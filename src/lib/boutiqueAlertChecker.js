import { supabase } from "@/integrations/supabase/client";
async function runBoutiqueAlertCheck(s) {
  const boutiqueId = s.boutique_id;
  const days = Math.max(1, s.period_days || 7);
  const now = /* @__PURE__ */ new Date();
  const since = new Date(Date.now() - days * 864e5).toISOString();
  const prevSince = new Date(Date.now() - 2 * days * 864e5).toISOString();
  const { data: recent } = await supabase.from("boutique_alert_log").select("type, created_at").eq("boutique_id", boutiqueId).gte("created_at", new Date(Date.now() - 864e5).toISOString());
  const recentTypes = new Set((recent ?? []).map((r) => r.type));
  const toInsert = [];
  const [{ data: cur }, { data: prev }] = await Promise.all([
    supabase.rpc("boutique_period_kpis", {
      _boutique_id: boutiqueId,
      _since: since,
      _until: now.toISOString()
    }),
    supabase.rpc("boutique_period_kpis", {
      _boutique_id: boutiqueId,
      _since: prevSince,
      _until: since
    })
  ]);
  const curK = cur?.[0];
  const prevK = prev?.[0];
  if (curK && prevK && prevK.views > 5) {
    const dropPct = (prevK.views - curK.views) / prevK.views * 100;
    if (dropPct >= s.views_drop_pct && !recentTypes.has("views_drop")) {
      toInsert.push({
        boutique_id: boutiqueId,
        type: "views_drop",
        severity: dropPct >= 60 ? "critical" : "warning",
        title: `Chute des vues : -${dropPct.toFixed(0)}%`,
        message: `Vues sur ${days}j : ${curK.views} contre ${prevK.views} la p\xE9riode pr\xE9c\xE9dente.`,
        metadata: { current: curK.views, previous: prevK.views, drop_pct: dropPct }
      });
    }
  }
  const { data: scenes } = await supabase.rpc("scene_analytics_summary", {
    _boutique_id: boutiqueId,
    _since: since
  });
  const lowCtr = (scenes ?? []).filter((r) => Number(r.impressions) > 50 && Number(r.ctr) < s.ctr_floor);
  if (lowCtr.length > 0 && !recentTypes.has("ctr_drop")) {
    toInsert.push({
      boutique_id: boutiqueId,
      type: "ctr_drop",
      severity: "warning",
      title: `${lowCtr.length} sc\xE8ne(s) sous-performante(s)`,
      message: `CTR < ${s.ctr_floor}% d\xE9tect\xE9 sur ${lowCtr.length} sc\xE8ne(s). Pensez \xE0 retravailler vos CTA.`,
      metadata: { scenes: lowCtr.map((r) => ({ id: r.scene_id, type: r.scene_type, ctr: r.ctr })) }
    });
  }
  const { data: products } = await supabase.from("products").select("id, supplier_products!inner(name, stock, moq)").eq("boutique_id", boutiqueId).eq("status", "active");
  const lowStock = [];
  for (const p of products ?? []) {
    const sp = p.supplier_products;
    if (!sp) continue;
    const stock = Number(sp.stock ?? 0);
    const moq = Math.max(Number(sp.moq ?? 1), 1);
    if (stock / moq <= s.low_stock_ratio) lowStock.push({ id: p.id, name: sp.name, stock, moq });
  }
  if (lowStock.length > 0 && !recentTypes.has("low_stock")) {
    toInsert.push({
      boutique_id: boutiqueId,
      type: "low_stock",
      severity: lowStock.some((x) => x.stock <= 0) ? "critical" : "warning",
      title: `Stock faible sur ${lowStock.length} produit(s)`,
      message: lowStock.slice(0, 3).map((x) => `${x.name} (${x.stock}/${x.moq})`).join(", "),
      metadata: { products: lowStock }
    });
  }
  if (s.audits_enabled && !recentTypes.has("audit")) {
    const { data: bData } = await supabase.from("boutiques").select("legal_email, legal_siret, status").eq("id", boutiqueId).single();
    const missing = [];
    if (!bData?.legal_email) missing.push("email l\xE9gal");
    if (!bData?.legal_siret) missing.push("SIRET");
    if (bData?.status !== "published") missing.push("publication");
    if (missing.length > 0) {
      toInsert.push({
        boutique_id: boutiqueId,
        type: "audit",
        severity: "info",
        title: `Audit : ${missing.length} action(s) \xE0 compl\xE9ter`,
        message: `Pour rester conforme : ${missing.join(", ")}.`,
        metadata: { missing }
      });
    }
  }
  let emailed = 0;
  for (const a of toInsert) {
    let emailStatus = null;
    if (s.email_enabled && s.notify_email) {
      try {
        const subject = `[Alerte] ${a.title}`;
        const body = `
          <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
            <h2 style="color:#0f2438;margin:0 0 12px;">${escapeHtml(a.title)}</h2>
            <p style="color:#475569;line-height:1.6;">${escapeHtml(a.message ?? "")}</p>
            <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
              Alerte automatique Brand-In-A-Box \u2014 r\xE9glez vos seuils dans Param\xE8tres &gt; Alertes.
            </p>
          </div>`;
        const { error } = await supabase.functions.invoke("send-boutique-email", {
          body: {
            boutique_id: boutiqueId,
            type: "alert",
            recipient_email: s.notify_email,
            subject_override: subject,
            body_override: body
          }
        });
        emailStatus = error ? "failed" : "sent";
        if (!error) emailed++;
      } catch {
        emailStatus = "failed";
      }
    } else {
      emailStatus = "skipped";
    }
    a.email_status = emailStatus;
  }
  if (toInsert.length > 0) {
    await supabase.from("boutique_alert_log").insert(toInsert);
  }
  await supabase.from("boutique_alert_settings").update({ last_checked_at: now.toISOString() }).eq("boutique_id", boutiqueId);
  return {
    created: toInsert.length,
    emailed,
    alerts: toInsert.map((a) => ({ type: a.type, title: a.title, severity: a.severity }))
  };
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}
export {
  runBoutiqueAlertCheck
};
