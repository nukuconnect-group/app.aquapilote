# Refonte Inscription & Système d'Abonnement SaaS

## 1. Correctifs UI page Auth (mobile)

- **Page Inscription mobile** : utiliser la même image de fond (poissons) que la page Connexion, sur toute la surface (pas seulement une bande en haut). Supprimer les bordures/ombres noires sur les côtés — fond entièrement blanc/transparent cohérent avec Connexion.
- **Partage des pages** : rendre `/auth` (connexion) et `/auth?mode=register` (inscription) accessibles via URL directe pour permettre le partage de liens.

## 2. Suppression activation manuelle

- Retirer l'obligation d'activation par l'admin.
- Modifier le trigger `handle_new_user` : `is_activated = true` par défaut.
- Retirer le blocage `is_activated` dans `AuthContext` (login autorisé immédiatement).
- Le composant `PendingActivations` reste disponible en admin mais devient une vue historique (comptes non-vérifiés email).

## 3. Confirmation e-mail Supabase

- Activer `email_confirm` dans Supabase Auth (via config.toml).
- Après inscription : afficher un écran "Un e-mail de confirmation a été envoyé à votre adresse".
- Utiliser les templates auth existants (Lovable Emails déjà configuré via `auth-email-hook`).
- L'utilisateur peut se connecter avant vérification, mais un bandeau non-bloquant l'invite à confirmer.

## 4. Pack Découverte 30 jours automatique

- Étendre le trigger `handle_new_user` : créer automatiquement une ligne dans `subscriptions` :
  - `plan = 'trial_discovery'`
  - `status = 'trial'`
  - `start_date = now()`, `end_date = now() + 30 days`
  - `price = 0`
- Ajouter la valeur `'trial'` au statut si nécessaire.

## 5. Widget Trial sur Dashboard

- Nouveau composant `TrialStatusCard` affiché en haut du Dashboard :
  - Nom du pack actuel
  - Jours restants (compteur)
  - Barre de progression (0→30j)
  - CTA "Passer à un plan payant" quand < 7j
- Hook `useCurrentSubscription()` qui lit la ligne active de `subscriptions`.

## 6. Statuts d'abonnement automatiques

- Étendre la table `subscriptions` (déjà existante) — statuts supportés : `trial`, `active`, `expired`, `suspended`, `cancelled`.
- Cron job quotidien (edge function `subscription-lifecycle`) qui :
  - Passe `trial`/`active` → `expired` quand `end_date < now()`.
  - Suspend le profil (`is_suspended = true`) à l'expiration.

## 7. Notifications & e-mails de rappel

- Edge function `subscription-reminders` (planifiée quotidiennement via pg_cron) :
  - J-7, J-3, J-0 avant `end_date`.
  - Crée une notification in-app + envoie e-mail via `send-notification-email` (Resend déjà configuré).
- Nouveaux kinds : `trial_expiring_7`, `trial_expiring_3`, `trial_expired`.

## 8. Blocage à expiration

- Composant `SubscriptionGuard` (wrap le Dashboard) :
  - Si `status = 'expired'` : afficher écran "Votre essai est terminé" + redirection vers `/subscription`.
  - Données conservées (aucune suppression).
- Modules critiques restent lisibles en lecture seule ; écritures bloquées côté RLS via `user_meets_plan`.

## 9. Page "Abonnements et Tarification"

- Nouvelle route `/subscription` (protégée) rendant `SubscriptionPlans.tsx` (composant déjà présent) modernisée :
  - Cartes de packs (Découverte gratuit, Standard, Premium, Enterprise).
  - Prix mensuel/annuel, features, CTA "Choisir ce plan".
  - Design cohérent avec le thème glassmorphism.

## 10. Admin — gestion des abonnements

Étendre `SubscriptionsPanel.tsx` existant :
- **Modifier** un abonnement (plan, dates, prix).
- **Prolonger l'essai** : bouton "+15j / +30j" sur les lignes `trial`.
- **Activer/Suspendre** : boutons existants conservés.
- **Historique** : nouvelle Tab "Historique" affichant toutes les lignes (y compris expirées/annulées) avec filtres date + utilisateur.

## 11. Migration DB

- Trigger `handle_new_user` mis à jour : `is_activated = true` + insertion abonnement trial 30j.
- Nouvelle fonction `check_subscription_active(user_id)` pour RLS des modules payants.
- Aucune nouvelle table (utilise `subscriptions` existant).

---

## Détails techniques

**Fichiers créés :**
- `src/components/subscription/TrialStatusCard.tsx`
- `src/components/subscription/SubscriptionGuard.tsx`
- `src/hooks/useCurrentSubscription.tsx`
- `src/pages/SubscriptionPage.tsx`
- `supabase/functions/subscription-lifecycle/index.ts`
- `supabase/functions/subscription-reminders/index.ts`

**Fichiers modifiés :**
- `src/components/EnhancedRegistration.tsx` (image fond mobile identique Connexion)
- `src/pages/Auth.tsx` (support `?mode=register` pour partage)
- `src/contexts/AuthContext.tsx` (retirer blocage `is_activated`)
- `src/components/admin/SubscriptionsPanel.tsx` (modifier/prolonger/historique)
- `src/components/admin/PendingActivations.tsx` (adapter en vue historique)
- `src/components/Dashboard.tsx` (intégrer `TrialStatusCard`)
- `src/App.tsx` (route `/subscription`)

**Migrations SQL :**
1. Mettre à jour `handle_new_user()` pour `is_activated = true` + insertion trial.
2. Cron `pg_cron` pour appeler `subscription-lifecycle` et `subscription-reminders` chaque jour à 06:00 UTC.

**Templates e-mail :** utiliser les templates auth Lovable existants pour la vérification e-mail ; les rappels d'expiration passent par `send-notification-email` (Resend).
