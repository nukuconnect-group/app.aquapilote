# Plan d'implémentation

## 1. Authentification — Retrait Google
- Supprimer le bouton "Continuer avec Google" et la logique OAuth dans `LoginDialog.tsx` et `EnhancedRegistration.tsx`.
- Nettoyer la gestion du callback OAuth dans `pages/Auth.tsx`.
- Conserver email/password + MFA.

## 2. Module Ventes — Factures vs Reçus
- Dans `SalesManagement.tsx`, ajouter au moment de la création une **sélection claire** : 
  - Type de document : **Reçu** (REC-) ou **Facture** (FAC-)
- Champs supplémentaires affichés uniquement si "Facture" :
  - **Date d'échéance** (date picker)
  - **Taux de TVA** : sélecteur 0% / 10% / 20% (+ personnalisé)
- **Anti-doublon numéro** : avant insertion, requête Supabase `sales` pour vérifier que le `invoice_number` n'existe pas; si oui, incrémenter automatiquement (`FAC-2026-0001` → `FAC-2026-0002`).
- **Génération auto** du prochain numéro basée sur le max existant par préfixe + année.

## 3. Export PDF Factures/Reçus
- Ajouter bouton "Télécharger PDF" dans :
  - La liste `SalesManagement.tsx` (à côté de "Voir Reçu"/"Facture")
  - La prévisualisation `ReceiptPreview.tsx`
- Réutiliser `salesDocumentUtils.ts` (déjà présent) avec `html2canvas` + `jsPDF` pour rendre le DOM de la preview en PDF.

## 4. AquaAssistant — Brancher Lovable AI
- L'edge function `aqua-assistant/index.ts` utilise déjà `LOVABLE_API_KEY` et `google/gemini-2.5-flash` ✅
- Renforcer le **system prompt** pour spécialisation aquaculture + mention que le modèle pourra être affiné/entrainé plus tard via contexte additionnel.
- S'assurer que `AquaAssistant.tsx` appelle bien cette edge function et stream les réponses.
- Pas de changement de modèle pour l'instant (Gemini Flash via Lovable AI).

## 5. Module Équipe — Création compte simplifiée
- Dans `AddMemberDialog.tsx` + `SummaryDialog.tsx` : supprimer l'étape "Créer le compte" qui réapparait alors que le compte est déjà créé via l'edge function `create-team-member-account`.
- Flux corrigé : remplir infos → assigner unités/permissions → **un seul clic "Créer membre"** qui :
  1. Crée le compte auth (edge function)
  2. Insère dans `team_members` + `team_member_units`
  3. Affiche les identifiants une seule fois
- Plus de double validation ni de dialogue résumé séparé exigeant re-confirmation.

## 6. Sécurité Supabase Storage (cachet/signature)
- **Problème actuel** : bucket `company-logos` est **public** → cachet/signature accessibles à n'importe qui avec l'URL.
- **Solution** : Migration pour ajouter des policies storage strictes :
  - Les fichiers `stamps/{user_id}/*` et `signatures/{user_id}/*` ne sont lisibles QUE par leur propriétaire ou ses membres d'équipe.
  - Convertir le bucket en **privé** OU créer un nouveau bucket privé `company-documents`.
  - Utiliser `createSignedUrl()` pour l'affichage dans `ReceiptPreview.tsx`.
- Garder `company-logos` public uniquement pour le logo affiché publiquement (factures envoyées).

## Fichiers touchés (estimation)
- `src/components/LoginDialog.tsx`, `EnhancedRegistration.tsx`, `pages/Auth.tsx`
- `src/components/SalesManagement.tsx`, `economics/ReceiptPreview.tsx`
- `src/lib/salesDocumentUtils.ts` (export PDF)
- `src/components/team/AddMemberDialog.tsx`, `SummaryDialog.tsx`, `TeamManagement.tsx`
- `src/components/SettingsManagement.tsx` (upload cachet vers bucket privé)
- `supabase/functions/aqua-assistant/index.ts` (prompt aquaculture renforcé)
- Nouvelle migration : bucket privé + policies storage

## Questions avant de démarrer
1. Pour le bucket cachet/signature : préfères-tu un **nouveau bucket privé** `company-documents` (recommandé, plus propre) ou **convertir `company-logos`** en privé (risque casser les logos existants déjà publiés sur factures) ?
2. Pour le taux de TVA : les choix **0% / 10% / 20%** suffisent, ou veux-tu un champ libre numérique en plus ?
3. Pour AquaAssistant : OK pour garder **Gemini 2.5 Flash** (rapide, multilingue) comme modèle par défaut, sachant que tu pourras ajuster le system prompt plus tard pour "l'entraîner" sur ton contexte ?