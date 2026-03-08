

# Ce qui manque dans le projet LINKSY

Voici l'audit complet des fonctionnalites manquantes ou partiellement implementees.

---

## 1. Fonctionnalites critiques (bloquantes pour la production)

### Paiement en ligne
- Aucune integration de paiement (Stripe/Shopify). Le checkout confirme la commande sans encaisser.
- Integration Stripe ou Shopify necessaire pour les paiements reels.

### Envoi reel des emails
- Les modeles email existent dans la DB mais **aucun service d'envoi n'est connecte** (pas de Resend, pas d'edge function d'envoi).
- Les emails de bienvenue, confirmation de commande, expedition ne sont pas envoyes.

### Gestion du statut des commandes
- Pas de RLS policy UPDATE sur la table `orders` -- le vendeur **ne peut pas changer le statut logistique** (pending -> processing -> shipped -> delivered).
- La page Commandes affiche les statuts mais aucun bouton pour les modifier.

### SEO & Analytics -- donnees fictives
- `SEOAnalytics.tsx` utilise des donnees hardcodees (scores, suggestions IA). Aucune connexion reelle.

### Paiements -- donnees fictives
- `Paiements.tsx` affiche des donnees mock (`payoutHistory`, `boutiqueBreakdown`). Pas connecte a la table `payments`.

---

## 2. Fonctionnalites importantes (experience utilisateur)

### Gestion des stocks / inventaire
- Pas de champ `stock` sur les produits. Aucune alerte de rupture de stock reelle.

### Notifications
- `NotificationSystem.tsx` existe mais les notifications sont probablement mock. Pas de systeme de notifications temps reel.

### Page produit publique -- CartProvider manquant
- `ProductPublic.tsx` utilise `useCart()` mais n'est pas wrappe dans un `CartProvider` (le route dans App.tsx ne l'inclut pas). Risque d'erreur runtime identique au bug precedent.

### Recherche globale dans le dashboard
- La barre de recherche dans le header du dashboard est purement cosmetique (pas de logique).

### Multi-langue
- `LanguageContext` existe mais la traduction n'est probablement pas appliquee sur toutes les pages.

---

## 3. Ameliorations secondaires

| Element | Etat actuel |
|---------|-------------|
| Export CSV des commandes/ventes | Non implemente |
| Dashboard KPIs trends (comparaison periodes) | Valeurs hardcodees (ex: `trend: 12`) |
| Avatar upload dans Parametres | Champ `avatar_url` existe mais pas d'upload |
| Suppression de compte utilisateur | Non implemente |
| Domaine personnalise pour les boutiques | Non implemente |
| PWA / mode offline | Non implemente |
| Partage reseaux sociaux des boutiques | Non implemente |
| Systeme de coupons / promotions | Non implemente |
| Avis clients reels (pas mock) | `StorefrontTestimonials` affiche des donnees fictives |
| Page de politique de confidentialite / CGV | Non implementee |

---

## 4. Bugs potentiels identifies

1. **ProductPublic.tsx** -- `useCart()` appele sans `CartProvider` parent (meme bug que celui corrige precedemment)
2. **Triggers DB manquants** -- `generate_order_number` est defini comme trigger function mais la liste des triggers est vide, donc les order_numbers ne sont peut-etre pas generes automatiquement
3. **CheckoutForm** genere ses propres order_numbers cote client alors qu'un trigger serveur existe -- duplication potentielle

---

## Recommandation de priorite

1. **Corriger le bug ProductPublic** (CartProvider manquant)
2. **Ajouter la mise a jour du statut des commandes** (UPDATE policy + UI)
3. **Integrer Stripe** pour les paiements reels
4. **Connecter les donnees reelles** sur Paiements et SEO
5. **Connecter un service d'envoi d'emails** (Resend via edge function)

