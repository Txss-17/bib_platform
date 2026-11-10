# BIB Platform — référentiel de réconciliation au 10 novembre 2026

**Autorité métier :** les décisions opérationnelles consignées dans le Drive BIB sont confirmées par la Direction le 10 novembre 2026. Ne pas rouvrir les arbitrages simplement parce qu'un ancien fichier GitHub utilise des formulations différentes.

**Périmètre de cette livraison :** mise à jour de la lecture métier et garde-fou de présentation du portail fournisseur. Aucune migration exécutée, aucun paiement activé, aucun contrat signé à la place d'une personne habilitée.

## Matrice des décisions à appliquer

| Domaine | Décision arrêtée | Contrôle logiciel / limite |
| --- | --- | --- |
| Modèle B2C | Le marchand tiers est vendeur légal auprès du client ; BIB intervient comme plateforme et intermédiaire transparent, et non commissionnaire à la vente en son nom propre. | Le checkout et les documents affichent l'identité réelle du vendeur ; aucun repli implicite sur BIB en principal. |
| Boutiques tests | L'EI exploitante reste acheteur fournisseur et vendeur client ; la future SASU est une entité distincte tant qu'elle n'existe pas juridiquement. | Pas de fausse identité juridique ni de commission interne facturée par l'EI à elle-même ; GMV et CA propres séparés. |
| Approvisionnement | Fournisseur vendeur, marchand acheteur ; identité fournisseur masquée en exploration puis indiquée sur devis/facture contractuels. | Prix global commercial ne fusionnant jamais les factures fiscales de vendeurs/prestataires différents. |
| Tarification | Prix global indicatif produit + logistique + service BIB + frais convenus, avec calcul par poste et fiscalité applicable. | Un ancien prix de base non justifié ne devient pas un prix global approuvé. Devis accepté = version/empreinte figées. |
| Échantillon / stock | Échantillon acheté, reçu et explicitement validé avant commande de stock par SKU, quantité et conditions. | Paiement ne vaut ni validation technique, ni couverture financière, ni stock physiquement disponible. |
| Fournisseur | Candidature → présélection → contrat → invitation sécurisée prouvée → justificatifs → audit → admission décidée par SKU → publication distincte. | Ni présélection, ni événement de portail résolu, ni score d'audit favorable n'autorisent une admission ou une publication. |
| Audit | Rapports soumis à revue humaine ; aucun certificat automatique. Contre-audit justifié sur les constats d'origine. | BIB Audit collecte les preuves ; le pôle Audit/Intranet détient la décision finale, séparée du paiement. |
| Facturation Audit | Fournisseur payeur des prestations propres de BIB ; banque professionnelle du véritable émetteur, crédit vérifié par Finance. | Ne pas confondre virement reçu avec instruction de virement ou payout Stripe ; devis, facture, rapport et rapprochement séparés. |
| Gratifications | Décision finale du 09/11 : aucune prime ou gratification spécifique d'audit (25 %, 20 %, 14,5 % ou forfait). | Aucun calcul automatisé ni engagement de paiement individuel dérivé d'une ligne commerciale « intervention ». |
| Paiements | Stripe Payments/Connect selon flux ; Destination charges ciblées sous réserve des capacités et contrats réels. | Un paiement multi-bénéficiaire sans architecture validée reste bloqué. Un transfert n'est pas un payout bancaire ; refunds et disputes tracés. |
| Logistique | Livraison finale organisée via partenaire logistique ; le détail des opérations internes ne doit pas être exposé publiquement. | Pages publiques limitées aux services, garanties et informations utiles ; informations opérationnelles sensibles cantonnées au système interne. |
| Données et consentements | Cookies nécessaires, statistiques, personnalisation et communications doivent être distingués ; refus aussi accessible que l'acceptation. | Aucun consentement marketing inféré d'une acceptation contractuelle ni aucune case optionnelle précochée. |
| Documents juridiques | Identités et mandats réels, versions, acceptations et preuves individualisées par entité. | Une validation métier interne ne constitue pas une signature, ni une validation fiscale/ACPR/Stripe, ni une migration exécutée. |

