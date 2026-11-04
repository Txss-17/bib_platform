import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../../' + path, import.meta.url), 'utf8');

test('November draft legal documents are represented without fictitious issuer details', () => {
  const pages = read('src/pages/LegalPages.tsx');
  const pack = read('src/pages/PackLegal.tsx');
  for (const text of ['CGV BIB v1.2','CGU BIB v1.2','Mentions légales v1.1','Confidentialité v1.2','Cookies v1.1']) {
    assert.match(pack, new RegExp(text.replaceAll('.', '\\.')));
  }
  assert.match(pages, /nom et prénom de l'entrepreneur individuel/);
  assert.match(pages, /médiateur compétent réellement désigné/);
  assert.match(pages, /sous réserve de validation juridique/);
  assert.doesNotMatch(pages, /BRAND-IN-A-BOX SAS/);
});

test('Seller liability for own EI boutiques cannot be displaced by third-party CGV', () => {
  const pages = read('src/pages/LegalPages.tsx');
  const boutique = read('src/pages/BoutiqueLegalPages.tsx');
  assert.match(pages, /boutiques tests exploitées directement par l'entreprise individuelle/);
  assert.match(pages, /cette même entreprise est le vendeur professionnel/);
  assert.match(boutique, /type === "cgv" \? "\/cgv" : "\/cgu"/);
  assert.doesNotMatch(boutique, /theme\?\.cgvText/);
});
