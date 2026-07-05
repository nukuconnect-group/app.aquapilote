
## 1. Refonte pages Connexion / Inscription (split-screen responsive)

- Créer `src/pages/AuthLayout.tsx` : layout 2 colonnes (image à gauche, formulaire à droite) inspiré de l'image fournie.
  - Desktop : image plein hauteur à gauche (50%), formulaire à droite (50%) avec scroll interne.
  - Mobile : image en bandeau supérieur (h-40) ou masquée, formulaire plein écran.
  - Onglets « Connexion / Inscription » en haut du panneau droit (pill toggle).
  - Placeholder image (`src/assets/auth-hero.jpg` existant ou dégradé stylisé aquaculture) en attendant votre upload.
- Remplacer `src/pages/Auth.tsx` par ce layout. Les composants `LoginDialog` et `EnhancedRegistration` sont refactorés en formulaires **inline** (pas en Dialog) via nouveaux composants :
  - `src/components/auth/LoginForm.tsx` (extrait de LoginDialog)
  - `src/components/auth/RegisterForm.tsx` (extrait de EnhancedRegistration)
  - `LoginDialog` et `EnhancedRegistration` restent pour usages ailleurs, mais délèguent aux formulaires.
- Conserver : Google OAuth, MFA, parrainage, mot de passe oublié, suggestions de noms régionales, glassmorphism.

## 2. Nouveaux champs d'inscription

Ajouter dans `RegisterForm` (étape « Profil ») :

- **Type d'exploitation** (radio card 3 choix, obligatoire) :
  - `moyenne` — Moyenne exploitation
  - `semi_industriel` — Semi-industriel
  - `industriel` — Industriel
- **Besoin de capteurs IoT** : checkbox unique (défaut : décoché) « J'ai besoin de capteurs pour ma ferme ».

Sauvegarde dans `profiles` via metadata puis synchro à l'activation.

### Migration DB

```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS exploitation_type text
    CHECK (exploitation_type IN ('moyenne','semi_industriel','industriel')),
  ADD COLUMN IF NOT EXISTS needs_sensors boolean NOT NULL DEFAULT false;
```

Mise à jour `handle_new_user()` : lire `exploitation_type` et `needs_sensors` depuis `raw_user_meta_data` et les insérer dans `profiles`.

## 3. Bannière capteurs dans le dashboard

- Nouveau composant `src/components/dashboard/SensorsCTABanner.tsx` : affiche si `profile.needs_sensors === true` ET `dismissed_at` non défini.
  - CTA « Découvrir les capteurs IoT » → route `/dashboard/iot` (ou modal contact).
  - Bouton fermer → stocke `sensors_banner_dismissed_at` (colonne à ajouter).

Migration complémentaire :
```sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS sensors_banner_dismissed_at timestamptz;
```

Injection dans `src/pages/Dashboard.tsx` en haut du contenu.

## 4. AquaFeed IA — Avancé (IC)

Fichier : `src/components/aquafeed/AdvancedAquaFeedCalculator.tsx`.

- **Retirer complètement** la colonne « Formule » et toute mention d'hypothèses ou d'étapes de calcul dans les tableaux et les cartes de résultat. N'afficher que les valeurs finales (label + résultat).
- **Résumé unités** conservé en tête de résultat (déjà présent), reformulé : « Unités utilisées : masse en kg, effectifs en unités, coût en F CFA ».
- **Validations strictes** (déjà partielles) : renforcer messages :
  - Survie : `1 ≤ x ≤ 100` — « Le taux de survie doit être compris entre 1 et 100 %. »
  - Poids initial/final : `> 0` et `initial < final`.
  - IC : `> 0`.
  - Prix aliment : `> 0`.
  - Poids sac : `> 0`.
  Bloquer les résultats + toast si invalide.
- **Sac personnalisable** : ajouter option « Personnalisé » avec input numérique (kg), stocké dans state. Presets : 15, 25, 40, 50 kg.
- **Export PDF pro** : réécrire l'export PDF (jsPDF + jspdf-autotable, déjà dépendances via ExportDropdown) avec :
  - En-tête : logo AquaPilote (asset existant), titre « Rapport AquaFeed IA — Calcul <Mode> », date, utilisateur.
  - Section « Paramètres saisis » (espèce, infra, IC, survie, poids, prix, sac).
  - Section « Résultats » (tableau sans formules).
  - Pied de page paginé.
  - Bouton dédié « Télécharger PDF » à côté de l'ExportDropdown pour rendre l'action visible.

## 5. Tests manuels (documentés en commentaires)

Deux jeux d'exemples ajoutés en commentaires du composant :

- **Tilapia** : objectif 1000 kg, poids final 400 g, alevin 5 g, survie 85 %, IC 1.6, prix 850 F/kg, sac 25 kg.
- **Clarias** : objectif 2000 kg, poids final 800 g, alevin 3 g, survie 75 %, IC 1.2, prix 900 F/kg, sac 50 kg.

Vérifier arrondis (sacs = ceil).

## Fichiers touchés

- Créés : `src/pages/AuthLayout.tsx` (remplace Auth), `src/components/auth/LoginForm.tsx`, `src/components/auth/RegisterForm.tsx`, `src/components/dashboard/SensorsCTABanner.tsx`.
- Édités : `src/pages/Auth.tsx`, `src/components/LoginDialog.tsx`, `src/components/EnhancedRegistration.tsx`, `src/components/aquafeed/AdvancedAquaFeedCalculator.tsx`, `src/pages/Dashboard.tsx`.
- Migration : `profiles.exploitation_type`, `profiles.needs_sensors`, `profiles.sensors_banner_dismissed_at`, MAJ `handle_new_user()`.

## Hors périmètre (à confirmer avant d'aller plus loin)

- Envoi d'un email/notif à l'équipe pour les demandes capteurs.
- Restrictions de features selon `exploitation_type` (aucune pour l'instant, juste stockage).
- Nouvelle image hero réelle (placeholder en attendant votre upload).
