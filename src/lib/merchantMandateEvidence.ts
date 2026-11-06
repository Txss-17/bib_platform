import { supabase } from "@/integrations/supabase/client";

export type MerchantMandateEvidence = {
  id: string;
  mandate_key: "procurement" | "invoicing" | "sav_assistance";
  document_version: string;
  document_sha256: string;
  accepted_at: string;
  revoked_at: string | null;
  evidence_id: string;
};

type MandateEvidenceResponse = {
  records: MerchantMandateEvidence[];
  recording_enabled: false;
};

/**
 * Read-only. No mandate can be activated by this client.
 * The Edge Function authenticates the caller and resolves the legal entity
 * from the governed identity mirror rather than trusting client input.
 */
export async function listMerchantMandateEvidence(boutiqueId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(boutiqueId))
    throw new Error("invalid_boutique_id");

  const { data, error } = await supabase.functions.invoke<MandateEvidenceResponse>(
    "merchant-mandates", { body: { action: "list", boutique_id: boutiqueId } },
  );
  if (error) throw error;
  if (!data || !Array.isArray(data.records) || data.recording_enabled !== false)
    throw new Error("invalid_mandate_evidence_response");
  return data.records;
}
