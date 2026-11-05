import { supabase } from "@/integrations/supabase/client";

export type MarketingScope =
  | { kind: "bib" }
  | { kind: "boutique"; boutiqueId: string };
export interface MarketingContext {
  scope_key: string;
  boutique_id: string | null;
  controller_name: string;
  audience_name: string;
  notice_text: string;
  notice_hash: string;
  notice_version: string;
  privacy_url: string;
}
export interface MarketingLinkState {
  valid: boolean;
  state?: "pending" | "active" | "withdrawn";
  audience_name?: string;
  controller_name?: string;
  notice_text?: string;
}

export async function marketingSubscriptionAction<T>(
  body: Record<string, unknown>,
): Promise<T> {
  const { data, error } = await supabase.functions.invoke(
    "marketing-subscription",
    { body },
  );
  if (error || !data || data.error)
    throw new Error("marketing_subscription_unavailable");
  return data as T;
}

export function marketingScopeBody(scope: MarketingScope, language: string) {
  return {
    boutique_id: scope.kind === "boutique" ? scope.boutiqueId : null,
    locale: language === "en" ? "en" : "fr",
  };
}
