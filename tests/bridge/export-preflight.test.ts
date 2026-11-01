import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');

describe('Platform export source dependencies', () => {
  it('keeps a fail-closed preflight for all external export tables', () => {
    const exportHandler = read('supabase/functions/intranet-export/index.ts');
    const preflight = read('ops/release/platform-export-schema-preflight.sql');
    const required = [...exportHandler.matchAll(/\.from\("([a-z_]+)"\)/g)]
      .map(match => match[1])
      .filter(name => [
        'boutiques', 'orders', 'support_tickets', 'partner_onboarding_submissions',
        'subscriptions', 'payments', 'plans', 'customer_product_favorites',
        'customer_boutique_favorites', 'products', 'product_customization_dossiers',
        'stock_restock_requests', 'order_refunds', 'sav_escalation_events',
      ].includes(name));
    for (const name of new Set(required)) expect(preflight).toContain("('" + name + "')");
    expect(preflight).toContain('BIB_PLATFORM_EXPORT_NOT_READY');
    expect(preflight).toContain('BEGIN READ ONLY');
  });
});
