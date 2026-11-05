# BIB — Gate de prépublication juridique (5 novembre 2026)

> **BROUILLON DE PRÉPARATION — AUCUNE PUBLICATION NI MIGRATION.** Le document Word harmonisé v2.0 initialement produit était incompatible avec la liste blanche SQL sur plusieurs champs `{{...}}`. Les trois modèles de boutique ont été corrigés en v2.1 (Drive BIB — sous-dossier juridique). La compatibilité de champs ne vaut pas validation juridique.

## Ce qui est contrôlé
- Les modèles `JUR-B01`, `JUR-B02`, `JUR-B03` ont été rapprochés des fonctions `validate_legal_governance_payload` des migrations `Platform/0025` et `Intrabib/0084`.
- Le manifeste de prépublication dans `docs/legal-model-prepublication-contract-2026-11-05.json` garde explicitement `effective_at:null` et `import_allowed:false`.
- Aucun nouveau numéro de version d'acceptation n'est inventé pour les comptes marchands : les fichiers TypeScript et JavaScript portent encore `cgu/cgv=2026-09`, `privacy=2026-11-02`.

## Gate 0 : projet documentaire
- [x] Suppression des placeholders non reconnus et ajout des champs obligatoires; contrôle statique des textes extraits.
- [x] Modèles disponibles en `DOCX` et texte brut destiné à une **future** préparation de modèles.
- [ ] Vérifier les formulations exactes et les parcours de vente avec un juriste (rétractation en ligne, médiation, garanties, identité vendeur, RGPD).
- [ ] Valider ou corriger l'usage de `TVA_ID` pour une EI sans numéro de TVA applicable. Ne pas remplir un identifiant fictif.

## Gate 1 : identité et contrats
- [ ] Régulariser/contrôler l'EI et le droit d'exercer l'activité (et l'objet commercial approprié).
- [ ] Confirmer le nom légal, SIREN/SIRET, adresse pro, contact actif, médiateur **réellement conventionné**, hébergeur contractuel.
- [ ] Vérifier la qualification des parties (vendeur EI propre / marchand tiers), les mandats, PSP, responsabilité du support et des retours.
- [ ] Séparer la revue de `JUR-M01/M02`, `JUR-C01/C02`, des seuls modèles `JUR-B01/B02/B03` techniquement diffusés par le miroir boutique.

## Gate 2 : préproduction isolée
- [ ] Sauvegarder et tester la restauration avant toute migration; revoir les journaux Drizzle et les versions de checkout.
- [ ] Appliquer **en préproduction isolée seulement** les migrations nécessaires, puis déployer le bridge et l'import privé de manière coordonnée.
- [ ] Configurer les secrets serveur et vérifier `sandbox/live`, origine HTTPS et permissions; aucune clé secrète dans `VITE_*`.
- [ ] Créer les modèles dans Intrabib en brouillon, saisir `body` en texte clair, définir une `effective_at` avec fuseau **après arbitrage**, revue juridique indépendante puis Direction.
- [ ] Confirmer réception distante du numéro de séquence avant de considérer le miroir synchronisé.
- [ ] Tester la suspension si modèle retiré ou identité vendeuse modifiée; aucune réactivation d'une ancienne version en silence.
- [ ] Recetter compte EI propre + marchand tiers : publication bloque si identité non vérifiée, boutique affiche bon vendeur, checkout exige acceptation, snapshot immuable, retrait/rétractation, remboursement, données et cookies.
- [ ] Documenter les tests Stripe sans présumer `Stripe Connect` et le statut des fonds de tiers.

## Gate 3 : décision de publication
La revue juridique finale et l'autorisation de la Direction sont requises. La fusion d'une PR GitHub, la publication d'un document dans le registre Intrabib, sa réception par Platform et le déploiement public sont **quatre événements distincts**. Aucun de ces événements n'est déclenché par ce lot.

Références : `docs/store-legal-governance-2026-11-04.md`, `docs/legal-corpus-harmonization-2026-11-05.md`, `BIB-00 v1.6`, `BIB-00bis v1.3`.
