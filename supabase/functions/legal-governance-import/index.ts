import { createClient } from "npm:@supabase/supabase-js@2";
import { configuredPaymentEnvironment } from "../_shared/payment-environment.ts";
import { createLegalGovernanceImportHandler } from "../_shared/legal-governance-import-handler.mjs";

Deno.serve(async (request) => {
  let environment: string | undefined;
  try {
    environment = configuredPaymentEnvironment((key) => Deno.env.get(key));
  } catch {
    /* Fail closed before creating an admin client. */
  }
  return createLegalGovernanceImportHandler({
    secret: Deno.env.get("BIB_PLATFORM_BRIDGE_SECRET"),
    environment,
    origin: Deno.env.get("BIB_PUBLIC_SITE_ORIGIN"),
    getAdmin: () =>
      createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      ),
  })(request);
});
