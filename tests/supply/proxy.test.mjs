import {test} from "node:test";
import assert from "node:assert/strict";
import {forwardMerchantSupply} from "../../supabase/functions/_shared/merchant-supply-proxy.mjs";
const opts={url:"https://intrabib.example.test/functions/v1/merchant-supply-portal",secret:"unit-test-bridge-key-32-characters-only",environment:"sandbox",action:"list",merchantId:"merchant",boutiqueId:"boutique",buyerEntityId:"entity"};
const envelope={schema_version:1,source_app:"intrabib",environment:"sandbox",quotes:[]};
test("private bridge validates configuration before any network call",async()=>{
 let calls=0;const fetcher=async()=>{calls++;throw new Error("must not call");};
 for(const changed of [{secret:"short"},{environment:"demo"},{url:"http://intrabib.example.test"},{url:"https://user:pass@intrabib.example.test"},{url:opts.url+"?key=wrong"}])
  await assert.rejects(()=>forwardMerchantSupply({...opts,...changed,fetcher}));
 assert.equal(calls,0);
});
test("bridge sends server scope and rejects unrelated or uncommitted response envelopes",async()=>{
 let sent;const fetcher=async(url,request)=>{sent={url,request};return Response.json(envelope);};
 assert.deepEqual(await forwardMerchantSupply({...opts,fetcher}),envelope);
 assert.equal(sent.request.headers["x-bib-bridge-key"],opts.secret);assert.equal(JSON.parse(sent.request.body).buyer_entity_id,"entity");
 for(const bad of [{quotes:[]},{...envelope,source_app:"other"},{...envelope,environment:"live"},{...envelope,quotes:null}])
  await assert.rejects(()=>forwardMerchantSupply({...opts,fetcher:async()=>Response.json(bad)}),/invalid_supply_response/);
 await assert.rejects(()=>forwardMerchantSupply({...opts,action:"settlement",fetcher:async()=>Response.json(envelope)}),/invalid_supply_response/);
 await assert.rejects(()=>forwardMerchantSupply({...opts,fetcher:async()=>Response.json({error:"private SQL"},{status:409})}),/quote_changed/);
});
