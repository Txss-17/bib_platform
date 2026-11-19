# Brand-In-A-Box

Plateforme e-commerce B2B pour créer et opérer des boutiques : catalogue
fournisseur, boutique publique, paiements Stripe, opérations et outils de
marketing.

## Stack

- React 18, TypeScript, Vite et Tailwind CSS
- Supabase (authentification, base de données, stockage et Edge Functions)
- Stripe pour les abonnements et encaissements
- Vitest pour les tests unitaires

## Démarrage

Prérequis : Node.js 20+ et un projet Supabase configuré.

```bash
npm install
npm ci
npm run dev
```

Le serveur de développement écoute sur le port 8080.

Créer un fichier `.env.local` avec les valeurs fournies par Supabase :

```dotenv
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

Ne jamais exposer de clé `service_role` dans les variables `VITE_*`.
Les secrets Stripe, IA et email sont réservés aux secrets des Edge Functions.

## Validation

```bash
npm ci
npm run lint
npm test
npm run build
```

Les tests E2E sont configurés dans `playwright.config.ts`, mais Playwright
n’est pas encore une dépendance du projet. L’ajouter explicitement avant
d’exécuter `playwright test`.

## Base de données et fonctions

L’historique de déploiement est le journal `drizzle/migrations/meta/_journal.json`.
Les migrations applicables se trouvent dans `drizzle/migrations` et les Edge
Functions dans `supabase/functions`. Les anciens fichiers `supabase/migrations`
sont des références historiques : ne pas les rejouer en bloc, car ils contiennent
des changements qui se chevauchent et des schémas externes.

Après toute évolution du schéma, régénérer `src/integrations/supabase/types.ts`.
Vérifier les migrations déjà appliquées et la base ciblée avant tout déploiement.

Drizzle lit la connexion serveur `BIB_DATABASE_URL`. Comparer le schéma et les
historiques Drizzle/Supabase avant toute application sur une base restaurée ;
ne pas modifier artificiellement un journal pour aligner les compteurs.

Le [dossier maître BIB](https://docs.google.com/document/d/18lpUzk5j6jTKMw9m_s2XAPsALxdeP4OVkkqpbr-iv9M)
centralise les preuves, blocages et décisions Go/No-Go. La compilation ne
valide ni la restauration, ni les fournisseurs email/IA, ni un paiement Stripe
sandbox. Toute bascule de production, DNS ou Stripe réel demande une validation
explicite distincte.
