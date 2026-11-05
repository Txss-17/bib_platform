import test from "node:test";
import assert from "node:assert/strict";
import { createMarketingSubscriptionHandler } from "../../supabase/functions/_shared/marketing-subscription-handler.mjs";
import {
  marketingUnsubscribeLinks,
  verifiedMarketingAudience,
} from "../../supabase/functions/_shared/verified-marketing-audience.mjs";
const id = "10000000-0000-4000-8000-000000000001",
  token = "a".repeat(64);
const req = (body) =>
  new Request("https://example.test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
function setup(result = { data: { accepted: true }, error: null }) {
  const calls = [];
  const handler = createMarketingSubscriptionHandler({
    getAdmin: () => ({
      rpc: async (...args) => {
        calls.push(args);
        return result;
      },
    }),
  });
  return { handler, calls };
}
test("subscription boundary rejects extra tracking/identity fields, missing affirmative choice and malformed tokens before privileged access", async () => {
  const { handler, calls } = setup();
  for (const body of [
    {
      action: "request",
      boutique_id: id,
      locale: "fr",
      email: "a@example.test",
      notice_hash: token,
      accepted: false,
    },
    { action: "context", locale: "fr", device_id: "fingerprint" },
    { action: "context", locale: "fr", geolocation: { latitude: 42 } },
    { action: "confirm", token, controller_key: id },
    { action: "withdraw", token: "not-a-token" },
    { action: "context", boutique_id: "x", locale: "fr" },
  ])
    assert.equal((await handler(req(body))).status, 400);
  assert.equal(
    (await handler(new Request("https://example.test"))).status,
    405,
  );
  assert.equal(calls.length, 0);
});
test("only scope, exact notice and explicit email choice reach the transactional SQL request", async () => {
  const { handler, calls } = setup();
  const response = await handler(
    req({
      action: "request",
      boutique_id: id,
      locale: "en",
      email: " BUYER@Example.test ",
      notice_hash: token,
      accepted: true,
    }),
  );
  assert.equal(response.status, 202);
  assert.deepEqual(calls, [
    [
      "request_marketing_subscription",
      {
        p_boutique_id: id,
        p_locale: "en",
        p_email: "buyer@example.test",
        p_notice_hash: token,
        p_accepted: true,
      },
    ],
  ]);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});
test("inspection does not confirm or withdraw; a genuine RFC8058 POST withdraws the one scoped token", async () => {
  const { handler, calls } = setup({
    data: { valid: true, state: "pending" },
    error: null,
  });
  await handler(req({ action: "inspect_confirmation", token }));
  assert.equal(calls[0][1].p_action, "inspect_confirmation");
  const request = new Request(
    `https://example.test?action=unsubscribe&token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "List-Unsubscribe=One-Click",
    },
  );
  assert.equal((await handler(request)).status, 200);
  assert.deepEqual(calls[1], [
    "manage_marketing_subscription",
    { p_action: "withdraw", p_token: token },
  ]);
  assert.equal((await handler(new Request(request.url))).status, 405);
});
test("unavailable schema/queue, stale notices and rate limits never claim a recorded subscription or expose SQL details", async () => {
  for (const [code, status] of [
    ["42883", 503],
    ["40001", 409],
    ["54000", 429],
  ]) {
    const { handler } = setup({
      data: null,
      error: { code, message: "private address and secret" },
    });
    const response = await handler(req({ action: "context", locale: "fr" }));
    assert.equal(response.status, status);
    assert.ok(!(await response.text()).includes("private"));
  }
  const { handler } = setup({ data: { accepted: false }, error: null });
  assert.equal(
    (
      await handler(
        req({
          action: "request",
          locale: "fr",
          email: "buyer@example.test",
          notice_hash: token,
          accepted: true,
        }),
      )
    ).status,
    503,
  );
});
test("campaign audience uses only server verified scope and recheck IDs; unavailable proof fails closed", async () => {
  const calls = [];
  const admin = {
    rpc: async (...args) => {
      calls.push(args);
      return { data: [], error: null };
    },
  };
  await verifiedMarketingAudience(admin, id, 1000, id);
  assert.deepEqual(calls, [
    [
      "marketing_campaign_recipients",
      { p_boutique_id: id, p_min_spent_cents: 1000, p_subscription_id: id },
    ],
  ]);
  await assert.rejects(
    () =>
      verifiedMarketingAudience(
        {
          rpc: async () => ({
            data: null,
            error: { message: "schema absent" },
          }),
        },
        id,
      ),
    /audience_unavailable/,
  );
});
test("unsubscribe links contain an opaque scoped token and no email; untrusted origins and header injection are refused", () => {
  const result = marketingUnsubscribeLinks(
    { public_origin: "https://brand.example.test", unsubscribe_token: token },
    "https://project.supabase.co",
  );
  assert.equal(
    result.page,
    `https://brand.example.test/communications?action=unsubscribe#token=${token}`,
  );
  assert.equal(new URL(result.oneClick).searchParams.get("token"), token);
  assert.ok(!result.page.includes("email="));
  for (const public_origin of [
    "http://brand.example.test",
    "https://user:pass@brand.example.test",
    "https://brand.example.test/path",
  ])
    assert.throws(() =>
      marketingUnsubscribeLinks(
        { public_origin, unsubscribe_token: token },
        "https://project.supabase.co",
      ),
    );
  assert.throws(() =>
    marketingUnsubscribeLinks(
      {
        public_origin: "https://brand.example.test",
        unsubscribe_token: token + "\r\n",
      },
      "https://project.supabase.co",
    ),
  );
});
