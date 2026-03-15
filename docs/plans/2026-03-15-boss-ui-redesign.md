# Boss Fight UI Redesign — VS Split-Screen Layout

**Date :** 15 mars 2026
**Scope :** Refonte visuelle de l'écran boss fight — layout, animations, couleurs

---

## Concept

Remplacer le header compact actuel (2 barres HP côte à côte) par un layout VS split-screen : boss en haut (~35% écran), joueur en bas, séparateur "⚔️ VS" au milieu. Le boss doit être visuellement dominant et les animations doivent créer un vrai feeling de combat 1v1.

## Layout

```
┌─────────────────────────────────┐
│  ██████ BOSS ZONE ██████████    │  fond coloré par boss
│         🐉  (4rem, animé)       │
│    Dragon des Fractions         │
│    ████████████░░░ 3/5 PV       │
├────────── ⚔️ VS ───────────────┤
│    Phase 1 — Assaut (2/3)       │
│  ┌───────────────────────────┐  │
│  │  Question + timer + input │  │
│  └───────────────────────────┘  │
│    Toi  ❤️❤️❤️  3/3 PV          │
└─────────────────────────────────┘
```

## Changements

### HTML (`index.html`)
Restructurer `#screen-boss-fight` :
- `.boss-zone` — bloc haut avec fond coloré, contient emoji, nom, barre HP boss
- `.boss-vs-divider` — séparateur "⚔️ VS"
- `.player-zone` — bloc bas avec question card + PV joueur en cœurs

### CSS (`style.css`)
- `.boss-zone` : fond teinté par boss, padding généreux, text-align center
- Emoji boss : 4rem, centré
- Barre HP boss : large, sous l'emoji, couleur spécifique au boss
- PV joueur : cœurs ❤️/🖤 + barre fine, en bas
- `.boss-vs-divider` : ligne horizontale avec "⚔️ VS" centré
- Animations revues (voir ci-dessous)

### JS (`app.js`)
- `startBossFight()` : appliquer la couleur de zone du boss
- `updateBossHP()` : mettre à jour cœurs joueur (❤️→🖤)
- `handleBossAnswer()` : déclencher les nouvelles animations
- Ajouter transition "COUP FATAL" entre phase 1 et 2

## Couleurs par boss

| Boss | ID | Couleur zone (background) |
|------|----|--------------------------|
| 🐉 Dragon | dragon | `#3d1212` |
| 🤖 Golem | golem | `#1a2a1a` |
| 🧙 Sorcier | sorcier | `#1a1a3d` |
| 📐 Sphinx | sphinx | `#2a2a1a` |
| ⚗️ Alchimiste | alchimiste | `#1a2a2a` |
| 🌀 Kraken | kraken | `#0a1530` |

Stocké dans `BOSS_POOL` comme nouveau champ `color`.

## Animations

### Joueur touche le boss (bonne réponse)
1. Boss emoji : `scale(0.85)` + tremble (0.4s)
2. Barre HP boss : flash blanc (0.1s) puis transition width
3. Mini confetti (existant)
4. Si critique : flash doré overlay (0.15s) + texte "CRITIQUE ×2" qui fade

### Boss attaque le joueur (mauvaise réponse, phase 1)
1. Boss emoji : `translateY(+20px)` il fonce vers le joueur (0.3s)
2. Zone joueur : shake (0.4s)
3. Cœur correspondant : ❤️ → 🖤 avec animation scale+rotate

### Transition Phase 1 → Phase 2
1. Texte "⚔️ COUP FATAL" apparaît au centre, scale(0) → scale(1) avec glow
2. Pause 1.5s
3. Fade vers la question multi-étapes

## Fichiers impactés

| Fichier | Changement |
|---------|------------|
| `index.html` | Restructurer `#screen-boss-fight` |
| `css/style.css` | Remplacer les styles boss fight |
| `js/app.js` | Adapter les fonctions boss (HP display, animations, couleurs) |
| `js/questions.js` | Ajouter champ `color` à `BOSS_POOL` |
