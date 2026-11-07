import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  rpc: vi.fn(),
  from: vi.fn(),
  send: vi.fn(),
  writes: [] as unknown[],
}));
vi.mock("npm:@supabase/supabase-js@2", () => ({
  createClient: mocks.createClient,
}));
const store = "10000000-0000-4000-8000-000000000001",
  owner = "20000000-0000-4000-8000-000000000001",
  sid = "30000000-0000-4000-8000-000000000001";
const recipient = {
  subscription_id: sid,
  email: "buyer@example.test",
  full_name: '<img src=x onerror="alert(1)">',
  unsubscribe_token: "a".repeat(64),
  public_origin: "https://example.test",
  controller_name: "Vendeur test",
};
let handler: (request: Request) => Promise<Response>;
const request = (extra = {}) =>
  new Request(
    "https://project.supabase.co/functions/v1/send-marketing-campaign",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer authenticated-user",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        boutique_id: store,
        subject: "Offres test",
        body_html:
          '<p>Hello {{full_name}}</p><script>alert(1)</script><a href="javascript:alert(1)">Link</a>',
        ...extra,
      }),
    },
  );
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.writes = [];
  vi.stubGlobal("Deno", {
    env: {
      get: (name: string) =>
        ({
          SUPABASE_URL: "https://project.supabase.co",
          SUPABASE_SERVICE_ROLE_KEY: "server-only-test",
          SUPABASE_ANON_KEY: "public-test",
          LOVABLE_API_KEY: "mocked",
          GOOGLE_MAIL_API_KEY: "mocked",
        })[name],
    },
    serve: (fn: typeof handler) => {
      handler = fn;
    },
  });
  mocks.rpc.mockResolvedValue({ data: [recipient], error: null });
  mocks.send.mockResolvedValue(
    new Response(JSON.stringify({ id: "fake-send" }), { status: 200 }),
  );
  vi.stubGlobal("fetch", mocks.send);
  mocks.from.mockImplementation((table: string) => {
    if (table === "boutique_customers")
      throw new Error("unverified_legacy_audience_must_not_be_used");
    const data =
      table === "boutiques"
        ? { id: store, user_id: owner, name: "Boutique test", slug: "test", status: "published" }
        : table === "boutique_email_settings"
          ? {
              from_name: "Boutique test",
              marketing_footer_links: { Bad: "javascript:alert(1)" },
            }
          : table === "marketing_campaigns"
            ? { id: "campaign-test" }
            : null;
    const builder = {
      select: () => builder,
      eq: () => builder,
      like: () => builder,
      gte: () => builder,
      maybeSingle: async () => ({ data, error: null }),
      single: async () => ({ data, error: null }),
      insert: (value: unknown) => {
        mocks.writes.push([table, "insert", value]);
        return builder;
      },
      update: (value: unknown) => {
        mocks.writes.push([table, "update", value]);
        return builder;
      },
      then: (resolve: (value: unknown) => unknown) =>
        Promise.resolve({ data, error: null, count: 0 }).then(resolve),
    };
    return builder;
  });
  mocks.createClient.mockReturnValue({
    rpc: mocks.rpc,
    from: mocks.from,
    auth: {
      getUser: async () => ({
        data: { user: { id: owner, email: "owner@example.test", email_confirmed_at: "2026-01-01T00:00:00Z" } },
        error: null,
      }),
    },
  });
  const endpoint = "../../supabase/functions/send-marketing-campaign/index.ts";
  await import(/* @vite-ignore */ endpoint);
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function message() {
  const payload = JSON.parse(mocks.send.mock.calls[0][1].body);
  return Buffer.from(payload.raw, "base64url").toString("utf8");
}
describe("campaign consent enforcement", () => {
  it("sends only a verified audience after a fresh delivery check, sanitizes bulk HTML and adds working scoped unsubscribe links", async () => {
    const result = await handler(request());
    expect(result.status).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledTimes(2);
    expect(mocks.rpc.mock.calls[1][1]).toEqual({
      p_boutique_id: store,
      p_min_spent_cents: null,
      p_subscription_id: sid,
    });
    expect(mocks.send).toHaveBeenCalledTimes(1);
    const raw = message();
    expect(raw).toContain("To: buyer@example.test");
    expect(raw).toContain("List-Unsubscribe-Post: List-Unsubscribe=One-Click");
    expect(raw).toContain("/communications?action=unsubscribe#token=");
    expect(raw).not.toContain("?email=");
    expect(raw).not.toContain("<script>");
    expect(raw).not.toContain('href="javascript:');
    expect(raw).not.toContain('<img src="x"');
    expect(raw).toContain("Vendeur test");
  });
  it("a withdrawal after selection prevents delivery even though the original audience contained the address", async () => {
    mocks.rpc
      .mockResolvedValueOnce({ data: [recipient], error: null })
      .mockResolvedValueOnce({ data: [], error: null });
    const result = await handler(request());
    expect(await result.json()).toMatchObject({
      sent: 0,
      failed: 0,
      skipped: 1,
    });
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("missing proof or migration blocks bulk delivery with no fallback to the CRM boolean", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { code: "42883", message: "private SQL detail" },
    });
    const result = await handler(request());
    expect(result.status).toBe(500);
    expect(await result.text()).not.toContain("private SQL");
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it("test emails are restricted to the signed-in owner and create no subscription or false unsubscribe link", async () => {
    expect(
      (await handler(request({ test_recipient: "someone@example.test" })))
        .status,
    ).toBe(403);
    expect(mocks.send).not.toHaveBeenCalled();
    expect(
      (await handler(request({ test_recipient: "owner@example.test" }))).status,
    ).toBe(200);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(message()).toContain("Aucun abonnement créé");
    expect(message()).not.toContain("List-Unsubscribe:");
  });
});
