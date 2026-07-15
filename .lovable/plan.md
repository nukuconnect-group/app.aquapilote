
# Plan des corrections et améliorations

Voici le plan pour les 4 axes demandés. Je propose de traiter dans cet ordre car il y a des dépendances (les infos entreprise doivent être sauvegardées avant d'être utilisables dans PDF).

## 1. Module Comptabilité — ligne de chiffres avant les graphiques

Dans `AccountingDashboard.tsx`, ajouter une rangée de KPI cards en haut (avant les graphiques) affichant :
- Chiffre d'affaires total
- Total dépenses
- Bénéfice net
- Marge (%)
- Trésorerie courante

Format horizontal, responsive (grid 2 cols mobile → 5 cols desktop), avec icônes et variations vs mois précédent.

## 2. Paramètres Entreprise — persistance complète

**Problème :** les infos entreprise ne persistent pas correctement.

**Actions :**
- Étendre la table `profiles` (ou créer `company_settings`) avec tous les champs manquants : `logo_url`, `stamp_url`, `signature_url`, `cif_nif`, `rccm`, `website`, `legal_representative` (les champs `company_name`, `company_address`, `phone`, `email` existent déjà sur `profiles`).
- Créer un hook `useCompanyInfo()` qui charge/sauvegarde ces infos depuis Supabase (plus de localStorage seul).
- Refondre l'onglet Entreprise dans `SettingsManagement.tsx` : upload logo/cachet/signature vers bucket `company-logos` + affichage aperçu.
- Mettre à jour `companyHeaderUtils.ts` pour inclure cachet + signature dans les PDF.
- Brancher `useCompanyInfo` sur tous les générateurs de documents : rapports (`reportExportUtils.ts`), factures/reçus (`salesDocumentUtils.ts`), payslips (`payslipGenerator.ts`), fiches de pêche (`controlFishingPdf.ts`), exports alimentation (`feedingPrintUtils.ts`), etc.

## 3. Mobile — défilement complet sur toutes les pages

**Problème :** contenu coupé en bas sur mobile (hauteurs fixes / overflow-hidden mal placés).

**Actions :**
- Auditer `MainLayout.tsx` et corriger les containers avec `h-screen` / `overflow-hidden` non compensés par `pb-safe`.
- Ajouter un padding-bottom systémique (`pb-24 md:pb-8`) sur les conteneurs de module pour tenir compte de la barre de navigation mobile fixe.
- Vérifier `MobileNavigation.tsx` : hauteur réservée dans le layout via `env(safe-area-inset-bottom)`.
- Passer en revue les modules signalés : Comptabilité, RH, Alimentation, Rapports, Ventes, Achats — s'assurer que chaque page racine utilise `min-h-screen` + scroll natif et pas de `overflow-hidden` global.

## 4. Module Alimentation — Fiches d'alimentation

Nouvelle sous-section "Fiches d'alimentation" dans `FeedingManagement.tsx` :

**Modèle de données** (nouvelle table `feeding_sheets`) :
- `unit_id`, `infrastructure_id`, `title`, `period` (matin/midi/soir), `time`, `feed_type`, `quantity`, `unit`, `responsible_name`, `notes`, `frequency` (daily/weekly/monthly), `days[]`, `is_active`, `start_date`, `end_date`

**UI :**
- Liste des fiches par infrastructure avec filtres
- Formulaire de création/édition
- Génération auto de programme journalier/hebdo/mensuel (vue calendrier ou tableau)
- Bouton Imprimer / Export PDF (via `feedingPrintUtils.ts` étendu)
- Bouton Partager (WhatsApp/Email lien)
- Validation d'une distribution → crée un `feeding_record` lié à la fiche
- Historique des distributions par fiche
- Design mobile-first

**RLS :** policies user-scoped standard + accès team_members via `team_member_has_unit_access`.

## Détails techniques

- Une seule migration pour : extension `profiles` (colonnes manquantes) + nouvelle table `feeding_sheets` + GRANTs + RLS.
- Hook réutilisable `useCompanyInfo()` avec cache React Query pour éviter refetch.
- Uploads (logo/cachet/signature) vers bucket `company-logos` (public existant).
- PDFs : refactor de `generateCompanyHeaderHTML` pour accepter cachet + signature en pied de page.

## Ordre d'implémentation

1. Migration DB (profils étendus + `feeding_sheets`)
2. Hook `useCompanyInfo` + refonte onglet Entreprise
3. Branchement infos entreprise dans tous les générateurs PDF
4. KPI cards Comptabilité
5. Fix scroll mobile global
6. Module Fiches d'alimentation (UI + génération + PDF + partage)

## Confirmation

C'est un chantier substantiel (~15-20 fichiers modifiés/créés). Confirmez-vous ce plan, ou souhaitez-vous que je priorise un axe en particulier d'abord (ex: Paramètres Entreprise seul, ou Alimentation seul) ?
