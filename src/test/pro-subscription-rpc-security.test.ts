import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

describe("Pro subscription RPC authorization", () => {
  const sql = read("ops/release/harden-pro-subscription-rpc.sql");
  const pricing = read("supabase/migrations/20261102123000_pricing_and_pro_sales_guards.sql");
  const pos = read("supabase/functions/create-pos-checkout/index.ts");

  it("checks the authenticated subject, never an arbitrary supplied account", () => {
    expect(sql).toContain("(SELECT auth.uid()) = p_user_id");
    expect(sql).toContain("(SELECT auth.role()) = 'service_role'");
    expect(sql).toContain("SECURITY DEFINER");
    expect(sql).toContain("SET search_path = ''");
    expect(sql).toContain("FROM public.profiles pr");
    expect(sql).toContain("JOIN public.subscriptions sub ON sub.user_id = pr.user_id");
    expect(sql).toContain("sub.environment = p_environment");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.bib_has_active_pro_subscription(uuid,text) FROM PUBLIC, anon");
  });

  it("preserves private sale and trusted checkout integration", () => {
    expect(pricing).toContain("public.bib_has_active_pro_subscription(owner_id,'live')");
    expect(pricing).toContain("public.bib_has_active_pro_subscription(auth.uid(),'live')");
    expect(pos).toContain('"bib_has_active_pro_subscription"');
    expect(pos).toContain("const supabase = adminClient()");
  });
});
