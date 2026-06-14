## Plan d'exécution (par lots, validable étape par étape)

### Lot 1 — Inscription en page unique + workflow d'activation admin
- Refondre `EnhancedRegistration` en **page unique** style image fournie : fond dégradé bleu→magenta animé, carte blanche centrée, champs avec icônes (Nom, Prénom, Email, Téléphone, Pays, Nom ferme, Adresse ferme, Cheptel) + section « Type d'élevage » avec cases à cocher utilisant les types existants : **Écloserie, Algoculture, Aquaculture marine, Pisciculture, Commercialisation/Conservation, Aquaculture d'eau douce**.
- Ajout colonne `is_activated boolean default false` sur `profiles` via migration (les comptes existants sont marqués `true` pour ne pas casser).
- Après inscription : toast « Compte créé, en attente d'activation par un administrateur ».
- Blocage de connexion tant que `is_activated = false` (sauf comptes existants déjà migrés à `true`).
- Notification créée pour les admins à chaque nouvelle inscription.
- **Module Admin Dashboard** : nouvelle section « Comptes en attente d'activation » listant les profils non activés avec bouton **Activer** qui passe `is_activated=true` et envoie une notification à l'utilisateur (« Votre compte est activé »).

### Lot 2 — Dashboard : KPIs + en-tête + finance + IA + indicateurs
- **Header dashboard** : déplacer le `Select` d'unité dans la barre de titre « Centre de pilotage » à côté du sélecteur de période (alignés horizontalement).
- Retirer le `Select` de la carte « Fermes ».
- Sur les 3 cartes (Bassins actifs, Production, Alertes) : intégrer des sous-stats compactes et bien alignées :
  - Bassins actifs → biomasse totale + effectifs
  - Production → taux de survie + production estimée
  - Alertes → aliment restant + alertes critiques
- Rendre la section **Détails financiers** entièrement responsive (grid 1/2/4 cols).
- **Recommandations IA** : affichage en miniatures (cartes compactes scrollables).
- Remplacer le bloc « indicateurs circulaires » par d'autres graphiques (ex. courbes empilées ou camemberts comparatifs).

### Lot 3 — Sécurité données par rôles (RLS / API)
- Forcer dans les hooks `useProductionCycles`, `useUnitEquipment`, `useUnitInfrastructures`, `useDepreciableAssets` un filtrage côté requête basé sur les `assignedUnits` du membre (déjà géré côté UI) — appliquer `.in('unit_id', allowedUnitIds)` systématiquement.
- Vérifier policies RLS existantes; ajouter une policy `team_member_has_unit_access` là où elle manque.

### Lot 4 — Module Alimentation : Stock pro
- Refondre `FeedStockManager` en interface de gestion de stock avancée : tableau avec colonnes (Produit, SKU, Type, Quantité, Unité, Seuil min, Valeur unitaire, Valeur totale, Fournisseur, Date péremption, État), filtres, recherche, badges d'alerte, mouvements (entrée/sortie), export.

### Lot 5 — Cheptel & Pêche de contrôle
- **Cheptel/Lots** : ajouter bouton **Visualiser** par lot ouvrant un dialog détaillé (effectifs, biomasse, historique santé/alimentation/mortalité).
- **Pêche de contrôle** : ajouter bouton **Visualiser** par pêche ouvrant le détail.
- **PDF** : améliorer la mise en page des PDF générés (en-tête logo + nom ferme, mise en page tableau pro, pagination, footer signature AquaPilote).

### Lot 6 — Ventes : logo & marque sur reçus/factures
- Corriger `salesDocumentUtils` pour **forcer** le chargement du logo défini dans Paramètres (company-logos bucket) dans l'en-tête PDF.
- Retirer l'affichage de l'URL/lien de l'app dans le footer des documents.
- Ajouter un sceau/badge « Généré par AquaPilote » (icône + texte) en footer.

### Lot 7 — Vérification module Équipe
- Vérifier `useTeamMemberAccess` + `Dashboard.tsx` : confirmer que les `dashboard_roles` filtrent réellement les onglets visibles. Corriger si manquant.

---

### Détails techniques
- Migration : `ALTER TABLE profiles ADD COLUMN is_activated boolean DEFAULT true NOT NULL; UPDATE profiles SET is_activated = true;` (les nouveaux comptes via trigger `handle_new_user` seront créés avec `false`).
- Modifier `handle_new_user()` pour insérer `is_activated = false` + créer une notification pour chaque admin.
- AuthContext : après login, si `!is_activated` → déconnecter et afficher message.
- Composant `PendingActivations` dans `AdminDashboard`.

### Ordre proposé
Je propose d'attaquer **Lot 1 + Lot 7** d'abord (les plus critiques fonctionnellement), puis 2, 4, 5, 6, 3.

**Confirmez-vous ce plan et l'ordre ? Ou souhaitez-vous prioriser différemment / tout faire d'un coup ?**
