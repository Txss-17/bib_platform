# BIB — Contrôle complémentaire des documents juridiques avant affichage

Ce lot implémente une validation défensive côté client de `get_store_legal_bundle`. Il ne publie aucun modèle juridique et ne modifie pas les acceptations existantes.

## Contrôles ajoutés
- Le dossier documentaire doit correspondre à la boutique sollicitée et exposer un identifiant d'entité et une révision d'identité.
- Trois documents distincts attendus : JUR-B01 (CGV), JUR-B02 (CGU), JUR-B03 (mentions légales). Pas de duplicata, de modèle inconnu, de version ou de hash manquant.
- Les champs minimum d'identité juridique du vendeur, du médiateur, de la TVA et de l'hébergeur sont présents ; les espaces ou marqueurs de rédaction visibles sont rejetés.
- Les textes des documents ne doivent pas être vides ou contenir de jetons `{{...}}` non résolus.
- Échecs : l'interface échoue explicitement sans présenter un ensemble juridique incomplet comme prêt à accepter.

## Frontières de sécurité
La vérification est une **défense secondaire**. Le stockage des versions publiées, la validation par les équipes Juridique et Direction, les signatures et les empreintes des textes acceptés sont régis par la migration SQL `0025_store_legal_governance_and_order_evidence.sql`. Ce code ne vérifie ni l'identité au RNE, ni la validité réelle d'un médiateur, ni une signature cryptographique du hash.

## État documentaire
- Nouveau pack juridique de travail : https://docs.google.com/document/d/13kPmah29s2ddnmgK6dyXDN8jk5uEZJ6wRoQelMCvGMI/edit
- Audit de correspondance : https://docs.google.com/document/d/18DUJFIyjBTEFV-nJt-SKuO5aeola04_OHoEbHkCV-xQ/edit
- Les versions d'acceptation marchandes `2026-09` sont conservées ; aucune publication automatique des nouveaux brouillons.

Ne pas déployer sans vérification CI, revue juridique de tous les modèles et tests du chemin d'achat réel.
