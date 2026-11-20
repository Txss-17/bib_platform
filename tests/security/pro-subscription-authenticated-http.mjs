// Live authenticated PostgREST regression for the Pro entitlement RPC.
// Use staging user sessions; no password, service-role token or Stripe operation required.
// Fails closed on missing configuration and never prints secrets.
const required = (name) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing ${name}; supply it from a secure CI secret or local environment`);
  return value;
};

async function main() {
  const api = new URL(required("BIB_TEST_SUPABASE_URL"));
  if (api.protocol !== "https:") throw new Error("Supabase URL must use HTTPS");
  const publishable = required("BIB_TEST_SUPABASE_PUBLISHABLE_KEY");
  const ownerJwt = required("BIB_TEST_PRO_OWNER_JWT");
  const otherJwt = required("BIB_TEST_OTHER_USER_JWT");
  const environment = process.env.BIB_TEST_PRO_ENVIRONMENT ?? "sandbox";
  if (environment !== "live" && environment !== "sandbox") throw new Error("Invalid test environment");
  if (ownerJwt === otherJwt) throw new Error("Two different JWTs are required");

  const headers = (jwt) => ({
    apikey: publishable,
    authorization: `Bearer ${jwt}`,
    "Content-Type": "application/json",
  });
  async function request(path, jwt, body) {
    const url = new URL(path, api);
    const response = await fetch(url, {
      method: body === undefined ? "GET" : "POST",
      headers: headers(jwt),
      ...(body === undefined ? {} : {body: JSON.stringify(body)}),
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status} from ${url.pathname} (response body suppressed)`);
    return response.json();
  }

  const owner = await request("/auth/v1/user", ownerJwt);
  const other = await request("/auth/v1/user", otherJwt);
  if (!owner.id || !other.id || owner.id === other.id) {
    throw new Error("JWT user claims missing or identical");
  }
  const rpc = (jwt, userId, env = environment) =>
    request("/rest/v1/rpc/bib_has_active_pro_subscription", jwt, {
      p_user_id: userId,
      p_environment: env,
    });
  const [otherReadsOwner, ownerReadsOwn, ownerReadsOther] = await Promise.all([
    rpc(otherJwt, owner.id),
    rpc(ownerJwt, owner.id),
    rpc(ownerJwt, other.id),
  ]);
  if (otherReadsOwner !== false || ownerReadsOther !== false) {
    throw new Error("FAIL: cross-account Pro entitlement query returned non-false");
  }
  if (typeof ownerReadsOwn !== "boolean") {
    throw new Error("FAIL: own-account Pro entitlement query did not return boolean");
  }
  if (process.env.BIB_TEST_EXPECT_OWNER_PRO_ACTIVE === "true" && ownerReadsOwn !== true) {
    throw new Error("FAIL: expected an active Pro subscription for the owner");
  }
  if (process.env.BIB_TEST_EXPECT_OWNER_PRO_ACTIVE === "false" && ownerReadsOwn !== false) {
    throw new Error("FAIL: expected no active Pro subscription for the owner");
  }
  if (environment === "sandbox" && ownerReadsOwn === true) {
    const live = await rpc(ownerJwt, owner.id, "live");
    if (live !== false && process.env.BIB_TEST_EXPECT_LIVE_PRO_ACTIVE !== "true") {
      throw new Error("FAIL: owner has live Pro; set explicit BIB_TEST_EXPECT_LIVE_PRO_ACTIVE=true if intentional");
    }
  }

  // No external identity or token is included in output.
  console.log(JSON.stringify({
    result: "PASS",
    cross_account_query: "denied",
    own_account_query: "boolean",
    owner_has_active_pro_for_requested_environment: ownerReadsOwn,
    environment,
    test_type: "live_postgrest_user_jwt",
  }));
}

main().catch((error) => {
  console.error(`BIB HTTP RPC security test FAILED: ${error.message}`);
  process.exitCode = 1;
});
