import {describe,expect,it} from "vitest";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import {PGlite} from "@electric-sql/pglite";
import {platform,intranet} from "./paths";

const {supplierProductPayload}=await import(intranet+"/supabase/functions/_shared/platform-payloads.ts");
const {loadAdmittedSupplierProduct}=await import(intranet+"/supabase/functions/_shared/supplier-reference-publication.mjs");
const {createMerchantSupplyPortal}=await import(intranet+"/supabase/functions/_shared/merchant-supply-portal-handler.mjs");
const {forwardMerchantSupply}=await import(platform+"/supabase/functions/_shared/merchant-supply-proxy.mjs");
const {BridgeBody}=await import(platform+"/supabase/functions/_shared/bridge-contract.ts");
const {assertPaymentEnvironment}=await import(platform+"/supabase/functions/_shared/payment-environment.ts");

const id={supplier:"10000000-0000-4000-8000-000000000001",catalog:"20000000-0000-4000-8000-000000000001",merchant:"30000000-0000-4000-8000-000000000001",boutique:"40000000-0000-4000-8000-000000000001",author:"50000000-0000-4000-8000-000000000001",finance:"50000000-0000-4000-8000-000000000002",bib:"60000000-0000-4000-8000-000000000001",identity:"70000000-0000-4000-8000-000000000001",product:"80000000-0000-4000-8000-000000000001",publicCatalog:"90000000-0000-4000-8000-000000000001"};
const party=(entity_id:string,legal_name:string)=>({entity_id,legal_name,registration_id:"REG-RECETTE",address:"Adresse fictive de recette",email:"recette@example.test",evidence_reference:"JUSTIFICATIF-FICTIF"});
const operator=party(id.bib,"Opérateur BIB fictif"),seller=party(id.supplier,"Fournisseur fictif");
const fields={VENDEUR_NOM_LEGAL:"Marchand fictif",SIREN_SIRET:"REG-RECETTE",ADRESSE:"Adresse fictive de recette",CONTACT_VENDEUR:"recette@example.test",FORME_OU_EI:"EI",MEDIATEUR_COORDONNEES:"Médiateur fictif",TVA_ID:"Régime de recette",BIB_IDENTITE_LEGALE_VERIFIEE:"Opérateur BIB fictif",BIB_CONTACT:"Contact de recette",HEBERGEUR_RAISON_SOCIALE_ET_COORDONNEES:"Hébergeur fictif"};
const secret="recette-interapplications-sans-service-reel-32";

