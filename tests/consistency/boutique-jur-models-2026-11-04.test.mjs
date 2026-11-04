import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');

test('legal boutique routes render seller-specific BIB central models', () => {
  const app = read('src/App.tsx');
  const model = read('src/pages/BoutiqueLegalPages.tsx');
  assert.match(app, /boutique\/:slug\/mentions-legales/);
  assert.match(read('src/pages/BoutiqueCGVPage.tsx'), /BoutiqueLegalPages/);
  assert.match(read('src/pages/BoutiqueCGUPage.tsx'), /BoutiqueLegalPages/);
  assert.match(model, /JUR-B01/);
  assert.match(model, /JUR-B02/);
  assert.match(model, /JUR-B03/);
  assert.doesNotMatch(model, /theme\?\.cgvText|theme\?\.cguText/);
  assert.match(read('src/components/storefront/StorefrontFooter.tsx'), /boutique\/\$\{slug\}\/mentions-legales/);
});

test('checkout denies orders when seller identification is incomplete', () => {
  const checkout = read('supabase/functions/create-storefront-checkout/index.ts');
  assert.match(checkout, /legal_business_name, legal_siret, legal_address, legal_email/);
  assert.match(checkout, /informations juridiques du vendeur sont incomplètes/);
});

test('active legal version constants have no divergent JS and TS sources', () => {
  const ts = read('src/lib/legalDocumentVersions.ts');
  const js = read('src/lib/legalDocumentVersions.js');
  for (const key of ['cgu', 'cgv', 'privacy']) {
    const match = ts.match(new RegExp(key + ': "([^"]+)"'));
    assert.ok(match);
    assert.ok(js.includes(key + ': "' + match[1] + '"'));
  }
});
