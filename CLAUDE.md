# QuizHero — Jeu de Quiz Gamifié

App web gamifiée de quiz mathématiques pour enfants (CM2, 10 ans).

## Stack

- **HTML/CSS/JS** pur — zéro framework, zéro build
- **localStorage** pour la persistance (namespacé par profil)
- **PWA** — manifest + service worker, installable sur mobile
- **GitHub Pages** — https://pezzonidasit.github.io/quizhero/

## Structure

```
MathQuiz/
├── index.html          — HTML principal (8 écrans)
├── manifest.json       — PWA manifest
├── sw.js               — Service worker (offline)
├── css/style.css       — Dark theme + responsive
├── js/
│   ├── themes.js       — 10 thèmes (CSS variables)
│   ├── profiles.js     — ProfileManager (CRUD, namespaced storage)
│   ├── questions.js    — 6 générateurs + 50 énigmes artisanales
│   ├── progression.js  — XP, rangs, pièces, coffres, loot tables
│   └── app.js          — Logique principale (state, screens, events)
└── docs/plans/         — Design docs et plans
```

## Script Load Order (critique)

`themes.js` → `profiles.js` → `questions.js` → `progression.js` → `app.js`

## Fonctionnalités

### V1 (Core)
- 6 catégories : Calcul, Logique, Géométrie, Fractions, Mesures, Problèmes ouverts
- Questions algorithmiques (infinies) + banque artisanale (50 énigmes)
- Difficulté adaptative (3 niveaux × 3 sous-paliers)
- Score, streak, badges, records par catégorie
- Chronomètre optionnel, indices, explications
- Confettis, animations, dark theme responsive

### V2 (Gamification)
- Profils multiples (namespacé en localStorage)
- XP + 6 rangs (Bronze → Légende)
- Pièces (monnaie in-game)
- Coffres (milestones parties + XP) avec loot tables
- 10 thèmes/skins (3 gratuits + 7 en boutique)
- Boutique, profil détail, badges collectibles

## GitHub Repo

- **Repo** : `pezzonidasit/quizhero`
- **Pages** : https://pezzonidasit.github.io/quizhero/
- **Deploy** : push sur `main` → auto-deploy via GitHub Pages

Pour mettre à jour le site après modification :
```bash
cd /tmp/mathquiz-deploy && cp -r /c/Users/User/Claude/MathQuiz/* . && git add -A && git commit -m "update" && git push
```

## Ajouter des questions

Les énigmes artisanales sont dans `js/questions.js` → `RIDDLE_BANK[]`.
Chaque énigme : `{ category, text, unit, answer, hint, explanation }`.
Pour des réponses texte : ajouter `textAnswer: 'réponse'` et `answer: null`.

## Conventions

- **Python** : `python` (jamais `python3` ni `py`)
- **Paths Bash** : forward slashes (`/c/Users/User/Claude/MathQuiz/`)
- **Paths outils** : Windows (`C:\Users\User\Claude\MathQuiz\`)