async function rpc(db:PGlite,name:string,args:Record<string,unknown>,actor:string|null=null,testMode=false){
 if(!/^[a-z_]+$/.test(name)||Object.keys(args).some(k=>!/^[a-z_]+$/.test(k)))throw new Error("Unexpected test RPC");
 return db.transaction(async tx=>{
  const role=actor?"authenticated":"service_role";
  await tx.exec("SET LOCAL ROLE "+role);
  await tx.query("SELECT set_config('request.jwt.claim.sub',$1,true),set_config('request.jwt.claim.role',$2,true),set_config('bib.test_mode',$3,true)",[actor??"",role,String(testMode)]);
  const params=Object.keys(args).map((key,n)=>`${key} => $${n+1}`).join(",");
  return (await tx.query(`SELECT public.${name}(${params}) result`,Object.values(args))).rows[0].result as any;
 }).catch(error=>{delete error.query;throw error;});
}
async function prepare(environment:"live"|"sandbox"){
 const source=new PGlite(),destination=new PGlite(),testMode=environment==="sandbox";
 for(const file of ["tests/supply/fixture.sql","drizzle/migrations/0086_merchant_supply_model.sql","drizzle/migrations/0087_catalog_sandbox_isolation.sql"])
  await source.exec(await readFile(intranet+"/"+file,"utf8"));
 await source.exec("ALTER TABLE products ADD COLUMN updated_at timestamptz DEFAULT now(),ADD COLUMN category text DEFAULT 'Maison',ADD COLUMN selling_price numeric DEFAULT 10");
 for(const file of ["tests/legal-governance/fixture.sql","drizzle/migrations/0007_merchant_legal_acceptances.sql","drizzle/migrations/0025_store_legal_governance_and_order_evidence.sql","tests/supply/fixture.sql","drizzle/migrations/0027_merchant_supply_model.sql"])
  await destination.exec(await readFile(platform+"/"+file,"utf8"));
 await destination.exec("ALTER TABLE products ADD COLUMN stock_quantity integer DEFAULT 0");
 await source.query("UPDATE supply_operator_configuration SET enabled=true,party=$1,evidence_reference='REVUE-FICTIVE' WHERE singleton",[operator]);
 await source.query("INSERT INTO suppliers VALUES($1,'Fournisseur fictif','active',$2)",[id.supplier,testMode]);
 await source.query("INSERT INTO products(id,supplier_id,name,sku,status,test_account) VALUES($1,$2,'Produit fictif','RECETTE-SKU','validated',$3)",[id.catalog,id.supplier,testMode]);
 await source.query("INSERT INTO test_reference_admissions VALUES($1,'RECETTE-SKU',true,$2)",[id.supplier,testMode]);
 const owner=randomUUID();await source.query("INSERT INTO user_accounts VALUES($1,$2)",[owner,id.merchant]);
 await source.query("INSERT INTO shops VALUES($1,$2,$3,'Boutique fictive')",[randomUUID(),id.boutique,owner]);
 const identity={store_id:id.boutique,owner_id:id.merchant,legal_entity_id:id.merchant,fields};
 await source.query("INSERT INTO legal_governance_records(id,kind,payload,state,test_account,activation_sequence) VALUES($1,'identity',$2,'published',$3,1)",[id.identity,identity,testMode]);
 for(const action of ["read","create","update"])for(const page of ["supplier.suppliers","supplier.restock"])await source.query("INSERT INTO test_permissions VALUES($1,$2,$3)",[id.author,page,action]);
 for(const action of ["read","validate"])await source.query("INSERT INTO test_permissions VALUES($1,'finance.billing',$2)",[id.finance,action]);
 await destination.query("INSERT INTO boutiques(id,user_id,name,slug,legal_business_name,legal_siret,legal_address,legal_email) VALUES($1,$2,'Boutique fictive','recette',$3,$4,$5,$6)",[id.boutique,id.merchant,fields.VENDEUR_NOM_LEGAL,fields.SIREN_SIRET,fields.ADRESSE,fields.CONTACT_VENDEUR]);
 await destination.query("INSERT INTO legal_governance_configuration(singleton,environment,public_origin) VALUES(true,$1,'https://recette.example.test')",[environment]);
 await destination.query("INSERT INTO legal_governance_mirror(source_id,kind,payload,state,source_revision,activation_sequence,delivery_sequence,envelope) VALUES($1,'identity',$2,'published',1,1,1,'{}')",[id.identity,identity]);
 for(const model_key of ["JUR-B01","JUR-B02","JUR-B03"])await destination.query("INSERT INTO legal_governance_mirror(source_id,kind,payload,state,source_revision,activation_sequence,delivery_sequence,envelope) VALUES($1,'model',$2,'published',1,1,1,'{}')",[randomUUID(),{model_key,body:"Document fictif de recette",version:"v1",title:"Recette",locale:"fr",effective_at:"2026-01-01T00:00:00Z"}]);
 await destination.query("UPDATE supply_payment_configuration SET enabled=true,platform_entity_id=$1,evidence_reference='REVUE-FICTIVE' WHERE singleton",[id.bib]);
 await destination.query("INSERT INTO supply_destination_routes(entity_id,environment,flow,account_id,enabled,evidence_reference,tax_liability_approved,verified_at) VALUES($1,$2,'merchant_acquisition','acct_RecetteFournisseur',true,'REVUE-FICTIVE',true,now())",[id.supplier,environment]);
 const sourceRpc=(name:string,args:Record<string,unknown>,actor:string|null=null)=>rpc(source,name,args,actor,testMode);
 const platformRpc=(name:string,args:Record<string,unknown>,actor:string|null=null)=>rpc(destination,name,args,actor);
 const admin={rpc:async(name:string,args:Record<string,unknown>)=>{try{return{data:await sourceRpc(name,args),error:null};}catch(error){return{data:null,error};}}};
 const handler=createMerchantSupplyPortal({secret,environment,getAdmin:()=>admin});
 const forward=(action:string,extra:Record<string,unknown>={})=>forwardMerchantSupply({url:"https://source.recette.example.test/portal",secret,environment,merchantId:id.merchant,boutiqueId:id.boutique,buyerEntityId:id.merchant,action,...extra,
  fetcher:(url:string,init:RequestInit)=>handler(new Request(url,init))});
 return{source,destination,sourceRpc,platformRpc,forward,admin,testMode};
}

