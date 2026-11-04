const uuid = (v) =>
  typeof v === "string" &&
  /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
    v,
  );
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
function equal(a, b) {
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return mismatch === 0;
}
export function createLegalGovernanceImportHandler({
  secret,
  environment,
  origin,
  getAdmin,
}) {
  return async (request) => {
    if (request.method !== "POST")
      return json({ error: "method_not_allowed" }, 405);
    let publicOrigin;
    try {
      const parsed = new URL(origin);
      if (
        parsed.protocol !== "https:" ||
        parsed.username ||
        parsed.password ||
        parsed.pathname !== "/" ||
        parsed.search ||
        parsed.hash
      )
        throw new Error();
      publicOrigin = parsed.origin;
    } catch {
      return json({ error: "legal_bridge_unavailable" }, 503);
    }
    if (
      typeof secret !== "string" ||
      secret.length < 32 ||
      !["live", "sandbox"].includes(environment)
    )
      return json({ error: "legal_bridge_unavailable" }, 503);
    if (!equal(request.headers.get("x-bib-bridge-key") ?? "", secret))
      return json({ error: "unauthorized" }, 401);
    let body;
    try {
      const text = await request.text();
      if (text.length > 300000)
        return json({ error: "payload_too_large" }, 413);
      body = JSON.parse(text);
    } catch {
      return json({ error: "invalid_json" }, 400);
    }
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      body.schema_version !== 1 ||
      body.environment !== environment
    )
      return json({ error: "legal_environment_mismatch" }, 400);
    const allowed =
      body.action === "identity_snapshot"
        ? ["schema_version", "action", "environment", "store_id"]
        : ["schema_version", "action", "environment", "record"];
    if (
      Object.keys(body).some((k) => !allowed.includes(k)) ||
      !["identity_snapshot", "deliver"].includes(body.action)
    )
      return json({ error: "invalid_legal_action" }, 400);
    if (body.action === "identity_snapshot" && !uuid(body.store_id))
      return json({ error: "invalid_store" }, 400);
    if (
      body.action === "deliver" &&
      (!body.record ||
        !uuid(body.record.id) ||
        body.record.environment !== environment)
    )
      return json({ error: "invalid_legal_delivery" }, 400);
    try {
      const admin = getAdmin();
      if (body.action === "identity_snapshot") {
        const r = await admin.rpc("read_store_legal_identity_for_review", {
          p_store_id: body.store_id,
        });
        if (r.error) throw r.error;
        return r.data
          ? json({ ok: true, snapshot: r.data })
          : json({ error: "store_not_found" }, 404);
      }
      const r = await admin.rpc("import_legal_governance_record", {
        p_record: body.record,
        p_environment: environment,
        p_public_origin: publicOrigin,
      });
      if (r.error) throw r.error;
      if (!["applied", "replayed", "stale"].includes(r.data))
        throw new Error("invalid_legal_response");
      return json({ ok: true, result: r.data });
    } catch (error) {
      return json(
        {
          error:
            error?.code === "40001"
              ? "legal_delivery_conflict"
              : "legal_delivery_rejected",
        },
        error?.code === "40001" ? 409 : 503,
      );
    }
  };
}
