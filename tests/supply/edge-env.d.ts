// Node's compiler cannot fetch the Deno SDK imports. Runtime payment behavior
// is checked separately with the SQL ledger and mocked Stripe endpoint tests.
declare module "https://deno.land/std@0.168.0/encoding/hex.ts" {
  export function encode(value: Uint8Array): Uint8Array;
}
declare module "https://esm.sh/stripe@22.0.2" {
  export default class Stripe {
    constructor(key: string, options: Record<string, unknown>);
    static createFetchHttpClient(fetcher: typeof fetch): unknown;
    checkout: any;
    accounts: any;
    paymentIntents: any;
    charges: any;
    disputes: any;
    refunds: any;
  }
}
