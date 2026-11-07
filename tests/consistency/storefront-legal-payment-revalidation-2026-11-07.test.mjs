import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const checkout = readFileSync(new URL("../../src/components/storefront/CheckoutForm.tsx", import.meta.url), "utf8");

test("payment cannot advance while a legal bundle is being revalidated", () => {
  assert.match(checkout, /legal\.isFetching\|\|agreedHash!==legal\.data\.bundle_hash\|\|legal\.isError/);
  assert.match(checkout, /disabled=\{!hasShippingInfo\|\|!legal\.data\|\|legal\.isFetching\|\|legal\.isError/);
});

test("replaced or withdrawn terms revoke old acceptance and payment view", () => {
  assert.match(checkout, /legal\.isError\s*\|\|\s*\(legal\.data && legal\.data\.bundle_hash !== acceptedBundle\.bundle_hash\)/);
  assert.match(checkout, /setAgreedHash\(null\)/);
  assert.match(checkout, /setAcceptedBundle\(null\)/);
  assert.match(checkout, /setStep\("shipping"\)/);
  assert.match(checkout, /step === "pay" && acceptedBundle && !legal\.isError && legal\.data\?\.bundle_hash === acceptedBundle\.bundle_hash/);
});

test("Stripe receives a hash-bound approval, not a marketing or cookie acceptance", () => {
  assert.match(checkout, /legalAgreement=\{\{bundleHash:acceptedBundle\.bundle_hash,accepted:true/);
  assert.match(checkout, /Cet accord ne vous abonne pas à des communications commerciales/);
});
