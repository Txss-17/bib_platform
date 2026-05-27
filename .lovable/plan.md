Le chantier est gros — je propose de le découper en 4 lots livrables séparément. Validez l'ordre, je commence par le lot 1.

## Lot 1 — Vérification OTP + soumission durcie (fondations)

**Base de données**
- Nouvelle table `partner_onboarding_submissions` (id, portal type `suppliers`/`ops`, contact_email, status `draft|email_verified|submitted|under_review|approved|rejected`, payload jsonb, kyc_attachments jsonb, support_ticket_id, access_token unique, created_at, updated_at)
- Table `partner_onboarding_history` (submission_id, changed_at, change_summary, diff jsonb) pour tracer chaque modif
- Table `partner_email_otps` (email, code_hash, expires_at, attempts, consumed_at) — codes 6 chiffres, 10 min TTL, max 5 tentatives
- RLS : insert anonyme autorisé sur submissions/otps ; lecture/update uniquement via edge function avec access_token (security definer RPC)
- GRANT explicites sur les 3 tables

**Edge functions**
- `partner-otp-request` : génère un OTP, l'enqueue via `enqueue_email` (template transactionnel) ; rate-limit 3/min/email
- `partner-otp-verify` : valide le code, marque l'email vérifié, retourne un `access_token` signé (pour reprise/suivi)
- `partner-onboarding-submit` : appelée après OTP OK. Crée le `support_ticket` (source `partner_inquiry`), copie les fichiers KYC déjà uploadés dans `support-attachments` vers `support_ticket_attachments` automatiquement, envoie email récap au partenaire + notif équipe

**Wizard**
- Nouvelle étape "Vérification email" insérée juste avant l'étape finale "Récap & soumission"
- Bouton "Envoyer le code" → input 6 cases → "Vérifier" → débloque le bouton Soumettre
- Stocke `access_token` en localStorage pour reprise

## Lot 2 — Reprise / modification + historique

- Page `/suppliers/onboarding/resume` et `/ops/onboarding/resume` : saisie email → OTP → réhydrate le wizard depuis la submission
- Tant que `status != approved`, modifications autorisées
- Chaque save calcule un diff vs version précédente et insère une ligne dans `partner_onboarding_history` + notifie l'équipe (email transactionnel "Modification onboarding" avec résumé du diff)
- Bouton "Reprendre mon dossier" sur les pages Suppliers/Ops orientation

## Lot 3 — Portail de suivi (lien magique)

- Email de confirmation de soumission → lien `/portal/onboarding/:access_token`
- Page publique standalone affichant une timeline 5 étapes :
  1. Documents reçus
  2. Conformité validée
  3. Intégration planifiée
  4. Pilote en cours
  5. Go-live
- Chaque étape a un état `pending|in_progress|done` lu depuis la submission + son ticket support
- Affiche aussi : liste des documents uploadés, dernières notes équipe (depuis `support_ticket_responses`), bouton "Modifier mon dossier" tant que non validé
- Bouton "Renvoyer le lien" si l'utilisateur perd l'email

## Lot 4 — Pages opérationnelles (après approval)

**Conditionnel** : ces pages ne sont accessibles qu'aux submissions avec `status = approved`. Auth via le même access_token + OTP.

**Portail Suppliers** (`/suppliers/portal/:token`)
- Dépôt catalogue (upload produits proposés, statut validation par admin)
- Upload documents (certifications, fiches techniques)
- Demandes de MOQ à livrer (liste, bouton "Signaler envoi" → met à jour statut + notifie logistique)
- Commissions : MOQ vendus, restants, montant dû (vue agrégée depuis `orders` + `supplier_products`)
- Catalogue produits validés (lecture seule, MOQ min, prix échantillon, prix MOQ, médias, docs)

**Portail Ops/Logistique** (`/ops/portal/:token`)
- Dashboard stock global (par produit, par boutique partenaire)
- Écarts stock vs commandes en cours
- File commandes à expédier (toutes boutiques)
- Stock packaging/cartons
- Produits retournés
- Mise à jour statuts livraison → propage vers `orders.logistics_status` (visible côté boutique + client final via tracking existant)

Vu l'ampleur (15+ écrans, 8 tables, 6 edge functions), le Lot 4 mérite probablement un découpage supplémentaire mais je peux livrer une v1 fonctionnelle.

## Hors-scope de ce plan (à traiter séparément)

- **Affichage URL boutique en gras `nom.brand-in-a-box.space`** : c'est juste un changement visuel — je le ferai en passant dans le lot 1 (composant `<BoutiqueUrlBadge slug="..." />` réutilisable, sans toucher au routing réel qui reste `/boutique/:slug`)
- **Rattachement des domaines suppliers./logistics./shop. aux pages standalone** : ça dépend de votre config Vercel (rewrites par host). Je peux ajouter une détection `window.location.hostname` qui auto-route vers `/suppliers` ou `/ops` quand on arrive sur le bon domaine — dites-moi si je l'inclus dans le lot 1.

## Notes techniques

- Tous les emails passent par l'infra transactionnelle existante (`enqueue_email` + queue pgmq)
- Les fichiers KYC restent dans `support-attachments` (bucket privé) — la copie vers `support_ticket_attachments` est une simple insertion (mêmes paths)
- Les access_tokens sont des UUID v4 (32 caractères) stockés en clair côté DB, jamais exposés en URL avant vérif OTP
- Aucune migration sur les tables `auth.*` ou `storage.*`

---

**Confirmez** : on attaque Lot 1 (OTP + soumission durcie + auto-attach KYC + badge URL boutique) ? Ou vous voulez ajuster le périmètre ?