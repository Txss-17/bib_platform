import { createClient } from "npm:@supabase/supabase-js@2";
import { forwardMerchantSupply } from "../_shared/merchant-supply-proxy.mjs";
import { destinationChargePlan, parseSupplyQuote } from "../_shared/supply-contract.mjs";
import { verifyConnectedDestination } from "../_shared/merchant-destination.mjs";
import { createStripeClient,corsHeaders } from "../_shared/stripe.ts";
import { assertPaymentEnvironment } from "../_shared/payment-environment.ts";
import { assertTrustedReturnUrl } from "../_shared/return-url.ts";
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const respond=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,"Content-Type":"application/json","Cache-Control":"no-store"}});
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{headers:corsHeaders});
 if(req.method!=="POST")return respond({error:"method_not_allowed"},405);
 try{
  const token=req.headers.get("Authorization")?.replace(/^Bearer\s+/i,"").trim();if(!token)return respond({error:"authentication_required"},401);
  const userClient=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const {data:auth,error:authError}=await userClient.auth.getUser(token);if(authError||!auth.user)return respond({error:"authentication_required"},401);
  const raw=await req.text();if(raw.length>12000)return respond({error:"invalid_request"},400);const body=JSON.parse(raw);
  if(!body||Object.keys(body).some(k=>!["action","boutique_id","quote_id","quote_hash","quote_version","accepted","signatory","capacity","checkout_key","return_url","supplier_product_id","quantity","purpose","note","request_key"].includes(k))||!["list","accept","checkout","request"].includes(body.action)||!uuid.test(body.boutique_id??"")||(["accept","checkout"].includes(body.action)&&!uuid.test(body.quote_id??"")))return respond({error:"invalid_request"},400);
  const environment=Deno.env.get("BIB_SUPPLY_ENVIRONMENT");if(environment!=="live"&&environment!=="sandbox")return respond({error:"supply_not_configured"},503);
  assertPaymentEnvironment(environment,key=>Deno.env.get(key));
  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
  const {data:boutique,error:ownerError}=await admin.from("boutiques").select("id,user_id").eq("id",body.boutique_id).maybeSingle();
  if(ownerError||!boutique||boutique.user_id!==auth.user.id)return respond({error:"forbidden"},403);
  const {data:bundle,error:identityError}=await admin.rpc("compose_store_legal_bundle",{p_store_id:boutique.id,p_require_published:false});
  if(identityError||!bundle||bundle.environment!==environment)return respond({error:"verified_merchant_identity_required"},503);
  const options={url:Deno.env.get("BIB_INTRANET_SUPPLY_URL"),secret:Deno.env.get("BIB_PLATFORM_BRIDGE_SECRET"),environment,merchantId:auth.user.id,boutiqueId:boutique.id,buyerEntityId:bundle.legal_entity_id};
  if(body.action==="request"){
   if(!uuid.test(body.supplier_product_id??"")||!uuid.test(body.request_key??"")||!Number.isSafeInteger(body.quantity)||body.quantity<1||body.quantity>100000||!["sample","stock","on_demand"].includes(body.purpose)||typeof body.note!=="string"||body.note.length>2000)return respond({error:"invalid_request"},400);
   const {data:catalog,error:catalogError}=await admin.from("supplier_products").select("id,intranet_id,is_active").eq("id",body.supplier_product_id).maybeSingle();
   if(catalogError||!catalog?.is_active||!uuid.test(catalog.intranet_id??""))return respond({error:"catalog_reference_unavailable"},409);
   let verifiedSample;
   if(body.purpose!=="sample"){
    const {data,error}=await admin.rpc("verified_supply_sample",{p_merchant_id:auth.user.id,p_boutique_id:boutique.id,p_catalog_id:catalog.intranet_id,p_environment:environment});
    if(error||!data)return respond({error:"verified_paid_sample_required"},409);verifiedSample=data;
   }
   return respond(await forwardMerchantSupply({...options,action:"request",requestKey:body.request_key,payload:{catalog_id:catalog.intranet_id,quantity:body.quantity,purpose:body.purpose,note:body.note,...(verifiedSample?{verified_sample:verifiedSample}:{})}}));
  }
  const result=await forwardMerchantSupply({...options,action:"list"});
  if(!Array.isArray(result.quotes))return respond({error:"supply_unavailable"},503);
  const quotes=result.quotes.filter((q:any)=>q?.payload?.parties?.merchant?.entity_id===bundle.legal_entity_id&&q.payload.parties.merchant.legal_name===bundle.seller.VENDEUR_NOM_LEGAL&&q.payload.parties.merchant.registration_id===bundle.seller.SIREN_SIRET&&q.payload.parties.merchant.address===bundle.seller.ADRESSE&&q.payload.parties.merchant.email===bundle.seller.CONTACT_VENDEUR);
  if(body.action==="list")return respond({quotes});
  const quote=quotes.find((q:any)=>q.id===body.quote_id);if(!quote)return respond({error:"quote_unavailable"},404);
  parseSupplyQuote(quote.payload);
  if(body.action==="accept"){
   if(quote.payload.purpose!=="sample"){
    const {data,error}=await admin.rpc("verified_supply_sample",{p_merchant_id:auth.user.id,p_boutique_id:boutique.id,p_catalog_id:quote.payload.catalog_id,p_environment:environment});
    if(error||!data)return respond({error:"verified_paid_sample_required"},409);
   }
   if(body.accepted!==true||body.quote_hash!==quote.quote_hash||body.quote_version!==quote.quote_version||typeof body.signatory!=="string"||!body.signatory.trim()||typeof body.capacity!=="string"||!body.capacity.trim())return respond({error:"quote_changed_or_consent_missing"},409);
   return respond(await forwardMerchantSupply({...options,action:"accept",quoteId:quote.id,payload:{accepted:true,quote_hash:body.quote_hash,quote_version:body.quote_version,signatory:body.signatory,capacity:body.capacity}}));
  }
  if(quote.checkout_eligible!==true)return respond({error:"current_supplier_admission_required"},409);
  if(Deno.env.get("BIB_SUPPLY_CHECKOUT_READY")!=="true")return respond({error:"supply_checkout_not_activated"},503);
  if(quote.payload.purpose==="sample"&&Deno.env.get("BIB_SAMPLE_FULFILLMENT_READY")!=="true")return respond({error:"sample_fulfillment_not_configured"},503);
  if(!uuid.test(body.checkout_key??""))return respond({error:"checkout_key_required"},400);
  const returnUrl=new URL(assertTrustedReturnUrl(body.return_url));if(returnUrl.pathname!=="/dashboard/devis-approvisionnement")return respond({error:"invalid_return_path"},400);
  const {data:payment,error:reserveError}=await admin.rpc("reserve_merchant_supply_payment",{p_quote:quote,p_merchant_id:auth.user.id,p_boutique_id:boutique.id,p_environment:environment,p_checkout_key:body.checkout_key});
  if(reserveError||!payment)return respond({error:"accepted_quote_or_destination_unavailable"},reserveError?.code==="40001"?409:503);
  if(payment.state==="paid")return respond({paid:true});
  if(!["reserved","checkout"].includes(payment.state))return respond({error:"payment_requires_review"},409);
  const {data:route,error:routeError}=await admin.rpc("get_supply_destination_route",{p_entity_id:quote.payload.supplier_id,p_flow:"merchant_acquisition",p_environment:environment});
  if(routeError||!route||route.account_id!==payment.destination_account)return respond({error:"verified_destination_required"},503);
  const plan=destinationChargePlan(quote.payload,route);if(plan.total_cents<50||plan.total_cents>100000000)return respond({error:"payment_amount_unavailable"},422);
  const stripe=createStripeClient(environment);await verifyConnectedDestination(stripe,route.account_id);
  const success=new URL(returnUrl);success.searchParams.set("boutiqueId",boutique.id);success.searchParams.set("payment","return");
  const cancel=new URL(returnUrl);cancel.searchParams.set("boutiqueId",boutique.id);cancel.searchParams.set("payment","cancel");
  const session=await stripe.checkout.sessions.create({mode:"payment",payment_method_types:["card"],customer_email:auth.user.email,success_url:success.href,cancel_url:cancel.href,
   payment_intent_data:{...plan.payment_intent_data,metadata:{kind:"merchant_supply",supply_quote_id:quote.id,quote_hash:quote.quote_hash}},invoice_creation:{enabled:false},automatic_tax:{enabled:false},
   line_items:payment.totals.lines.filter((l:any)=>l.total_cents>0).map((l:any)=>({price_data:{currency:"eur",unit_amount:l.total_cents,product_data:{name:l.label.slice(0,250)},tax_behavior:"inclusive"},quantity:1})),
   metadata:{kind:"merchant_supply",supply_quote_id:quote.id,quote_hash:quote.quote_hash,merchant_id:auth.user.id,boutique_id:boutique.id,environment},
   custom_text:{submit:{message:"Règlement unique du devis. Les factures restent émises par le fournisseur et les prestataires identifiés."}},
  },{idempotencyKey:`merchant-supply:${payment.checkout_key}`});
  if(!session.url)return respond({error:"checkout_unavailable"},502);
  const {error:attachError}=await admin.rpc("attach_merchant_supply_session",{p_quote_id:quote.id,p_checkout_key:payment.checkout_key,p_session_id:session.id,p_checkout_url:session.url});
  if(attachError){await stripe.checkout.sessions.expire(session.id).catch(()=>{});return respond({error:"checkout_unavailable"},503);}
  return respond({checkoutUrl:session.url});
 }catch(error){const e=error as Error&{status?:number};return respond({error:e.message==="quote_changed"?"quote_changed":"supply_unavailable"},e.status===409?409:503);}
});
