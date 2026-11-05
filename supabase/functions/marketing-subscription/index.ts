import { createClient } from "npm:@supabase/supabase-js@2";
import { createMarketingSubscriptionHandler } from "../_shared/marketing-subscription-handler.mjs";

Deno.serve(
  createMarketingSubscriptionHandler({
    getAdmin: () => {
      const url = Deno.env.get("SUPABASE_URL");
      const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (!url || !key) throw new Error("missing_server_configuration");
      return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    },
  }),
);
