# BIB Talent — candidature intégrée et réception RH

Date : 2 novembre 2026

## Architecture et périmètre livré côté Platform

- `src/pages/BibTalent.tsx` intègre le formulaire au lieu d'un lien externe Google Forms.
- `src/components/talent/BibTalentApplicationForm.tsx` fournit la saisie bilingue,
  le choix du domaine, le type d'intérêt, les compétences, la motivation, la disponibilité
  et un consentement explicite. Pas d'upload de CV, de pièces KYC ni de données bancaires.
- `submit-talent-application` traite les réponses anonymes publiquement, mais
  vérifie origine, taille, types, champ anti-bot, quota par empreinte de réseau
  quotidienne et unicité d'une candidature par email/pôle/jour.
  Une vérification CAPTCHA de niveau production reste nécessaire en cas d'abus.
- La table `bib_talent_applications` est privée (RLS active, aucun droit direct anon/auth).
  Le pôle d'intérêt est préclassé, mais le propriétaire du dossier reste RH / Talent.
- Une purge quotidienne des dossiers Platform arrivant à leur date de rétention est configurée
  via `cron.job` `bib_talent_daily_retention_purge`. Le vivier facultatif de futures opportunités nécessite une case distincte et peut être conservé jusqu'à deux ans, sans prolonger rétroactivement les candidatures historiques.
- `intranet-talent-export` est un export dédié, paginé et inaccessible sans
  `BIB_TALENT_BRIDGE_SECRET`. Ce secret doit être présent **uniquement**
  comme secret serveur sur Platform et sur l'intranet, distinct du bridge général.
- L'export général `intranet-export` n'inclut aucun dossier de candidature :
  une équipe Marketplace qui synchronise ses données ne doit pas accéder
  automatiquement aux coordonnées des candidats.

## Route RH prévue dans BIB Intranet

Projet Intranet existant : `577f0500-7de0-47ed-baf6-dfd8dd873217`.
Module RH existant : `/pole/rh/recruitment`, table `hr_candidates`,
gestion réservée à RH/Direction via `can_access_rh_profiles(auth.uid())`.

La réception doit utiliser une nouvelle action serveur `pull_talent` :
1. Refuser toute requête d'un utilisateur non RH/Direction avant un appel au bridge.
2. Appeler `intranet-talent-export` avec l'en-tête
   `x-bib-talent-bridge-key`; gérer `next_offset` jusqu'à `complete=true`.
3. Importer de manière idempotente selon `platform_application_id`, conserver
   l'ID source, la date de consentement, le pôle souhaité et `retention_until`.
4. Créer ou rapprocher l'objet `hr_candidates` uniquement après confirmation
   d'absence de collision de courriel / source. L'origine est `bib_talent`,
   le statut initial est `new`.
5. Donner à la coordination RH la vue d'ensemble et la capacité de réaffecter
   le pôle. Le pôle métier n'accède qu'aux dossiers explicitement transmis par
   RH et via une autorisation contrôlée côté serveur.
6. Aucune invitation intranet, contrat, email ou accès métier ne doit être
   attribué automatiquement. Le suivi, le rejet et les demandes d'effacement
   doivent rester dans le workflow RH.
7. Propager les suppressions et purges aux copies locales Intranet afin de ne
   pas prolonger la conservation au-delà du consentement.

### Statut et blocages

Les fichiers et la table Platform ont été créés, mais les fonctions Edge
`submit-talent-application` et `intranet-talent-export` ne sont pas
confirmées déployées. Le secret dédié n'est pas confirmé configuré.

La tentative de modification directe du projet Intranet via Lovable a été
refusée car l'espace de travail ne dispose plus de crédits. **Le module RH
récepteur et le `pull_talent` ne sont donc pas implémentés dans l'intranet.**
Ne pas annoncer un routage automatique opérationnel à des candidats ou
à l'équipe RH tant que l'ensemble de la chaîne n'est pas testé.

