export type PaymentEnvironment = "sandbox" | "live";
type ReadEnv = (name: string) => string | undefined;

/** One live project is sufficient; sandbox requires a separate registered project. */
export function configuredPaymentEnvironment(
  readEnv: ReadEnv,
): PaymentEnvironment {
  const mode = readEnv("PAYMENTS_ENVIRONMENT");
  const liveRef = readEnv("PAYMENTS_LIVE_PROJECT_REF");
  const sandboxRef = readEnv("PAYMENTS_SANDBOX_PROJECT_REF");
  const projectUrl = readEnv("SUPABASE_URL");
  if (mode !== "live" && mode !== "sandbox") {
    throw new Error("PAYMENTS_ENVIRONMENT must be configured on the server");
  }
  if (!liveRef || !/^[a-z0-9-]+$/.test(liveRef)) {
    throw new Error("The live payment project reference must be configured");
  }
  if (
    (mode === "sandbox" && !sandboxRef) ||
    (sandboxRef && (liveRef === sandboxRef || !/^[a-z0-9-]+$/.test(sandboxRef)))
  ) {
    throw new Error(
      "Distinct payment project references must be configured for sandbox",
    );
  }
  const expectedRef = mode === "live" ? liveRef : sandboxRef;
  let url: URL;
  try {
    url = new URL(projectUrl ?? "");
  } catch {
    throw new Error("Payment database URL is invalid");
  }
  if (
    url.protocol !== "https:" ||
    url.hostname !== `${expectedRef}.supabase.co` ||
    url.port ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error("Payment mode does not match this Supabase project");
  }
  return mode;
}

export function assertPaymentEnvironment(
  requested: unknown,
  readEnv: ReadEnv,
): PaymentEnvironment {
  const configured = configuredPaymentEnvironment(readEnv);
  if (requested !== configured) {
    throw new Error("Payment environment is not enabled on this server");
  }
  return configured;
}

/** Call only after verifying the signature of the complete event payload. */
export function assertEventEnvironment(
  event: { livemode?: unknown },
  environment: PaymentEnvironment,
) {
  if (event.livemode !== (environment === "live")) {
    throw new Error("Stripe event mode does not match this server");
  }
}
