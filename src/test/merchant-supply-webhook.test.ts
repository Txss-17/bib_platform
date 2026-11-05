import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
const mock=vi.hoisted(()=>({client:vi.fn(),rpc:vi.fn(),from:vi.fn(),verify:vi.fn(),intent:vi.fn(),charge:vi.fn(),dispute:vi.fn()}));
vi.mock("npm:@supabase/supabase-js@2",()=>({createClient:mock.client}));
vi.mock("../../supabase/functions/_shared/stripe.ts",()=>({verifyWebhook:mock.verify,createStripeClient:()=>({paymentIntents:{retrieve:mock.intent},charges:{retrieve:mock.charge},disputes:{retrieve:mock.dispute}})}));
let handler:(request:Request)=>Promise<Response>;
beforeEach(async()=>{
 vi.resetModules();vi.clearAllMocks();vi.spyOn(console,"log").mockImplementation(()=>{});vi.spyOn(console,"error").mockImplementation(()=>{});
 vi.stubGlobal("Deno",{serve:(fn:typeof handler)=>{handler=fn;},env:{get:()=>"unit-test-only"}});
 mock.client.mockReturnValue({rpc:mock.rpc,from:mock.from});mock.rpc.mockResolvedValue({data:true,error:null});
 mock.charge.mockResolvedValue({id:"ch_test",payment_intent:"pi_test",amount:4440,amount_refunded:0});
 mock.from.mockImplementation(()=>{const b={select:()=>b,eq:()=>b,maybeSingle:async()=>({data:{quote_id:"quote-test",refunded_cents:0,totals:{total_cents:4440}}})};return b;});
 const path="../../supabase/functions/payments-webhook/index.ts";await import(/* @vite-ignore */path);
});
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks();});
const deliver=async(type:string,object:Record<string,unknown>)=>{mock.verify.mockResolvedValue({id:"evt_unit_test",created:1,type,data:{object}});return handler(new Request("https://example.test/payments-webhook?env=sandbox",{method:"POST",body:"signed-unit-test-payload"}));};
describe("Merchant supply signed webhook routing",()=>{
 it("never writes payment evidence after signature verification fails or payment is still pending",async()=>{
  mock.verify.mockRejectedValue(new Error("bad signature"));expect((await handler(new Request("https://example.test/payments-webhook?env=sandbox",{method:"POST",body:"bad"}))).status).toBe(400);expect(mock.client).not.toHaveBeenCalled();
  expect((await deliver("checkout.session.completed",{id:"cs_test",metadata:{kind:"merchant_supply"},payment_status:"unpaid"})).status).toBe(200);expect(mock.rpc).not.toHaveBeenCalled();
 });
 it("retrieves current Stripe payment evidence and keeps a failed persistence retryable",async()=>{
  mock.intent.mockResolvedValue({id:"pi_test",status:"succeeded"});
  expect((await deliver("checkout.session.completed",{id:"cs_test",metadata:{kind:"merchant_supply"},payment_status:"paid",payment_intent:"pi_test"})).status).toBe(200);
  expect(mock.intent).toHaveBeenCalledWith("pi_test",{expand:["latest_charge"]});expect(mock.rpc).toHaveBeenCalledWith("record_merchant_supply_payment",expect.objectContaining({p_environment:"sandbox",p_payment_intent:{id:"pi_test",status:"succeeded"}}));
  mock.rpc.mockResolvedValue({error:{code:"40001"}});expect((await deliver("checkout.session.completed",{id:"cs_test",metadata:{kind:"merchant_supply"},payment_status:"paid",payment_intent:"pi_test"})).status).toBe(400);
 });
 it("uses current refund totals rather than the out-of-order event snapshot",async()=>{
  mock.charge.mockResolvedValue({id:"ch_test",amount:4440,amount_refunded:4440});
  expect((await deliver("charge.refunded",{id:"ch_test",payment_intent:"pi_test",amount_refunded:100})).status).toBe(200);
  expect(mock.rpc).toHaveBeenCalledWith("adjust_merchant_supply_payment",expect.objectContaining({p_state:"refunded",p_refunded_cents:4440,p_event_id:"evt_unit_test"}));
 });
 it("uses the current dispute result and never interprets an open dispute as available funding",async()=>{
  mock.dispute.mockResolvedValue({id:"dp_test",charge:"ch_test",status:"under_review"});
  expect((await deliver("charge.dispute.closed",{id:"dp_test",payment_intent:"pi_test",status:"won"})).status).toBe(200);
  expect(mock.rpc).toHaveBeenCalledWith("adjust_merchant_supply_payment",expect.objectContaining({p_state:"disputed"}));
 });
 it("keeps a refund hold after a won dispute even when the refund event has not reached the local ledger",async()=>{
  mock.dispute.mockResolvedValue({id:"dp_test",charge:"ch_test",status:"won"});mock.charge.mockResolvedValue({id:"ch_test",payment_intent:"pi_test",amount:4440,amount_refunded:1000});
  expect((await deliver("charge.dispute.closed",{id:"dp_test",payment_intent:"pi_test"})).status).toBe(200);
  expect(mock.rpc).toHaveBeenCalledWith("adjust_merchant_supply_payment",expect.objectContaining({p_state:"partially_refunded",p_refunded_cents:1000}));
 });
});
