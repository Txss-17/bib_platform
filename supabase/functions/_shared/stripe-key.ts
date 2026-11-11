/**
 * Selects a direct Stripe secret for a BIB-controlled account.
 * Intentionally never falls back to the Lovable connector token or the
 * legacy STRIPE_{SANDBOX,LIVE}_API_KEY connector credentials.
 */
export type BibStripeMode = "sandbox" | "live";
export type SecretReader = (key: string) => string | undefined;

export function readDirectStripeSecretKey(
  mode: BibStripeMode,
  read: SecretReader,
): string {
  const name =
    mode === "sandbox" ? "BIB_STRIPE_SANDBOX_SECRET_KEY" :
    mode === "live" ? "BIB_STRIPE_LIVE_SECRET_KEY" :
    undefined;
  if (!name) throw new Error("Invalid Stripe payment environment");
  const prefix = mode === "sandbox" ? "sk_test_" : "sk_live_";
  const secret = read(name);
  if (
    !secret ||
    !secret.startsWith(prefix) ||
    secret.length <= prefix.length ||
    secret.trim() !== secret
  ) {
    // Do not log the invalid value: it might contain a credential.
    throw new Error(`Direct Stripe secret key is not configured for ${mode}`);
  }
  return secret;
}
