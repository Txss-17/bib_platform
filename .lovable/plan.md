# Centre d'aide Brand-In-A-Box

## Constat
Aujourd'hui le lien « Centre d'aide » du menu pointe vers `/a-propos`, qui est en réalité une page **manifesto / À propos**. Il manque une vraie page d'aide pour orienter vendeurs, partenaires et clients finaux.

## Objectif
Créer une page publique `/centre-aide` (alias `/aide`) qui regroupe **toutes les ressources** dont un utilisateur a besoin avant d'écrire au support, organisée en 4 blocs lisibles en moins de 30 secondes.

## Structure de la page

### 1. Hero + barre de recherche
- Titre « Comment pouvons-nous vous aider ? »
- Input de recherche live qui filtre l'ensemble FAQ + guides ci-dessous (filtrage client, pas d'appel backend).
- 3 raccourcis rapides : « Suivre ma commande », « Devenir vendeur », « Contacter le support ».

### 2. Bloc « Je suis… » (orientation par persona)
Cartes cliquables qui scrollent vers la section adaptée :
- **Client** → suivi commande, retours, recyclage, gift cards
- **Vendeur** → créer boutique, ajouter produits, paiements, échantillons
- **Fournisseur** → candidature, catalogue, performance
- **Partenaire logistique** → portail Ops, étiquettes, litiges

### 3. Ressources & guides
Grille de cartes regroupées par thème (icône + titre + 2-3 liens chacun) :
- **Premiers pas** : Créer un compte, Choisir un plan (`/tarifs`), Lancer sa première boutique
- **Boutique & produits** : Brand Studio IA, Sections, Ajouter un produit fournisseur, Validation échantillon
- **Commandes & paiements** : Suivi (`/tracking`), Étiquettes A6, Litiges 48 h, Reversements
- **Marketing & SEO** : SEO Copilot, Campagnes e-mail, Ventes privées
- **Conformité & légal** : KYC, RGPD, CGV (`/legal/*`), Pack légal
- **Partenaires** : Devenir fournisseur (`/suppliers/apply`), Devenir logisticien (`/ops/apply`), Portails

Chaque lien interne pointe vers une route existante de l'app (pas de page fantôme).

### 4. FAQ par catégorie (accordion shadcn)
Onglets : **Client / Vendeur / Fournisseur / Logistique / Compte & facturation**. ~6 questions par onglet, réponses concises (2-3 phrases), avec liens internes vers les pages concernées. Exemples :
- « Comment suivre une commande ? » → renvoi vers `/tracking`
- « Quand suis-je payé ? » → renvoi `/dashboard/paiements`
- « Échantillon obligatoire : pourquoi ? » → renvoi vers la mémoire sample-validation
- « Comment supprimer mon compte ? » → renvoi `/dashboard/parametres`

### 5. Contact & escalade
- Carte « Toujours bloqué ? » avec : ouvrir un ticket (`/dashboard/mes-tickets` si connecté, sinon redirection login), e-mail `support@brand-in-a-box.space`, délais affichés (réponse < 24 h, escalade litige 48 h).
- Bouton secondaire « Statut plateforme » (placeholder, lien interne).

## Implémentation

### Fichiers
- **Créer** `src/pages/CentreAide.tsx` — composant complet, données FAQ + guides en const local.
- **Modifier** `src/App.tsx` — route `/centre-aide` + alias `/aide` → `<CentreAide />`.
- **Modifier** `src/components/Header.tsx` — lien « Centre d'aide » pointe désormais vers `/centre-aide` (au lieu de `/a-propos`). La page `/a-propos` reste accessible pour le manifesto.
- **Modifier** `src/components/Footer.tsx` — ajouter lien « Centre d'aide » dans la colonne support.

### Détails techniques
- SEO via `useSEO` : titre `Centre d'aide — Brand-In-A-Box`, description orientée mots-clés support/FAQ.
- JSON-LD `FAQPage` injecté pour SEO (schema.org).
- Composants : `Accordion`, `Tabs`, `Card`, `Input` (shadcn déjà en place).
- Recherche : `useMemo` qui filtre un tableau unifié `{ question, answer, category, tags }` sur match insensible aux accents.
- Tokens : marine/or/ivoire, status tokens sémantiques (`bg-success/10`, `text-info`, etc.) — aucune couleur Tailwind brute.
- Responsive mobile-first (cartes 1 col mobile, 2-3 cols desktop).
- i18n : textes FR par défaut conformes à la mémoire (pas de switch EN ajouté dans ce lot — réutilisera `LanguageContext` plus tard si besoin).

## Hors-périmètre
- Pas de back-office d'édition de FAQ (contenu statique versionné).
- Pas de recherche serveur / IA (le chatbot `support-ai` reste accessible via `FloatingSupportButton`).
- Pas de refonte de `/a-propos` (manifesto conservé tel quel).
