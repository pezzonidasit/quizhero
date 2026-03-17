// fiches.js — Bibliothèque des 28 fiches pédagogiques CM2
// Chargé en lazy loading au premier clic "Aide"
// Expose window.FICHES globalement

window.FICHES = {

  // ─── CALCUL ───────────────────────────────────────────────────────────────

  'multiplication': {
    titre: 'La Multiplication',
    intro: 'Multiplier, c\'est additionner plusieurs fois le même nombre. Par exemple, 3 × 4 veut dire "3 groupes de 4" ou "4 + 4 + 4 = 12".',
    regle: 'a × b = b × a  (on peut changer l\'ordre !)\n\nPour une multiplication posée :\n1. On multiplie chaque chiffre du bas par chaque chiffre du haut\n2. On n\'oublie pas de décaler d\'un rang quand on passe aux dizaines\n3. On additionne les résultats partiels',
    exemples: [
      {
        enonce: 'Combien font 24 × 13 ?',
        calcul: '  24\n×  13\n────\n  72   ← 24 × 3\n+240   ← 24 × 10\n────\n 312'
      },
      {
        enonce: 'Un paquet contient 6 biscuits. Combien y a-t-il de biscuits dans 7 paquets ?',
        calcul: '7 × 6 = 42 biscuits'
      }
    ],
    astuce: '💡 Apprends tes tables par cœur jusqu\'à 10 × 10 ! Astuce pour × 9 : le résultat a toujours des chiffres dont la somme vaut 9. Ex : 9 × 7 = 63, et 6 + 3 = 9 !'
  },

  'division': {
    titre: 'La Division',
    intro: 'Diviser, c\'est partager en parts égales. Si on a 20 bonbons pour 4 enfants, chaque enfant aura 20 ÷ 4 = 5 bonbons.',
    regle: 'dividende ÷ diviseur = quotient (reste r)\n\nPour une division posée :\n1. On prend les chiffres du dividende un par un\n2. On cherche combien de fois le diviseur "rentre dedans"\n3. On soustrait et on descend le chiffre suivant\n4. S\'il reste quelque chose à la fin, c\'est le reste (toujours < diviseur)',
    exemples: [
      {
        enonce: 'Calcule 85 ÷ 4',
        calcul: '85 ÷ 4 :\n- 8 ÷ 4 = 2, reste 0\n- On descend 5 → 05\n- 5 ÷ 4 = 1, reste 1\nRésultat : quotient = 21, reste = 1\nVérif : 21 × 4 + 1 = 84 + 1 = 85 ✓'
      },
      {
        enonce: '35 élèves sont répartis en groupes de 6. Combien de groupes complets ? Combien d\'élèves restent ?',
        calcul: '35 ÷ 6 = 5 groupes complets, reste 5 élèves'
      }
    ],
    astuce: '💡 Pour vérifier ta division : quotient × diviseur + reste = dividende. C\'est ton contrôle anti-erreur !'
  },

  'priorites': {
    titre: 'Priorités des Opérations',
    intro: 'Quand un calcul mélange +, −, × et ÷, il faut respecter un ordre précis. Ce n\'est pas "de gauche à droite" — certaines opérations passent avant les autres !',
    regle: 'Ordre à respecter :\n1. Les parenthèses ( ) en premier\n2. Les multiplications × et divisions ÷ ensuite\n3. Les additions + et soustractions − en dernier\n\nMoyen mnémotechnique : "Parenthèses d\'abord, × et ÷ ensemble, + et − pour finir"',
    exemples: [
      {
        enonce: 'Calcule 3 + 4 × 2',
        calcul: '3 + 4 × 2\n= 3 + 8   ← on fait × en premier\n= 11'
      },
      {
        enonce: 'Calcule (3 + 4) × 2',
        calcul: '(3 + 4) × 2\n= 7 × 2   ← parenthèses en premier\n= 14'
      }
    ],
    astuce: '💡 Les parenthèses changent tout ! (3 + 4) × 2 ≠ 3 + 4 × 2. Quand tu veux qu\'une addition passe en premier, mets-la entre parenthèses !'
  },

  'calcul_mental': {
    titre: 'Calcul Mental',
    intro: 'Le calcul mental, c\'est calculer dans sa tête rapidement grâce à des astuces malins. Pas besoin de poser le calcul !',
    regle: '× 10 : ajoute un zéro (35 × 10 = 350)\n× 100 : ajoute deux zéros (35 × 100 = 3 500)\n× 9 : × 10 puis − le nombre (7 × 9 = 70 − 7 = 63)\n× 11 : × 10 puis + le nombre (6 × 11 = 60 + 6 = 66)\n\nArrondi-ajustement :\n→ Pour × 99 : × 100 puis − le nombre\n→ Pour + 99 : + 100 puis − 1',
    exemples: [
      {
        enonce: 'Calcule 45 × 9 mentalement',
        calcul: '45 × 9\n= 45 × 10 − 45\n= 450 − 45\n= 405'
      },
      {
        enonce: 'Calcule 236 + 99',
        calcul: '236 + 99\n= 236 + 100 − 1\n= 336 − 1\n= 335'
      }
    ],
    astuce: '💡 Arrondi d\'abord, ajuste ensuite ! Pour multiplier par 5, divise par 2 et multiplie par 10. Ex : 14 × 5 = 14 ÷ 2 × 10 = 7 × 10 = 70.'
  },

  // ─── FRACTIONS ────────────────────────────────────────────────────────────

  'fractions_lire': {
    titre: 'Lire et Écrire une Fraction',
    intro: 'Une fraction, c\'est une façon d\'écrire une partie d\'un tout. Si tu coupes un gâteau en 4 parts égales et tu en prends 3, tu as mangé 3/4 du gâteau !',
    regle: '    numérateur\n  ─────────────  ← "sur"\n   dénominateur\n\nLe dénominateur dit en combien de parts égales on coupe.\nLe numérateur dit combien de parts on prend.\n\nFraction propre : numérateur < dénominateur (ex : 3/4)\nFraction = 1 quand numérateur = dénominateur (ex : 4/4 = 1)',
    exemples: [
      {
        enonce: 'Comment écrire "trois cinquièmes" ?',
        calcul: '3/5\n→ On coupe en 5 parts égales\n→ On en prend 3'
      },
      {
        enonce: 'Une pizza est coupée en 8 parts. Léa mange 3 parts. Quelle fraction a-t-elle mangée ?',
        calcul: 'Léa a mangé 3/8 de la pizza\n(3 parts sur 8 au total)'
      }
    ],
    astuce: '💡 "Numérateur" contient le mot "numéro" → c\'est le chiffre du haut. "Dénominateur" → c\'est le nombre de parts. Retiens : le bas dit EN COMBIEN, le haut dit COMBIEN ON PREND.'
  },

  'fractions_comparer': {
    titre: 'Comparer des Fractions',
    intro: 'Comment savoir si 2/3 est plus grand que 3/5 ? Il existe des astuces selon si les dénominateurs sont pareils ou différents.',
    regle: 'Même dénominateur → compare les numérateurs\n  Ex : 3/7 < 5/7  (car 3 < 5)\n\nMême numérateur → le plus grand dénominateur donne la plus petite fraction\n  Ex : 1/4 < 1/3  (les quarts sont plus petits que les tiers)\n\nDénominateurs différents → réduis au même dénominateur\n  Trouve le dénominateur commun, puis compare',
    exemples: [
      {
        enonce: 'Compare 3/8 et 5/8',
        calcul: 'Même dénominateur (8)\n3 < 5\nDonc 3/8 < 5/8'
      },
      {
        enonce: 'Compare 1/3 et 2/6',
        calcul: '1/3 = 2/6  (on multiplie haut et bas par 2)\nDonc 1/3 = 2/6 : elles sont égales !'
      }
    ],
    astuce: '💡 Imagine des parts de gâteau. Si le gâteau est coupé en 8, les parts sont plus petites que s\'il est coupé en 3. Donc 1/8 < 1/3 !'
  },

  'fractions_additionner': {
    titre: 'Additionner des Fractions',
    intro: 'Pour additionner des fractions, il faut que les "parts" soient de la même taille. On ne peut pas additionner des tiers et des quarts directement — comme on ne peut pas additionner des pommes et des oranges !',
    regle: 'Même dénominateur : on additionne les numérateurs\n  a/n + b/n = (a+b)/n\n\nDénominateurs différents :\n  1. Trouver le dénominateur commun\n  2. Transformer chaque fraction\n  3. Additionner les numérateurs',
    exemples: [
      {
        enonce: 'Calcule 2/7 + 3/7',
        calcul: '2/7 + 3/7\n= (2+3)/7\n= 5/7'
      },
      {
        enonce: 'Calcule 1/2 + 1/4',
        calcul: '1/2 = 2/4  (on multiplie haut et bas par 2)\n2/4 + 1/4\n= (2+1)/4\n= 3/4'
      }
    ],
    astuce: '💡 On n\'additionne JAMAIS les dénominateurs ! 1/3 + 1/3 = 2/3 (pas 2/6). Le dénominateur reste le même, seul le numérateur change.'
  },

  'fractions_decimales': {
    titre: 'Fractions Décimales',
    intro: 'Certaines fractions peuvent s\'écrire comme des nombres décimaux (avec une virgule). Ce sont des fractions dont le dénominateur est 10, 100 ou 1 000.',
    regle: 'Correspondances à connaître :\n1/2 = 0,5\n1/4 = 0,25\n3/4 = 0,75\n1/5 = 0,2\n1/10 = 0,1\n1/100 = 0,01\n\nRègle : divise le numérateur par le dénominateur\n  Ex : 3/4 → 3 ÷ 4 = 0,75',
    exemples: [
      {
        enonce: 'Écris 7/10 en décimal',
        calcul: '7/10 = 0,7\n(7 dixièmes → 1 chiffre après la virgule)'
      },
      {
        enonce: 'Léa a 3/4 d\'euro. Combien est-ce en centimes ?',
        calcul: '3/4 = 0,75 euro\n0,75 × 100 = 75 centimes'
      }
    ],
    astuce: '💡 Pour convertir une fraction en décimal, fais la division ! 1 ÷ 4 = 0,25. Ton calculateur peut t\'aider à vérifier, mais entraîne-toi à le faire de tête pour 1/2, 1/4, 3/4 et 1/5 !'
  },

  // ─── GÉOMÉTRIE ────────────────────────────────────────────────────────────

  'perimetre': {
    titre: 'Le Périmètre',
    intro: 'Le périmètre, c\'est la longueur du tour d\'une figure. Imagine que tu marches tout autour du bord — la distance totale, c\'est le périmètre !',
    regle: 'Carré (côté = c) :\n  P = 4 × c\n\nRectangle (longueur = L, largeur = l) :\n  P = 2 × (L + l)  ou  P = 2L + 2l\n\nTriangle :\n  P = côté 1 + côté 2 + côté 3\n\nCercle (rayon = r) :\n  P = 2 × π × r  ≈ 2 × 3,14 × r',
    exemples: [
      {
        enonce: 'Un rectangle mesure 8 cm de long et 5 cm de large. Quel est son périmètre ?',
        calcul: 'P = 2 × (L + l)\n= 2 × (8 + 5)\n= 2 × 13\n= 26 cm'
      },
      {
        enonce: 'Un carré a un côté de 6 cm. Quel est son périmètre ?',
        calcul: 'P = 4 × c\n= 4 × 6\n= 24 cm'
      }
    ],
    astuce: '💡 Périmètre = longueur du bord. Aire = surface à l\'intérieur. Ne confonds pas les deux ! Le périmètre se mesure en cm, m… (unités de longueur).'
  },

  'aire': {
    titre: 'L\'Aire',
    intro: 'L\'aire, c\'est la surface à l\'intérieur d\'une figure. Imagine que tu veux peindre le fond d\'une pièce — tu as besoin de l\'aire !',
    regle: 'Carré (côté = c) :\n  A = c × c = c²\n\nRectangle (longueur = L, largeur = l) :\n  A = L × l\n\nTriangle (base = b, hauteur = h) :\n  A = (b × h) ÷ 2\n\nUnités : cm², m², km²',
    exemples: [
      {
        enonce: 'Une chambre mesure 4 m × 3 m. Quelle est son aire ?',
        calcul: 'A = L × l\n= 4 × 3\n= 12 m²'
      },
      {
        enonce: 'Un triangle a une base de 6 cm et une hauteur de 4 cm. Quelle est son aire ?',
        calcul: 'A = (b × h) ÷ 2\n= (6 × 4) ÷ 2\n= 24 ÷ 2\n= 12 cm²'
      }
    ],
    astuce: '💡 L\'aire se mesure en unités CARRÉES (cm², m²). Si tu calcules l\'aire d\'un sol en m², tu sais combien de carreaux de 1 m × 1 m il faut pour le couvrir !'
  },

  'volume': {
    titre: 'Le Volume',
    intro: 'Le volume, c\'est la place occupée par un objet dans l\'espace. Comme l\'eau qui remplit une boîte ou un cube !',
    regle: 'Cube (arête = a) :\n  V = a × a × a = a³\n\nPavé droit (longueur L, largeur l, hauteur h) :\n  V = L × l × h\n\nUnités :\n  1 cm³ = 1 millilitre (mL)\n  1 dm³ = 1 litre (L)\n  1 m³ = 1 000 litres',
    exemples: [
      {
        enonce: 'Une boîte mesure 5 cm × 3 cm × 2 cm. Quel est son volume ?',
        calcul: 'V = L × l × h\n= 5 × 3 × 2\n= 30 cm³'
      },
      {
        enonce: 'Un cube a une arête de 4 cm. Quel est son volume ?',
        calcul: 'V = a³\n= 4 × 4 × 4\n= 64 cm³'
      }
    ],
    astuce: '💡 Le volume se mesure en unités CUBES (cm³, m³). Un cube de 1 cm de côté a un volume de 1 cm³ et contient exactement 1 mL d\'eau !'
  },

  'angles': {
    titre: 'Les Types d\'Angles',
    intro: 'Un angle, c\'est l\'ouverture entre deux droites qui partent du même point. On mesure les angles en degrés (°). Un tour complet = 360°.',
    regle: 'Angle droit : exactement 90° (le coin d\'une feuille)\nAngle aigu : moins de 90° (plus fermé qu\'un angle droit)\nAngle obtus : entre 90° et 180° (plus ouvert qu\'un angle droit)\nAngle plat : exactement 180° (une ligne droite)\nAngle rentrant : entre 180° et 360°\n\nOn mesure les angles avec un rapporteur.',
    exemples: [
      {
        enonce: 'Classe ces angles : 45°, 90°, 120°, 180°',
        calcul: '45° → aigu (< 90°)\n90° → droit (= 90°)\n120° → obtus (entre 90° et 180°)\n180° → plat (= 180°)'
      },
      {
        enonce: 'Dans un rectangle, quels angles trouve-t-on ?',
        calcul: 'Un rectangle a 4 angles droits (90° chacun)\n4 × 90° = 360° au total'
      }
    ],
    astuce: '💡 Pour reconnaître un angle droit, utilise le coin d\'une feuille comme gabarit. Si l\'angle coïncide exactement avec le coin → c\'est un angle droit !'
  },

  'symetrie': {
    titre: 'L\'Axe de Symétrie',
    intro: 'Une figure a un axe de symétrie quand on peut la plier en deux et que les deux moitiés se superposent parfaitement. Comme un papillon ou une lettre "A" !',
    regle: 'Axe de symétrie = droite qui partage une figure en deux parties identiques\n\nFigures et leurs axes :\n- Carré : 4 axes de symétrie\n- Rectangle : 2 axes\n- Cercle : infinité d\'axes\n- Triangle équilatéral : 3 axes\n- Losange : 2 axes\n\nPour construire le symétrique d\'un point :\n→ Le point et son image sont à égale distance de l\'axe',
    exemples: [
      {
        enonce: 'La lettre A a-t-elle un axe de symétrie ?',
        calcul: 'Oui ! Un axe vertical passe en plein milieu.\nLa partie gauche et la partie droite sont identiques.'
      },
      {
        enonce: 'Le point A est à 3 cm de l\'axe. Où est son symétrique A\' ?',
        calcul: 'A\' est aussi à 3 cm de l\'axe, de l\'autre côté.\nDistance totale A → A\' = 6 cm'
      }
    ],
    astuce: '💡 Pour trouver un axe de symétrie, plie la figure (ou imagine-la pliée) ! Si les deux moitiés se superposent exactement, tu as trouvé un axe.'
  },

  'droites': {
    titre: 'Droites Parallèles et Perpendiculaires',
    intro: 'Les droites peuvent avoir des relations entre elles : certaines ne se croisent jamais (parallèles), d\'autres se croisent à angle droit (perpendiculaires).',
    regle: 'Droites parallèles :\n→ Elles ne se croisent jamais, même prolongées\n→ Elles sont toujours à la même distance l\'une de l\'autre\n→ Notation : (d) ∥ (d\')\n\nDroites perpendiculaires :\n→ Elles se croisent en formant un angle droit (90°)\n→ Notation : (d) ⊥ (d\')\n\nOutils : équerre (angles droits) et règle (tracé)',
    exemples: [
      {
        enonce: 'Les rails d\'un chemin de fer sont-ils parallèles ou perpendiculaires ?',
        calcul: 'Parallèles ! Les deux rails ne se croisent jamais\net restent toujours à la même distance.'
      },
      {
        enonce: 'Les rues d\'un quadrillage forment-elles des angles droits ?',
        calcul: 'Oui, les rues horizontales et verticales\nsont perpendiculaires entre elles (90°).'
      }
    ],
    astuce: '💡 Dans un rectangle, les côtés opposés sont parallèles et les côtés adjacents sont perpendiculaires. Le rectangle est le meilleur exemple des deux à la fois !'
  },

  // ─── MESURES ──────────────────────────────────────────────────────────────

  'longueurs': {
    titre: 'Unités de Longueur',
    intro: 'Pour mesurer des longueurs, on utilise différentes unités selon ce qu\'on mesure : les millimètres pour de petites choses, les kilomètres pour de grandes distances !',
    regle: 'km → m → dm → cm → mm\n\n× 10 à chaque fois qu\'on descend :\n1 km = 1 000 m\n1 m = 10 dm = 100 cm = 1 000 mm\n1 cm = 10 mm\n\n÷ 10 à chaque fois qu\'on monte :\n10 mm = 1 cm\n100 cm = 1 m\n1 000 m = 1 km',
    exemples: [
      {
        enonce: 'Convertis 2,5 km en mètres',
        calcul: '2,5 km × 1 000 = 2 500 m'
      },
      {
        enonce: 'Convertis 350 cm en mètres',
        calcul: '350 cm ÷ 100 = 3,5 m'
      }
    ],
    astuce: '💡 Astuce du tableau : écris les unités en colonnes (km, hm, dam, m, dm, cm, mm) et place tes chiffres. Déplacer la virgule d\'un rang = multiplier ou diviser par 10 !'
  },

  'masses': {
    titre: 'Unités de Masse',
    intro: 'La masse, c\'est ce qu\'on mesure quand on se pèse ! On utilise des unités différentes selon si on pèse un médicament ou un camion.',
    regle: 't → kg → g → mg\n\n× 1 000 à chaque fois qu\'on descend :\n1 t (tonne) = 1 000 kg\n1 kg = 1 000 g\n1 g = 1 000 mg\n\n÷ 1 000 à chaque fois qu\'on monte',
    exemples: [
      {
        enonce: 'Convertis 3 kg en grammes',
        calcul: '3 kg × 1 000 = 3 000 g'
      },
      {
        enonce: 'Un éléphant pèse 5 000 kg. Combien de tonnes ?',
        calcul: '5 000 kg ÷ 1 000 = 5 t'
      }
    ],
    astuce: '💡 Entre kg et g, entre g et mg : on multiplie ou divise toujours par 1 000 (pas 100 comme pour les longueurs). C\'est là que beaucoup se trompent !'
  },

  'capacites': {
    titre: 'Unités de Capacité',
    intro: 'La capacité, c\'est la quantité de liquide qu\'un récipient peut contenir. La bouteille d\'eau de 1,5 L, le verre de 20 cL… ce sont des unités de capacité !',
    regle: 'L → dL → cL → mL\n\n× 10 à chaque fois qu\'on descend :\n1 L = 10 dL = 100 cL = 1 000 mL\n1 cL = 10 mL\n\nEquivalence utile :\n1 L = 1 dm³\n1 mL = 1 cm³',
    exemples: [
      {
        enonce: 'Convertis 2,5 L en cL',
        calcul: '2,5 L × 100 = 250 cL'
      },
      {
        enonce: 'Une bouteille contient 75 cL. Combien de mL ?',
        calcul: '75 cL × 10 = 750 mL'
      }
    ],
    astuce: '💡 Une canette de soda fait 33 cL = 330 mL. Une grande bouteille fait 1,5 L = 150 cL = 1 500 mL. Ces repères du quotidien t\'aident à te souvenir des conversions !'
  },

  'durees': {
    titre: 'Les Durées',
    intro: 'Calculer des durées, c\'est mesurer le temps qui passe. Entre 8h30 et 10h15, combien de temps s\'est-il écoulé ? Voici comment calculer !',
    regle: 'Unités :\n60 secondes = 1 minute\n60 minutes = 1 heure\n24 heures = 1 jour\n7 jours = 1 semaine\n\nPour calculer une durée :\n→ Méthode des "sauts" : on va de l\'heure de départ à l\'heure d\'arrivée\n→ Ex : de 8h45 à 10h20\n  Saut 1 : 8h45 → 9h00 = 15 min\n  Saut 2 : 9h00 → 10h00 = 60 min\n  Saut 3 : 10h00 → 10h20 = 20 min\n  Total : 15 + 60 + 20 = 95 min = 1h35',
    exemples: [
      {
        enonce: 'Le film commence à 14h20 et finit à 16h05. Combien dure-t-il ?',
        calcul: '14h20 → 15h00 : 40 min\n15h00 → 16h00 : 60 min\n16h00 → 16h05 : 5 min\nTotal : 40 + 60 + 5 = 105 min = 1h45'
      },
      {
        enonce: 'Convertis 135 minutes en heures et minutes',
        calcul: '135 ÷ 60 = 2 heures reste 15 minutes\nDonc 135 min = 2h15'
      }
    ],
    astuce: '💡 Utilise la méthode des sauts : vas d\'abord à l\'heure pile la plus proche, puis avance heure par heure, puis ajuste les minutes. C\'est plus simple que de tout calculer d\'un coup !'
  },

  'conversions': {
    titre: 'Tableau de Conversion',
    intro: 'Le tableau de conversion, c\'est l\'outil magique pour passer d\'une unité à une autre. Il fonctionne pour les longueurs, les masses et les capacités.',
    regle: 'Principe : décaler la virgule\n\n→ Multiplier par 10 : virgule vers la droite (1 cran)\n→ Multiplier par 100 : virgule vers la droite (2 crans)\n→ Multiplier par 1 000 : virgule vers la droite (3 crans)\n\n→ Diviser par 10 : virgule vers la gauche (1 cran)\n→ Diviser par 100 : virgule vers la gauche (2 crans)\n→ Diviser par 1 000 : virgule vers la gauche (3 crans)\n\nSi un chiffre manque, on met 0 à sa place.',
    exemples: [
      {
        enonce: 'Convertis 4,5 m en cm',
        calcul: '1 m = 100 cm → × 100\nVirgule décale de 2 rangs vers la droite\n4,5 m = 4,50 m → 450 cm'
      },
      {
        enonce: 'Convertis 36 mm en cm',
        calcul: '1 cm = 10 mm → ÷ 10\nVirgule décale de 1 rang vers la gauche\n36 mm = 3,6 cm'
      }
    ],
    astuce: '💡 Retiens : vers la droite = plus grand nombre (on multiplie), vers la gauche = plus petit nombre (on divise). La virgule se déplace, les chiffres restent en place !'
  },

  // ─── NOMBRES ──────────────────────────────────────────────────────────────

  'grands_nombres': {
    titre: 'Les Grands Nombres',
    intro: 'Les grands nombres, c\'est quand on dépasse 999 ! On les regroupe par classes de 3 chiffres pour les lire et les écrire plus facilement.',
    regle: 'Classes (de droite à gauche) :\n→ Classe des unités : unités, dizaines, centaines\n→ Classe des milliers : unités de milliers, dizaines de milliers, centaines de milliers\n→ Classe des millions : unités de millions…\n\nPour lire un grand nombre :\n1. Repère les classes (par groupes de 3 chiffres depuis la droite)\n2. Lis chaque groupe avec son nom de classe\n\nEx : 2 456 789 = "deux millions quatre cent cinquante-six mille sept cent quatre-vingt-neuf"',
    exemples: [
      {
        enonce: 'Lis le nombre 3 045 200',
        calcul: 'Classes : 3 | 045 | 200\n→ 3 millions\n→ 45 mille\n→ 200\n= "trois millions quarante-cinq mille deux cents"'
      },
      {
        enonce: 'Écris en chiffres : "un million deux cent mille"',
        calcul: '1 200 000\n(1 million = 1 000 000\n+ 200 000 = 200 000)'
      }
    ],
    astuce: '💡 Pour éviter les erreurs, compte les chiffres depuis la droite et place des espaces tous les 3 chiffres. 1 000 000 = 7 chiffres = 1 million. Tu peux vérifier en comptant les zéros !'
  },

  'decimaux': {
    titre: 'Les Nombres Décimaux',
    intro: 'Un nombre décimal, c\'est un nombre qui a des chiffres après la virgule. 3,75 ou 0,5 sont des nombres décimaux. On les utilise pour les prix, les mesures précises…',
    regle: 'Structure d\'un nombre décimal :\n  [partie entière] , [partie décimale]\n  Ex : 12,345\n  → Partie entière : 12\n  → Partie décimale : 345\n\nPosition des chiffres :\n  ...centaines | dizaines | unités , dixièmes | centièmes | millièmes...\n  Ex : 4 , 7 5\n  → 4 unités, 7 dixièmes, 5 centièmes\n  → 4 + 7/10 + 5/100 = 4,75',
    exemples: [
      {
        enonce: 'Dans 3,72, quel est le chiffre des centièmes ?',
        calcul: '3 , 7 2\n       ↑\n  centièmes\n→ Le chiffre des centièmes est 2'
      },
      {
        enonce: 'Range dans l\'ordre croissant : 2,5 / 2,15 / 2,09 / 2,8',
        calcul: '2,09 < 2,15 < 2,5 < 2,8\n(comparer d\'abord les unités, puis les dixièmes, puis les centièmes)'
      }
    ],
    astuce: '💡 Pour comparer des décimaux, compare d\'abord les parties entières. Si elles sont égales, regarde les dixièmes, puis les centièmes... Ne te laisse pas impressionner par le nombre de chiffres : 2,9 > 2,15 !'
  },

  'arrondir': {
    titre: 'Arrondir un Nombre',
    intro: 'Arrondir, c\'est remplacer un nombre par une valeur approchée plus simple. On dit souvent qu\'un trajet dure "environ 2 heures" ou qu\'un livre coûte "environ 15 euros".',
    regle: 'Pour arrondir à l\'unité la plus proche :\n1. Repère le chiffre de l\'unité voulue\n2. Regarde le chiffre juste APRÈS (à droite)\n3. Si ce chiffre est ≥ 5 → on arrondit au DESSUS (on ajoute 1)\n   Si ce chiffre est < 5 → on arrondit en DESSOUS (on garde)\n\nRègle universelle :\n≥ 5 → arrondi supérieur\n< 5 → arrondi inférieur',
    exemples: [
      {
        enonce: 'Arrondi 3,67 à l\'unité',
        calcul: 'Chiffre des unités : 3\nChiffre suivant (dixièmes) : 6 ≥ 5\n→ On arrondit au dessus\n3,67 ≈ 4'
      },
      {
        enonce: 'Arrondi 47,3 à la dizaine',
        calcul: 'Chiffre des dizaines : 4 (soit 40)\nChiffre suivant (unités) : 7 ≥ 5\n→ On arrondit au dessus\n47,3 ≈ 50'
      }
    ],
    astuce: '💡 Le chiffre décisif est TOUJOURS celui qui est juste après la position à laquelle tu arrondis. ≥ 5 = tu montes, < 5 = tu restes. Simple !'
  },

  'pourcentages': {
    titre: 'Les Pourcentages',
    intro: 'Un pourcentage, c\'est une fraction sur 100. 50% veut dire 50 sur 100, c\'est-à-dire la moitié. On utilise les pourcentages pour les promotions, les notes, les statistiques…',
    regle: 'Correspondances à connaître :\n100% = tout entier\n50% = moitié (÷ 2)\n25% = quart (÷ 4)\n10% = dixième (÷ 10)\n1% = centième (÷ 100)\n\nCalculer x% d\'un nombre N :\n→ Méthode : N × x ÷ 100\nOu : calculer 10% puis multiplier\n\nEx : 30% de 80\n= 80 × 30 ÷ 100\n= 24',
    exemples: [
      {
        enonce: 'Un jeu coûte 60 €. Il est soldé à 25%. Quelle est la réduction ?',
        calcul: '25% de 60 €\n= 60 × 25 ÷ 100\n= 1 500 ÷ 100\n= 15 €\nPrix final : 60 − 15 = 45 €'
      },
      {
        enonce: 'Calcule 10% de 350',
        calcul: '10% = ÷ 10\n350 ÷ 10 = 35'
      }
    ],
    astuce: '💡 Pour calculer un pourcentage facilement : calcule d\'abord 10% (divise par 10), puis multiplie ! Pour 30%, calcule 10% × 3. Pour 5%, calcule 10% ÷ 2.'
  },

  // ─── PROBLÈMES ────────────────────────────────────────────────────────────

  'proportionnalite': {
    titre: 'La Proportionnalité',
    intro: 'Deux grandeurs sont proportionnelles quand, si l\'une double, l\'autre double aussi. Le prix d\'un article et la quantité achetée sont souvent proportionnels !',
    regle: 'Tableau de proportionnalité :\n\n  Quantité  |  Prix\n  ──────────|──────\n      2     |   6 €\n      5     |   ? €\n\nMéthode du coefficient multiplicateur :\n→ Trouve ce qu\'on multiplie : 2 × ? = 5 → coefficient = 5/2\n→ Applique à l\'autre colonne : 6 × 5/2 = 15 €\n\nMéthode du retour à l\'unité :\n→ Prix pour 1 : 6 ÷ 2 = 3 €\n→ Prix pour 5 : 3 × 5 = 15 €',
    exemples: [
      {
        enonce: '3 stylos coûtent 4,50 €. Combien coûtent 7 stylos ?',
        calcul: 'Prix de 1 stylo : 4,50 ÷ 3 = 1,50 €\nPrix de 7 stylos : 1,50 × 7 = 10,50 €'
      },
      {
        enonce: 'Une voiture roule à vitesse constante. En 2 h elle fait 150 km. En 5 h, quelle distance ?',
        calcul: 'Distance en 1h : 150 ÷ 2 = 75 km\nDistance en 5h : 75 × 5 = 375 km'
      }
    ],
    astuce: '💡 Avant de calculer, vérifie que c\'est bien proportionnel ! "Plus on achète, plus c\'est cher" = proportionnel. "Plus on attend, plus la file raccourcit" = pas proportionnel.'
  },

  'partage': {
    titre: 'Partage Équitable',
    intro: 'Partager équitablement, c\'est distribuer une quantité en parts égales. C\'est une division ! Et parfois il reste quelque chose qu\'on ne peut pas partager.',
    regle: 'Partage équitable = division\n  Quantité totale ÷ Nombre de parts = Part de chacun\n\nSi la division a un reste :\n→ Le reste ne peut pas être partagé en entiers\n→ On peut garder le reste, ou le convertir (ex : 1 € = 100 centimes)\n\nVérification : part × nombre + reste = total',
    exemples: [
      {
        enonce: '3 amis se partagent 50 billes. Combien chacun en reçoit-il ? Combien en reste-t-il ?',
        calcul: '50 ÷ 3 = 16 reste 2\nChaque ami reçoit 16 billes.\nIl reste 2 billes.\nVérif : 16 × 3 + 2 = 48 + 2 = 50 ✓'
      },
      {
        enonce: '4 enfants se partagent 7,20 €. Quelle est la part de chacun ?',
        calcul: '7,20 ÷ 4 = 1,80 €\nChaque enfant reçoit 1,80 €'
      }
    ],
    astuce: '💡 Le reste doit toujours être PLUS PETIT que le diviseur. Si ton reste est plus grand, tu as fait une erreur dans la division !'
  },

  'vitesse': {
    titre: 'Vitesse, Distance, Durée',
    intro: 'Quand une voiture roule à 90 km/h pendant 2 heures, elle parcourt 180 km. Ces trois grandeurs (vitesse, distance, durée) sont toujours liées par une relation simple !',
    regle: 'Le triangle magique :\n\n        D\n      ─────\n      V × T\n\nD = Distance (en km, m…)\nV = Vitesse (en km/h, m/s…)\nT = Temps/Durée (en h, s…)\n\nFormules :\n→ D = V × T\n→ V = D ÷ T\n→ T = D ÷ V',
    exemples: [
      {
        enonce: 'Un cycliste roule à 15 km/h pendant 3 heures. Quelle distance parcourt-il ?',
        calcul: 'D = V × T\n= 15 × 3\n= 45 km'
      },
      {
        enonce: 'Pour aller à 120 km à 60 km/h, combien de temps faut-il ?',
        calcul: 'T = D ÷ V\n= 120 ÷ 60\n= 2 heures'
      }
    ],
    astuce: '💡 Astuce du triangle magique : cache la grandeur que tu cherches avec ton doigt. Ce qui reste te donne la formule ! Cache D → V × T. Cache V → D ÷ T. Cache T → D ÷ V.'
  },

  'prix': {
    titre: 'Prix, Monnaie et Rendu de Monnaie',
    intro: 'Calculer des prix, c\'est utile chaque jour ! Que ce soit pour savoir si tu as assez d\'argent, combien on va te rendre ou quel est le meilleur prix.',
    regle: 'Rendu de monnaie :\n→ Rendu = Somme donnée − Prix à payer\n\nMéthode du "complément" :\n→ Pars du prix et monte jusqu\'à la somme donnée par sauts pratiques\n\nPrix total :\n→ Prix total = prix unitaire × quantité\n\nMeilleur prix (par unité) :\n→ Divise le prix par la quantité pour comparer',
    exemples: [
      {
        enonce: 'Tu achètes un livre à 7,50 €. Tu donnes un billet de 10 €. Combien te rend-on ?',
        calcul: 'Rendu = 10,00 − 7,50\n= 2,50 €\n\nMéthode complément :\n7,50 → 8,00 : 0,50 €\n8,00 → 10,00 : 2,00 €\nTotal rendu : 2,50 €'
      },
      {
        enonce: '6 bonbons coûtent 1,80 €. Quel est le prix de 10 bonbons ?',
        calcul: 'Prix de 1 bonbon : 1,80 ÷ 6 = 0,30 €\nPrix de 10 bonbons : 0,30 × 10 = 3,00 €'
      }
    ],
    astuce: '💡 Pour le rendu de monnaie, la méthode du complément (partir du prix et monter) est plus facile que la soustraction. C\'est comme ça que les commerçants le font !'
  }

};
