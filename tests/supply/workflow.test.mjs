import {before,beforeEach,after,test} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import {PGlite} from "@electric-sql/pglite";
import {supplyQuoteTotals} from "../../supabase/functions/_shared/supply-contract.mjs";
const merchant="30000000-0000-4000-8000-000000000001",boutique="40000000-0000-4000-8000-000000000001",supplier="10000000-0000-4000-8000-000000000001",catalog="20000000-0000-4000-8000-000000000001",entity=merchant,bib="60000000-0000-4000-8000-000000000001",product="80000000-0000-4000-8000-000000000001",sp="90000000-0000-4000-8000-000000000001";
const party=(id,name)=>({entity_id:id,legal_name:name,registration_id:"REG-TEST",address:"Adresse fictive",email:"test@example.test",evidence_reference:"JUSTIFICATIF-TEST"});
const fields={VENDEUR_NOM_LEGAL:"Marchand test",SIREN_SIRET:"REG-TEST",ADRESSE:"Adresse fictive",CONTACT_VENDEUR:"test@example.test",FORME_OU_EI:"EI",MEDIATEUR_COORDONNEES:"Médiateur fictif",TVA_ID:"Régime de test",BIB_IDENTITE_LEGALE_VERIFIEE:"Opérateur fictif",BIB_CONTACT:"Contact test",HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES:"Hébergeur test"};
const payload=()=>({schema_version:1,model:"transparent_intermediation",purpose:"stock",merchant_id:merchant,boutique_id:boutique,catalog_id:catalog,supplier_id:supplier,quantity:3,currency:"EUR",parties:{supplier:party(supplier,"Fournisseur test"),merchant:party(entity,"Marchand test"),bib:party(bib,"Opérateur test")},lines:[{component:"goods",issuer:"supplier",label:"Produit",quantity:3,unit_net_cents:1000,tax_rate_bps:2000,tax_reason:"Régime test"},{component:"delivery",issuer:"bib",label:"Livraison",quantity:1,unit_net_cents:500,tax_rate_bps:2000,tax_reason:"Régime test"},{component:"bib_fee",issuer:"bib",label:"Commission",quantity:1,unit_net_cents:200,tax_rate_bps:2000,tax_reason:"Régime test"}],valid_until:"2030-01-01T00:00:00Z",mandate_reference:"MANDAT-TEST",terms_reference:"CGS-TEST",delivery_terms:"Partenaire BIB",ownership_terms:"Aucun transfert par simple sélection."});
let db;
before(async()=>{
 db=new PGlite();
 for(const path of ["../legal-governance/fixture.sql","../../drizzle/migrations/0007_merchant_legal_acceptances.sql","../../drizzle/migrations/0025_store_legal_governance_and_order_evidence.sql","./fixture.sql","../../drizzle/migrations/0027_merchant_supply_model.sql"])
  await db.exec(await readFile(new URL(path,import.meta.url),"utf8")).catch(e=>{delete e.query;throw e;});
});
after(async()=>db.close());
beforeEach(async()=>{
 await db.exec("TRUNCATE boutiques,products,supplier_products,legal_governance_mirror,legal_governance_configuration,supply_destination_routes,merchant_supply_payments,sample_purchases,sample_validations CASCADE");
 await db.query("UPDATE supply_payment_configuration SET enabled=true,platform_entity_id=$1,evidence_reference='APPROBATION-TEST' WHERE singleton",[bib]);
 await db.exec("INSERT INTO legal_governance_configuration(singleton,environment,public_origin) VALUES(true,'live','https://example.test')");
 await db.query("INSERT INTO boutiques(id,user_id,name,slug,legal_business_name,legal_siret,legal_address,legal_email) VALUES($1,$2,'Boutique test','test',$3,$4,$5,$6)",[boutique,merchant,fields.VENDEUR_NOM_LEGAL,fields.SIREN_SIRET,fields.ADRESSE,fields.CONTACT_VENDEUR]);
 await db.query("INSERT INTO legal_governance_mirror(source_id,kind,payload,state,source_revision,activation_sequence,delivery_sequence,envelope) VALUES($1,'identity',$2,'published',1,1,2,'{}')",[randomUUID(),{store_id:boutique,owner_id:merchant,fields,legal_entity_id:entity}]);
 for(const model_key of ["JUR-B01","JUR-B02","JUR-B03"])await db.query("INSERT INTO legal_governance_mirror(source_id,kind,payload,state,source_revision,activation_sequence,delivery_sequence,envelope) VALUES($1,'model',$2,'published',1,1,2,'{}')",[randomUUID(),{model_key,body:"Document de test uniquement",version:"v1",title:"Test",locale:"fr",effective_at:"2026-01-01T00:00:00Z"}]);
 await db.exec("UPDATE boutiques SET status='published'");
 await db.query("INSERT INTO supplier_products(id,intranet_id,is_active,base_price,acquisition_pricing) VALUES($1,$2,true,12.5,$3)",[sp,catalog,{version:"price-test",currency:"EUR",goods_unit_cents:1000,delivery_unit_cents:100,bib_fee_unit_cents:150}]);
 await db.query("INSERT INTO products(id,boutique_id,status,supplier_product_id) VALUES($1,$2,'draft',$3)",[product,boutique,sp]);
 await db.query("INSERT INTO sample_validations(product_id,user_id,status,visual_confirmed_at) VALUES($1,$2,'validated',now())",[product,merchant]);
 await db.query("INSERT INTO sample_purchases(product_id,user_id,stripe_session_id,stripe_environment,amount_cents,currency,payment_status,paid_at) VALUES($1,$2,'cs_verified_sample','live',1200,'eur','paid',now())",[product,merchant]);
 for(const [id,flow,account]of[[supplier,"merchant_acquisition","acct_SupplierTest"],[entity,"merchant_sale","acct_MerchantTest"]])await db.query("INSERT INTO supply_destination_routes(entity_id,environment,flow,account_id,enabled,evidence_reference,tax_liability_approved,verified_at) VALUES($1,'live',$2,$3,true,'VALIDATION-TEST',true,now())",[id,flow,account]);
});
const rpc=(name,args,role="service_role",actor="")=>db.transaction(async tx=>{await tx.exec("SET LOCAL ROLE "+role);await tx.query("SELECT set_config('request.jwt.claim.sub',$1,true)",[actor]);return(await tx.query(`SELECT ${name}(${args.map((_,i)=>`$${i+1}`).join(',')}) result`,args)).rows[0].result;}).catch(e=>{delete e.query;throw e;});
async function quote(p=payload()) {const hash=(await db.query("SELECT encode(sha256(convert_to($1::jsonb::text,'UTF8')),'hex') hash",[p])).rows[0].hash;return{id:randomUUID(),checkout_eligible:true,state:"accepted",payload:p,totals:supplyQuoteTotals(p),quote_hash:hash,acceptance:{actor_id:merchant,quote_hash:hash}};}
const reserve=(q,actor=merchant,env="live",key=randomUUID())=>rpc("reserve_merchant_supply_payment",[q,actor,boutique,env,key]);
async function attach(q){const p=await reserve(q);await rpc("attach_merchant_supply_session",[q.id,p.checkout_key,"cs_supply_test","https://checkout.stripe.com/test"]);return p;}
const session=q=>({id:"cs_supply_test",payment_intent:"pi_supply_test",payment_status:"paid",amount_total:q.totals.total_cents,currency:"eur",metadata:{supply_quote_id:q.id,quote_hash:q.quote_hash}});
const intent=q=>({id:"pi_supply_test",status:"succeeded",on_behalf_of:"acct_SupplierTest",transfer_data:{destination:"acct_SupplierTest"},application_fee_amount:q.totals.by_issuer.bib,amount_received:q.totals.total_cents,currency:"eur",latest_charge:{id:"ch_supply_test",payment_intent:"pi_supply_test",amount:q.totals.total_cents,currency:"eur",paid:true,amount_refunded:0,disputed:false}});
test("retail destination is the verified merchant and cannot silently use BIB as principal",async()=>{
 const route=await rpc("get_storefront_destination_route",[boutique,"live"]);assert.equal(route.account_id,"acct_MerchantTest");
 await db.exec("UPDATE supply_destination_routes SET model='own_ei_principal' WHERE flow='merchant_sale'");await assert.rejects(()=>rpc("get_storefront_destination_route",[boutique,"live"]),/destination_unavailable/);
});
test("only an accepted exact quote for the current verified buyer can reserve a supplier payment",async()=>{
 const q=await quote();await assert.rejects(()=>reserve({...q,state:"issued"}),/accepted_supply_quote/);
 await assert.rejects(()=>reserve({...q,quote_hash:"0".repeat(64)}),/evidence_mismatch/);
 await assert.rejects(()=>reserve(q,randomUUID()),/accepted_supply_quote/);
 await assert.rejects(()=>reserve(q,merchant,"sandbox"),/current_supply_buyer/);
 assert.equal((await reserve(q)).totals.total_cents,4440);
});
test("one quote keeps one payment key across retries and refuses route changes",async()=>{
 const q=await quote(),first=await reserve(q);const replay=await reserve(q);assert.equal(replay.checkout_key,first.checkout_key);
 await db.exec("UPDATE supply_destination_routes SET account_id='acct_Other' WHERE flow='merchant_acquisition'");await assert.rejects(()=>reserve(q),/checkout_conflict/);
});
test("a third independent logistics payee is blocked for destination charges",async()=>{
 const p=payload();p.parties.logistics=party(randomUUID(),"Logisticien");p.lines[1].issuer="logistics";
 const q=await quote(p);await assert.rejects(()=>reserve(q),/single_beneficiary/);
});
test("browser callers cannot reserve or mark paid, while a redirect cannot create a payment proof",async()=>{
 const q=await quote();await assert.rejects(()=>rpc("reserve_merchant_supply_payment",[q,merchant,boutique,"live",randomUUID()],"authenticated",merchant),/permission denied/);
 await attach(q);const [row]=(await db.query("SELECT state FROM merchant_supply_payments")).rows;assert.equal(row.state,"checkout");
 await assert.rejects(()=>rpc("record_merchant_supply_payment",[session(q),intent(q),"live","evt_fake"],"authenticated",merchant),/permission denied/);
});
test("webhook evidence checks price, currency, destination and fee; creates one durable sync event",async()=>{
 const q=await quote();await attach(q);
 await assert.rejects(()=>rpc("record_merchant_supply_payment",[{...session(q),amount_total:1},intent(q),"live","evt_bad"]),/payment_mismatch/);
 await assert.rejects(()=>rpc("record_merchant_supply_payment",[session(q),{...intent(q),on_behalf_of:"acct_Other"},"live","evt_bad"]),/payment_mismatch/);
 await rpc("record_merchant_supply_payment",[session(q),intent(q),"live","evt_good"]);await rpc("record_merchant_supply_payment",[session(q),intent(q),"live","evt_good"]);
 const events=(await db.query("SELECT payload FROM merchant_supply_payment_outbox")).rows;assert.equal(events.length,1);assert.equal(events[0].payload.bib_collected_cents,840);assert.equal(events[0].payload.bib_revenue_cents,700);assert.equal(events[0].payload.supplier_cents,3600);
});
test("paid samples become ordered, never physically received or validated; repeated webhook preserves physical state",async()=>{
 await db.exec("TRUNCATE sample_purchases,sample_validations");const p=payload();p.purpose="sample";const q=await quote(p);await attach(q);await rpc("record_merchant_supply_payment",[session(q),intent(q),"live","evt_sample"]);
 assert.equal((await db.query("SELECT status FROM sample_validations")).rows[0].status,"ordered");
 await db.exec("UPDATE sample_validations SET status='received'");await rpc("record_merchant_supply_payment",[session(q),intent(q),"live","evt_sample_retry"]);assert.equal((await db.query("SELECT status FROM sample_validations")).rows[0].status,"received");
});
test("refunds and disputes retain original proof, queue a new revision and never turn a failed session paid",async()=>{
 const q=await quote();await attach(q);await rpc("record_merchant_supply_payment",[session(q),intent(q),"live","evt_paid"]);
 await rpc("adjust_merchant_supply_payment",["pi_supply_test","live","evt_refund","partially_refunded",1000,{charge_id:"ch_test"}]);
 assert.equal((await db.query("SELECT state FROM merchant_supply_payments")).rows[0].state,"partially_refunded");assert.equal((await db.query("SELECT count(*) n FROM merchant_supply_payment_outbox")).rows[0].n,2);
 await assert.rejects(()=>rpc("adjust_merchant_supply_payment",["pi_supply_test","live","evt_forged_won","paid",1000,{}]),/invalid_supply_adjustment/);
 await rpc("fail_merchant_supply_checkout",["cs_supply_test","live"]);assert.equal((await db.query("SELECT state FROM merchant_supply_payments")).rows[0].state,"partially_refunded");
});

