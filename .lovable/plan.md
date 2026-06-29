# Plan d'évolution AquaPilote

Ce plan ajoute 3 nouveaux modules majeurs (AquaFeed AI, AquaHealth AI, Bibliothèque Premium), une base de données aquacole administrable, et étend le dashboard + l'administration. Tout respecte le RBAC existant (`APP_MODULE_PERMISSIONS`, `useTeamMemberAccess`), la charte UI (shadcn + tokens sémantiques) et la structure de routage par `?module=` du Dashboard.

C'est un chantier important. Je propose de le livrer en **4 phases** pour garder chaque étape vérifiable et stable. Vous pourrez valider/itérer après chaque phase.

---

## Phase 1 — Fondations base de données + Admin

### Nouvelles tables Supabase (toutes avec RLS + GRANT)

- `fish_species` — espèces (nom, nom scientifique, image, notes)
- `feeding_rules` — règles de nourrissage administrables
  - espèce, stade (alevin/juvénile/grossissement/géniteur), poids_min_g, poids_max_g, taux_pct_biomasse, nb_repas, température_opt
- `aqua_diseases` — maladies (nom, catégorie bact/parasit/fong/viral, description, causes, facteurs, gravité, taux_mortalité, prévention, images[], documents[])
- `disease_symptoms` — catalogue des symptômes (clé, label, description)
- `disease_symptom_map` — table de liaison maladie ↔ symptôme avec poids (0-1) pour le scoring
- `disease_treatments` — traitements (maladie_id, nom, principe actif, dosage, durée, voie d'administration, mesures eau, isolement bool, suivi)
- `aqua_diagnoses` — historique des diagnostics utilisateur (user_id, unit_id, batch_id, symptômes[], résultats jsonb, créé_le)
- `feed_calculations` — historique des calculs ration (user_id, espèce, nb_poissons, poids_moy, biomasse, ration, nb_repas, ration/repas, projection cycle)
- `premium_library_items` — bibliothèque (titre, catégorie, type [pdf/video/sop/guide/fiche/webinar], fichier_url, thumb, plan_min [free/standard/premium/enterprise], description, tags[])
- `premium_library_views` — statistiques de consultation (item_id, user_id, viewed_at)

### Rôle admin & seed

- Réutilise `has_role(auth.uid(),'admin')` pour toutes les politiques d'écriture.
- Lecture : `authenticated` pour les catalogues (espèces, maladies, symptômes, règles, traitements). Bibliothèque filtrée par plan (fonction SQL `user_plan(uid)` lue depuis `subscriptions`).
- Seed initial : ~12 espèces (Tilapia, Clarias, Carpe, Hétérotis, Capitaine, etc.), règles de base (Tilapia/Clarias par stade), 10 maladies listées avec symptômes/traitements de référence, ~15 symptômes.

### Module Administration étendu

Nouvel onglet "Référentiel aquacole" dans `AdminDashboard` avec sous-onglets CRUD :
- Espèces, Règles de nourrissage, Symptômes, Maladies (+ liaison symptômes), Traitements, Bibliothèque Premium.

---

## Phase 2 — Module AquaFeed AI

- Ajout dans `APP_MODULE_PERMISSIONS` : `{ id: 'aquafeed', label: 'AquaFeed AI', tabIds: ['aquafeed'] }`.
- Route `?module=aquafeed` dans `Dashboard.tsx`, item de navigation (sidebar + mobile menu) sous "Production & Élevage".
- Composant `src/components/aquafeed/AquaFeedAI.tsx` :
  - Formulaire : espèce (select depuis `fish_species`), nb poissons, poids moyen (g), température eau (optionnel), stade auto-détecté depuis poids.
  - Moteur de calcul (utilitaire `src/lib/feedingEngine.ts`) :
    - biomasse = nb × poids_moy
    - taux = lookup `feeding_rules` (espèce + plage poids) → fallback courbe par défaut
    - ration/j = biomasse × taux%
    - nb_repas et ration/repas issus de la règle
    - projection : courbe de croissance simple (modèle exponentiel paramétrable par espèce), prévision poids/biomasse à J+cycle, consommation cumulée
  - Affichage : carte résultat, tableau récapitulatif, graphique Recharts (courbe croissance + cumul aliment), bouton "Enregistrer le calcul" → `feed_calculations`.
  - Onglet "Historique" : liste filtrable, ré-ouverture d'un calcul.
- Bouton "Créer plan de nourrissage" pré-rempli vers `FeedingPlanScheduler`.

---

## Phase 3 — AquaHealth AI + Recommandations

- Sous-module dans `ProphylaxieManagement` : nouvel onglet "AquaHealth AI" (composant `src/components/prophylaxie/AquaHealthAI.tsx`).
- Formulaire : checkboxes générées depuis `disease_symptoms` + champ "Autres", sélection lot/unité optionnelle, paramètres eau si dispo.
- Moteur de diagnostic (`src/lib/diseaseDiagnosis.ts`) :
  - Score par maladie = Σ(poids des symptômes cochés présents dans `disease_symptom_map`) / Σ(poids totaux maladie) ; bonus si paramètres eau hors seuils correspondants.
  - Sortie classée : top 3 maladies probables, niveau de risque (faible/moyen/élevé/critique), causes, facteurs.
- Panneau "Recommandations" généré depuis `disease_treatments` lié à la maladie n°1 :
  - actions urgentes, isolement, paramètres eau à vérifier, traitement + dosage + durée, suivi post-traitement, mesures préventives.
- Enregistrement automatique dans `aqua_diagnoses` (historique consultable).
- Bouton "Créer une intervention sanitaire" pré-remplit le formulaire existant `health_records`.
- Architecture évolutive : interface `DiagnosisProvider` (impl. locale `RuleBasedProvider`, futur `AIProvider` via edge function) — un seul point à brancher plus tard pour ajouter Mistral/Lovable AI.

---

## Phase 4 — Bibliothèque Premium + Dashboard + Polish

### Bibliothèque Premium
- Module `library` dans `APP_MODULE_PERMISSIONS`, route `?module=library`.
- Composant `src/components/library/PremiumLibrary.tsx` : grille de cartes par catégorie, filtres (type, tag, recherche), preview PDF/vidéo, téléchargement sécurisé via URL signée (bucket privé `premium-library` créé via `storage_create_bucket`).
- Garde d'accès : compare `plan_min` de l'item au plan utilisateur (`subscriptions`) ; sinon CTA "Passer au plan supérieur".
- Tracking : insert dans `premium_library_views` à l'ouverture.
- Admin upload via CRUD Phase 1 (drag & drop fichier + thumbnail).

### Dashboard
Ajouts dans `ModernDashboard` (cartes en bas, masquées si modules non autorisés) :
- Nb diagnostics (30j), top 3 maladies détectées, consommation aliment estimée (somme `feed_calculations`), biomasse totale (sum livestock), croissance moyenne (delta poids vs J-30), nb documents Premium consultés.

### Responsive & cohérence
- Toutes les nouvelles pages : grilles `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`, tableaux dans `ResponsiveTable`, dialogues plein-écran sur mobile.
- Utilisation systématique des tokens sémantiques (pas de `bg-white`, `text-black`).
- i18n : ajout des clés dans `src/i18n/locales/fr/navigation.ts` + en + autres langues (libellés modules + dashboard).

---

## Détails techniques

- **Migrations** : une migration par phase (4 migrations), chacune avec `CREATE TABLE` + `GRANT SELECT,INSERT,UPDATE,DELETE TO authenticated`, `GRANT ALL TO service_role`, `ENABLE RLS`, policies (lecture authenticated, écriture admin via `has_role`).
- **RBAC** : 3 nouveaux IDs de module dans `moduleAccess.ts` (`aquafeed`, `aquahealth` virtuel rattaché à `health`, `library`). `aquahealth` reste sous l'onglet `health` donc pas de nouvelle permission séparée — accessible à quiconque a `health`.
- **Edge functions** : aucune nouvelle requise en Phase 1-4 ; la Phase 3 prépare l'interface pour brancher une edge function `aqua-health-ai` (Lovable AI) en option future, sans bloquer la livraison.
- **Storage** : nouveau bucket privé `premium-library` (Phase 4), bucket public `disease-images` pour les visuels maladies (Phase 1).
- **Sécurité** : aucun secret exposé côté client. Toutes les écritures admin protégées par `has_role(auth.uid(),'admin')`. URLs signées 5 min pour les téléchargements Premium.

---

## Livraison proposée

Je commence par la **Phase 1** (migrations + admin CRUD + seed) dès votre validation. Si vous préférez un ordre différent (ex : démarrer par AquaFeed AI), dites-le moi.

Voulez-vous que je lance la Phase 1 maintenant ?
