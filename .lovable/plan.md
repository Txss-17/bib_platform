
## Objectif

Remplacer le gabarit HTML générique actuel du Portail Logistique par un **modèle d'étiquette Brand-In-A-Box** fidèle à la maquette fournie : format A6 (10×15 cm) prêt à imprimer sur imprimante thermique ou A4, avec code-barres et QR code générés à la volée. Les API transporteurs (Sendcloud/Colissimo/DHL…) seront branchées plus tard sans casser ce composant.

## Modèle d'étiquette (reproduction fidèle de la maquette)

Format **A6 portrait 10×15 cm**, fond blanc, encre noire + accent or BIB.

```text
┌────────────────────────────────────────────┐
│  [Logo BIB]  BRAND-IN-A-BOX   [⛨ VERIFIED] │
├────────────────────────────────────────────┤
│  EXPÉDITEUR                    ⛨ VERIFIED  │
│  {boutique.legal_business_name}   BY       │
│  {boutique.legal_address}                  │
│                                            │
│  DESTINATAIRE         PAYS DE LIVRAISON    │
│  {customer_name}      {country}            │
│  {shipping_address}   DATE D'EXPÉDITION    │
│                       {ship_date}          │
├────────────────────────────────────────────┤
│  INFORMATIONS PRODUIT                      │
│  ┌──────────────────────┬───────────────┐  │
│  │ SKU (BOUTIQUE)       │ {sku}         │  │
│  ├──────────────────────┼──────────┬────┤  │
│  │ RÉFÉRENCE PRODUIT    │ {ref}    │QTÉ │  │
│  │                      │          │ {n}│  │
│  └──────────────────────┴──────────┴────┘  │
│                                            │
│  N° DE COMMANDE                            │
│  BIB26-XXXXXX                              │
│  ┃┃┃┃ ┃┃ ┃┃┃ ┃┃┃┃ ┃┃ ┃   (Code128)         │
│  BIB26XXXXXX                               │
│                                            │
│  ┌────┐  Suivez votre colis                │
│  │ QR │  via le système                    │
│  └────┘                                    │
└────────────────────────────────────────────┘
```

Variante d'impression :
- **Une étiquette par page A6** (par défaut, imprimante thermique Zebra/Dymo)
- **Planche A4 = 4 étiquettes** (bouton « Planche A4 ») pour imprimante bureautique

## Sources de données (sans API)

| Champ | Source |
|---|---|
| Expéditeur (nom/adresse) | `boutiques.legal_business_name`, `legal_address` |
| Destinataire | `orders.customer_name` + adresse stockée dans `orders.metadata` (déjà saisie au checkout) |
| Pays de livraison | dérivé adresse (fallback `orders.market`) |
| N° commande | `orders.order_number` (format `BIB26-XXXXXX`) |
| SKU / Référence / Qté | jointure `products` → `supplier_products` |
| Date d'expédition | date du jour à l'impression |
| Code-barres | Code128 du `order_number` sans tiret |
| QR code | URL publique de suivi `https://shop.brand-in-a-box.space/tracking?order={order_number}` |

Aucun champ transporteur/tracking_number/poids n'est requis pour l'instant — emplacements réservés mais non affichés tant que `null`.

## Implémentation technique

### Dépendances
- `jsbarcode` (génération Code128 en SVG)
- `qrcode` (génération QR en SVG)

### Nouveau fichier `src/lib/shippingLabel.ts`
Fonctions pures :
- `buildLabelData(order, boutique, productLine)` → normalise les données
- `renderLabelSVG(data)` → renvoie la chaîne HTML/SVG de l'étiquette A6 (CSS print `@page { size: 100mm 150mm; margin: 0 }`)
- `renderA4Sheet(labelsData[])` → 4 étiquettes par planche A4
- `openPrintWindow(html)` → réutilise l'helper existant

### Refacto `src/pages/OpsPortal.tsx`
Remplacer `printShippingLabel` et `printAllShippingLabels` par appels à `renderLabelSVG` / `renderA4Sheet`. Ajout dans l'onglet **Opérations → Gestion expédition** :
- Bouton « Imprimer étiquette » (par commande, A6)
- Bouton « Planche A4 (4 étiquettes) » (sélection multiple)
- Toggle format dans le header de section : **A6 thermique** | **A4 ×4**

Le bouton existant « Imprimer étiquettes » du tableau principal pointera vers le nouveau format.

### Mémoire projet
Ajout d'une entrée `mem://features/shipping-label` documentant le modèle BIB et le hook futur pour l'API transporteur (champs `carrier`, `tracking_number`, `weight_kg`, `parcel_id` à mapper quand l'API sera branchée — emplacements déjà prévus dans le SVG).

## Hors-périmètre (pour plus tard, quand l'API sera branchée)
- Création de l'expédition côté transporteur
- Récupération du PDF officiel transporteur (remplace le SVG BIB)
- Stockage de `tracking_number`, `carrier`, `parcel_id` sur `orders`
- Webhook de mise à jour de statut

Aucun changement de schéma DB nécessaire dans ce lot.
