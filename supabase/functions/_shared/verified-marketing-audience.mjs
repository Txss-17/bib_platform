export async function verifiedMarketingAudience(
  admin,
  boutiqueId,
  minSpentCents = null,
  subscriptionId = null,
) {
  const { data, error } = await admin.rpc("marketing_campaign_recipients", {
    p_boutique_id: boutiqueId,
    p_min_spent_cents: minSpentCents,
    p_subscription_id: subscriptionId,
  });
  if (error || !Array.isArray(data))
    throw new Error("verified_marketing_audience_unavailable");
  return data;
}

export function marketingUnsubscribeLinks(recipient, supabaseUrl) {
  const origin = new URL(recipient.public_origin);
  if (
    origin.protocol !== "https:" ||
    origin.origin !== recipient.public_origin ||
    !/^[a-f0-9]{64}$/.test(recipient.unsubscribe_token)
  )
    throw new Error("invalid_marketing_unsubscribe_link");
  const api = new URL("/functions/v1/marketing-subscription", supabaseUrl);
  if (api.protocol !== "https:")
    throw new Error("invalid_marketing_api_origin");
  api.searchParams.set("action", "unsubscribe");
  api.searchParams.set("token", recipient.unsubscribe_token);
  return {
    page: `${origin.origin}/communications?action=unsubscribe#token=${recipient.unsubscribe_token}`,
    oneClick: api.href,
  };
}
