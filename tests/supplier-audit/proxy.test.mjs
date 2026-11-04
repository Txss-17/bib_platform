import test from "node:test";
import assert from "node:assert/strict";
import { forwardSupplierAudit } from "../../supabase/functions/_shared/supplier-audit-proxy.mjs";
const secret = "s".repeat(40),
  url = "https://intrabib.test/functions/v1/supplier-audit-portal";
const submission = {
  id: "10000000-0000-4000-8000-000000000001",
  portal: "suppliers",
  status: "approved",
  email_verified_at: "2026-11-04",
};
test("unapproved, unverified and logistics partners never reach the private audit endpoint", async () => {
  const fetcher = () => {
    throw new Error("must not call");
  };
  for (const patch of [
    { status: "pending" },
    { email_verified_at: null },
    { portal: "ops" },
  ])
    assert.equal(
      (
        await forwardSupplierAudit(
          { action: "list_audits" },
          { ...submission, ...patch },
          { url, secret, fetcher },
        )
      ).status,
      403,
    );
});
test("missing or unsafe server configuration fails closed", async () => {
  const fetcher = () => {
    throw new Error("must not call");
  };
  for (const config of [
    { url: null, secret },
    { url: "http://unsafe.test", secret },
    { url, secret: "short" },
  ])
    assert.equal(
      (
        await forwardSupplierAudit({ action: "list_audits" }, submission, {
          ...config,
          fetcher,
        })
      ).status,
      503,
    );
});
test("the submission comes from the verified DB row, never from the browser body", async () => {
  let received;
  const result = await forwardSupplierAudit(
    { action: "list_audits", submission_id: "forged", actor_id: "forged" },
    submission,
    {
      url,
      secret,
      fetcher: async (target, options) => {
        received = { target, options, body: JSON.parse(options.body) };
        return new Response(JSON.stringify({ cases: [] }));
      },
    },
  );
  assert.equal(result.status, 200);
  assert.deepEqual(received.body, {
    schema_version: 1,
    submission_id: submission.id,
    action: "list",
  });
  assert.equal(received.options.headers["x-bib-bridge-key"], secret);
  assert.equal(JSON.stringify(result).includes(secret), false);
});
test("acceptance forwards only the exact version evidence and validated input", async () => {
  const body = {
    action: "accept_audit_quote",
    case_id: "20000000-0000-4000-8000-000000000001",
    key: "30000000-0000-4000-8000-000000000001",
    revision: 12,
    quote_hash: "a".repeat(64),
    signatory: " Partner ",
    supplier_id: "forged",
  };
  let payload;
  assert.equal(
    (
      await forwardSupplierAudit(body, submission, {
        url,
        secret,
        fetcher: async (_, opts) => {
          payload = JSON.parse(opts.body);
          return new Response(JSON.stringify({ cases: [] }));
        },
      })
    ).status,
    200,
  );
  assert.equal(payload.revision, 12);
  assert.equal(payload.quote_hash, body.quote_hash);
  assert.equal(payload.key, body.key);
  assert.equal(payload.signatory, "Partner");
  assert.equal(payload.supplier_id, undefined);
  assert.equal(
    (
      await forwardSupplierAudit({ ...body, quote_hash: "bad" }, submission, {
        url,
        secret,
        fetcher: () => {
          throw new Error();
        },
      })
    ).status,
    400,
  );
});
test("remote SQL errors and network failures are not exposed or converted to success", async () => {
  let r = await forwardSupplierAudit({ action: "list_audits" }, submission, {
    url,
    secret,
    fetcher: async () => new Response("PRIVATE ERROR", { status: 500 }),
  });
  assert.equal(r.status, 503);
  assert.equal(JSON.stringify(r).includes("PRIVATE"), false);
  r = await forwardSupplierAudit({ action: "list_audits" }, submission, {
    url,
    secret,
    fetcher: async () => {
      throw new Error("PRIVATE ADDRESS");
    },
  });
  assert.equal(r.status, 503);
  r = await forwardSupplierAudit({ action: "list_audits" }, submission, {
    url,
    secret,
    fetcher: async () => new Response(JSON.stringify({ wrong: [] })),
  });
  assert.equal(r.status, 503);
});