describe.each(["live","sandbox"] as const)("Isolated merchant supply flow (%s)",environment=>{
 it("transmits the accepted merchant evidence, records one settlement and requires Finance coverage before production",async()=>{
  const c=await prepare(environment);
  try{
   const price={version:"PRIX-FICTIF",currency:"EUR",goods_unit_cents:1000,delivery_unit_cents:100,bib_fee_unit_cents:150};
   const priceId=await c.sourceRpc("propose_catalog_acquisition_price",{p_product_id:id.catalog,p_price:price,p_evidence_reference:"TARIF-FICTIF"},id.author);
   await c.sourceRpc("approve_catalog_acquisition_price",{p_id:priceId},id.finance);
   const caller={from:()=>({select(){return this;},eq(){return this;},single:async()=>({data:(await c.source.query("SELECT to_jsonb(p) product FROM products p WHERE id=$1",[id.catalog])).rows[0].product})})};
   const admitted=await loadAdmittedSupplierProduct(caller,c.admin,id.catalog,{environment});expect(admitted.error).toBeUndefined();
   const publication=BridgeBody.parse(supplierProductPayload(admitted.product));expect(publication.data.environment).toBe(environment);
   expect(publication.data).not.toHaveProperty("supplier_id");expect(publication.data).not.toHaveProperty("supplier_name");
   const config={PAYMENTS_ENVIRONMENT:environment,PAYMENTS_LIVE_PROJECT_REF:"live-recette",PAYMENTS_SANDBOX_PROJECT_REF:"sandbox-recette",SUPABASE_URL:`https://${environment}-recette.supabase.co`};
   assertPaymentEnvironment(publication.data.environment,(key:string)=>config[key as keyof typeof config]);
   await c.destination.query("INSERT INTO supplier_products(id,intranet_id,is_active,base_price,acquisition_pricing) VALUES($1,$2,true,$3,$4)",[id.publicCatalog,id.catalog,publication.data.base_price,publication.data.acquisition_pricing]);
   await c.destination.query("INSERT INTO products(id,boutique_id,status,supplier_product_id) VALUES($1,$2,'draft',$3)",[id.product,id.boutique,id.publicCatalog]);
   await c.destination.query("INSERT INTO sample_validations(product_id,user_id,status,visual_confirmed_at) VALUES($1,$2,'validated',now())",[id.product,id.merchant]);
   await c.destination.query("INSERT INTO sample_purchases(product_id,user_id,stripe_session_id,stripe_environment,amount_cents,currency,payment_status,paid_at) VALUES($1,$2,'cs_echantillon_fictif',$3,1200,'eur','paid',now())",[id.product,id.merchant,environment]);
   const proof=await c.platformRpc("verified_supply_sample",{p_merchant_id:id.merchant,p_boutique_id:id.boutique,p_catalog_id:id.catalog,p_environment:environment});
   const request={catalog_id:id.catalog,purpose:"stock",quantity:3,note:"Commande fictive de recette",verified_sample:proof};
   const requestKey=randomUUID(),received=await c.forward("request",{requestKey,payload:request});
   expect((await c.forward("request",{requestKey,payload:request})).request_id).toBe(received.request_id);
   const options=await c.sourceRpc("supply_quote_options",{},id.author);
   const payload={schema_version:1,model:"transparent_intermediation",purpose:"stock",merchant_id:id.merchant,boutique_id:id.boutique,catalog_id:id.catalog,supplier_id:id.supplier,quantity:3,currency:"EUR",parties:{merchant:options.buyers[0].party,supplier:seller,bib:operator},
    lines:[{component:"goods",issuer:"supplier",label:"Produit fictif",quantity:3,unit_net_cents:1000,tax_rate_bps:2000,tax_reason:"Régime fictif de recette"},{component:"delivery",issuer:"bib",label:"Livraison",quantity:1,unit_net_cents:500,tax_rate_bps:2000,tax_reason:"Régime fictif de recette"},{component:"bib_fee",issuer:"bib",label:"Commission BIB",quantity:1,unit_net_cents:200,tax_rate_bps:2000,tax_reason:"Régime fictif de recette"}],valid_until:"2099-01-01T00:00:00Z",mandate_reference:"MANDAT-FICTIF",terms_reference:"CONTRAT-FICTIF",delivery_terms:"Partenaire logistique BIB uniquement",ownership_terms:"Le marchand achète au fournisseur ; le dépôt ne transfère pas la propriété à BIB."};
   let q=await c.sourceRpc("create_merchant_supply_quote",{p_key:randomUUID(),p_payload:payload,p_request_id:received.request_id},id.author);
   const advance=async(action:string,data={},actor=id.author)=>{q=await c.sourceRpc("advance_merchant_supply_quote",{p_id:q.id,p_revision:q.revision,p_key:randomUUID(),p_action:action,p_payload:data},actor);};
   await advance("submit");await advance("approve",{evidence_reference:"REVUE-FICTIVE"},id.finance);await advance("issue");
   let list=await c.forward("list");expect(list.quotes).toHaveLength(1);expect(list.quotes[0].payload.parties.supplier.legal_name).toBe("Fournisseur fictif");
   await c.forward("accept",{quoteId:q.id,payload:{accepted:true,quote_hash:q.quote_hash,quote_version:q.quote_version,signatory:"Représentant fictif",capacity:"Mandataire fictif"}});
   list=await c.forward("list");const accepted=list.quotes[0];
   expect(accepted.acceptance.actor_id).toBe(id.merchant);expect(accepted).not.toHaveProperty("coverage");expect(accepted).not.toHaveProperty("approved_by");
   await expect(c.platformRpc("reserve_merchant_supply_payment",{p_quote:{...accepted,acceptance:{...accepted.acceptance,actor_id:undefined}},p_merchant_id:id.merchant,p_boutique_id:id.boutique,p_environment:environment,p_checkout_key:randomUUID()})).rejects.toThrow(/supply_evidence_mismatch/);
   const payment=await c.platformRpc("reserve_merchant_supply_payment",{p_quote:accepted,p_merchant_id:id.merchant,p_boutique_id:id.boutique,p_environment:environment,p_checkout_key:randomUUID()});expect(payment.totals.total_cents).toBe(4440);
   const sessionId=`cs_recette_${environment}`,intentId=`pi_recette_${environment}`;
   await c.platformRpc("attach_merchant_supply_session",{p_quote_id:q.id,p_checkout_key:payment.checkout_key,p_session_id:sessionId,p_checkout_url:"https://checkout.stripe.com/recette-fictive"});
   const receipt={p_session:{id:sessionId,payment_intent:intentId,payment_status:"paid",amount_total:4440,currency:"eur",metadata:{supply_quote_id:q.id,quote_hash:q.quote_hash}},p_payment_intent:{id:intentId,status:"succeeded",amount_received:4440,currency:"eur",on_behalf_of:"acct_RecetteFournisseur",transfer_data:{destination:"acct_RecetteFournisseur"},application_fee_amount:840,latest_charge:{id:"ch_fictif",payment_intent:intentId,amount:4440,currency:"eur",paid:true,amount_refunded:0,disputed:false}},p_environment:environment,p_event_id:"evt_recette_paid"};
   await c.platformRpc("record_merchant_supply_payment",receipt);await c.platformRpc("record_merchant_supply_payment",receipt);
   const outbox=(await c.destination.query("SELECT payload FROM merchant_supply_payment_outbox ORDER BY revision")).rows;expect(outbox).toHaveLength(1);
   await c.forward("settlement",{quoteId:q.id,payload:outbox[0].payload});await c.forward("settlement",{quoteId:q.id,payload:outbox[0].payload});
   const location=randomUUID();await c.source.query("INSERT INTO logistics_partners VALUES($1,'Entrepôt fictif','active')",[location]);
   const restock=(await c.source.transaction(async tx=>{await tx.exec("SET LOCAL ROLE authenticated");await tx.query("SELECT set_config('request.jwt.claim.sub',$1,true),set_config('bib.test_mode',$2,true)",[id.author,String(c.testMode)]);return tx.query("INSERT INTO supplier_restock_orders(supply_quote_id,destination_type,destination_id,destination_name) VALUES($1,'logistics_partner',$2,'Entrepôt fictif') RETURNING id",[q.id,location]);})).rows[0].id;
   const status=(next:string)=>c.source.transaction(async tx=>{await tx.exec("SET LOCAL ROLE authenticated");await tx.query("SELECT set_config('request.jwt.claim.sub',$1,true),set_config('bib.test_mode',$2,true)",[id.author,String(c.testMode)]);await tx.query("UPDATE supplier_restock_orders SET status=$1 WHERE id=$2",[next,restock]);}).catch(error=>{delete error.query;throw error;});
   await status("sent");await expect(status("in_production")).rejects.toThrow(/financial_coverage_required/);
   q=(await c.source.query("SELECT * FROM merchant_supply_quotes WHERE id=$1",[q.id])).rows[0];
   await advance("record_coverage",{amount_cents:4440,evidence_reference:"COUVERTURE-FICTIVE",coverage_terms:"Fonds disponibles vérifiés pour la recette fictive",valid_until:"2099-01-01T00:00:00Z"},id.finance);await status("in_production");
   await advance("attach_invoice",{issuer:"supplier",reference:"F-FOURNISSEUR-FICTIVE",document_reference:"PIECE-FOURNISSEUR-FICTIVE",amount_cents:3600,debtor:"merchant"},id.finance);
   await advance("attach_invoice",{issuer:"bib",reference:"F-BIB-FICTIVE",document_reference:"PIECE-BIB-FICTIVE",amount_cents:840,debtor:"merchant"},id.finance);
   const documents=(await c.forward("list")).quotes[0].invoice_documents;
   expect(documents.map((doc:any)=>[doc.issuer,doc.amount_cents])).toEqual([["supplier",3600],["bib",840]]);
   expect(documents.every((doc:any)=>!("recorded_by" in doc))).toBe(true);
   await c.platformRpc("adjust_merchant_supply_payment",{p_payment_intent_id:intentId,p_environment:environment,p_event_id:"evt_recette_refund",p_state:"partially_refunded",p_refunded_cents:1000,p_evidence:{charge_id:"ch_fictif"}});
   const refund=(await c.destination.query("SELECT payload FROM merchant_supply_payment_outbox ORDER BY revision DESC LIMIT 1")).rows[0].payload;
   await c.forward("settlement",{quoteId:q.id,payload:refund});await c.forward("settlement",{quoteId:q.id,payload:outbox[0].payload});
   await expect(status("shipped")).rejects.toThrow(/financial_coverage_required/);
   expect((await c.source.query("SELECT state FROM merchant_supply_settlements WHERE quote_id=$1",[q.id])).rows[0].state).toBe("partially_refunded");
   expect((await c.destination.query("SELECT stock_quantity FROM products WHERE id=$1",[id.product])).rows[0].stock_quantity).toBe(0);
   expect((await c.platformRpc("get_own_supply_payments",{p_boutique_id:id.boutique},randomUUID()))).toEqual([]);
  }finally{await c.source.close();await c.destination.close();}
 },30000);
});
