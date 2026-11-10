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

## Correctif supplémentaire dans la PR #48 — garde du récepteur catalogue

Le récepteur `intranet-import` n'autorise plus l'activation implicite d'un produit si `is_active` manque. Toute opération d'activation doit maintenant transporter : (1) `is_active=true` explicite, (2) un UUID canonique du produit Intranet, (3) un horodatage de version source et (4) une enveloppe de prix global approuvée. La désactivation `is_active=false` reste possible pour retirer une offre même depuis un ancien expéditeur ; les protections de provenance et d'environnement continuent de s'appliquer. Six tests de régression ciblés couvrent ces règles.

**Limite importante :** ces champs d'import ne démontrent pas eux-mêmes la décision d'admission Audit. Cette décision est contrôlée en amont par `loadAdmittedSupplierProduct` (Intranet), qui appelle `get_supplier_reference_admission`. La preuve connectée, l'anti-rejeu et la cohérence entre les deux systèmes doivent encore être vérifiés, notamment sur l'issue #40. Une ligne active préexistante sans provenance vérifiée ne devient pas admise du seul fait de cette correction. Le récepteur ne doit pas être déployé isolément sans test de compatibilité du producteur et de non-régression sur les désactivations.

## Contrôle supplémentaire — indépendance de la décision Catalogue

Le portail fournisseur ne peut plus appeler `update_event_status` pour clore ou approuver ses propres événements `catalog_draft` : le serveur vérifie le propriétaire, le portail et le type avant toute mutation. Les mises à jour de traitement logistique restent disponibles sur les types autorisés et les tests couvrent les deux parcours. L'événement `resolved` d'un ancien catalogue ne vaut toujours **pas** une admission Audit ; la correction des dossiers historiques et l'affichage de décisions par SKU restent à spécifier en collaboration avec Intranet.

Le précontrôle CI a mis en évidence une attente historique 409 sur une version source manquante ; le récepteur retourne désormais 412 avant accès à la base. Le test est aligné sur cette règle de refus anticipé. L'échec séparé de couverture exhaustive des traductions EN concerne plusieurs centaines de clés non couvertes et reste distinct de l'admission SKU. Les succès des sous-tests ne valent pas validation de la CI entière.

## Évolution du 10/11 — décisions SKU actuelles

BIB Intranet PR [#88](https://github.com/Txss-17/bib_intranet/pull/88) ajoute une projection read-only des **dernières décisions Audit par référence** via une liaison immuable au dossier fournisseur Platform (jamais par nom, mail ou saisie navigateur). BIB Platform ajoute un appel service-à-service `list_supplier_references`, un panneau « Références et décisions actuelles » et une distinction explicite avec les décisions **historiques** de chaque rapport d'audit. Un fournisseur ne peut pas les modifier.

Sorties limitées à SKU, décision `admitted/refused/correction_required`, dossier source et date. Aucun document bancaire ou commentaire interne transmis. La décision d'admission n'est **pas** une publication au catalogue marchand : le circuit de publication reste contrôlé séparément. Il faut déployer **d'abord la migration et l'endpoint Intranet sur préproduction**, puis Platform, et vérifier l'isolation inter-fournisseur, l'antériorité des décisions, les corrections et refus ultérieurs, les accès suspendus, les environnements et la migration.

## Parcours invitation / OTP : sécurité de livraison

Sur la demande OTP existante, Platform refuse maintenant de retourner un succès si le service de courriel transactionnel renvoie un statut d'erreur ou si l'appel réseau échoue. Un enregistrement OTP peut exister dans ce cas ; il doit expirer selon le délai configuré et n'est **pas** une preuve de remise. Le contrôle ne prouve pas que le message a été effectivement délivré dans la boîte de réception : il prouve uniquement l'acceptation de la requête par le service d'envoi.

La véritable invitation post-contrat reste un lot distinct : émission uniquement après dossier signé et visa Intranet, lien public vers le parcours OTP, preuve d'émission/acheminement, idempotence, session révocable et interdiction de placer un jeton de dossier dans l'URL. La route héritée `/:portal/portal/:token` demeure un risque à résorber avant activation d'accès réels ; ce correctif ne la présente pas comme sûre.

## Sécurisation incrémentale du portail partenaire (PR #48)

- Le RPC opérationnel n'expose plus l'enregistrement brut du dossier partenaire. Une migration additive (non exécutée) limite la réponse aux champs nécessaires et impose un statut `approved` avec email vérifié. Le jeton, les pièces KYC et les notes internes sont volontairement absents.
- Après OTP, la reprise d'onboarding utilise désormais la route sans identifiant `/{suppliers|ops}/dossier` avec passage de la preuve de session dans l'état de navigation ; les anciennes routes `/portal/:token` renvoient vers la vérification OTP. C'est une réduction des fuites via URL/referrer, **pas** encore une session serveur à expiration.
- Les confirmations de candidature ne construisent plus de liens contenant le jeton de dossier et ne reprennent plus un en-tête Origin non fiable ; le lien mène à la reprise OTP sur le domaine BIB.
- La vérification OTP remplace le jeton du dossier après chaque login, et la consommation du code utilise une écriture conditionnelle atomique pour refuser un deuxième usage.
- Tests de non-régression ajoutés pour les chemins URL sans jeton, la projection SQL, la rotation et l'usage unique.

### Blocages restant avant mise en service

Ces changements, bien que renforçant la sécurité, **ne satisfont pas** encore l'issue #41 : la table de dossier conserve un jeton bearer persistant, la durée de vie et la révocation des sessions ne sont pas modélisées indépendamment, les invitations ne sont pas déclenchées par une décision de contrat signé authentifiée par Intranet, et la permission opérationnelle ne distingue pas encore les rôles documentaires, SKU et commandes live. Les parcours existants doivent être testés en préproduction, avec plan de reprise des liens hérités et retrait des tokens stockés dans les journaux historiques. L'administrateur doit décider du basculement après recette et sans invalider silencieusement des comptes légitimes.

### Durée de vie des jetons OTP — migration de préproduction

La migration additive `20261110225500_partner_dossier_bearer_expiration.sql` ajoute `access_token_expires_at` au dossier partenaire. Un code OTP consommé une seule fois crée/renouvelle un jeton pour **deux heures** ; un nouvel OTP fait tourner ce jeton et invalide le précédent. Les fonctions `partner_load_submission`, `partner_load_history`, `partner_load_operational_portal`, ainsi que les Edge Functions de soumission et d'action, refusent les jetons expirés. Un jeton historique dont la date d'expiration est nulle ne donne plus accès ; son détenteur doit revérifier l'adresse e-mail.

**Ordre de recette/déploiement obligatoire :** sauvegarde et procédure de retour arrière vérifiées → migration SQL sur préproduction → fonctions OTP/portail/soumission coordonnées → interface et tests connectés → décision Go/No-Go. Une mise à jour partielle risque de bloquer les dossiers existants ; les partenaires doivent être informés de la nécessité d'obtenir un nouveau code OTP. La rotation d'un jeton n'est pas encore un dispositif complet de sessions multi-appareils, d'habilitations contractuelles, de révocation administrative immédiate ni une preuve de signature de contrat. Ne pas présenter cette étape comme clôture de l'issue #41.
