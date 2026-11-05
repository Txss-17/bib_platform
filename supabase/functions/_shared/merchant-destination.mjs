export async function verifyConnectedDestination(stripe,accountId){
 if(!/^acct_[a-zA-Z0-9]+$/.test(accountId??""))throw new Error("verified_destination_required");
 const account=await stripe.accounts.retrieve(accountId);
 if(account?.id!==accountId||account.deleted||account.charges_enabled!==true||account.payouts_enabled!==true||account.capabilities?.card_payments!=="active"||account.capabilities?.transfers!=="active")throw new Error("connected_account_not_ready");
 return account;
}
export async function merchantSaleDestination(admin,stripe,boutiqueId,environment){
 const {data:route,error}=await admin.rpc("get_storefront_destination_route",{p_boutique_id:boutiqueId,p_environment:environment});
 if(error||!route||route.environment!==environment||route.flow!=="merchant_sale"||route.enabled!==true)throw new Error("verified_destination_unavailable");
 if(route.model==="own_ei_principal")return {payment_intent_data:undefined,automatic_tax:{enabled:true,liability:{type:"self"}},metadata:{charge_model:"own_ei_principal",merchant_entity_id:route.entity_id}};
 if(route.model!=="destination_charges")throw new Error("invalid_charge_model");
 await verifyConnectedDestination(stripe,route.account_id);
 // BIB's fee is already included in the supplier acquisition quote, never charged twice.
 return {payment_intent_data:{on_behalf_of:route.account_id,transfer_data:{destination:route.account_id}},
  automatic_tax:{enabled:true,liability:{type:"account",account:route.account_id}},metadata:{charge_model:"destination_charges",merchant_entity_id:route.entity_id}};
}
