import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');

test('BIB-00 v1.5 supplier initial audits require accepted quote, never free by default', () => {
  const supplier = read('src/components/standalone/SuppliersPricingSection.tsx');
  assert.match(supplier, /base indicative de chiffrage de 150 €/);
  assert.match(supplier, /devis accepté/);
  assert.doesNotMatch(supplier, /audit initial (?:de qualification )?est offert/i);
  assert.match(supplier, /régime de TVA/);
});

test('BIB-00bis DEC-015 central terms are not replaced by boutique overrides', () => {
  const legal = read('src/pages/BoutiqueLegalPages.tsx');
  assert.doesNotMatch(legal, /theme\?\.cgvText|theme\?\.cguText/);
  const serverDocuments = read('src/hooks/useStoreLegalBundle.ts');
  assert.match(serverDocuments, /get_store_legal_bundle/);
  assert.doesNotMatch(legal, /dangerouslySetInnerHTML/);
});

test('DEC-002 own EI stores are treated differently from independent merchants', () => {
  const legal = read('src/pages/LegalPages.tsx');
  assert.match(legal, /boutiques tests permanentes propres à BIB/);
  assert.match(legal, /abonnement ou commission facturée à elle-même/);
});
