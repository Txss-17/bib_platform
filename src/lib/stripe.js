import { loadStripe } from "@stripe/stripe-js";
const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;
const environment = clientToken?.startsWith("pk_test_") ? "sandbox" : "live";
let stripePromise = null;
function getStripe() {
  if (!stripePromise) {
    if (!clientToken) {
      throw new Error("VITE_PAYMENTS_CLIENT_TOKEN is not set");
    }
    stripePromise = loadStripe(clientToken);
  }
  return stripePromise;
}
function getStripeEnvironment() {
  return environment;
}
function isPaymentsConfigured() {
  return !!clientToken;
}
export {
  getStripe,
  getStripeEnvironment,
  isPaymentsConfigured
};
