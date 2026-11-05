import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = (p) => readFileSync(new URL("../../" + p, import.meta.url), "utf8");

test("global legal hub discloses seller-specific terms and historic generic drafts", () => {
  const page = read("src/pages/PackLegal.tsx");
  assert.match(page, /JUR-M01\/M02/);
  assert.match(page, /JUR-B01\/B02\/B03/);
  assert.match(page, /CGV de la boutique/);
  assert.match(page, /sources historiques/);
  assert.match(page, /non des CGV de boutique opposables/);
});

test("global sales information does not supersede a store contract", () => {
  const page = read("src/pages/LegalPages.tsx");
  assert.match(page, /Présentation générale, non substitutive aux CGV du vendeur/);
  assert.match(page, /les CGV de la boutique du vendeur réel/);
  assert.doesNotMatch(page, /Les présentes Conditions Générales de Vente régissent les commandes de produits/);
});

test("seller-aware store pages stay backed by the server legal bundle", () => {
  const page = read("src/pages/BoutiqueLegalPages.tsx");
  assert.match(page, /useStoreLegalBundle/);
  assert.match(page, /StoreLegalDocuments/);
  assert.doesNotMatch(page, /theme\?\.cgvText/);
});
