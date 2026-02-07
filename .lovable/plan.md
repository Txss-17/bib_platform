

# Ajout de commandes de test pour la carte géographique

## Objectif
Insérer des commandes de test couvrant plusieurs continents, pays et marchés pour vérifier le drill-down de la carte des ventes (Continent -> Pays -> Ville).

## Étapes

### 1. Créer des produits de test
Les commandes nécessitent un `product_id` valide. Il faut d'abord créer quelques produits liés à une boutique existante et des produits fournisseurs existants.

### 2. Insérer des commandes variées géographiquement
Insérer environ 15-20 commandes réparties sur plusieurs marchés :

- **Europe** : FR (France), DE (Allemagne), ES (Espagne), IT (Italie)
- **Afrique** : MA (Maroc), SN (Sénégal), CI (Côte d'Ivoire)
- **Amérique du Nord** : US (États-Unis), CA (Canada)
- **Asie** : JP (Japon), CN (Chine)

Chaque commande aura des montants variés pour simuler des données réalistes.

### 3. Vérification
Après l'insertion, naviguer vers la page Ventes pour confirmer que :
- Les continents s'affichent avec les totaux agrégés
- Le clic sur un continent montre les pays correspondants
- Les données (Ventes, Commandes, CA) sont correctes

## Détails techniques

Les insertions se feront via l'outil d'insertion de données (pas via migration) car il s'agit de données, pas de changements de schéma.

- Boutique utilisée : `dfedfed7-3e90-4722-90ba-19d0e97f7efe`
- Produit fournisseur utilisé : `4581b32d-8ca8-4e45-9b21-b2b94140010d`
- Les `order_number` seront générés automatiquement par le trigger `generate_order_number`
- Le champ `market` correspondra aux codes pays (FR, DE, US, MA, etc.)
