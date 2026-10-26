# Cohérence BIB Platform / Intranet — 26 octobre 2026

Cette correction part de Platform `088870e3691f6caf18080f1c6f21ec7e626c3b0b` et de l’Intranet `7abcc1e3e2a470099bfa38e1bbcfda420766d553`. Les correctifs du bridge préparés le 25 octobre sont inclus. Les anciens fichiers `.patch` présents dans le dépôt sont des références historiques à ne pas rejouer après cette intégration.

## Comportement obtenu

- Le thème est piloté par un seul fournisseur `next-themes` dans chaque application. Platform utilise la préférence `bib-theme` dans ses pages publiques, le tableau de bord, les fenêtres déportées et l’aperçu du Studio. L’ancienne préférence `bib-dashboard-theme` est migrée lorsqu’aucun choix commun n’existe. L’Intranet conserve aussi le choix après rechargement. Le choix est propre au navigateur et à l’origine de chaque application.
- Les surfaces, textes, états et contrôles utilisent les couleurs sémantiques. Les sections de marque marine gardent un fond marine fixe et une typographie lisible. Les palettes définies par les marchands restent leur contenu.
- Le catalogue FR/EN couvre les libellés BIB des pages, formulaires, erreurs, statuts, messages accessibles, réglages et outils du Studio. Les constantes de présentation sont relues dans la langue courante, ainsi que les dates et montants. La préférence `bib-language` conserve le choix et récupère l’ancienne clé `linksy-lang`. Un paramètre `lang=fr` ou `lang=en` est reconnu au chargement.
- Les noms, descriptions, textes libres, pages et visuels fournis par les marchands ne sont jamais envoyés à un traducteur. Les traductions sont locales et explicites. Les valeurs enregistrées des choix BIB ne changent pas lorsque leur libellé change de langue.
- La personnalisation repose sur les capacités qualifiées dans l’Intranet et sur un produit effectivement ajouté à une boutique. Plusieurs boutiques pour une même référence imposent un choix explicite.
- Le dossier est enregistré côté serveur avec contrôle de version. Un échec ne devient pas un faux succès grâce à un brouillon local. Une édition retire l’accord technique précédent et exige une nouvelle soumission.
- B.I.B Circular reste en présentation : aucune déclaration de scan ne crédite de points. Les faux avis et notifications d’exemple ne sont plus présentés comme des données réelles.

## Contrat et identifiants

Les deux applications conservent leurs bases Supabase existantes. Le bridge transporte les projections autorisées ; le navigateur Platform n’accède pas aux données privées de l’Intranet.

| Donnée                 | Contrat                                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Référence catalogue    | `supplier_products.id` côté Platform, rattachée à `products.platform_id` côté Intranet                                |
| Produit de boutique    | `products.id` côté Platform ; identifiant utilisé pour son dossier                                                    |
| Options qualifiées     | `logo`, `colors`, `materials`, `finishes`, `packaging`, `marking`, `dimensions`, `text`                               |
| Conditions             | MOQ, délai confirmé en jours, supplément entier en centimes avec devise explicite ; échantillon obligatoire           |
| Informations publiques | Origine, poids, dimensions, ingrédients, conservation et galerie HTTPS                                                |
| Informations exclues   | Coûts d’achat internes, notes d’audit, documents privés et quantités de stock arbitraires                             |
| Version                | La configuration marchande porte un numéro de version ; les miroirs refusent les versions et horodatages plus anciens |

`productId` identifie un produit de boutique. `supplierProductId` identifie une référence catalogue. Les anciens liens contenant un identifiant catalogue dans `productId` restent reconnus, sans utiliser cet identifiant comme identifiant de dossier.

## Parcours de personnalisation

1. Un responsable autorisé qualifie les capacités et conditions dans **Fournisseurs → Produits validés**. Le serveur vérifie son rôle et son portefeuille.
2. **Transmettre à Platform** publie ces seules informations commerciales autorisées via `supplier_product`.
3. Le marchand ajoute la référence à une boutique, choisit ses options et enregistre un brouillon. Le serveur vérifie la propriété du produit, l’activité de la référence, les capacités et la version attendue.
4. **Demander la revue BIB** soumet la version enregistrée. Un nom de marque et, lorsqu’une technique de logo est choisie, un fichier de logo HTTPS sont requis.
5. La synchronisation Intranet importe les demandes. L’équipe habilitée peut les mettre en revue, demander des modifications, refuser avec motif ou donner un accord technique.
6. `customization_review` renvoie cette décision à Platform. L’Intranet enregistre l’horodatage autoritatif retourné par Platform, empêchant une ancienne synchronisation d’écraser la décision.

