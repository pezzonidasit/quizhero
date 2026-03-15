# MathQuiz — Design V2 (Gamification)

**Date :** 2026-03-15
**Base :** V1 existante (6 catégories, difficulté adaptative, dark theme)
**Inspiration :** Duolingo — progression, récompenses, engagement

---

## 1. Système de profils

- Écran de sélection au lancement — liste des profils existants + bouton "+"
- Création de profil : saisir un prénom + choisir parmi 3 skins de base
- Chaque profil a son propre namespace en localStorage : XP, rang, pièces, coffres, skins débloqués, records, badges
- Possibilité de supprimer un profil
- Profils illimités

---

## 2. XP & Rangs

- XP gagnés à chaque partie : 1 point de score = 1 XP + bonus difficulté (Difficile = ×1.5 XP)
- 6 rangs avec paliers :

| Rang | XP requis | Icône |
|------|-----------|-------|
| Bronze | 0 | 🥉 |
| Argent | 500 | 🥈 |
| Or | 1500 | 🥇 |
| Diamant | 3500 | 💎 |
| Maître | 7000 | 👑 |
| Légende | 15000 | ⭐ |

- Animation de montée de rang quand un palier est franchi
- Badge de profil (cadre autour du prénom) qui change selon le rang

---

## 3. Pièces (monnaie in-game)

- Gains : chaque partie rapporte des pièces (score ÷ 2, arrondi) + bonus dans les coffres
- Dépenses : boutique de skins/thèmes
- Solde affiché dans le header du profil

---

## 4. Coffres

### Coffres de palier
- Débloqués aux niveaux d'XP 5, 10, 15, 20... (tous les 5 paliers de parties)
- Garantissent au moins 1 item rare ou épique
- Contenu : pièces + 1-3 items

### Coffres de streak parties
- Débloqués après 5, 10, 25, 50 parties avec ≥70% de bonnes réponses
- Plus petits : pièces + 1-2 items communs
- Le streak se reset uniquement sur une mauvaise partie (<70%), jamais par le temps

### Raretés des items
| Rareté | Items | Couleur |
|--------|-------|---------|
| Commun | XP bonus (×2 pendant 1 partie), indices gratuits (3 sans coût) | Gris |
| Rare | Boucliers (protège le streak), badges exclusifs | Bleu |
| Épique | Thèmes/skins | Violet |

### Animation d'ouverture
- Coffre qui tremble → s'ouvre → items révélés un par un avec effet de lumière

---

## 5. Skins & Boutique

### Thèmes disponibles (~10)

**Gratuits (choix à la création) :**
- "Nuit étoilée" (dark actuel)
- "Océan" (bleus profonds)
- "Forêt" (verts naturels)

**Débloquables (coffre ou boutique) :**
- "Galaxie" — violets/roses cosmiques
- "Lave" — rouges/oranges sombres
- "Arctique" — blancs/bleus glacés
- "Néon" — noir + accents fluo
- "Coucher de soleil" — oranges/roses chauds
- "Pixel retro" — style 8-bit
- "Bonbon" — pastels colorés

### Boutique
- Grille de skins avec prix en pièces (50-200 pièces selon rareté)
- Skins possédés marqués avec ✓
- Aperçu du thème avant achat (preview live)
- Chaque thème change : --bg-dark, --bg-card, accents, couleurs catégories

---

## 6. Écrans

### Nouveaux
- **Écran profils** : sélection/création au lancement
- **Écran coffre** : animation d'ouverture + révélation items
- **Écran boutique** : grille skins, prix, aperçu, achat
- **Écran profil** : stats détaillées, badges, rang, historique

### Modifiés
- **Accueil** : header profil (prénom, rang, XP bar, pièces)
- **Fin de partie** : XP gagnés, pièces gagnées, progression rang, coffre si milestone

---

## 7. Architecture technique

- Tout reste en localStorage, un namespace par profil : `mq_profile_{id}_*`
- Les thèmes sont des objets CSS variables injectés dynamiquement
- Les coffres sont des loot tables côté client (pas besoin de serveur)
- Préparé pour V3 : arbre de compétences par catégorie

---

## V3 (futur)
- Arbre de compétences par catégorie (débloqué comme feature)
- Mode défi (2 joueurs sur le même appareil)
- Classement entre profils
