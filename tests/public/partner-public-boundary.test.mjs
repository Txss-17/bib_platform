import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sources = [
  'src/pages/Suppliers.tsx',
  'src/pages/Ops.tsx',
  'src/pages/OpsApply.tsx',
  'src/components/standalone/SuppliersPricingSection.tsx',
  'src/pages/SuppliersOnboarding.tsx',
  'src/pages/OpsOnboarding.tsx',
].map(p => [p, readFileSync(new URL('../../' + p, import.meta.url), 'utf8')]);

test('public partner copy must not assert unapproved fee or internal sanctions', () => {
  for (const [path, source] of sources) {
    assert.doesNotMatch(source, /19 € (?:par mois|\/ mois)/, path);
    assert.doesNotMatch(source, /(?:audit|chiffrage).*150 €/i, path);
    assert.doesNotMatch(source, /suspension avec préavis 30 jours/i, path);
    assert.doesNotMatch(source, /pénalité forfaitaire prévue au contrat/i, path);
    assert.doesNotMatch(source, /48h de préavis/i, path);
  }
});

test('essential public descriptions remain available without internal specifics', () => {
  const suppliers = sources.find(([p]) => p.endsWith('/Suppliers.tsx'))[1];
  const ops = sources.find(([p]) => p.endsWith('/Ops.tsx'))[1];
  assert.match(suppliers, /Candidater comme fournisseur/);
  assert.match(suppliers, /Critères de compatibilité/);
  assert.match(ops, /Devenir partenaire/);
  assert.match(ops, /Les services logistiques du réseau BIB/);
});
