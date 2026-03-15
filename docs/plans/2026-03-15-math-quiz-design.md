# MathQuiz — Design V1

**Date :** 2026-03-15
**Pour :** Enfant de 10 ans (CM2) passionné de maths
**Type :** App web statique (HTML/CSS/JS), zéro backend

---

## Architecture

- **Single-page app** — HTML + CSS + JS, aucune dépendance serveur
- **Questions algorithmiques** : générées côté client en JS avec templates + paramètres aléatoires (infinies)
- **Banque d'énigmes artisanales** : JSON intégré, enrichi via Claude Code à la demande
- **Persistance** : `localStorage` pour records, badges débloqués, préférences
- **Hébergement** : fichier local ou GitHub Pages / Netlify
- **Responsive** : mobile-first, touch-friendly, fonctionne sur téléphone et PC

---

## Écrans

### 1. Accueil
- Titre de l'app
- Sélecteur catégorie : Toutes / Calcul / Logique / Géométrie / Fractions / Mesures / Problèmes ouverts
- Sélecteur difficulté : Facile / Moyen / Difficile
- Sélecteur nombre de questions : 5 / 10 / 20
- Toggle chronomètre (optionnel)
- Bouton "Jouer !"
- Records personnels affichés en bas

### 2. Jeu
- **Header** : question X/N, score, streak 🔥, chrono (si activé)
- **Carte question** : badge catégorie coloré, énoncé, unité de réponse attendue
- **Indice** : bouton "Afficher l'indice" (coûte le bonus de points)
- **Input** : champ réponse + bouton "Valider"
- **Feedback** : après validation — vert (correct) / rouge (incorrect) + explication du raisonnement
- **Bouton "Suivant"** pour passer à la question suivante

### 3. Fin de partie
- Score final avec animation
- Nouveau record ? → explosion de confettis
- Badges débloqués pendant la partie
- Boutons "Rejouer" (mêmes paramètres) / "Menu"

---

## Catégories de questions

| Catégorie | Couleur | Exemples algorithmiques |
|-----------|---------|------------------------|
| Calcul | Bleu | Problèmes contextualisés (+, -, ×, ÷) : magasin, bibliothèque, etc. |
| Logique | Vert | Suites numériques, qui-suis-je, déduction |
| Géométrie | Orange | Périmètre, aire, compter les faces/arêtes |
| Fractions | Violet | Parts de pizza, partages, comparaisons |
| Mesures | Rouge | Conversions cm/m/km, durées, masses |
| Problèmes ouverts | Jaune | Combinatoire simple, "combien de façons de..." |

Chaque question contient : énoncé, unité de réponse, réponse correcte, indice, explication.

---

## Système de difficulté

- **3 niveaux de base** choisis par l'utilisateur : Facile / Moyen / Difficile
- **Adaptation intra-niveau** : 3 sous-paliers dans chaque niveau
  - Monte d'un sous-palier après 3 bonnes réponses consécutives
  - Descend d'un sous-palier après 2 erreurs d'affilée
- Les paramètres des templates (taille des nombres, nombre d'étapes) varient selon le sous-palier

---

## Gamification

### Score
- +10 points par bonne réponse
- +5 bonus si répondu sans indice
- Bonus chrono : +3 si réponse en <10s, +1 si <20s (uniquement si chrono activé)
- Pas de points négatifs (pas de punition)

### Streak 🔥
- Compteur de bonnes réponses consécutives
- Animation flamme qui grandit avec la série

### Records
- Meilleur score par catégorie + global
- Meilleure série par catégorie + global
- Sauvés en localStorage

### Badges (~10)
- "Première partie" — terminer une partie
- "Sans faute" — score parfait sur une partie
- "En feu" — 10 bonnes réponses d'affilée
- "Sans filet" — 5 réponses sans utiliser d'indice
- "Maître du calcul" (et variantes par catégorie) — 50 bonnes réponses dans une catégorie
- "Speedster" — terminer une partie chrono en <2min
- "Explorateur" — jouer dans toutes les catégories
- "Difficile !" — terminer une partie en mode Difficile

---

## Look & Feel

- **Fond sombre** : #1a1a2e ou similaire, cartes légèrement plus claires (#25253e)
- **Couleurs vives** par catégorie (voir tableau ci-dessus)
- **Animations** :
  - Confettis sur bonne réponse
  - Shake sur erreur
  - Explosion de confettis si record battu en fin de partie
  - Transitions fluides entre questions (slide)
  - Flamme streak animée
- **Typographie** : grande, lisible, police moderne sans-serif
- **Boutons** : grands, touch-friendly (min 48px), avec hover/active states colorés
- **Responsive** : mobile-first, grille fluide

---

## V2 (futur)

- Système XP + niveaux
- Coffres à débloquer (récompenses aléatoires)
- Skins / thèmes personnalisables
- Classement / ranking
- Récompenses quotidiennes
