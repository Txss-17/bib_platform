const uuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

/** submission is read by the caller from the approved, token-verified DB row. */
export async function forwardSupplierAudit(
  body,
  submission,
  { url, secret, fetcher = fetch },
) {
  if (
    submission.portal !== "suppliers" ||
    submission.status !== "approved" ||
    !submission.email_verified_at
  )
    return { status: 403, body: { error: "verified_supplier_required" } };
  if (!url || !secret || secret.length < 32)
    return { status: 503, body: { error: "audit_service_unavailable" } };
  let target;
  try {
    target = new URL(url);
    if (target.protocol !== "https:" || target.username || target.password)
      throw new Error();
  } catch {
    return { status: 503, body: { error: "audit_service_unavailable" } };
  }
  const payload = {
    schema_version: 1,
    submission_id: submission.id,
    action: body.action === "list_supplier_references" ? "list_references" : body.action === "list_audits" ? "list" : "accept",
  };
  if (body.action === "accept_audit_quote") {
    if (
      !uuid(body.case_id) ||
      !uuid(body.key) ||
      !Number.isInteger(body.revision) ||
      body.revision < 1 ||
      body.revision > 2147483647 ||
      typeof body.quote_hash !== "string" ||
      !/^[a-f0-9]{64}$/.test(body.quote_hash) ||
      typeof body.signatory !== "string" ||
      body.signatory.trim().length < 2 ||
      body.signatory.trim().length > 200
    )
      return { status: 400, body: { error: "invalid_audit_acceptance" } };
    Object.assign(payload, {
      case_id: body.case_id,
      key: body.key,
      revision: body.revision,
      quote_hash: body.quote_hash,
      signatory: body.signatory.trim(),
    });
  } else if (!["list_audits", "list_supplier_references"].includes(body.action))
    return { status: 400, body: { error: "invalid_audit_action" } };
  try {
    const response = await fetcher(target.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-bib-bridge-key": secret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      return {
        status: [400, 403, 404, 409].includes(response.status)
          ? response.status
          : 503,
        body: {
          error:
            response.status === 409
              ? "quote_changed"
              : "audit_service_unavailable",
        },
      };
    const data = await response.json();
    if (body.action === "list_supplier_references") {
      if (!data || !Array.isArray(data.references)) throw new Error("invalid_reference_response");
      return { status: 200, body: { ok: true, references: data.references } };
    }
    if (!data || !Array.isArray(data.cases))
      throw new Error("invalid_response");
    return { status: 200, body: { ok: true, cases: data.cases } };
  } catch {
    return { status: 503, body: { error: "audit_service_unavailable" } };
  }
}