La publication de la page BIB Talent sur un autre projet/domaine doit être
vérifiée ; une mise à jour de `bib_platform` ne met pas nécessairement à
jour une page publiée depuis un projet différent.

## Vérification de recette

- Anonyme : soumission valide / invalide / doublon / quota et honeypot.
- Candidat : confirmation sans fausse promesse de poste.
- Anonyme ou marchand connecté : aucune lecture directe de la table Talent.
- Bridge générique : aucun dossier Talent exporté.
- Bridge Talent sans ou avec mauvais secret : réponse 403.
- RH authentifié : import idempotent, lecture des détails de son dossier et suivi.
- Autre pôle : aucun accès à la liste RH sans transfert approuvé.
- Purge : échéance et propagation vers intranet vérifiées.
- Contrats et statuts de collaboration : contrôles RH avant toute création de compte.


## Évolution Carrières — 5 novembre 2026 (GitHub `main`)

- Les quatre offres sont publiées dans `/carrieres` avec des cartes synthétiques (intitulé, profil, durée et boutons). Le pôle de rattachement et les missions sont visibles en ouvrant la fiche complète, sans afficher de responsable nominatif ou fonctionnel.
- Depuis `/carrieres` et `/carrieres/offres/:code`, « Postuler » ouvre une fenêtre modale accessible avec formulaire complet, offre préselectionnée et fermeture explicite. Les anciennes URL `?stage=CODE#postuler` ouvrent aussi la modale, sans défilement forcé vers le formulaire.
- Le candidat peut joindre un **CV PDF ou DOCX jusqu'à 4 Mio**, transmettre un **lien LinkedIn** ou un autre lien CV/portfolio. Aucun CV n'est publié dans le répertoire public.
- Le formulaire transmet un `multipart/form-data` à `submit-talent-application`. La fonction contrôle l'origine, la taille, l'extension et la signature de fichier, le consentement, le quota et le lien LinkedIn. Les CV sont téléversés via le service role dans le bucket privé `bib-talent-cvs` ; la référence privée `cv_storage_path` et `linkedin_url` sont rattachées à `bib_talent_applications`.
- `intranet-talent-export` expose les nouvelles métadonnées uniquement au bridge RH muni du secret. `intranet-talent-cv` fournit le fichier uniquement au serveur RH autorisé, par `POST` avec `application_id` et le secret `BIB_TALENT_BRIDGE_SECRET`. Le secret ne doit **jamais** se trouver dans le navigateur.
- Le lien « Informations sur la conservation » cible `/talent/confidentialite#conservation-candidatures` et déclenche le défilement vers la bonne section sur chargement SPA.
- Migration requise : `supabase/migrations/20261105174500_talent_private_cv_storage.sql` (colonnes, bucket privé, RLS restrictive, queue de purge). La suppression d'une candidature inscrit sa pièce jointe dans `bib_talent_cv_cleanup_queue`, puis `talent-cv-cleanup` purge l'objet via l'API Storage, uniquement lorsqu'un ordonnanceur autorisé l'appelle.

**Statut de déploiement :** les changements ci-dessus sont des modifications source dans GitHub. L'application effective de la migration, le déploiement des fonctions Supabase, la configuration du secret bridge, le déclenchement régulier de `talent-cv-cleanup`, la synchronisation Intrabib RH et le fonctionnement réel du dépôt/téléchargement CV **n'ont pas été confirmés** dans cet environnement. Un parcours utilisateur complet et les contrôles d'accès doivent être testés avant communication publique.

**Recette à effectuer :** ouvrir/fermer les modales depuis chaque entrée, vérifier les quatre codes de stage, soumettre PDF valide, DOCX valide, CV absent + LinkedIn, rejeter fichiers invalides/surdimensionnés et liens non LinkedIn, vérifier le bucket non public, l'export RH, le téléchargement réservé au bridge, le lien-ancre de conservation et la purge effective des CV expirés.