test("a refund that precedes checkout completion is recorded as a hold from the start",async()=>{
 const q=await quote();await attach(q);const pi=intent(q);pi.latest_charge.amount_refunded=1000;
 await rpc("record_merchant_supply_payment",[session(q),pi,"live","evt_late_checkout"]);
 const row=(await db.query("SELECT state,refunded_cents FROM merchant_supply_payments")).rows[0];assert.equal(row.state,"partially_refunded");assert.equal(row.refunded_cents,1000);
 assert.equal((await db.query("SELECT payload FROM merchant_supply_payment_outbox")).rows[0].payload.state,"partially_refunded");
});
test("accepted quotes fail closed when the source admission has been withdrawn",async()=>{
 const q=await quote();await assert.rejects(()=>reserve({...q,checkout_eligible:false}),/accepted_supply_quote_required/);
});

test("stock quotes and legacy restock requests require a current paid, physically approved sample",async()=>{
 await db.exec("UPDATE sample_validations SET visual_confirmed_at=NULL");
 const q=await quote();await assert.rejects(()=>reserve(q),/verified_paid_sample_required/);
 await assert.rejects(()=>rpc("verified_supply_sample",[merchant,boutique,catalog,"live"]),/verified_paid_sample_required/);
 await assert.rejects(()=>db.query("INSERT INTO stock_restock_requests(product_id,boutique_id,supplier_product_id) VALUES($1,$2,$3)",[product,boutique,sp]),/verified_paid_sample_required/);
 await db.exec("UPDATE sample_validations SET visual_confirmed_at=now()");
 assert.ok((await rpc("verified_supply_sample",[merchant,boutique,catalog,"live"])).sample_id);
 await db.query("INSERT INTO stock_restock_requests(product_id,boutique_id,supplier_product_id) VALUES($1,$2,$3)",[product,boutique,sp]);
});
