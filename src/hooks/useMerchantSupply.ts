import {useMutation,useQuery,useQueryClient} from "@tanstack/react-query";
import {useAuth} from "@/contexts/AuthContext";
import {supabase} from "@/integrations/supabase/client";
import type {SupplyQuote} from "@/components/supply/SupplyQuoteSummary";
export interface SupplyPayment {quote_id:string;state:string;amount_cents:number;currency:string;updated_at:string}
export async function supplyAction<T>(body:Record<string,unknown>):Promise<T>{
 const {data,error}=await supabase.functions.invoke("merchant-supply",{body});
 if(error||!data||data.error){
  let code=data?.error;
  if(error?.context instanceof Response){try{code=(await error.context.clone().json()).error;}catch{/* Keep the generic failure. */}}
  throw new Error(code==="verified_paid_sample_required"?code:"supply_action_unavailable");
 }return data as T;
}
export function useMerchantSupply(boutiqueId:string){
 const {user}=useAuth();
 return useQuery({queryKey:["merchant-supply",user?.id,boutiqueId],enabled:!!user&&!!boutiqueId,refetchInterval:30000,queryFn:async()=>{
  const {quotes}=await supplyAction<{quotes:SupplyQuote[]}>({action:"list",boutique_id:boutiqueId});
  if(!Array.isArray(quotes))throw new Error("invalid_supply_response");
  const {data,error}=await supabase.rpc("get_own_supply_payments" as never,{p_boutique_id:boutiqueId} as never);if(error)throw error;
  return {quotes,payments:(data??[]) as unknown as SupplyPayment[]};
 }});
}
export function useSupplyAction(){const qc=useQueryClient();return useMutation({mutationFn:(body:Record<string,unknown>)=>supplyAction<any>(body),onSuccess:()=>qc.invalidateQueries({queryKey:["merchant-supply"]})});}
