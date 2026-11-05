import { createClient } from "npm:@supabase/supabase-js@2";
import { assertPaymentEnvironment } from "../_shared/payment-environment.ts";
import { forwardMerchantSupply } from "../_shared/merchant-supply-proxy.mjs";
const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json"}});
Deno.serve(async req=>{
 if(req.method!=="POST")return reply({error:"method_not_allowed"},405);
 const key=Deno.env.get("BIB_SUPPLY_WORKER_KEY");
 if(!key||key.length<32)return reply({error:"worker_not_configured"},503);
 const provided=req.headers.get("x-bib-worker-key")??"";let diff=provided.length^key.length;for(let i=0;i<Math.max(provided.length,key.length);i++)diff|=(provided.charCodeAt(i)||0)^(key.charCodeAt(i)||0);
 if(diff)return reply({error:"unauthorized"},401);
 const environment=Deno.env.get("BIB_SUPPLY_ENVIRONMENT");if(environment!=="sandbox"&&environment!=="live")return reply({error:"worker_not_configured"},503);
 try{assertPaymentEnvironment(environment,name=>Deno.env.get(name));}catch{return reply({error:"worker_not_configured"},503);}
 const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 const {data:rows,error}=await admin.from("merchant_supply_payment_outbox").select("quote_id,revision,payload").is("delivered_at",null).order("created_at").limit(50);
 if(error)return reply({error:"outbox_unavailable"},503);
 let delivered=0;
 for(const row of rows??[]){
  if(row.payload.environment!==environment)continue;
  try{
   await forwardMerchantSupply({url:Deno.env.get("BIB_INTRANET_SUPPLY_URL"),secret:Deno.env.get("BIB_PLATFORM_BRIDGE_SECRET"),environment,action:"settlement",quoteId:row.quote_id,payload:row.payload,merchantId:undefined,boutiqueId:undefined,buyerEntityId:undefined});
   const {error:ackError}=await admin.from("merchant_supply_payment_outbox").update({delivered_at:new Date().toISOString()}).eq("quote_id",row.quote_id).eq("revision",row.revision);
   if(!ackError)delivered++;
  }catch{/* Keep the canonical row pending for a supervised retry; never discard it. */}
 }
 return reply({delivered,pending:(rows??[]).length-delivered});
});
