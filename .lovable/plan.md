## 1. Nouveau logo Aquapilote partout

- Copier `user-uploads://LOGO_AQUAPILOTE_REVU.png` vers :
  - `public/favicon.png` (remplace l'actuel)
  - `public/aquapilote-logo.png`
  - `src/assets/aqua-pilot-logo-main.png` et `src/assets/aqua-pilot-logo.png` (remplace les anciens, mêmes noms = aucun import à modifier)
- Supprimer `public/favicon.ico` pour qu'il ne prenne pas la priorité
- Mettre à jour `index.html` (favicon + meta og:image)
- Mettre à jour `public/manifest.json` (icons)
- Retirer toute référence textuelle "Lovable" :
  - `index.html` (titre, meta), `vite.config.ts` (componentTagger), `README.md`, `capacitor.config.ts`
  - Edge functions : `aqua-assistant`, `create-team-member-account`, `reset-team-member-password` (commentaires/labels uniquement, ne pas toucher `LOVABLE_API_KEY` qui est le nom de variable obligatoire)
  - `src/lib/domainGuard.ts` (whitelist domaines lovable conservée techniquement mais commentaire générique)

## 2. Module Vente — Facture ET Reçu indépendants

Dans `SalesManagement.tsx` :
- Remplacer le sélecteur actuel par **deux boutons d'action distincts** en haut de la page :
  - "Créer un reçu" (REC-) → marqué PAYÉ, avec signature
  - "Créer une facture" (FAC-) → sans mention PAYÉ, sans signature, avec champ TVA + échéance, cachet optionnel
- Le choix verrouille `document_type` dans le formulaire (au lieu d'un toggle modifiable)
- Adapter `ReceiptPreview.tsx` : si `document_type === 'invoice'` → ne pas afficher PAYÉ ni signature, afficher cachet si présent ; si `receipt` → comportement actuel

## 3. Module Cheptel — Géniteurs

Dans `src/components/LivestockManagement.tsx` (formulaire de création de lot) :
- Si `type === 'geniteurs'` :
  - Afficher champs : `male_count`, `male_weight_kg`, `female_count`, `female_weight_kg`
  - Calcul auto : `total_weight = male_weight_kg + female_weight_kg`, `quantity = male_count + female_count`, `average_weight = total_weight / quantity`
  - Remplacer le libellé "Taux de survie" par "Taux de participation" (réutilise la colonne existante `expected_survival_rate`, libellé UI uniquement)
- Migration : ajouter colonnes `male_weight` et `female_weight` (numeric) à `livestock_batches`

## 4. Module Alimentation — Stock kg + sacs

Dans `FeedStockManager.tsx` :
- Ajouter champs au formulaire : `bag_count` (nombre de sacs), `kg_per_bag` (kg par sac)
- Calcul auto : `quantity (kg) = bag_count × kg_per_bag`
- Garder `cost` comme prix total ; afficher prix/kg calculé
- Corriger l'erreur actuelle de création (vérifier validation, champs requis, payload envoyé à `feed_stocks`)
- Permettre la création répétée (reset propre du formulaire après succès, ne pas fermer le dialog tant que l'utilisateur ne le ferme pas explicitement, ou bouton "Enregistrer et nouveau")
- Migration : ajouter `bag_count` et `kg_per_bag` (numeric, nullable) à `feed_stocks`

## 5. Module Équipe — Création directe

Dans `TeamMemberCard.tsx`, `TeamMemberList.tsx`, `MemberDetailsDialog.tsx` :
- Supprimer tout bouton/section "Créer le compte" qui apparaît après ajout d'un membre
- Le compte est déjà créé via l'edge function `create-team-member-account` lors de l'ajout → forcer `status = 'active'` et `account_created = true` dès l'insertion
- Nettoyer les flags conditionnels qui ré-affichent l'étape

## Migrations DB (un seul fichier)

```sql
ALTER TABLE livestock_batches 
  ADD COLUMN IF NOT EXISTS male_weight numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS female_weight numeric DEFAULT 0;

ALTER TABLE feed_stocks
  ADD COLUMN IF NOT EXISTS bag_count numeric,
  ADD COLUMN IF NOT EXISTS kg_per_bag numeric;
```

## Fichiers touchés

- `index.html`, `public/manifest.json`, `public/favicon.png` (remplacé), `src/assets/aqua-pilot-logo-main.png` (remplacé), `vite.config.ts`, `README.md`, `capacitor.config.ts`
- `src/components/SalesManagement.tsx`, `src/components/economics/ReceiptPreview.tsx`
- `src/components/LivestockManagement.tsx`
- `src/components/feeding/FeedStockManager.tsx`, `src/hooks/useFeedStocks.tsx`
- `src/components/team/TeamMemberCard.tsx`, `src/components/team/TeamMemberList.tsx`, `src/components/team/MemberDetailsDialog.tsx`
- Edge functions : nettoyage commentaires "Lovable" uniquement

Confirmer pour lancer l'implémentation + la migration.