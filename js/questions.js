/* MathQuiz — Question Engine */

// ── Categories ──────────────────────────────────────────────────────
const CATEGORIES = {
  calcul:    { label: 'Calcul',          color: '#4a9eff' },
  logique:   { label: 'Logique',         color: '#4ecdc4' },
  geometrie: { label: 'Géométrie',       color: '#ff8c42' },
  fractions: { label: 'Fractions',       color: '#a855f7' },
  mesures:   { label: 'Mesures',         color: '#ff6b6b' },
  ouvert:    { label: 'Problèmes ouverts', color: '#ffd93d' }
};

// ── Utilities ───────────────────────────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Generators ──────────────────────────────────────────────────────

function generateCalcul(subLevel) {
  if (subLevel === 1) {
    // Multiplication + add/subtract with context
    const scenarios = [
      () => {
        const n = rand(3, 8);
        const per = rand(4, 12);
        const bonus = rand(5, 20);
        return {
          text: `À la bibliothèque, ${n} étagères contiennent chacune ${per} livres. On ajoute ${bonus} livres. Combien y a-t-il de livres en tout ?`,
          answer: n * per + bonus,
          hint: `Calcule d'abord ${n} × ${per}, puis ajoute ${bonus}.`,
          explanation: `${n} × ${per} = ${n * per}, puis ${n * per} + ${bonus} = ${n * per + bonus}.`
        };
      },
      () => {
        const n = rand(3, 9);
        const per = rand(2, 6);
        const eaten = rand(2, 5);
        const total = n * per;
        return {
          text: `Au marché, tu achètes ${n} sachets de ${per} pommes. Tu en manges ${eaten}. Combien t'en reste-t-il ?`,
          answer: total - eaten,
          hint: `Calcule d'abord le total, puis retire ${eaten}.`,
          explanation: `${n} × ${per} = ${total}, puis ${total} − ${eaten} = ${total - eaten}.`
        };
      },
      () => {
        const n = rand(4, 7);
        const per = rand(3, 8);
        const extra = rand(3, 10);
        return {
          text: `En classe, il y a ${n} rangées de ${per} tables. La maîtresse ajoute ${extra} tables. Combien de tables en tout ?`,
          answer: n * per + extra,
          hint: `Multiplie d'abord, puis additionne.`,
          explanation: `${n} × ${per} = ${n * per}, plus ${extra} = ${n * per + extra}.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'calcul', text: s.text, unit: '', answer: s.answer, hint: s.hint, explanation: s.explanation };

  } else if (subLevel === 2) {
    // Two groups to add: n1×per1 + n2×per2
    const n1 = rand(3, 7);
    const per1 = rand(4, 9);
    const n2 = rand(2, 6);
    const per2 = rand(3, 8);
    const answer = n1 * per1 + n2 * per2;
    return {
      category: 'calcul',
      text: `Un magasin reçoit ${n1} cartons de ${per1} jouets et ${n2} cartons de ${per2} peluches. Combien d'articles en tout ?`,
      unit: '',
      answer,
      hint: `Calcule chaque groupe séparément, puis additionne.`,
      explanation: `${n1} × ${per1} = ${n1 * per1} et ${n2} × ${per2} = ${n2 * per2}. Total = ${answer}.`
    };

  } else {
    // Three-step: initial - give + receive - lose
    const initial = rand(30, 80);
    const give = rand(5, 15);
    const receive = rand(3, 12);
    const lose = rand(2, 8);
    const answer = initial - give + receive - lose;
    return {
      category: 'calcul',
      text: `Tu as ${initial} billes. Tu en donnes ${give}, tu en reçois ${receive}, puis tu en perds ${lose}. Combien t'en reste-t-il ?`,
      unit: '',
      answer,
      hint: `Fais les opérations une par une, dans l'ordre.`,
      explanation: `${initial} − ${give} = ${initial - give}, + ${receive} = ${initial - give + receive}, − ${lose} = ${answer}.`
    };
  }
}

function generateLogique(subLevel) {
  // Sometimes generate a "qui suis-je" riddle instead
  if (Math.random() < 0.3) {
    const n = rand(5, 25) * 2;
    const double = n * 2;
    return {
      category: 'logique',
      text: `Qui suis-je ? Mon double est ${double} et ma moitié est ${n / 2}.`,
      unit: '',
      answer: n,
      hint: `Si mon double est ${double}, divise par 2.`,
      explanation: `${double} ÷ 2 = ${n}. Vérification : ${n} ÷ 2 = ${n / 2}. ✓`
    };
  }

  if (subLevel === 1) {
    // Arithmetic sequence
    const start = rand(2, 10);
    const step = rand(3, 7);
    const seq = [];
    for (let i = 0; i < 5; i++) seq.push(start + step * i);
    const answer = start + step * 5;
    return {
      category: 'logique',
      text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`,
      unit: '',
      answer,
      hint: `Regarde la différence entre chaque nombre.`,
      explanation: `On ajoute ${step} à chaque fois. ${seq[4]} + ${step} = ${answer}.`
    };

  } else if (subLevel === 2) {
    // Geometric sequence
    const start = rand(2, 4);
    const factor = rand(2, 3);
    const seq = [];
    let val = start;
    for (let i = 0; i < 4; i++) { seq.push(val); val *= factor; }
    const answer = val;
    return {
      category: 'logique',
      text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`,
      unit: '',
      answer,
      hint: `Chaque nombre est multiplié par le même facteur.`,
      explanation: `On multiplie par ${factor} à chaque fois. ${seq[3]} × ${factor} = ${answer}.`
    };

  } else {
    // Alternating pattern: +a, ×b
    const a = rand(2, 5);
    const b = 2;
    let val = rand(3, 6);
    const seq = [val];
    for (let i = 0; i < 4; i++) {
      val = (i % 2 === 0) ? val + a : val * b;
      seq.push(val);
    }
    const answer = (4 % 2 === 0) ? val + a : val * b;
    return {
      category: 'logique',
      text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`,
      unit: '',
      answer,
      hint: `Regarde : une fois on ajoute, une fois on multiplie…`,
      explanation: `Le motif alterne : +${a}, ×${b}. Le suivant est ${answer}.`
    };
  }
}

function generateGeometrie(subLevel) {
  if (subLevel === 1) {
    // Rectangle perimeter
    const l = rand(3, 15);
    const w = rand(2, 10);
    const answer = 2 * (l + w);
    return {
      category: 'geometrie',
      text: `Un rectangle mesure ${l} cm de long et ${w} cm de large. Quel est son périmètre ?`,
      unit: 'cm',
      answer,
      hint: `Périmètre = 2 × (longueur + largeur).`,
      explanation: `2 × (${l} + ${w}) = 2 × ${l + w} = ${answer} cm.`
    };

  } else if (subLevel === 2) {
    // Rectangle area
    const l = rand(3, 12);
    const w = rand(2, 9);
    const answer = l * w;
    return {
      category: 'geometrie',
      text: `Un rectangle mesure ${l} cm de long et ${w} cm de large. Quelle est son aire ?`,
      unit: 'cm²',
      answer,
      hint: `Aire = longueur × largeur.`,
      explanation: `${l} × ${w} = ${answer} cm².`
    };

  } else {
    // Composite: rectangle + square
    const rl = rand(5, 10);
    const rw = rand(3, 6);
    const side = rand(2, 4);
    const answer = rl * rw + side * side;
    return {
      category: 'geometrie',
      text: `Une forme est composée d'un rectangle de ${rl} cm × ${rw} cm et d'un carré de côté ${side} cm. Quelle est l'aire totale ?`,
      unit: 'cm²',
      answer,
      hint: `Calcule l'aire de chaque forme, puis additionne.`,
      explanation: `Rectangle : ${rl} × ${rw} = ${rl * rw}. Carré : ${side} × ${side} = ${side * side}. Total = ${answer} cm².`
    };
  }
}

function generateFractions(subLevel) {
  if (subLevel === 1) {
    // Pizza parts remaining
    const total = pick([4, 6, 8]);
    const eaten = rand(1, total - 1);
    const answer = total - eaten;
    return {
      category: 'fractions',
      text: `Une pizza est coupée en ${total} parts. Tu en manges ${eaten}. Combien de parts reste-t-il ?`,
      unit: 'parts',
      answer,
      hint: `C'est une simple soustraction.`,
      explanation: `${total} − ${eaten} = ${answer} parts restantes.`
    };

  } else if (subLevel === 2) {
    // Fraction of a number: 1/n of X
    const n = pick([2, 3, 4, 5]);
    const x = n * rand(3, 10);
    const answer = x / n;
    return {
      category: 'fractions',
      text: `Combien vaut 1/${n} de ${x} ?`,
      unit: '',
      answer,
      hint: `Divise ${x} par ${n}.`,
      explanation: `${x} ÷ ${n} = ${answer}.`
    };

  } else {
    // Adding fractions same denominator
    const d = pick([4, 5, 6, 8]);
    const a = rand(1, d - 2);
    const b = rand(1, d - a);
    const answer = a + b;
    return {
      category: 'fractions',
      text: `Combien font ${a}/${d} + ${b}/${d} ? Donne le numérateur (le dénominateur reste ${d}).`,
      unit: '',
      answer,
      hint: `Quand les dénominateurs sont les mêmes, on additionne les numérateurs.`,
      explanation: `${a}/${d} + ${b}/${d} = ${a + b}/${d}. Le numérateur est ${answer}.`
    };
  }
}

function generateMesures(subLevel) {
  if (subLevel === 1) {
    // cm ↔ m conversions
    if (Math.random() < 0.5) {
      const m = rand(1, 9);
      const cm = rand(10, 90);
      const answer = m * 100 + cm;
      return {
        category: 'mesures',
        text: `Convertis ${m} m et ${cm} cm en centimètres.`,
        unit: 'cm',
        answer,
        hint: `1 mètre = 100 centimètres.`,
        explanation: `${m} × 100 + ${cm} = ${answer} cm.`
      };
    } else {
      const totalCm = rand(120, 500);
      const answer = totalCm;
      const m = Math.floor(totalCm / 100);
      const cm = totalCm % 100;
      return {
        category: 'mesures',
        text: `${m} m ${cm} cm = combien de cm au total ?`,
        unit: 'cm',
        answer,
        hint: `Convertis les mètres en cm, puis ajoute le reste.`,
        explanation: `${m} × 100 + ${cm} = ${answer} cm.`
      };
    }

  } else if (subLevel === 2) {
    // Hours + minutes to total minutes
    const h = rand(1, 4);
    const m = rand(5, 55);
    const answer = h * 60 + m;
    return {
      category: 'mesures',
      text: `Convertis ${h} h ${m} min en minutes.`,
      unit: 'min',
      answer,
      hint: `1 heure = 60 minutes.`,
      explanation: `${h} × 60 + ${m} = ${answer} minutes.`
    };

  } else {
    // kg + g to total grams
    const kg = rand(1, 5);
    const g = rand(50, 900);
    const answer = kg * 1000 + g;
    return {
      category: 'mesures',
      text: `Convertis ${kg} kg ${g} g en grammes.`,
      unit: 'g',
      answer,
      hint: `1 kg = 1000 g.`,
      explanation: `${kg} × 1000 + ${g} = ${answer} g.`
    };
  }
}

function generateOuvert(subLevel) {
  if (subLevel === 1) {
    // Coin combinations: pieces of 5 and 2 to make a total
    const target = pick([11, 13, 17, 19, 21]);
    // Find number of ways to make target with 5s and 2s
    let count = 0;
    for (let fives = 0; fives * 5 <= target; fives++) {
      const rest = target - fives * 5;
      if (rest % 2 === 0) count++;
    }
    return {
      category: 'ouvert',
      text: `Combien de façons peux-tu faire ${target} € avec des pièces de 5 € et de 2 € ?`,
      unit: '',
      answer: count,
      hint: `Essaie avec 0 pièces de 5, puis 1 pièce de 5, etc.`,
      explanation: `Il y a ${count} façon(s) de combiner des pièces de 5 € et 2 € pour faire ${target} €.`
    };

  } else if (subLevel === 2) {
    // Outfit combinations: tops × bottoms
    const tops = rand(3, 6);
    const bottoms = rand(2, 5);
    const answer = tops * bottoms;
    return {
      category: 'ouvert',
      text: `Tu as ${tops} t-shirts et ${bottoms} pantalons. Combien de tenues différentes peux-tu faire ?`,
      unit: '',
      answer,
      hint: `Pour chaque t-shirt, tu peux porter n'importe quel pantalon.`,
      explanation: `${tops} × ${bottoms} = ${answer} tenues possibles.`
    };

  } else {
    // Handshake problem: n(n-1)/2
    const n = rand(4, 8);
    const answer = n * (n - 1) / 2;
    return {
      category: 'ouvert',
      text: `${n} amis se retrouvent et chacun fait une poignée de main à chacun des autres. Combien de poignées de main en tout ?`,
      unit: '',
      answer,
      hint: `La première personne serre la main de ${n - 1} personnes, la deuxième de ${n - 2}…`,
      explanation: `${n} × ${n - 1} ÷ 2 = ${answer} poignées de main.`
    };
  }
}

// ── Artisanal Riddle Bank ───────────────────────────────────────────
const RIDDLE_BANK = [

  // ═══════════════════════════════════════════════════════════════════
  // CALCUL (~8 riddles)
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'calcul',
    text: 'Un bus part avec 20 passagers. Au 1er arrêt, 5 descendent et 8 montent. Au 2e arrêt, 3 descendent et 9 montent. Combien de passagers y a-t-il maintenant ?',
    unit: '',
    answer: 29,
    hint: 'Suis chaque arrêt : retire ceux qui descendent, ajoute ceux qui montent.',
    explanation: '20 − 5 + 8 = 23. Puis 23 − 3 + 9 = 29 passagers.'
  },
  {
    category: 'calcul',
    text: 'Tu as un billet de 20 €. Tu achètes un cahier à 5 € et 2 stylos à 3 € chacun. Combien te reste-t-il ?',
    unit: '€',
    answer: 9,
    hint: 'Calcule d\'abord le total dépensé.',
    explanation: 'Cahier : 5 €. Stylos : 2 × 3 = 6 €. Total : 11 €. Rendu : 20 − 11 = 9 €.'
  },
  {
    category: 'calcul',
    text: 'Au supermarché, Maman achète 3 paquets de biscuits à 4 € et 2 bouteilles de jus à 3 €. Papa lui donne un bon de réduction de 5 €. Combien paie-t-elle ?',
    unit: '€',
    answer: 13,
    hint: 'Additionne tout, puis retire la réduction.',
    explanation: 'Biscuits : 3 × 4 = 12 €. Jus : 2 × 3 = 6 €. Total : 18 €. Avec réduction : 18 − 5 = 13 €.'
  },
  {
    category: 'calcul',
    text: 'Un boulanger prépare 12 croissants par fournée. Il fait 5 fournées le matin et 3 l\'après-midi. Il en donne 15 à ses voisins. Combien lui en reste-t-il ?',
    unit: '',
    answer: 81,
    hint: 'Calcule le total de fournées, puis retire les croissants donnés.',
    explanation: 'Total fournées : 5 + 3 = 8. Croissants : 8 × 12 = 96. Reste : 96 − 15 = 81.'
  },
  {
    category: 'calcul',
    text: 'Pour son anniversaire, Léa reçoit 25 € de ses parents, 15 € de sa mamie et 10 € de son oncle. Elle achète un livre à 18 € et un bracelet à 12 €. Combien lui reste-t-il ?',
    unit: '€',
    answer: 20,
    hint: 'Additionne les cadeaux, puis soustrais les achats.',
    explanation: 'Reçu : 25 + 15 + 10 = 50 €. Dépensé : 18 + 12 = 30 €. Reste : 50 − 30 = 20 €.'
  },
  {
    category: 'calcul',
    text: 'Un cinéma a 15 rangées de 12 sièges. 47 places sont occupées. Combien de places sont libres ?',
    unit: '',
    answer: 133,
    hint: 'Calcule d\'abord le nombre total de sièges.',
    explanation: 'Total : 15 × 12 = 180 sièges. Libres : 180 − 47 = 133.'
  },
  {
    category: 'calcul',
    text: 'Dans un parking, il y a 4 étages. Chaque étage a 25 places pour les voitures et 10 places pour les motos. Combien de véhicules le parking peut-il accueillir en tout ?',
    unit: '',
    answer: 140,
    hint: 'Calcule les places par étage, puis multiplie par 4.',
    explanation: 'Par étage : 25 + 10 = 35 places. Total : 4 × 35 = 140 places.'
  },
  {
    category: 'calcul',
    text: 'Un fermier ramasse 8 œufs par jour. Combien d\'œufs ramasse-t-il en 3 semaines ?',
    unit: '',
    answer: 168,
    hint: 'Combien de jours y a-t-il dans 3 semaines ?',
    explanation: '3 semaines = 21 jours. 21 × 8 = 168 œufs.'
  },

  // ═══════════════════════════════════════════════════════════════════
  // LOGIQUE (~9 riddles)
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'logique',
    text: 'Je suis un nombre à deux chiffres. La somme de mes chiffres est 10, et la différence est 4. Le chiffre des dizaines est plus grand. Qui suis-je ?',
    unit: '',
    answer: 73,
    hint: 'Deux chiffres qui font 10 ensemble, avec 4 d\'écart.',
    explanation: 'Les chiffres sont 7 et 3 (7+3=10, 7−3=4). Le nombre est 73.'
  },
  {
    category: 'logique',
    text: 'Un escargot grimpe un mur de 10 m. Chaque jour il monte de 3 m, mais chaque nuit il redescend de 2 m. En combien de jours atteint-il le sommet ?',
    unit: 'jours',
    answer: 8,
    hint: 'Il progresse de 1 m par jour… mais le dernier jour, il ne redescend pas !',
    explanation: 'Chaque jour net : +1 m. Après 7 jours il est à 7 m. Le 8e jour il monte de 3 m → 10 m. Arrivé !'
  },
  {
    category: 'logique',
    text: 'Dans une ferme, il y a des poules et des lapins. On compte 20 têtes et 56 pattes. Combien y a-t-il de lapins ?',
    unit: '',
    answer: 8,
    hint: 'Chaque poule a 2 pattes, chaque lapin en a 4. Essaie avec des nombres !',
    explanation: 'Si 20 poules → 40 pattes. Il y a 56 − 40 = 16 pattes en trop. Chaque lapin ajoute 2 pattes. 16 ÷ 2 = 8 lapins.'
  },
  {
    category: 'logique',
    text: 'Lors d\'une course, Léo dépasse le 2e. Emma est devant Léo. Hugo est juste derrière Léo. Qui est 2e ?',
    unit: '',
    answer: null,
    textAnswer: 'léo',
    hint: 'Si tu dépasses le 2e, tu prends sa place.',
    explanation: 'Léo dépasse le 2e → Léo est 2e. Emma est devant → Emma est 1re. Hugo derrière → Hugo est 3e.'
  },
  {
    category: 'logique',
    text: 'Je suis un nombre. Si tu me multiplies par 6 et que tu ajoutes 4, tu obtiens 40. Qui suis-je ?',
    unit: '',
    answer: 6,
    hint: 'Pars de 40, retire 4, puis divise.',
    explanation: '40 − 4 = 36. 36 ÷ 6 = 6. Vérification : 6 × 6 + 4 = 40. ✓'
  },
  {
    category: 'logique',
    text: 'Alice a le double de l\'âge de Ben. La somme de leurs âges est 24 ans. Quel âge a Alice ?',
    unit: 'ans',
    answer: 16,
    hint: 'Si Ben a un âge, Alice a le double. Les deux ensemble font 24.',
    explanation: 'Ben = x, Alice = 2x. x + 2x = 24 → 3x = 24 → x = 8. Alice a 2 × 8 = 16 ans.'
  },
  {
    category: 'logique',
    text: 'Je suis un nombre à deux chiffres. Mon chiffre des unités est le triple de mon chiffre des dizaines. La somme de mes chiffres est 8. Qui suis-je ?',
    unit: '',
    answer: 26,
    hint: 'Le chiffre des unités = 3 × le chiffre des dizaines.',
    explanation: 'Si dizaines = 2, unités = 3 × 2 = 6. Vérif : 2 + 6 = 8. ✓ Le nombre est 26.'
  },
  {
    category: 'logique',
    text: 'Un père a 40 ans. Son fils a 12 ans. Dans combien d\'années le père aura-t-il exactement le double de l\'âge de son fils ?',
    unit: 'ans',
    answer: 16,
    hint: 'Appelle x le nombre d\'années. Le père aura 40+x, le fils 12+x.',
    explanation: '40 + x = 2 × (12 + x) → 40 + x = 24 + 2x → 16 = x. Dans 16 ans : père = 56, fils = 28. ✓'
  },
  {
    category: 'logique',
    text: 'Je pense à un nombre. Je le multiplie par 5, j\'ajoute 3, puis je divise par 2. J\'obtiens 14. Quel est mon nombre ?',
    unit: '',
    answer: 5,
    hint: 'Remonte les opérations à l\'envers : multiplie par 2, retire 3, divise par 5.',
    explanation: '14 × 2 = 28. 28 − 3 = 25. 25 ÷ 5 = 5. Vérif : 5 × 5 = 25, + 3 = 28, ÷ 2 = 14. ✓'
  },

  // ═══════════════════════════════════════════════════════════════════
  // GÉOMÉTRIE (~8 riddles)
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'geometrie',
    text: 'Un carré a un périmètre de 36 cm. Quelle est son aire ?',
    unit: 'cm²',
    answer: 81,
    hint: 'Trouve d\'abord la longueur d\'un côté.',
    explanation: 'Côté = 36 ÷ 4 = 9 cm. Aire = 9 × 9 = 81 cm².'
  },
  {
    category: 'geometrie',
    text: 'Un rectangle a une aire de 48 cm² et une largeur de 6 cm. Quel est son périmètre ?',
    unit: 'cm',
    answer: 28,
    hint: 'Trouve d\'abord la longueur à partir de l\'aire.',
    explanation: 'Longueur = 48 ÷ 6 = 8 cm. Périmètre = 2 × (8 + 6) = 28 cm.'
  },
  {
    category: 'geometrie',
    text: 'Combien de faces a un cube ?',
    unit: '',
    answer: 6,
    hint: 'Pense à un dé : dessus, dessous, devant, derrière, gauche, droite.',
    explanation: 'Un cube a 6 faces carrées.'
  },
  {
    category: 'geometrie',
    text: 'Un triangle a des côtés de 7 cm, 8 cm et 5 cm. Quel est son périmètre ?',
    unit: 'cm',
    answer: 20,
    hint: 'Le périmètre, c\'est la somme de tous les côtés.',
    explanation: '7 + 8 + 5 = 20 cm.'
  },
  {
    category: 'geometrie',
    text: 'Un terrain de foot rectangulaire mesure 100 m de long et 60 m de large. Un joueur fait le tour complet du terrain en courant. Quelle distance parcourt-il ?',
    unit: 'm',
    answer: 320,
    hint: 'C\'est le périmètre du rectangle.',
    explanation: 'Périmètre = 2 × (100 + 60) = 2 × 160 = 320 m.'
  },
  {
    category: 'geometrie',
    text: 'On veut carreler un sol rectangulaire de 4 m sur 3 m avec des carreaux carrés de 1 m de côté. Combien faut-il de carreaux ?',
    unit: '',
    answer: 12,
    hint: 'C\'est l\'aire du rectangle.',
    explanation: 'Aire = 4 × 3 = 12 m². Il faut 12 carreaux.'
  },
  {
    category: 'geometrie',
    text: 'Combien d\'arêtes a un cube ?',
    unit: '',
    answer: 12,
    hint: 'Une arête est un segment entre deux sommets. Compte les arêtes du haut, du bas, et les verticales.',
    explanation: '4 arêtes en haut + 4 en bas + 4 verticales = 12 arêtes.'
  },
  {
    category: 'geometrie',
    text: 'Une piscine rectangulaire mesure 10 m de long et 5 m de large. On veut poser une barrière tout autour avec un portillon de 1 m. Quelle longueur de barrière faut-il acheter ?',
    unit: 'm',
    answer: 29,
    hint: 'Calcule le périmètre, puis retire la largeur du portillon.',
    explanation: 'Périmètre = 2 × (10 + 5) = 30 m. On retire 1 m pour le portillon : 30 − 1 = 29 m.'
  },

  // ═══════════════════════════════════════════════════════════════════
  // FRACTIONS (~8 riddles)
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'fractions',
    text: 'Un gâteau est coupé en 6 parts. Paul mange 2 parts, Marie mange 3 parts. Combien de parts reste-t-il ?',
    unit: '',
    answer: 1,
    hint: 'Soustrais les parts mangées du total.',
    explanation: '6 − 2 − 3 = 1 part restante.'
  },
  {
    category: 'fractions',
    text: 'Une pizza est coupée en 8 parts égales. Tu en manges 3/8 et ton ami en mange 2/8. Combien de parts reste-t-il ?',
    unit: '',
    answer: 3,
    hint: 'Additionne les parts mangées, puis soustrais du total.',
    explanation: '3 + 2 = 5 parts mangées. 8 − 5 = 3 parts restantes.'
  },
  {
    category: 'fractions',
    text: 'Dans une classe de 30 élèves, 1/3 des élèves portent des lunettes. Combien d\'élèves portent des lunettes ?',
    unit: '',
    answer: 10,
    hint: 'Divise le nombre d\'élèves par 3.',
    explanation: '1/3 de 30 = 30 ÷ 3 = 10 élèves.'
  },
  {
    category: 'fractions',
    text: 'Tu as 24 bonbons. Tu en donnes 1/4 à ton frère et 1/6 à ta sœur. Combien t\'en reste-t-il ?',
    unit: '',
    answer: 14,
    hint: 'Calcule 1/4 de 24 et 1/6 de 24 séparément.',
    explanation: '1/4 de 24 = 6 bonbons. 1/6 de 24 = 4 bonbons. Donné : 6 + 4 = 10. Reste : 24 − 10 = 14.'
  },
  {
    category: 'fractions',
    text: 'Quelle fraction est la plus grande : 3/4 ou 2/3 ? Donne le numérateur de la plus grande.',
    unit: '',
    answer: 3,
    hint: 'Mets les deux fractions au même dénominateur pour comparer.',
    explanation: '3/4 = 9/12 et 2/3 = 8/12. Comme 9/12 > 8/12, c\'est 3/4 la plus grande. Numérateur = 3.'
  },
  {
    category: 'fractions',
    text: 'Un réservoir de 60 litres est rempli aux 3/5. Combien de litres contient-il ?',
    unit: 'litres',
    answer: 36,
    hint: 'Calcule d\'abord 1/5 de 60, puis multiplie par 3.',
    explanation: '1/5 de 60 = 12 litres. 3/5 = 3 × 12 = 36 litres.'
  },
  {
    category: 'fractions',
    text: 'Une tablette de chocolat a 24 carrés. Emma mange 1/4 de la tablette, puis Lucas mange 1/3 de ce qui reste. Combien de carrés reste-t-il ?',
    unit: '',
    answer: 12,
    hint: 'Attention : Lucas mange 1/3 de ce qui RESTE, pas de la tablette entière.',
    explanation: 'Emma : 1/4 de 24 = 6 carrés. Reste : 24 − 6 = 18. Lucas : 1/3 de 18 = 6 carrés. Reste : 18 − 6 = 12.'
  },
  {
    category: 'fractions',
    text: 'Un ruban mesure 40 cm. On en coupe les 3/8. Quelle est la longueur du morceau coupé ?',
    unit: 'cm',
    answer: 15,
    hint: 'Calcule 3/8 de 40.',
    explanation: '1/8 de 40 = 5 cm. 3/8 = 3 × 5 = 15 cm.'
  },

  // ═══════════════════════════════════════════════════════════════════
  // MESURES (~8 riddles)
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'mesures',
    text: 'Un film commence à 14h30 et dure 1h55. Combien de minutes se sont écoulées entre le début et la fin du film ?',
    unit: 'minutes',
    answer: 115,
    hint: '1h55, c\'est combien de minutes au total ?',
    explanation: '1h55 = 60 + 55 = 115 minutes.'
  },
  {
    category: 'mesures',
    text: 'Un train part à 9h15 et arrive à 11h45. Combien de minutes a duré le trajet ?',
    unit: 'minutes',
    answer: 150,
    hint: 'Calcule d\'abord les heures, puis les minutes.',
    explanation: 'De 9h15 à 11h15 = 2h = 120 min. De 11h15 à 11h45 = 30 min. Total : 120 + 30 = 150 minutes.'
  },
  {
    category: 'mesures',
    text: 'Un cycliste roule à 15 km/h pendant 2 heures. Quelle distance a-t-il parcourue ?',
    unit: 'km',
    answer: 30,
    hint: 'Distance = vitesse × temps.',
    explanation: '15 km/h × 2 h = 30 km.'
  },
  {
    category: 'mesures',
    text: 'Un sac de pommes pèse 2 kg 350 g. Un sac de poires pèse 1 kg 700 g. Quel est le poids total en grammes ?',
    unit: 'g',
    answer: 4050,
    hint: 'Convertis d\'abord tout en grammes.',
    explanation: '2 kg 350 g = 2350 g. 1 kg 700 g = 1700 g. Total : 2350 + 1700 = 4050 g.'
  },
  {
    category: 'mesures',
    text: 'Il est 16h40. Le cours de natation commence dans 1h35. À quelle heure commence-t-il ? Donne uniquement les minutes de l\'heure de début.',
    unit: '',
    answer: 15,
    hint: '16h40 + 1h35 : attention au passage au-dessus de 60 minutes.',
    explanation: '16h40 + 1h = 17h40. 17h40 + 35 min = 18h15. Les minutes sont 15.'
  },
  {
    category: 'mesures',
    text: 'Tu achètes 3 baguettes à 1,20 € chacune et un croissant à 1,50 €. Tu paies avec un billet de 10 €. Combien te rend-on ?',
    unit: '€',
    answer: 4.9,
    hint: 'Calcule le total dépensé, puis soustrais de 10 €.',
    explanation: '3 × 1,20 = 3,60 €. Total : 3,60 + 1,50 = 5,10 €. Rendu : 10 − 5,10 = 4,90 €.'
  },
  {
    category: 'mesures',
    text: 'Le matin il fait −3°C. L\'après-midi la température monte de 11 degrés. Quelle est la température l\'après-midi ?',
    unit: '°C',
    answer: 8,
    hint: 'Pars de −3 et ajoute 11.',
    explanation: '−3 + 11 = 8°C.'
  },
  {
    category: 'mesures',
    text: 'Une corde mesure 2 m 40 cm. On en coupe un morceau de 85 cm. Combien de centimètres reste-t-il ?',
    unit: 'cm',
    answer: 155,
    hint: 'Convertis d\'abord tout en centimètres.',
    explanation: '2 m 40 cm = 240 cm. 240 − 85 = 155 cm.'
  },

  // ═══════════════════════════════════════════════════════════════════
  // PROBLÈMES OUVERTS (~9 riddles)
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'ouvert',
    text: 'Combien de nombres à 2 chiffres différents peut-on écrire avec les chiffres 1, 2 et 3 ?',
    unit: '',
    answer: 6,
    hint: 'Les deux chiffres doivent être différents. Essaie de tous les lister !',
    explanation: '3 choix pour les dizaines × 2 choix pour les unités = 6 nombres : 12, 13, 21, 23, 31, 32.'
  },
  {
    category: 'ouvert',
    text: 'Au restaurant, tu peux choisir 1 entrée parmi 3, 1 plat parmi 4 et 1 dessert parmi 2. Combien de menus différents peux-tu composer ?',
    unit: '',
    answer: 24,
    hint: 'Multiplie le nombre de choix à chaque étape.',
    explanation: '3 × 4 × 2 = 24 menus différents.'
  },
  {
    category: 'ouvert',
    text: 'Tu lances 2 dés. De combien de façons peux-tu obtenir un total de 7 ?',
    unit: '',
    answer: 6,
    hint: 'Le 1er dé peut faire 1 à 6. Pour chaque valeur, cherche ce que le 2e dé doit faire.',
    explanation: '(1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 façons.'
  },
  {
    category: 'ouvert',
    text: 'Combien y a-t-il de carrés en tout sur un échiquier 3×3 ? (Pas seulement les petits !)',
    unit: '',
    answer: 14,
    hint: 'Il y a des carrés de taille 1×1, 2×2 et 3×3.',
    explanation: '9 carrés 1×1 + 4 carrés 2×2 + 1 carré 3×3 = 14 carrés.'
  },
  {
    category: 'ouvert',
    text: 'Tu as 4 drapeaux de couleurs différentes. De combien de façons peux-tu les aligner sur une rangée ?',
    unit: '',
    answer: 24,
    hint: 'Pour le 1er, tu as 4 choix. Pour le 2e, 3 choix. Et ainsi de suite.',
    explanation: '4 × 3 × 2 × 1 = 24 arrangements possibles.'
  },
  {
    category: 'ouvert',
    text: 'Dans un carré magique 3×3, la somme de chaque ligne, colonne et diagonale est 15. Le centre est 5, le coin haut-gauche est 2. Quel nombre est dans le coin bas-droit ?',
    unit: '',
    answer: 8,
    hint: 'La diagonale haut-gauche → bas-droit doit faire 15.',
    explanation: 'Diagonale : 2 + 5 + ? = 15 → ? = 15 − 7 = 8.'
  },
  {
    category: 'ouvert',
    text: 'On plie une feuille de papier en 2. Puis encore en 2. Puis encore en 2. Combien de couches d\'épaisseur a la feuille ?',
    unit: '',
    answer: 8,
    hint: 'Chaque pliage double le nombre de couches.',
    explanation: '1er pliage : 2. 2e pliage : 4. 3e pliage : 8 couches.'
  },
  {
    category: 'ouvert',
    text: 'Tu dois monter un escalier de 5 marches. À chaque pas, tu montes 1 ou 2 marches. De combien de façons peux-tu monter ?',
    unit: '',
    answer: 8,
    hint: 'Commence par les petits escaliers : 1 marche, 2 marches, 3 marches… et cherche le motif.',
    explanation: '1 marche : 1 façon. 2 : 2. 3 : 3. 4 : 5. 5 : 8. C\'est la suite de Fibonacci !'
  },
  {
    category: 'ouvert',
    text: 'Tu veux colorier les 3 cases d\'une rangée avec 2 couleurs (rouge ou bleu). Combien de coloriages différents peux-tu faire ?',
    unit: '',
    answer: 8,
    hint: 'Chaque case a 2 choix de couleur, indépendamment des autres.',
    explanation: '2 × 2 × 2 = 8 coloriages possibles. (RRR, RRB, RBR, RBB, BRR, BRB, BBR, BBB)'
  }
];

// ── Main Entry Point ────────────────────────────────────────────────
const GENERATORS = {
  calcul:    generateCalcul,
  logique:   generateLogique,
  geometrie: generateGeometrie,
  fractions: generateFractions,
  mesures:   generateMesures,
  ouvert:    generateOuvert
};

function generateQuestion(category, subLevel, lastCategory) {
  // Resolve 'all' to a random category, avoiding the last one
  const catKeys = Object.keys(CATEGORIES);
  let cat;
  if (category === 'all') {
    const available = lastCategory ? catKeys.filter(k => k !== lastCategory) : catKeys;
    cat = pick(available);
  } else {
    cat = category;
  }

  // 20% chance to pick from RIDDLE_BANK
  if (Math.random() < 0.2) {
    const matches = RIDDLE_BANK.filter(r => r.category === cat);
    if (matches.length > 0) {
      return { ...pick(matches) };
    }
  }

  // Use the generator
  const generator = GENERATORS[cat];
  if (generator) {
    return generator(subLevel);
  }

  // Fallback — should not happen
  return generateCalcul(subLevel);
}
