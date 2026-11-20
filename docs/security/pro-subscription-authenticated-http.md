# Test HTTP authentifié — droit d’abonnement Pro

Script : `node tests/security/pro-subscription-authenticated-http.mjs`

Ce test appelle réellement l’API Supabase Auth puis la RPC PostgreSQL exposée par PostgREST, sans effectuer de paiement et sans modifier la base.

## Préconditions

Utiliser **uniquement un projet de préproduction** et deux sessions utilisateur distinctes. Les jetons d’accès doivent être transmis par variables d’environnement ou secrets CI, jamais commités dans Git. Le compte titulaire et le second compte doivent être actifs.

Variables requises :

- `BIB_TEST_SUPABASE_URL` : URL HTTPS de Supabase **préproduction**.
- `BIB_TEST_SUPABASE_PUBLISHABLE_KEY` : clé publique/publishable (jamais la clé `service_role`).
- `BIB_TEST_PRO_OWNER_JWT` : JWT d’une session du titulaire.
- `BIB_TEST_OTHER_USER_JWT` : JWT d’une autre session utilisateur.

Variables facultatives :

- `BIB_TEST_PRO_ENVIRONMENT=sandbox` (par défaut).
- `BIB_TEST_EXPECT_OWNER_PRO_ACTIVE=true` pour exiger un scénario positif où le titulaire dispose déjà d’un abonnement Pro actif dans l’environnement demandé.
- `BIB_TEST_EXPECT_OWNER_PRO_ACTIVE=false` pour exiger le scénario négatif.
- `BIB_TEST_EXPECT_LIVE_PRO_ACTIVE=true` uniquement si le titulaire a aussi un abonnement Pro réel actif en environnement live.

Le script identifie chaque titulaire via `GET /auth/v1/user`, teste les appels croisés avec leurs JWT respectifs et vérifie les réponses en lecture seule. Il masque les réponses HTTP d’erreur et ne journalise ni identités ni jetons.

## Critères d’acceptation

1. Le compte B ne doit pas pouvoir déterminer si A possède un abonnement Pro (`false` pour une demande de B vers A).
2. Le compte A ne doit pas pouvoir consulter le statut du compte B (`false`).
3. Le compte A reçoit un booléen pour son propre compte, vrai seulement lorsqu’un abonnement admissible existe.
4. Lorsqu’un abonnement actif sandbox est présent, l’environnement live ne doit pas hériter de ce droit, sauf abonnement live effectivement actif.

**Limite** : le script ne génère ni compte ni abonnement ; il ne peut donc confirmer le scénario Pro actif que si une session d’essai déjà provisionnée dispose effectivement de ce droit. Le précédent test SQL transactionnel de préproduction a déjà couvert ce scénario avec une donnée synthétique annulée.

**Ne pas lancer ce script sur production tant que la migration de production n’est pas appliquée et validée.**
