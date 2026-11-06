import { z } from "zod";

/**
 * Client-to-trusted-server request contract only.
 * Validation here does NOT authorize a mandate or persist evidence.
 * The server must independently verify the signed-in user, representative
 * authority, legal entity, published document hash and affirmative action.
 */
export const merchantMandateAcceptanceSchema = z.object({
  merchantLegalEntityId: z.string().uuid(),
  mandateKey: z.enum(["procurement", "invoicing", "sav_assistance"]),
  documentVersion: z.string().trim().min(1).max(100),
  documentSha256: z.string().regex(/^[a-f0-9]{64}$/),
  acceptanceLabel: z.string().trim().min(1).max(1000),
  signerRole: z.string().trim().min(1).max(200),
  affirmativeAcceptance: z.literal(true),
}).strict();

export type MerchantMandateAcceptanceRequest = z.infer<
  typeof merchantMandateAcceptanceSchema
>;

export function validateMerchantMandateAcceptance(input: unknown) {
  return merchantMandateAcceptanceSchema.safeParse(input);
}
