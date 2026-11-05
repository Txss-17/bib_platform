import {acquisitionUnitTotal} from "../../supabase/functions/_shared/supply-contract.mjs";
import {getUiLocale,translateUi} from "@/lib/uiTranslation";
export function catalogAcquisitionPrice(product:{acquisition_pricing?:unknown}):number|null{
 try{return product.acquisition_pricing?acquisitionUnitTotal(product.acquisition_pricing)/100:null;}catch{return null;}
}
export function catalogAcquisitionLabel(product:{acquisition_pricing?:unknown}):string{
 const amount=catalogAcquisitionPrice(product);
 return amount===null?translateUi("À confirmer par devis"):new Intl.NumberFormat(getUiLocale(),{style:"currency",currency:"EUR"}).format(amount);
}
