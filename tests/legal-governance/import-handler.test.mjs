import test from "node:test";
import assert from "node:assert/strict";
import { createLegalGovernanceImportHandler } from "../../supabase/functions/_shared/legal-governance-import-handler.mjs";
const secret = "x".repeat(40),
  id = "10000000-0000-4000-8000-000000000001";
const request = (body = {}, key = secret) =>
  new Request("https://example.test", {
    method: "POST",
    headers: { "x-bib-bridge-key": key },
    body: JSON.stringify({ schema_version: 1, environment: "live", ...body }),
  });
function setup(overrides = {}) {
  const calls = [];
  let clients = 0;
  const handler = createLegalGovernanceImportHandler({
    secret,
    environment: "live",
    origin: "https://example.test/",
    getAdmin: () => {
      clients++;
      return {
        rpc: async (name, args) => {
          calls.push([name, args]);
          return {
            data:
              name === "read_store_legal_identity_for_review"
                ? { store_id: id, fields: {} }
                : "applied",
            error: null,
          };
        },
      };
    },
    ...overrides,
  });
  return { handler, calls, clients: () => clients };
}
test("private import validates method, secret, origin and project environment before creating an admin client", async () => {
  const s = setup();
  assert.equal(
    (await s.handler(new Request("https://example.test"))).status,
    405,
  );
  assert.equal(
    (
      await s.handler(
        request({ action: "identity_snapshot", store_id: id }, "wrong"),
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await s.handler(
        request({
          action: "identity_snapshot",
          store_id: id,
          environment: "sandbox",
        }),
      )
    ).status,
    400,
  );
  assert.equal(s.clients(), 0);
  for (const origin of [
    "http://example.test",
    "https://example.test/path",
    "https://user:password@example.test",
  ])
    assert.equal((await setup({ origin }).handler(request())).status, 503);
});
test("source lookups and deliveries pass only validated fields to their dedicated SQL functions", async () => {
  const s = setup();
  assert.equal(
    (await s.handler(request({ action: "identity_snapshot", store_id: id })))
      .status,
    200,
  );
  assert.deepEqual(s.calls[0], [
    "read_store_legal_identity_for_review",
    { p_store_id: id },
  ]);
  const record = { id, environment: "live" };
  assert.equal(
    (await s.handler(request({ action: "deliver", record }))).status,
    200,
  );
  assert.deepEqual(s.calls[1], [
    "import_legal_governance_record",
    {
      p_record: record,
      p_environment: "live",
      p_public_origin: "https://example.test",
    },
  ]);
});
test("a browser cannot smuggle identities, unknown keys or another environment into a delivery", async () => {
  const s = setup();
  for (const body of [
    { action: "identity_snapshot", store_id: id, owner_id: id },
    { action: "deliver", record: { id, environment: "sandbox" } },
    { action: "deliver", record: null },
  ])
    assert.equal((await s.handler(request(body))).status, 400);
  assert.equal(s.clients(), 0);
});
test("SQL conflicts and internal errors are sanitized without claiming success", async () => {
  for (const code of ["40001", "22023"]) {
    const s = setup({
      getAdmin: () => ({
        rpc: async () => ({
          data: null,
          error: { code, message: "private SQL secret" },
        }),
      }),
    });
    const r = await s.handler(
      request({ action: "deliver", record: { id, environment: "live" } }),
    );
    assert.equal(r.status, code === "40001" ? 409 : 503);
    assert.ok(!(await r.text()).includes("private SQL"));
  }
});
