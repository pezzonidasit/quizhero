# MathQuiz V4 — Design : Social, Classement, Dashboard Parent

**Date :** 15 mars 2026
**Scope :** Backend Firebase + classement + groupes + dashboard parent + énigmes partagées + modération

---

## Contexte

V3 (Boss Fights + Contrats) est live. V4 introduit un backend Firebase pour débloquer les features sociales. Chaque enfant joue sur son propre téléphone (PWA isolée), il faut synchroniser les données entre appareils.

### Contraintes
- Le jeu doit rester jouable **offline** (Firebase sync quand réseau dispo)
- Pas de login/mot de passe — les enfants ont 10 ans
- Free tier Firebase (1 GB stockage, 10 GB/mois transfer)
- Pas de framework, tout en vanilla JS

---

## 1. Architecture Firebase

### Setup
- Un projet Firebase "mathquiz"
- Realtime Database (pas Firestore — plus simple, sync temps réel natif)
- Auth anonyme activée (chaque appareil obtient un UID auto)
- Rules : lecture publique sur classement, écriture limitée à son propre playerId

### Structure DB

```
mathquiz/
├── players/
│   └── {playerId}/
│       ├── name: "Liam P."           // prénom + initiale (privacy)
│       ├── rank: "or"
│       ├── xp: 1028
│       ├── weeklyXP: 340             // reset chaque lundi
│       ├── weeklyGames: 12
│       ├── bestStreak: 14
│       ├── bossesDefeated: 3
│       ├── gamesPlayed: 45
│       ├── updatedAt: timestamp
│       └── groups/
│           └── {groupCode}: true
│
├── groups/
│   └── {groupCode}/
│       ├── name: "Famille Pezzi"
│       ├── createdBy: {playerId}      // admin
│       ├── createdAt: timestamp
│       ├── members/
│       │   └── {playerId}: true
│       ├── banned/
│       │   └── {playerId}: true
│       └── dashboard/                 // stats détaillées (admin only via rules)
│           └── {playerId}/
│               ├── catStats: {...}
│               ├── recentRate: 0.72
│               ├── weakCategories: ["fractions", "mesures"]
│               ├── timeSpent: 1840    // secondes cette semaine
│               ├── contractsCompleted: {bronze: 5, silver: 3, gold: 1}
│               └── updatedAt: timestamp
│
├── leaderboard/
│   └── weekly/
│       └── {playerId}/
│           ├── name: "Liam P."
│           ├── xp: 340
│           ├── rank: "or"
│           ├── bestStreak: 8
│           └── bossesDefeated: 1
│
└── riddles/
    └── {riddleId}/
        ├── createdBy: {playerId}
        ├── creatorName: "Liam"
        ├── groupCode: "PEZZI"        // null = global
        ├── category: "logique"
        ├── text: "..."
        ├── answer: 42
        ├── hint: "..."
        ├── explanation: "..."
        ├── plays: 12                  // nombre de fois jouée
        ├── successRate: 0.58
        └── createdAt: timestamp
```

### Security Rules (simplifié)

```json
{
  "players": {
    "$uid": {
      ".read": true,
      ".write": "$uid === auth.uid"
    }
  },
  "groups": {
    "$code": {
      ".read": "data.child('members').child(auth.uid).exists()",
      "dashboard": {
        ".read": "data.parent().child('createdBy').val() === auth.uid"
      },
      "banned": {
        ".write": "data.parent().child('createdBy').val() === auth.uid"
      }
    }
  },
  "leaderboard": {
    ".read": true,
    "weekly": {
      "$uid": {
        ".write": "$uid === auth.uid"
      }
    }
  },
  "riddles": {
    ".read": true,
    "$rid": {
      ".write": "!data.exists() || data.child('createdBy').val() === auth.uid"
    }
  }
}
```

---

## 2. Auth & Identité

### Premier lancement (nouveau joueur)
1. Firebase Auth anonyme → obtient un `uid`
2. Le `uid` est stocké en localStorage (`mq_firebaseUid`)
3. Le joueur crée son profil normalement (prénom, thème)
4. Les données profil sont écrites dans `/players/{uid}`
5. Le nom affiché publiquement = prénom + initiale du nom (si fourni), sinon juste prénom

