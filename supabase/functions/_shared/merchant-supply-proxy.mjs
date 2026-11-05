export async function forwardMerchantSupply({url,secret,environment,merchantId,boutiqueId,buyerEntityId,action,quoteId,requestKey=undefined,payload={},fetcher=fetch}){
 if(typeof secret!=="string"||secret.length<32||!["sandbox","live"].includes(environment))throw new Error("supply_not_configured");
 const endpoint=new URL(url);
 if(endpoint.protocol!=="https:"||endpoint.username||endpoint.password||endpoint.search||endpoint.hash)throw new Error("invalid_supply_endpoint");
 const response=await fetcher(endpoint.href,{method:"POST",headers:{"Content-Type":"application/json","x-bib-bridge-key":secret},body:JSON.stringify({action,environment,merchant_id:merchantId,boutique_id:boutiqueId,buyer_entity_id:buyerEntityId,quote_id:quoteId,request_key:requestKey,payload}),signal:AbortSignal.timeout(15000)});
 const data=await response.json();
 if(!response.ok){const error=new Error(response.status===409?"quote_changed":"supply_unavailable");error.status=response.status===409?409:503;throw error;}
 if(!data||typeof data!=="object"||data.error||data.schema_version!==1||data.source_app!=="intrabib"||data.environment!==environment)throw new Error("invalid_supply_response");
 if(action==="list"&&!Array.isArray(data.quotes))throw new Error("invalid_supply_response");
 if(action==="accept"&&(data.quote?.id!==quoteId||data.quote?.state!=="accepted"))throw new Error("invalid_supply_response");
 if(action==="request"&&(typeof data.request_id!=="string"||!["received","quoted"].includes(data.state)))throw new Error("invalid_supply_response");
 if(action==="settlement"&&data.ok!==true)throw new Error("invalid_supply_response");
 return data;
}
