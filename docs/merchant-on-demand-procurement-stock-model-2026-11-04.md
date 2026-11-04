# BIB Platform — catalogue marchand, stock fournisseur et achat à la commande

## Décision de référence
En phase entreprise individuelle au régime micro, **BIB ne préachète pas les produits**. Le fournisseur reste propriétaire des unités qu'il détient. Le marchand tiers est vendeur juridique de ses produits et acquiert auprès du fournisseur les unités nécessaires à une vente confirmée, selon le contrat applicable. Dans les boutiques tests propres, l'entreprise individuelle BIB est directement acheteur et vendeur, sans autofacturation d'abonnement ni commission. BIB est l'intermédiaire de référencement, de coordination opérationnelle et de logistique. L'ajout d'une référence à une boutique ne crée ni achat fournisseur, ni stock disponible, ni propriété du stock pour BIB.

## États à tenir séparés
- **Référence catalogue** : contrôlée par BIB, avec qualité/audit, MOQ, prix fournisseur et capacités de personnalisation.
- **Offre boutique** : produit choisi par le marchand, marge et conditions commerciales, statut de validation d'échantillon. Ne pas assimiler à une commande.
- **Disponibilité fournisseur** : quantité ou capacité confirmée, source contractuelle, heure de vérification, fournisseur propriétaire. **Cette donnée n'existe pas encore dans le schéma Platform** ; ne pas déduire la disponibilité du champ `products.stock_quantity`.
- **Stock physiquement réceptionné** : quantités et réservations du registre opérationnel, avec preuve de réception/mouvement. Les unités déjà réservées ne sont pas libres.
- **Commande client** : identité marchand vendeur, transaction Stripe et achat fournisseur correspondant, quantité, prix et paiement; vérifier la disponibilité avant tout engagement.
- **Approvisionnement à la vente** : achat par le marchand après vente client, accepté par le fournisseur puis préparé / personnalisé / expédié par le circuit BIB.
- **Demande de réassort anticipé** : facultative et distincte d'une vente, avec MOQ. Une approbation ne crédite pas de stock.

## Contrôles manquants pour rendre la vente sans préachat opérationnelle
1. Fournisseur : source de disponibilité/capacité fiable et horodatée, limites et expirations, mises à jour et refus fournisseur, identifiants de lots éventuels.
2. Validation commerciale : conditions d'achat fournisseur propres au marchand, propriété juridique, facturation, éligibilité du produit, MOQ par mode de commande (commande unitaire / regroupement de précommandes).
3. Checkout : ne jamais contourner `reserve_product_stock_checkout` faute de source fiable. Ajouter un flux serveur **distinct** pour la commande à la demande avec vérification et réservation/confirmation de capacité fournisseur et compensation si paiement échoue.
4. Commande : état de l'achat fournisseur par vendeur marchand, facture fournisseur au marchand, paiement PSP, idempotence et rapprochement avec la vente client.
5. Personnalisation : production après regroupement des précommandes et validation de déclenchement conformément aux capacités du fournisseur; statuts et quantités suivis.
6. Livraison : BIB orchestre l'expédition via partenaire contractuel et conserve la traçabilité jusqu'à la livraison.
7. Exceptions : rupture fournisseur, délai, refus, annulation, remboursements, retours, stock en quarantaine ; préserver la propriété et les preuves de flux.

## État effectif du code au 4 novembre 2026
Le tableau de bord marchand et les fiches décrivent le bon modèle. Les références restent initialisées à `stock_quantity = 0` et le checkout en ligne réserve actuellement du stock local. **La vente à la demande avec déclenchement automatique de l'achat fournisseur n'est PAS encore câblée de bout en bout.** Ne jamais la présenter comme opérationnelle ni ouvrir une vente non couverte. Il reste à implémenter les contrôles serveur et le contrat financier correspondant.
