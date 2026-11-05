import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {ids,quoteFixture} from "../../tests/supply/fixtures.mjs";
const mock=vi.hoisted(()=>({client:vi.fn(),rpc:vi.fn(),from:vi.fn(),forward:vi.fn(),session:vi.fn(),expire:vi.fn(),account:vi.fn(),auth:vi.fn(),quote:null as any,reserveError:null as any,owner:true,ready:true}));
vi.mock("npm:@supabase/supabase-js@2",()=>({createClient:mock.client}));
vi.mock("../../supabase/functions/_shared/merchant-supply-proxy.mjs",()=>({forwardMerchantSupply:mock.forward}));
vi.mock("../../supabase/functions/_shared/stripe.ts",()=>({corsHeaders:{},createStripeClient:()=>({accounts:{retrieve:mock.account},checkout:{sessions:{create:mock.session,expire:mock.expire}}})}));
let handler:(request:Request)=>Promise<Response>;
beforeEach(async()=>{
 vi.resetModules();vi.clearAllMocks();mock.quote=quoteFixture("accepted");mock.reserveError=null;mock.owner=true;mock.ready=true;
 vi.stubGlobal("Deno",{serve:(fn:typeof handler)=>{handler=fn;},env:{get:(key:string)=>({PAYMENTS_ENVIRONMENT:"sandbox",PAYMENTS_LIVE_PROJECT_REF:"live-test",PAYMENTS_SANDBOX_PROJECT_REF:"sandbox-test",SUPABASE_URL:"https://sandbox-test.supabase.co",SUPABASE_ANON_KEY:"unit-test-public",SUPABASE_SERVICE_ROLE_KEY:"unit-test-private",BIB_SUPPLY_ENVIRONMENT:"sandbox",BIB_SUPPLY_CHECKOUT_READY:mock.ready?"true":"false",BIB_SAMPLE_FULFILLMENT_READY:"false"})[key]}});
 mock.auth.mockResolvedValue({data:{user:{id:ids.merchant,email:"buyer@example.test"}}});
 mock.client.mockReturnValue({auth:{getUser:mock.auth},rpc:mock.rpc,from:mock.from});
 mock.from.mockImplementation(()=>{const b={select:()=>b,eq:()=>b,maybeSingle:async()=>({data:{id:ids.boutique,user_id:mock.owner?ids.merchant:ids.supplier}})};return b;});
 mock.rpc.mockImplementation(async(name:string)=>({data:name==="compose_store_legal_bundle"?{environment:"sandbox",legal_entity_id:ids.merchant,seller:{VENDEUR_NOM_LEGAL:mock.quote.payload.parties.merchant.legal_name,SIREN_SIRET:"REG-TEST",ADRESSE:"Adresse fictive pour recette",CONTACT_VENDEUR:"test@example.test"}}:name==="verified_supply_sample"?{sample_id:ids.key}:name==="reserve_merchant_supply_payment"?{state:"reserved",checkout_key:ids.key,destination_account:"acct_TestSupplier",totals:mock.quote.totals}:name==="get_supply_destination_route"?{enabled:true,flow:"merchant_acquisition",environment:"sandbox",entity_id:ids.supplier,account_id:"acct_TestSupplier"}:null,error:name==="reserve_merchant_supply_payment"?mock.reserveError:null}));
 mock.forward.mockImplementation(async(opts:any)=>opts.action==="list"?{quotes:[mock.quote]}:{quote:mock.quote});
 mock.account.mockResolvedValue({id:"acct_TestSupplier",charges_enabled:true,payouts_enabled:true,capabilities:{card_payments:"active",transfers:"active"}});
 mock.session.mockResolvedValue({id:"cs_test_supply",url:"https://checkout.stripe.com/c/pay/cs_test_supply"});
 const path="../../supabase/functions/merchant-supply/index.ts";await import(/* @vite-ignore */path);
});
afterEach(()=>vi.unstubAllGlobals());
const request=(overrides:Record<string,unknown>={},token="unit-test-token")=>new Request("https://example.test/merchant-supply",{method:"POST",headers:token?{Authorization:`Bearer ${token}`}:{},body:JSON.stringify({action:"checkout",boutique_id:ids.boutique,quote_id:ids.quote,checkout_key:ids.key,return_url:"https://brand-in-a-box.space/dashboard/devis-approvisionnement",...overrides})});
describe("Merchant acquisition checkout",()=>{
 it("requires authentication and server-owned store scope before reading supplier identities",async()=>{
  expect((await handler(request({},""))).status).toBe(401);expect(mock.client).not.toHaveBeenCalled();
  mock.owner=false;expect((await handler(request())).status).toBe(403);expect(mock.forward).not.toHaveBeenCalled();expect(mock.session).not.toHaveBeenCalled();
 });
 it("rejects client prices, owner IDs or account routing",async()=>{
  for(const field of ["amount_cents","merchant_id","supplier_id","account_id"]){expect((await handler(request({[field]:"forged"}))).status).toBe(400);}
  expect(mock.rpc).not.toHaveBeenCalled();expect(mock.session).not.toHaveBeenCalled();
 });
 it("requires explicit version-bound acceptance independently of marketing",async()=>{
  mock.quote=quoteFixture();
  for(const changed of [{accepted:false},{accepted:true,quote_hash:"b".repeat(64)}])expect((await handler(request({action:"accept",quote_hash:mock.quote.quote_hash,quote_version:1,signatory:"Buyer",capacity:"Director",...changed}))).status).toBe(409);
  expect(mock.forward.mock.calls.every(([arg])=>arg.action==="list")).toBe(true);expect(mock.session).not.toHaveBeenCalled();
 });
 it("blocks withdrawn admission, disabled activation, samples without readiness and missing destination before Stripe",async()=>{
  mock.quote.checkout_eligible=false;expect((await handler(request())).status).toBe(409);
  mock.quote.checkout_eligible=true;mock.ready=false;expect((await handler(request())).status).toBe(503);
  mock.ready=true;mock.quote.payload.purpose="sample";expect((await handler(request())).status).toBe(503);
  mock.quote.payload.purpose="stock";mock.reserveError={code:"55000"};expect((await handler(request())).status).toBe(503);
  expect(mock.session).not.toHaveBeenCalled();
 });
 it("creates one global payment with supplier on_behalf_of, the exact BIB gross fee and a durable retry key",async()=>{
  for(const retry of [ids.key,crypto.randomUUID()])expect((await handler(request({checkout_key:retry}))).status).toBe(200);
  for(const [params,options]of mock.session.mock.calls){
   expect(options).toEqual({idempotencyKey:`merchant-supply:${ids.key}`});
   expect(params.payment_intent_data).toMatchObject({on_behalf_of:"acct_TestSupplier",transfer_data:{destination:"acct_TestSupplier"},application_fee_amount:840});
   expect(params.line_items.reduce((sum:number,line:any)=>sum+line.price_data.unit_amount*line.quantity,0)).toBe(4440);
   expect(params.automatic_tax.enabled).toBe(false);expect(params.invoice_creation.enabled).toBe(false);
  }
 });
 it("cannot charge an account with payouts disabled or let a failed session attachment look successful",async()=>{
  mock.account.mockResolvedValue({id:"acct_TestSupplier",charges_enabled:true,payouts_enabled:false});expect((await handler(request())).status).toBe(503);expect(mock.session).not.toHaveBeenCalled();
  mock.account.mockResolvedValue({id:"acct_TestSupplier",charges_enabled:true,payouts_enabled:true,capabilities:{card_payments:"active",transfers:"active"}});
  const impl=mock.rpc.getMockImplementation()!;mock.rpc.mockImplementation(async(name:string,...args:any[])=>name==="attach_merchant_supply_session"?{error:{code:"40001"}}:impl(name,...args));
  const result=await handler(request());expect(result.status).toBe(503);expect(await result.text()).not.toContain("checkoutUrl");expect(mock.expire).toHaveBeenCalledWith("cs_test_supply");
 });
});
