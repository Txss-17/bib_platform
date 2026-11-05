const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
};
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const tokenPattern = /^[a-f0-9]{64}$/;
const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

/** Public capability endpoint. No IP, user agent, device ID or cookie data enters SQL. */
export function createMarketingSubscriptionHandler({ getAdmin }) {
  return async (request) => {
    if (request.method === "OPTIONS")
      return new Response(null, { headers: cors });
    if (request.method !== "POST")
      return json({ error: "method_not_allowed" }, 405);
    const raw = await request.text();
    if (raw.length > 8192) return json({ error: "invalid_request" }, 400);
    let body;
    try {
      if (
        request.headers
          .get("content-type")
          ?.includes("application/x-www-form-urlencoded")
      ) {
        const form = new URLSearchParams(raw);
        const url = new URL(request.url);
        if (
          form.get("List-Unsubscribe") !== "One-Click" ||
          url.searchParams.get("action") !== "unsubscribe"
        )
          return json({ error: "invalid_request" }, 400);
        body = { action: "withdraw", token: url.searchParams.get("token") };
      } else body = JSON.parse(raw);
    } catch {
      return json({ error: "invalid_request" }, 400);
    }
    if (!body || typeof body !== "object" || Array.isArray(body))
      return json({ error: "invalid_request" }, 400);
    let rpc, args;
    if (body.action === "context" || body.action === "request") {
      const allowed =
        body.action === "context"
          ? ["action", "boutique_id", "locale"]
          : [
              "action",
              "boutique_id",
              "locale",
              "email",
              "notice_hash",
              "accepted",
            ];
      if (
        Object.keys(body).some((key) => !allowed.includes(key)) ||
        (body.boutique_id != null &&
          (typeof body.boutique_id !== "string" ||
            !uuid.test(body.boutique_id))) ||
        !["fr", "en"].includes(body.locale)
      )
        return json({ error: "invalid_request" }, 400);
      args = { p_boutique_id: body.boutique_id ?? null, p_locale: body.locale };
      rpc = "marketing_subscription_context";
      if (body.action === "request") {
        if (
          body.accepted !== true ||
          typeof body.email !== "string" ||
          body.email.length > 254 ||
          !/^[a-z0-9][a-z0-9._+%=-]*@[a-z0-9][a-z0-9.-]*\.[a-z]{2,63}$/i.test(
            body.email.trim(),
          ) ||
          typeof body.notice_hash !== "string" ||
          !tokenPattern.test(body.notice_hash)
        )
          return json({ error: "invalid_request" }, 400);
        rpc = "request_marketing_subscription";
        args = {
          ...args,
          p_email: body.email.trim().toLowerCase(),
          p_notice_hash: body.notice_hash,
          p_accepted: true,
        };
      }
    } else if (
      [
        "inspect_confirmation",
        "confirm",
        "inspect_unsubscribe",
        "withdraw",
      ].includes(body.action)
    ) {
      if (
        Object.keys(body).some((key) => !["action", "token"].includes(key)) ||
        typeof body.token !== "string" ||
        !tokenPattern.test(body.token)
      )
        return json({ error: "invalid_request" }, 400);
      rpc = "manage_marketing_subscription";
      args = { p_action: body.action, p_token: body.token };
    } else return json({ error: "invalid_request" }, 400);
    try {
      const { data, error } = await getAdmin().rpc(rpc, args);
      if (error)
        return json(
          {
            error:
              error.code === "40001"
                ? "notice_changed"
                : error.code === "54000"
                  ? "rate_limited"
                  : "subscription_unavailable",
          },
          error.code === "40001" ? 409 : error.code === "54000" ? 429 : 503,
        );
      if (!data || (body.action === "request" && data.accepted !== true))
        return json({ error: "subscription_unavailable" }, 503);
      return json(data, body.action === "request" ? 202 : 200);
    } catch {
      return json({ error: "subscription_unavailable" }, 503);
    }
  };
}
