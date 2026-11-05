import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import {QueryClient,QueryClientProvider} from "@tanstack/react-query";
import {QuoteCard} from "@/pages/dashboard/SupplyQuotes";
import {quoteFixture,ids} from "./fixtures.mjs";
import type {SupplyQuote} from "@/components/supply/SupplyQuoteSummary";
import "@/index.css";
const client=new QueryClient({defaultOptions:{queries:{retry:false},mutations:{retry:false}}});
function Harness(){
 const [quote,setQuote]=useState(quoteFixture()),[paid,setPaid]=useState(false),[english,setEnglish]=useState(false);
 return <main className="mx-auto max-w-6xl space-y-6 p-4"><h1 className="text-xl font-bold">Recette fictive du devis d’acquisition</h1><p>Données fictives ; tous les services distants sont interceptés par la recette.</p>
  <div className="flex flex-wrap gap-3"><button onClick={()=>setQuote(q=>({...q,quote_version:q.quote_version+1,quote_hash:"b".repeat(64)}))}>Nouvelle version de recette</button><button onClick={()=>{setQuote(quoteFixture("accepted"));setPaid(false);}}>Afficher un devis accepté de recette</button><button onClick={()=>setPaid(true)}>Confirmer le règlement de recette</button><button onClick={()=>setEnglish(v=>!v)}>Changer la langue</button></div>
  <QuoteCard key={`${quote.id}:${quote.quote_version}:${quote.quote_hash}`} quote={quote as unknown as SupplyQuote} boutiqueId={ids.boutique} payment={paid?{quote_id:quote.id,state:"paid",amount_cents:4440,currency:"EUR",updated_at:new Date().toISOString()}:undefined} english={english}/>
 </main>;
}
createRoot(document.getElementById("root")!).render(<QueryClientProvider client={client}><Harness/></QueryClientProvider>);
