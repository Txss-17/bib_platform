import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
const mock=vi.hoisted(()=>({client:vi.fn(),forward:vi.fn(),from:vi.fn(),ack:vi.fn(),secret:"unit-test-worker-key-32-characters-only",environment:"sandbox"}));
vi.mock("npm:@supabase/supabase-js@2",()=>({createClient:mock.client}));
vi.mock("../../supabase/functions/_shared/merchant-supply-proxy.mjs",()=>({forwardMerchantSupply:mock.forward}));
let handler:(request:Request)=>Promise<Response>;
beforeEach(async()=>{
 vi.resetModules();vi.clearAllMocks();mock.secret="unit-test-worker-key-32-characters-only";mock.environment="sandbox";
 vi.stubGlobal("Deno",{serve:(fn:typeof handler)=>{handler=fn;},env:{get:(key:string)=>({BIB_SUPPLY_WORKER_KEY:mock.secret,BIB_SUPPLY_ENVIRONMENT:mock.environment,PAYMENTS_ENVIRONMENT:"sandbox",PAYMENTS_LIVE_PROJECT_REF:"live-test",PAYMENTS_SANDBOX_PROJECT_REF:"sandbox-test",SUPABASE_URL:"https://sandbox-test.supabase.co",SUPABASE_SERVICE_ROLE_KEY:"unit-test-private",BIB_INTRANET_SUPPLY_URL:"https://example.test/portal",BIB_PLATFORM_BRIDGE_SECRET:"unit-test-bridge-key-32-characters-only"})[key]}});
 mock.client.mockReturnValue({from:mock.from});mock.ack.mockResolvedValue({error:null});
 mock.from.mockImplementation(()=>{const b={select:()=>b,is:()=>b,order:()=>b,limit:async()=>({data:[{quote_id:"quote-test",revision:2,payload:{environment:"sandbox",state:"paid"}}]}),update:()=>{const u={eq:()=>u,then:(resolve:any)=>mock.ack().then(resolve)};return u;}};return b;});
 const path="../../supabase/functions/merchant-supply-sync/index.ts";await import(/* @vite-ignore */path);
});
afterEach(()=>vi.unstubAllGlobals());
const request=(secret="unit-test-worker-key-32-characters-only")=>new Request("https://example.test/sync",{method:"POST",headers:{"x-bib-worker-key":secret}});
describe("Private merchant settlement outbox",()=>{
 it("checks worker authentication and project environment before opening a database client",async()=>{
  expect((await handler(request("wrong"))).status).toBe(401);expect(mock.client).not.toHaveBeenCalled();
  mock.environment="live";expect((await handler(request())).status).toBe(503);expect(mock.client).not.toHaveBeenCalled();
 });
 it("keeps failed bridge deliveries pending instead of acknowledging them",async()=>{
  mock.forward.mockRejectedValue(new Error("unavailable"));const response=await handler(request());expect(await response.json()).toEqual({delivered:0,pending:1});expect(mock.ack).not.toHaveBeenCalled();
 });
 it("only acknowledges a committed delivery and retains failed local acknowledgement for idempotent retry",async()=>{
  mock.forward.mockResolvedValue({ok:true});mock.ack.mockResolvedValue({error:{code:"outage"}});expect(await (await handler(request())).json()).toEqual({delivered:0,pending:1});
  mock.ack.mockResolvedValue({error:null});expect(await (await handler(request())).json()).toEqual({delivered:1,pending:0});expect(mock.forward).toHaveBeenCalledTimes(2);
 });
});