### Rejoindre un groupe
1. Écran "Groupes" accessible depuis le profil
2. Bouton "Rejoindre un groupe" → saisir un code (4-6 caractères, lettres majuscules)
3. Vérification : le groupe existe ? le joueur est-il banni ?
4. Si OK → ajout dans `/groups/{code}/members/{uid}` et `/players/{uid}/groups/{code}`
5. Le joueur peut rejoindre **plusieurs groupes**

### Créer un groupe
1. Bouton "Créer un groupe" → saisir un nom
2. Code auto-généré (6 caractères aléatoires, ex: "PEZZI3")
3. Le créateur est automatiquement `createdBy` (admin)
4. Affichage du code à partager (copier / partager)

---

## 3. Classement

### Classement Global
- Top 50 joueurs par XP hebdomadaire
- Reset chaque lundi à minuit
- Affiché comme une liste : rang, nom, XP, icône rang
- Le joueur voit sa position même s'il n'est pas dans le top 50
- Accessible depuis l'écran d'accueil (nouveau bouton 🏆)

### Classement Groupe
- Même format que le global mais filtré par groupe
- Affiché dans l'écran du groupe
- Multiple catégories : XP semaine, meilleur streak, boss vaincus
- "Champion de la semaine" = couronne sur le #1

### Sync des stats
- À chaque fin de partie (`endGame()`), push les stats vers Firebase
- Offline : les stats s'accumulent en localStorage, sync au prochain lancement online
- Firebase `onDisconnect` pas nécessaire — on push, on ne subscribe pas en temps réel pour les stats

### Écran classement

```
┌─────────────────────────────────┐
│  🏆 Classement                  │
│  [Global] [Famille] [Copains]   │  ← tabs par groupe
│                                 │
│  Cette semaine                  │
│  👑 1. Liam P.    ⭐ 450 XP     │
│     2. Noé P.     💎 380 XP     │
│     3. Emma C.    🥇 290 XP     │
│     ...                         │
│  ─────────────────              │
│  📊 Toi : #4 — 240 XP          │
└─────────────────────────────────┘
```

---

## 4. Dashboard Parent

### Accès
- Depuis l'écran du groupe, bouton "📊 Dashboard" (visible seulement pour le créateur/admin)
- Protégé par PIN parent (le même 2609 ou un PIN dédié au groupe)

### Contenu
Pour chaque membre du groupe :

| Donnée | Source |
|--------|--------|
| Taux de réussite par catégorie | `catStats` |
| Catégories négligées (pas touchées depuis 7+ jours) | `lastPlayed` par cat |
| Temps passé cette semaine | `timeSpent` |
| Nombre de parties cette semaine | `weeklyGames` |
| Contrats complétés (bronze/silver/gold) | `contractsCompleted` |
| Progression XP (courbe) | `weeklyXP` historique |
| Questions les plus échouées | top 5 questions ratées |

### Écran dashboard

```
┌─────────────────────────────────┐
│  📊 Dashboard — Famille Pezzi   │
│                                 │
│  👤 Liam                        │
│  XP: 1028  Parties: 45  Temps: 2h30 │
│  ████ Calcul 82%                │
│  ████ Logique 75%               │
│  ██░░ Fractions 45% ⚠️          │
│  ░░░░ Mesures — pas joué ⚠️     │
│                                 │
│  👤 Noé                         │
│  ...                            │
└─────────────────────────────────┘
```