## État du code observé sur main

- **Déjà développé, à confirmer en recette connectée :** brouillon de devis échantillon/stock, identité fournisseur privée sur le devis, prix commercial consolidé, contrôles d'échantillons et de couverture, bridge Platform–Intranet, parcours Stripe et protections de consentement.
- **Écart de présentation corrigé dans cette branche :** le nombre d'événements `catalog_draft` résolus était présenté comme « Produits validés ». Il mesure désormais les **propositions traitées**. La notification de dépôt ne promet plus une réponse sous 48 h sans engagement démontré.
- **P0 — à implémenter / prouver :** portail fournisseur limité aux SKU réellement admis avec preuve d'admission Intranet, identification canonique `suppliers.id`, absence de fuite de dossiers internes et contrôles serveur à chaque publication (issue #40).
- **P0 — à implémenter / prouver :** contrat signé → demande d'invitation OTP sécurisée / preuve de remise → activation distincte et révocable, fournisseur ou logisticien (issue #41).
- **P0 — à prouver en préproduction :** migration/schéma Drizzle–Supabase, secrets bridge et RPC/RLS, Stripe test, compte connecté, paiement/charge/transfert/remboursement/litige, réception physique, factures et rapprochement réel ; aucun checkout de production sans Go/No-Go.
- **P1 — à réconcilier :** surfaces marchandes, dashboards, approvisionnements, boutique EI, gestion de stocks, facture/avoir, documents de consentement, service logistique et parcours client.

## Tests de non-régression exigés

1. Un `catalog_draft` résolu **ne** vaut **pas** SKU admis.
2. Un SKU présélectionné, éligible ou audité mais non admis reste inaccessible dans le catalogue commercial du fournisseur et des marchands.
3. Un SKU admis par décision versionnée et autorisée reste soumis au contrôle distinct de publication.
4. Le fournisseur exploratoire reste masqué ; le devis contractuel révèle vendeur, acheteur et identité de BIB.
5. Échantillon payé sans validation physique : commande de stock refusée.
6. Paiement réussi sans couverture Finance, remboursement ou contestation : production et expédition refusées.
7. Achat boutique EI : aucun revenu de commission interne ; vente client EI : CA du vendeur EI.
8. Paniers multi-bénéficiaires non pris en charge : paiement refusé sans détournement vers le compte BIB.
9. Score d'audit élevé ou audit payé : aucune admission ni publication automatique.
10. Consentement cookies, marketing et acceptation contractuelle : preuves et finalités indépendantes.

## Documents de référence Drive

- [Référentiel décisionnel — intermédiation, prix global, Stripe](https://docs.google.com/document/d/1k6U9xBsmA1KeUOGz0vH-PweVhBpAyeop5z8B5FdnSDQ/edit)
- [BIB-31 — flux marketplace, finance et fiscalité v2.2](https://docs.google.com/document/d/1eBb7okAEUh5lyAVN2wxI4utVmWW1EMoPn3xFcblqiVw/edit)
- [Procédure fournisseurs, devis, audit et règlements](https://docs.google.com/document/d/1AEFtOiACQivT6KTFd51QrqA2TWJRcmJ_nGfxCoDsfkQ/edit)
- [Cas pratiques de devis et factures d'audit du 09/11, section 13](https://docs.google.com/document/d/1TaJmz_LqrhnenH2G2pY-AcLdI4fODbJepB_ktp1qYJ8/edit)
- [Cahier fonctionnel Audit / Finance](https://docs.google.com/document/d/1LwTHlbWGSjAIUbhMFSBFJKCuGpmeop3MGGwiiU2_a1o/edit)

## Politique de livraison

La validation de Direction **fige les choix métier**, mais ne vaut pas permission d'exécuter des migrations irréversibles, de faire circuler des paiements réels, de publier des données partenaires ni d'attester une conformité réglementaire non vérifiée. Maintenir les travaux en PR jusqu'aux contrôles de préproduction, puis enregistrer la décision Go/No-Go et les preuves.
