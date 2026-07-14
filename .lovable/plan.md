## Plan de refonte (7 lots, dans l'ordre validé)

Chaque lot est livré et vérifié avant de passer au suivant. Je vous montre le résultat, vous validez, on enchaîne.

---

### Lot 1 — Admin : statistiques abonnés + gestion utilisateurs avancée
- Nouvelle carte "Statistiques d'accès" dans l'admin :
  - Nombre total d'utilisateurs, actifs 7j / 30j, connectés aujourd'hui (via `user_sessions`)
  - Répartition par plan d'abonnement (trial / basic / pro / enterprise)
  - Graphique des inscriptions sur 30 jours
- Refonte du sous-module "Utilisateurs" :
  - Vue tableau responsive avec recherche + filtres (plan, statut, activé)
  - Actions par ligne : voir profil, gérer unités (activer/désactiver, assigner à membres d'équipe), renvoyer email d'activation, envoyer lien de réinitialisation mot de passe, régénérer mot de passe temporaire, suspendre/réactiver
  - Nouvelle edge function `admin-reset-user-password` (envoie lien Supabase `resetPasswordForEmail`)
  - Nouvelle edge function `admin-regenerate-password` (génère un mot de passe temp + envoie par email)

### Lot 2 — Comptabilité : graphiques pro d'abord
- Réorganisation de `AccountingDashboard` : bandeau graphiques en tête (courbe CA/dépenses/marge sur 12 mois, camembert répartition dépenses, barres cash-flow mensuel, ratio de rentabilité), puis KPIs chiffrés, puis tableaux
- Style "cabinet comptable" : palette sobre, légendes claires, tooltips détaillés

### Lot 3 — Responsive : cartes d'unités
- Correction du débordement des noms d'unités sur mobile (`ProductionUnitsManagement` + `InfrastructureCard`) : `truncate`, `min-w-0`, grilles adaptatives, badges qui passent à la ligne

### Lot 4 — Support client temps réel
- Activation de Realtime sur `support_messages` et `support_tickets`
- Souscription live dans `SupportModule` et côté admin : nouveaux messages/tickets apparaissent instantanément, indicateur "en train d'écrire" simple, badge non-lus qui se met à jour
- Notification toast à l'admin sur nouveau ticket

### Lot 5 — RH : contrats de travail avancés
- Nouvelle table `employment_contracts` (type CDI/CDD/stage/prestation, dates, salaire, période d'essai, clauses, statut, signature)
- CRUD dans `HRManagement` avec formulaire multi-étapes
- Génération PDF du contrat (mise en page pro, en-tête entreprise, articles)
- Historique des contrats par employé, alertes fin de CDD

### Lot 6 — Module hors-ligne : installer PWA
- Bouton "Installer l'application" bien visible dans `OfflineDataManager`
- Instructions par plateforme (Android/iOS/Desktop) quand `beforeinstallprompt` n'est pas dispo
- Statut : "Installée" / "Non installée" détecté via `display-mode: standalone`

### Lot 7 — Rapports auto : PDF professionnels
- Refonte du générateur (`reportExportUtils` + `UnitReportGenerator`) avec jsPDF + autotable :
  - Page de couverture (logo entreprise, période, unité)
  - Sommaire cliquable
  - Sections : synthèse exécutive, indicateurs clés, graphiques (via html2canvas), tableaux détaillés, annexes
  - En-tête/pied de page sur chaque page (n° page, date, entreprise)
  - Signature et cachet en fin
- 6 types de rapports : mensuel, cycle production, financier, cheptel, alimentation, sanitaire

---

### Détails techniques

- Chaque edge function admin vérifie `has_role(auth.uid(), 'admin')` avant exécution
- Realtime : `ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages, public.support_tickets` + politiques RLS déjà en place
- Contrats : RLS `user_id = auth.uid()` + accès team members via `is_team_member_of`
- PDF : réutilise `companyHeaderUtils` existant pour la charte

---

**Question rapide avant de démarrer le Lot 1 :** je démarre maintenant sur le Lot 1 (Admin) ? Ou vous préférez que je regroupe Lot 3 (responsive unités — rapide, ~15 min) avec le Lot 1 pour livrer les deux ensemble ?