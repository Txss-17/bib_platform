import {afterEach,beforeEach,describe,expect,it,vi} from "vitest";
import {cleanup,fireEvent,render,screen,waitFor} from "@testing-library/react";
import {QuoteCard} from "@/pages/dashboard/SupplyQuotes";
import {ids,quoteFixture} from "../../tests/supply/fixtures.mjs";
import type {SupplyQuote} from "@/components/supply/SupplyQuoteSummary";
const mock=vi.hoisted(()=>({mutate:vi.fn()}));
vi.mock("@/hooks/useMerchantSupply",()=>({useSupplyAction:()=>({mutateAsync:mock.mutate,isPending:false})}));
const card=(quote=quoteFixture(),payment?:any)=><QuoteCard key={`${quote.id}:${quote.quote_version}:${quote.quote_hash}`} quote={quote as unknown as SupplyQuote} boutiqueId={ids.boutique} payment={payment} english={false}/>;
const open=()=>fireEvent.click(screen.getByText(/ACQ-TEST-001/));
beforeEach(()=>{mock.mutate.mockReset();});
afterEach(cleanup);
describe("Merchant quote agreement",()=>{
 it("shows the actual supplier, separate issuers and an unchecked, optional-marketing-independent agreement",async()=>{
  render(card());open();expect(screen.getAllByText("Fournisseur fictif").length).toBeGreaterThan(0);
  const choice=screen.getByRole("checkbox");expect(choice).not.toBeChecked();
  expect(screen.getByRole("button",{name:"Accepter ce devis"})).toBeDisabled();
  expect(screen.getByText(/ne m’inscrit à aucune offre marketing/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText("Nom du signataire habilité"),{target:{value:"Gérante test"}});
  fireEvent.change(screen.getByLabelText("Qualité ou habilitation à engager l’acheteur"),{target:{value:"Mandataire"}});
  fireEvent.click(choice);mock.mutate.mockResolvedValue({quote:{state:"accepted"}});
  fireEvent.click(screen.getByRole("button",{name:"Accepter ce devis"}));
  await waitFor(()=>expect(mock.mutate).toHaveBeenCalledWith(expect.objectContaining({quote_hash:"a".repeat(64),quote_version:1,accepted:true,signatory:"Gérante test"})));
  expect(screen.getByRole("status")).toHaveTextContent("Aucun paiement n’est encore confirmé");
 });
 it("clears agreement after a stale-version rejection and after a newly issued version",async()=>{
  const {rerender}=render(card());open();
  fireEvent.change(screen.getByLabelText("Nom du signataire habilité"),{target:{value:"Test"}});fireEvent.change(screen.getByLabelText("Qualité ou habilitation à engager l’acheteur"),{target:{value:"Gérante"}});fireEvent.click(screen.getByRole("checkbox"));
  mock.mutate.mockRejectedValue(new Error("quote_changed"));fireEvent.click(screen.getByRole("button",{name:"Accepter ce devis"}));
  await waitFor(()=>expect(screen.getByRole("checkbox")).not.toBeChecked());expect(screen.getByRole("status")).toHaveTextContent("n’a pas pu être accepté");
  fireEvent.click(screen.getByRole("checkbox"));rerender(card({...quoteFixture(),quote_version:2,quote_hash:"b".repeat(64)}));open();
  expect(screen.getByRole("checkbox")).not.toBeChecked();expect(screen.getByLabelText("Nom du signataire habilité")).toHaveValue("");
 });
 it("never treats a browser return as paid and never reports a failed checkout as success",async()=>{
  window.history.replaceState({},"","/dashboard/devis-approvisionnement?payment=return");render(card(quoteFixture("accepted")));open();
  expect(screen.getByText(/Aucun règlement n’est confirmé/)).toBeInTheDocument();mock.mutate.mockRejectedValue(new Error("unavailable"));
  fireEvent.click(screen.getByRole("button",{name:"Régler le montant global du devis"}));
  await waitFor(()=>expect(screen.getByRole("status")).toHaveTextContent("Aucun règlement n’a été confirmé"));
 });
 it("blocks payment after admission withdrawal and shows refund holds without offering a second payment",()=>{
  const {rerender}=render(card({...quoteFixture("accepted"),checkout_eligible:false}));open();expect(screen.getByRole("alert")).toBeInTheDocument();
  expect(screen.getByRole("button",{name:"Régler le montant global du devis"})).toBeDisabled();
  rerender(card(quoteFixture("accepted"),{state:"partially_refunded"}));expect(screen.getByText(/partiellement remboursé/)).toBeInTheDocument();
  expect(screen.queryByRole("button",{name:"Régler le montant global du devis"})).not.toBeInTheDocument();
 });
});