### Push des données dashboard
- À chaque `endGame()`, les stats détaillées sont pushées dans `/groups/{code}/dashboard/{uid}`
- Le parent voit les données de tous les membres de son groupe
- Données sensibles protégées par security rules (seul l'admin peut lire `/dashboard`)

---

## 5. Création & Partage d'Énigmes

### Créer une énigme
- Nouvel écran accessible depuis le profil ou l'accueil
- Formulaire : catégorie, texte de la question, réponse (numérique ou texte), indice, explication
- Choix de partage : "Mon groupe" (sélection) ou "Tout le monde" (global)
- L'énigme est pushée dans `/riddles/{autoId}`
- Limite : 5 énigmes par joueur (pour éviter le spam)

### Jouer des énigmes communautaires
- Dans le mode "Toutes catégories", 1 question sur 5 peut être une énigme communautaire (si disponible)
- Marquée visuellement : "📝 Créée par Liam"
- Après réponse, le joueur peut noter l'énigme (👍/👎)
- Les énigmes mal notées (< 30% 👍 après 10 votes) sont retirées automatiquement

### Pièces passives
- Quand quelqu'un résout une de tes énigmes : +2 pièces pour le créateur
- Notification au prochain lancement : "Ton énigme a été résolue 5 fois ! +10 🪙"

---

## 6. Modération (Admin du groupe)

### Actions admin
Depuis le dashboard parent :

| Action | Effet |
|--------|-------|
| **Bannir un membre** | Le joueur est retiré du groupe + ajouté à `/banned`. Ne peut plus rejoindre avec le même code. |
| **Débannir** | Retirer de `/banned`. Le joueur peut rejoindre à nouveau. |
| **Supprimer une énigme** | Supprimer une énigme créée par un membre (dans le groupe uniquement) |
| **Régénérer le code** | Nouveau code pour le groupe. L'ancien code ne fonctionne plus. Les membres existants restent. |

### Anti-abus global
- Rate limiting : max 10 écritures/minute par joueur
- Énigmes : max 5 actives par joueur
- Noms : filtre basique sur les mots interdits (côté client)

---

## 7. Offline Support

### Principe
Le jeu reste 100% jouable offline. Firebase sync quand le réseau est disponible.

### Implémentation
- `firebase.database().goOffline()` / `goOnline()` géré automatiquement
- Les écritures en offline sont mises en queue par Firebase SDK
- Les lectures (classement, énigmes) utilisent un cache localStorage rafraîchi toutes les 5 minutes online
- Si offline au lancement : afficher le dernier classement caché + message "Dernière mise à jour : il y a 2h"

---

## 8. Fichiers impactés

| Fichier | Changement |
|---------|------------|
| `index.html` | Firebase SDK (CDN), nouveaux écrans (classement, groupes, dashboard, créer énigme) |
| `js/firebase.js` | **NOUVEAU** — init Firebase, auth anonyme, helpers CRUD |
| `js/sync.js` | **NOUVEAU** — sync stats vers Firebase après chaque partie |
| `js/app.js` | Boutons classement/groupes sur home, intégration sync dans endGame |
| `css/style.css` | Styles classement, dashboard, groupes, création énigme |
| `sw.js` | Ajout nouveaux fichiers au cache |

### Nouveau fichier : `js/firebase.js`
```js
// Firebase config + init
// Auth anonyme
// Helpers : pushStats(), joinGroup(), createGroup(), getLeaderboard(), etc.
```

### Nouveau fichier : `js/sync.js`
```js
// syncAfterGame(stats) — appelé dans endGame()
// syncOnLaunch() — refresh classement + notifs au démarrage
// Offline queue management
```

---

## 9. Écrans à ajouter

| Écran | Accès | Contenu |
|-------|-------|---------|
| `screen-leaderboard` | Bouton 🏆 sur home | Tabs global/groupe, classement hebdo |
| `screen-groups` | Depuis profil | Liste des groupes, rejoindre/créer |
| `screen-group-detail` | Clic sur un groupe | Classement groupe, code, dashboard (admin) |
| `screen-dashboard` | Depuis group-detail (admin) | Stats détaillées par membre |
| `screen-create-riddle` | Depuis profil ou home | Formulaire création énigme |

---

## 10. Hors scope V4

- Chat/messages entre joueurs
- Matchmaking temps réel (1v1 live)
- Notifications push (nécessiterait FCM + service worker avancé)
- Mode défi direct (2 joueurs même appareil — V5)
