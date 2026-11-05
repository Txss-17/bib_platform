import {spawn} from "node:child_process";
import {chromium,expect} from "@playwright/test";
import {mkdirSync} from "node:fs";
import {resolve} from "node:path";
import {tmpdir} from "node:os";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../../",import.meta.url)),base=process.env.BIB_SUPPLY_BASE_URL??"http://127.0.0.1:5187",output=process.env.BIB_SUPPLY_ARTIFACTS??resolve(tmpdir(),"bib-supply-smoke");
mkdirSync(output,{recursive:true});
const server=process.env.BIB_SUPPLY_BASE_URL?null:spawn(process.execPath,["node_modules/vite/bin/vite.js","--host","127.0.0.1","--port","5187","--strictPort"],{cwd:root,stdio:"ignore",env:{...process.env,VITE_SUPABASE_URL:"https://supply-test.supabase.co",VITE_SUPABASE_PUBLISHABLE_KEY:"supply-unit-test-public-key"}});
let browser;
try{
 let ready=false;for(let i=0;i<80;i++){try{ready=(await fetch(`${base}/tests/supply/harness.html`)).ok;}catch{/* starting */}if(ready)break;await new Promise(r=>setTimeout(r,200));}if(!ready)throw new Error("Supply test server did not start");
 browser=await chromium.launch({headless:true,args:["--no-sandbox"]});const context=await browser.newContext({viewport:{width:1280,height:900}});
 const requests=[],errors=[];let unavailable=false;
 await context.route("**/*",async route=>{
  const url=new URL(route.request().url());if(url.origin===new URL(base).origin)return route.continue();
  if(url.hostname.endsWith(".supabase.co")){
   const headers={"access-control-allow-origin":"*","access-control-allow-headers":"authorization,apikey,x-client-info,content-type","access-control-allow-methods":"POST,OPTIONS"};
   if(route.request().method()==="OPTIONS")return route.fulfill({status:204,headers});
   if(url.pathname.endsWith("/functions/v1/merchant-supply")){
    const body=route.request().postDataJSON();requests.push(body);
    return route.fulfill({status:unavailable||body.action==="checkout"?503:200,headers,contentType:"application/json",body:JSON.stringify(unavailable||body.action==="checkout"?{error:"unit_test_unavailable"}:{quote:{state:"accepted"}})});
   }
   return route.fulfill({status:200,headers,contentType:"application/json",body:"[]"});
  }
  return route.abort(); // This test never reaches a real PSP, email service or production backend.
 });
 const page=await context.newPage();page.on("pageerror",error=>errors.push(error.message));
 await page.goto(`${base}/tests/supply/harness.html?payment=return`);await page.locator("summary").click();
 await expect(page.getByRole("checkbox")).not.toBeChecked();await expect(page.getByRole("button",{name:"Accepter ce devis",exact:true})).toBeDisabled();
 await expect(page.getByText("Fournisseur fictif",{exact:true}).first()).toBeVisible();
 await page.getByLabel("Nom du signataire habilité").fill("Gérante fictive");await page.getByLabel("Qualité ou habilitation à engager l’acheteur").fill("Mandataire fictive");await page.getByRole("checkbox").check();
 await page.getByRole("button",{name:"Nouvelle version de recette"}).click();await page.locator("summary").click();
 await expect(page.getByRole("checkbox")).not.toBeChecked();await expect(page.getByLabel("Nom du signataire habilité")).toHaveValue("");expect(requests).toHaveLength(0);
 await page.getByLabel("Nom du signataire habilité").fill("Gérante fictive");await page.getByLabel("Qualité ou habilitation à engager l’acheteur").fill("Mandataire fictive");await page.getByRole("checkbox").check();unavailable=true;
 await page.getByRole("button",{name:"Accepter ce devis",exact:true}).click();await expect(page.getByRole("status")).toContainText("n’a pas pu être accepté");await expect(page.getByRole("checkbox")).not.toBeChecked();
 unavailable=false;await page.getByRole("checkbox").check();await page.getByRole("button",{name:"Accepter ce devis",exact:true}).click();await expect(page.getByRole("status")).toContainText("Aucun paiement n’est encore confirmé");
 expect(requests.at(-1)).toMatchObject({action:"accept",quote_version:2,quote_hash:"b".repeat(64),accepted:true});expect(requests.every(r=>r.action==="accept")).toBe(true);
 await page.getByRole("button",{name:"Afficher un devis accepté de recette"}).click();await page.locator("summary").click();await expect(page.getByText(/Aucun règlement n’est confirmé/)).toBeVisible();
 await page.getByRole("button",{name:"Régler le montant global du devis"}).click();await expect(page.getByRole("status")).toContainText("Aucun règlement n’a été confirmé");
 for(const width of [320,390]){await page.setViewportSize({width,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:resolve(output,`supply-quote-${width}.png`),animations:"disabled",fullPage:true});}
 await page.getByRole("button",{name:"Confirmer le règlement de recette"}).click();await expect(page.getByText(/Règlement confirmé par le prestataire/)).toBeVisible();await expect(page.getByRole("button",{name:"Régler le montant global du devis"})).toHaveCount(0);
 await page.getByRole("button",{name:"Changer la langue"}).click();await expect(page.getByText(/Payment confirmed by the payment provider/)).toBeVisible();
 await page.goto(`${base}/dashboard/devis-approvisionnement`);await expect(page).toHaveURL(/\/login(?:[?#]|$)/);expect(errors).toEqual([]);
 console.log("PASS: named supplier, unchecked exact-version acceptance, stale and unavailable responses, redirect without payment proof, scoped requests, private route, English and 320/390px layouts.");
}finally{await browser?.close();server?.kill("SIGTERM");}
