import { beforeAll, beforeEach, afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

const owner = "10000000-0000-4000-8000-000000000001";
const other = "10000000-0000-4000-8000-000000000002";
const boutique = "10000000-0000-4000-8000-000000000010";
const order = "10000000-0000-4000-8000-000000000020";
const issue = "10000000-0000-4000-8000-000000000030";
const subscription = "10000000-0000-4000-8000-000000000040";
let db: PGlite;

async function withRole(role: "authenticated" | "service_role" | "anon", actor: string | null, callback: (tx: any) => Promise<unknown>) {
  return db.transaction(async tx => {
    await tx.exec("SET LOCAL ROLE " + role);
    await tx.query("SELECT set_config('request.jwt.claim.role',$1,true),set_config('request.jwt.claim.sub',$2,true)",[role,actor ?? ""]);
    return callback(tx);
  });
}
const respond = (actor: string,pAction: string,pStatus: string,note?: string) =>
  withRole("authenticated",actor,tx => tx.query(
    "SELECT public.respond_to_order_issue($1,$2::public.issue_action,$3,$4::public.issue_status)",
    [issue,pAction,note??"Documented response",pStatus],
  ));
const escalate = (environment="live") =>
  withRole("service_role",null,tx => tx.query(
    "SELECT * FROM public.escalate_unanswered_order_issues(100,$1)",[environment],
  ));

beforeAll(async () => {
  db = new PGlite();
  await db.exec(await readFile(new URL("./fixture.sql",import.meta.url),"utf8"));
  await db.exec(await readFile(new URL("../../drizzle/migrations/0024_sav_48h_atomic_escalation.sql",import.meta.url),"utf8"));
});
afterAll(async () => { await db.close(); });
beforeEach(async () => {
  await db.exec("TRUNCATE public.sav_escalation_events,public.issue_responses,public.order_issues,public.subscriptions,public.profiles,public.orders,public.boutiques,auth.users CASCADE");
  await db.query("INSERT INTO auth.users(id) VALUES($1),($2)",[owner,other]);
  await db.query("INSERT INTO public.boutiques(id,user_id) VALUES($1,$2)",[boutique,owner]);
  await db.query("INSERT INTO public.orders(id,boutique_id,stripe_environment) VALUES($1,$2,'live')",[order,boutique]);
  await db.query("INSERT INTO public.profiles(user_id,insurance_addon_enabled) VALUES($1,true)",[owner]);
  await db.query("INSERT INTO public.subscriptions(id,user_id,price_id,status,current_period_end) VALUES($1,$2,'insurance_pro_monthly','active',now()+interval '1 month')",[subscription,owner]);
  await db.query("INSERT INTO public.order_issues(id,order_id,created_at,deadline_at) VALUES($1,$2,now()-interval '1 hour',now()+interval '47 hours')",[issue,order]);
});

describe("Seller SAV response / 48-hour insurance handoff",() => {
  it("atomically records a seller decision and moves the case",async () => {
    await respond(owner,"accept","accepted");
    const state = (await db.query("SELECT status::text FROM public.order_issues WHERE id=$1",[issue])).rows[0];
    const count = (await db.query("SELECT count(*)::int AS n FROM public.issue_responses WHERE issue_id=$1",[issue])).rows[0];
    expect(state.status).toBe("accepted");
    expect(count.n).toBe(1);
    expect(((await escalate()) as any).rows).toHaveLength(0);
  });
  it("denies another merchant and never saves a phantom response",async () => {
    await expect(respond(other,"accept","accepted")).rejects.toThrow(/issue_not_owned/);
    expect((await db.query("SELECT count(*)::int AS n FROM public.issue_responses")).rows[0].n).toBe(0);
  });
  it("forbids direct issue mutation and response insertion, including by the rightful seller",async () => {
    await expect(withRole("authenticated",owner,tx=>tx.query("UPDATE public.order_issues SET status='resolved' WHERE id=$1",[issue]))).rejects.toThrow();
    await expect(withRole("authenticated",owner,tx=>tx.query("INSERT INTO public.issue_responses(issue_id,action) VALUES($1,'accept')",[issue]))).rejects.toThrow();
  });
  it("blocks money-like partial refunds outside the dedicated Stripe refund path",async () => {
    await expect(respond(owner,"partial_refund","accepted")).rejects.toThrow(/use_stripe_refund_workflow/);
    expect((await db.query("SELECT count(*)::int AS n FROM public.issue_responses")).rows[0].n).toBe(0);
  });
  it("escalates exactly once after 48h with active insurance, and freezes late seller decisions",async () => {
    await db.query("UPDATE public.order_issues SET created_at=now()-interval '50 hours',deadline_at=now()-interval '2 hours' WHERE id=$1",[issue]);
    const first:any=await escalate();
    await expect(respond(owner,"accept","accepted")).rejects.toThrow(/bib_sav_escalation_required/);
    const second:any=await escalate();
    expect(first.rows).toHaveLength(1);
    expect(second.rows).toHaveLength(0);
    expect((await db.query("SELECT status::text FROM public.order_issues WHERE id=$1",[issue])).rows[0].status).toBe("escalated");
    expect((await db.query("SELECT count(*)::int AS n FROM public.sav_escalation_events")).rows[0].n).toBe(1);
  });
  it("allows a seller to respond after 48 h when BIB has not actually taken over",async () => {
    await db.query("UPDATE public.order_issues SET created_at=now()-interval '50 hours', deadline_at=now()-interval '2 hours' WHERE id=$1",[issue]);
    await db.query("UPDATE public.profiles SET insurance_addon_enabled=false WHERE user_id=$1",[owner]);
    await respond(owner,"accept","accepted");
    expect((await db.query("SELECT status::text FROM public.order_issues WHERE id=$1",[issue])).rows[0].status).toBe("accepted");
    expect(((await escalate()) as any).rows).toHaveLength(0);
  });
  it("never overwrites a late insured seller response if received before the worker",async () => {
    await db.query("UPDATE public.order_issues SET created_at=now()-interval '50 hours', deadline_at=now()-interval '2 hours' WHERE id=$1",[issue]);
    await respond(owner,"accept","accepted");
    expect(((await escalate()) as any).rows).toHaveLength(0);
    expect((await db.query("SELECT count(*)::int AS n FROM public.sav_escalation_events")).rows[0].n).toBe(0);
  });
  it("does not escalate uninsured or canceled insurance cases",async () => {
    await db.query("UPDATE public.order_issues SET created_at=now()-interval '49 hours',deadline_at=now()-interval '1 hour' WHERE id=$1",[issue]);
    await db.query("UPDATE public.profiles SET insurance_addon_enabled=false WHERE user_id=$1",[owner]);
    expect(((await escalate()) as any).rows).toHaveLength(0);
    await db.query("UPDATE public.profiles SET insurance_addon_enabled=true WHERE user_id=$1",[owner]);
    await db.query("UPDATE public.subscriptions SET status='canceled' WHERE id=$1",[subscription]);
    expect(((await escalate()) as any).rows).toHaveLength(0);
  });
  it("does not escalate before the 48-hour minimum even if deadline was shortened",async () => {
    await db.query("UPDATE public.order_issues SET deadline_at=now()-interval '1 minute' WHERE id=$1",[issue]);
    expect(((await escalate()) as any).rows).toHaveLength(0);
  });
  it("refuses takeover when the insurance subscription belongs to another Stripe environment",async () => {
    await db.query("UPDATE public.order_issues SET created_at=now()-interval '49 hours',deadline_at=now()-interval '1 hour' WHERE id=$1",[issue]);
    await db.query("UPDATE public.subscriptions SET environment='sandbox' WHERE id=$1",[subscription]);
    expect(((await escalate("live")) as any).rows).toHaveLength(0);
    expect((await db.query("SELECT status::text FROM public.order_issues WHERE id=$1",[issue])).rows[0].status).toBe("pending");
    await db.query("UPDATE public.subscriptions SET environment='live' WHERE id=$1",[subscription]);
    expect(((await escalate("live")) as any).rows).toHaveLength(1);
  });
  it("keeps sandbox and live escalation passes isolated",async () => {
    await db.query("UPDATE public.order_issues SET created_at=now()-interval '49 hours',deadline_at=now()-interval '1 hour' WHERE id=$1",[issue]);
    expect(((await escalate("sandbox")) as any).rows).toHaveLength(0);
    expect(((await escalate("live")) as any).rows).toHaveLength(1);
  });
  it("refuses cron execution from a merchant session",async () => {
    await expect(withRole("authenticated",owner,tx=>tx.query("SELECT * FROM public.escalate_unanswered_order_issues(100,'live')"))).rejects.toThrow();
  });
});
