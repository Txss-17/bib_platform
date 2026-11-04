import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');

test('product dashboard carries approved preorders while checkout remains secured', () => {
  const product = read('src/pages/dashboard/Produits.tsx');
  const checkout = read('supabase/functions/create-storefront-checkout/index.ts');
  assert.match(product, /précommandes regroupées/);
  assert.match(product, /après confirmation de commande/);
  assert.match(product, /droits légaux de rétractation/);
  assert.match(checkout, /reserve_product_stock_checkout/);
});
test('commercial documentation identifies merchant seller and production cancellation gate', () => {
  const legal = read('src/pages/LegalPages.tsx');
  assert.match(legal, /Précommandes, production personnalisée et annulation/);
  assert.match(legal, /marchand professionnel reste identifié comme vendeur/);
  assert.match(legal, /feu vert effectif de lancement de la production/);
  assert.match(legal, /quatorze \(14\) jours/);
});
