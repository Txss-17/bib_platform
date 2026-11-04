import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');

test('merchant listing does not manufacture stock or create an upfront purchase', () => {
  const add = read('src/components/dashboard/AddToBoutiqueDialog.tsx');
  assert.match(add, /stock_quantity:\s*0/);
  assert.match(add, /sans acheter\s+le stock à l’avance/);
  assert.match(add, /queryClient\.invalidateQueries\(\{ queryKey: \["products"\] \}\)/);
  assert.match(add, /Gérer la référence dans ma boutique/);
});
test('local inventory is not labelled supplier-wide stock', () => {
  const products = read('src/pages/dashboard/Produits.tsx');
  assert.match(products, /Stock local à surveiller/);
  assert.match(products, /disponibilité fournisseur/);
  const detail = read('src/components/storefront/StorefrontProductDetail.tsx');
  assert.match(detail, /Commande indisponible : disponibilité fournisseur à confirmer/);
  assert.match(detail, /!isOutOfStock/);
});