L’accord technique n’active pas un produit, ne valide pas un échantillon et ne lance aucune fabrication. La validation physique et les règles opérationnelles de production restent des étapes distinctes.

## Intégration et déploiement

Les migrations ci-dessous sont préparées et testées sur des fixtures PostgreSQL. Elles ne sont pas appliquées automatiquement par cette PR.

1. Vérifier l’historique Drizzle et les schémas des deux environnements. Ne pas rejouer tous les anciens SQL de `supabase/migrations` : ils contiennent des versions qui se recouvrent.
2. Appliquer uniquement les migrations encore absentes : Platform `0019_customer_and_ops_access.sql`, `0020_bridge_sync_contract.sql`, `0021_platform_customer_favorites.sql`, puis `0022_customization_workflow.sql` ; Intranet `0028_atomic_platform_favorites.sql`, puis `0029_product_customization_bridge.sql`.
3. Déployer les fonctions Platform `intranet-import`, `intranet-export`, `partner-portal-action` avec leurs modules `_shared`, et la fonction Intranet `platform-bridge` avec ses modules `_shared`. Préserver le secret privé partagé ; il ne doit pas être placé dans une variable Vite ni transmis au navigateur.
4. Déployer les deux frontends après les migrations et les fonctions. L’export refuse une lecture incomplète plutôt que d’annoncer une synchronisation vide réussie.
5. Exécuter un cycle de recette sur un produit de test : qualification, transmission, brouillon, soumission, synchronisation, revue et retour de décision. Vérifier aussi une modification concurrente et un compte hors périmètre.

Les tables, fonctions et droits attendus sont définis directement dans ces migrations. La création du dossier est compatible avec un environnement où l’ancien SQL `0015` n’a pas été appliqué.

## Vérification reproductible

Avec les deux dépôts voisins nommés `bib_platform` et `bib_intranet`, depuis Platform :

```sh
npm ci
npm run check
npm run lint
npm test
npm run test:bridge
npm run check:bridge
npm run build
npx playwright install chromium
BIB_START_PREVIEW=1 BIB_PREVIEW_MODE=production npm run test:consistency
```

`BIB_INTRANET_ROOT` peut pointer vers un autre checkout. Les tests du bridge utilisent PostgreSQL embarqué et des réponses simulées : ils ne nécessitent ni clé de service ni connexion à une base distante. Le test navigateur intercepte toutes les requêtes backend avec un compte fictif et bloque les autres services externes. Il écrit les captures et son rapport dans un répertoire temporaire, configurable avec `BIB_SMOKE_ARTIFACTS`.

Depuis l’Intranet :

```sh
npm ci
npx tsc --noEmit -p tsconfig.app.json
npm run build
```

Le lint global de l’Intranet contient une dette antérieure à cette correction, notamment des `any` et des annotations `@ts-nocheck`. Ce résultat ne doit pas être présenté comme un contrôle global réussi.

## Limites de recette

Recette locale du 26 octobre : 194 tests applicatifs et 83 tests de contrat, handlers et PostgreSQL réussis ; typage et lint Platform réussis ; 8 scénarios navigateur couvrant 24 affichages en clair/sombre, FR/EN et ordinateur/mobile sur la version compilée. Les deux applications compilent. Le typage Intranet et le lint de ses modules frontend modifiés passent ; son lint global conserve la dette antérieure décrite ci-dessus.

Les tests locaux ne prouvent pas le déploiement des migrations ni la configuration des secrets, de Stripe ou des services IA distants. Les préférences de notification par catégorie, l’activation TOTP et le paramétrage initial des versements restent signalés comme indisponibles sur l’écran concerné. Le contrôle de publication du Studio utilise les données persistées ; il ne constitue pas une transaction atomique côté serveur.
