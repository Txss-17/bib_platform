# Traitement BIB des demandes de réassort

Le marchand demande un réassort dans la fiche de son produit. La demande conserve le produit marchand, sa boutique, la référence catalogue, la quantité et le MOQ constaté. BIB l’examine dans **Supplier → Produits validés → Demandes de réapprovisionnement Platform**, puis transmet une approbation ou un refus motivé au marchand.

Une approbation ne crée pas un achat fournisseur et ne modifie aucun stock. Les achats fournisseurs et les réceptions physiques gardent leur propre traitement. Le crédit de stock utilise toujours le flux protégé `stock_receipt` et `receive_product_stock`.

## Mise en service coordonnée

1. Appliquer les migrations Drizzle antérieures manquantes, puis Platform `0023_stock_restock_review.sql` et Intranet `0030_platform_stock_restock_requests.sql`. Ne pas rejouer les migrations Supabase historiques.
2. Vérifier les correspondances catalogue : `supplier_products.intranet_id` Platform doit contenir le UUID du produit catalogue `products.id` Intranet. Ce UUID ne désigne pas le produit marchand.
3. Déployer Platform `intranet-export` et `intranet-import`, puis Intranet `platform-bridge`, avec la même clé privée de liaison. Déployer les interfaces des deux projets.
4. Effectuer une synchronisation complète (sans date de départ) pour reprendre les demandes existantes. Une table indisponible ou une demande sans référence catalogue valide fait échouer la synchronisation ; aucun point de reprise réussi ne doit être enregistré.
5. Vérifier le parcours avec un compte marchand propriétaire et un responsable BIB autorisé sur le produit : demande au MOQ, synchronisation, refus motivé ou approbation, puis retour du statut et du commentaire sur Platform.

Ces changements sont préparés dans les dépôts. Leur application aux bases et services distants doit être vérifiée séparément ; un fichier de migration ne constitue pas une preuve de déploiement.

## Contrat et protections

L’export incrémental `restock_requests` est borné par `since` et `snapshot_at`, utilise `updated_at` et pagine toutes les lignes. Il transmet les identifiants marchand/catalogue/boutique, les libellés, la quantité, le MOQ, le statut, les notes, la version et les dates.

L’import privé accepte :
```json
{
  "type": "restock_review",
  "data": {
    "request_id": "UUID de la demande Platform",
    "version": 1,
    "status": "rejected",
    "comment": "Motif visible par le marchand"
  }
}
```

Seuls `approved` et `rejected` sont acceptés. Le refus exige un motif non vide, de 2 000 caractères maximum. La réponse est `{ "request": <ligne autoritative> }` ; les libellés d’export ne sont pas répétés dans cette réponse.

La fonction de revue est réservée au service. Elle verrouille la demande, vérifie sa version et son statut `requested`, recontrôle la référence active et le MOQ courant avant approbation, puis incrémente la version. Une reprise de la même décision avec la version d’origine renvoie le résultat enregistré sans nouvelle écriture. Toute décision concurrente ou différente reçoit un conflit (409).

Le marchand dispose uniquement de la lecture de ses demandes et de l’insertion des champs métier autorisés. Il ne choisit ni statut, version, commentaire BIB, dates de revue ou de synchronisation. L’interface actualise le suivi toutes les 30 secondes lorsqu’elle est ouverte et permet une actualisation manuelle ; les erreurs de lecture restent visibles.

## Validation reproductible

La CI exécute les tests habituels et une tâche dédiée au contrat entre dépôts : `npm run test:bridge` et `npm run check:bridge`, avec le dépôt Intranet compatible à côté de Platform. Les tests de base isolée vérifient notamment les droits, le MOQ, les conflits, les reprises sans doublon et l’absence de crédit de stock. Le dépôt compagnon est épinglé dans la tâche CI pour conserver une validation reproductible.
