# Refonte Centre de pilotage et mortalité Cheptel

## Centre de pilotage
- Remplacer l’en-tête actuel par un bandeau sombre « EN DIRECT » avec statut de synchronisation, unité active et périodes 7/14/30 jours.
- Harmoniser les quatre indicateurs principaux en cartes claires avec icônes colorées, chiffres lisibles et détails utiles.
- Conserver les filtres ferme et infrastructure, avec une disposition adaptée au mobile, à la tablette et à l’ordinateur.

## Mortalité par infrastructure
- Ajouter un onglet « Mortalité » au module Cheptel avec un formulaire dédié.
- Afficher chaque infrastructure active, son cycle, son lot, l’espèce et le nombre de sujets disponibles.
- Valider la date, la cause et la quantité déclarée, sans autoriser de valeur vide, négative ou supérieure au stock disponible.
- Enregistrer la déclaration de façon atomique afin de mettre à jour ensemble l’historique sanitaire, le lot, l’infrastructure, le cycle et le stock de l’unité.
- Actualiser les données affichées immédiatement après validation et présenter un historique par infrastructure.

## Détails techniques
- Une fonction SQL sécurisée exécutera la déclaration dans une transaction unique et vérifiera l’utilisateur, l’unité et les quantités côté serveur.
- Le formulaire restera filtré par l’unité active et respectera le mode démonstration.
- Les couleurs de la refonte utiliseront les rôles visuels existants du projet.

## Vérification
- Vérifier la compilation puis tester visuellement le tableau de bord et le formulaire Cheptel sur mobile et ordinateur.
