import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { assertStoreLegalBundleReady } from "@/lib/legalBundleReadiness";

export type StoreLegalDocument = {
  model_id: string;
  model_key: string;
  version: string;
  title: string;
  locale: string;
  effective_at: string;
  text: string;
  hash: string;
};
export type StoreLegalBundle = {
  store_id: string;
  legal_entity_id: string;
  identity_review_id: string;
  seller: Record<string, string>;
  environment: "sandbox" | "live";
  documents: StoreLegalDocument[];
  bundle_hash: string;
};
export type OrderLegalProof = {
  bundle: StoreLegalBundle;
  bundle_hash: string;
  accepted_at: string;
  acceptance_statement: string;
  channel: string;
};

export async function legalRpc<T>(
  name: string,
  args: Record<string, unknown>,
): Promise<T> {
  const client = supabase as unknown as {
    rpc(
      name: string,
      args: Record<string, unknown>,
    ): PromiseLike<{ data: unknown; error: { message: string } | null }>;
  };
  const { data, error } = await client.rpc(name, args);
  if (error) throw new Error("legal_documents_unavailable");
  return data as T;
}
export function useStoreLegalBundle(storeId?: string) {
  return useQuery({
    queryKey: ["store-legal-bundle", storeId],
    enabled: !!storeId,
    staleTime: 0,
    retry: 1,
    queryFn: async () => {
      const bundle = await legalRpc<StoreLegalBundle>(
        "get_store_legal_bundle",
        { p_store_id: storeId },
      );
      assertStoreLegalBundleReady(bundle, storeId!);
      return bundle;
    },
  });
}
