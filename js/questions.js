/* QuizHero — Question Engine */

// ── Categories ──────────────────────────────────────────────────────
const CATEGORIES = {
  calcul:    { label: 'Calcul',          color: '#4a9eff' },
  logique:   { label: 'Logique',         color: '#4ecdc4' },
  geometrie: { label: 'Géométrie',       color: '#ff8c42' },
  fractions: { label: 'Fractions',       color: '#a855f7' },
  mesures:   { label: 'Mesures',         color: '#ff6b6b' },
  ouvert:    { label: 'Problèmes ouverts', color: '#ffd93d' },
  geographie:{ label: 'Géographie',       color: '#22c55e' },
  revision:  { label: 'Révision',         color: '#10b981' }
};

// ── Utilities ───────────────────────────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ── Generators ──────────────────────────────────────────────────────

function generateCalcul(subLevel) {
  if (subLevel === 1) {
    // CE2 (8-9 ans): additions/soustractions < 100, tables ×2-×5, problèmes 1 étape
    const scenarios = [
      () => {
        const a = rand(10, 50);
        const b = rand(10, 49);
        const answer = a + b;
        return {
          text: `Combien font ${a} + ${b} ?`,
          answer,
          hint: `Additionne les dizaines, puis les unités.`,
          explanation: `${a} + ${b} = ${answer}.`
        };
      },
      () => {
        const a = rand(30, 99);
        const b = rand(10, a - 1);
        const answer = a - b;
        return {
          text: `Combien font ${a} − ${b} ?`,
          answer,
          hint: `Soustrais les unités, puis les dizaines.`,
          explanation: `${a} − ${b} = ${answer}.`
        };
      },
      () => {
        const a = rand(2, 5);
        const b = rand(2, 9);
        const answer = a * b;
        return {
          text: `Combien font ${a} × ${b} ?`,
          answer,
          hint: `C'est la table de ${a}.`,
          explanation: `${a} × ${b} = ${answer}.`
        };
      },
      () => {
        const sachets = rand(2, 5);
        const bonbons = rand(3, 8);
        const bonus = rand(1, 5);
        const answer = sachets * bonbons + bonus;
        return {
          text: `Tu as ${sachets} sachets de ${bonbons} bonbons. Mamie t'en donne ${bonus} de plus. Combien en as-tu ?`,
          answer,
          hint: `Multiplie d'abord, puis ajoute ${bonus}.`,
          explanation: `${sachets} × ${bonbons} = ${sachets * bonbons}, puis + ${bonus} = ${answer}.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'calcul', text: s.text, unit: '', answer: s.answer, hint: s.hint, explanation: s.explanation, ficheKey: 'calcul_mental' };

  } else if (subLevel === 2) {
    // CM2 (10 ans): multiplications contextualisées, 2 groupes, 2 étapes
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
      },
      () => {
        const n1 = rand(3, 7);
        const per1 = rand(4, 9);
        const n2 = rand(2, 6);
        const per2 = rand(3, 8);
        const answer = n1 * per1 + n2 * per2;
        return {
          text: `Un magasin reçoit ${n1} cartons de ${per1} jouets et ${n2} cartons de ${per2} peluches. Combien d'articles en tout ?`,
          answer,
          hint: `Calcule chaque groupe séparément, puis additionne.`,
          explanation: `${n1} × ${per1} = ${n1 * per1} et ${n2} × ${per2} = ${n2 * per2}. Total = ${answer}.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'calcul', text: s.text, unit: '', answer: s.answer, hint: s.hint, explanation: s.explanation, ficheKey: 'multiplication' };

  } else {
    // 6e (11-12 ans): opérations combinées, priorités, grands nombres
    const scenarios = [
      () => {
        const a = rand(6, 15);
        const b = rand(3, 9);
        const c = rand(10, 30);
        const answer = a * b + c;
        return {
          text: `Combien font ${a} × ${b} + ${c} ?`,
          answer,
          hint: `Attention aux priorités : la multiplication se fait avant l'addition.`,
          explanation: `${a} × ${b} = ${a * b}, puis ${a * b} + ${c} = ${answer}.`
        };
      },
      () => {
        let a, b, c, d, answer;
        do {
          a = rand(5, 12); b = rand(3, 8);
          c = rand(2, 6); d = rand(2, 9);
          answer = a * b - c * d;
        } while (answer <= 0);
        return {
          text: `Combien font ${a} × ${b} − ${c} × ${d} ?`,
          answer,
          hint: `Calcule chaque multiplication d'abord, puis soustrais.`,
          explanation: `${a} × ${b} = ${a * b} et ${c} × ${d} = ${c * d}. Donc ${a * b} − ${c * d} = ${answer}.`
        };
      },
      () => {
        const a = rand(100, 500);
        const b = rand(100, 500);
        const c = rand(50, 200);
        const answer = a + b - c;
        return {
          text: `Un entrepôt contient ${a} caisses. On en livre ${b} de plus, puis on en expédie ${c}. Combien en reste-t-il ?`,
          answer,
          hint: `Additionne d'abord, puis soustrais.`,
          explanation: `${a} + ${b} = ${a + b}, puis ${a + b} − ${c} = ${answer}.`
        };
      },
      () => {
        const a = rand(100, 999);
        const b = rand(2, 9);
        const answer = a * b;
        return {
          text: `Combien font ${a} × ${b} ?`,
          answer,
          hint: `Décompose : ${a} = ${Math.floor(a / 100) * 100} + ${a % 100}. Multiplie chaque partie par ${b}.`,
          explanation: `${a} × ${b} = ${answer}.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'calcul', text: s.text, unit: '', answer: s.answer, hint: s.hint, explanation: s.explanation, ficheKey: 'calcul_mental' };
  }
}

function generateLogique(subLevel) {
  // Sometimes generate a "qui suis-je" riddle instead
  if (Math.random() < 0.3) {
    const maxN = subLevel === 1 ? 10 : 25;
    const n = rand(3, maxN) * 2;
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

  // Pick a random sequence type to avoid repetition
  const seqTypes = subLevel === 1 ? [0, 1, 2] : subLevel === 2 ? [3, 4, 5] : [6, 7, 8];
  const type = seqTypes[Math.floor(Math.random() * seqTypes.length)];

  switch (type) {
    case 0: { // Arithmetic +
      const start = subLevel === 1 ? rand(1, 10) : rand(1, 20);
      const step = subLevel === 1 ? rand(2, 5) : rand(2, 12);
      const seq = [];
      for (let i = 0; i < 5; i++) seq.push(start + step * i);
      const answer = start + step * 5;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Regarde la différence entre chaque nombre.`,
        explanation: `On ajoute ${step} à chaque fois. ${seq[4]} + ${step} = ${answer}.` };
    }
    case 1: { // Arithmetic −
      const start = subLevel === 1 ? rand(30, 50) : rand(60, 100);
      const step = subLevel === 1 ? rand(2, 5) : rand(3, 11);
      const seq = [];
      for (let i = 0; i < 5; i++) seq.push(start - step * i);
      const answer = start - step * 5;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `La suite descend. De combien à chaque fois ?`,
        explanation: `On enlève ${step} à chaque fois. ${seq[4]} − ${step} = ${answer}.` };
    }
    case 2: { // Squares 1, 4, 9, 16...
      const offset = rand(0, 3);
      const seq = [];
      for (let i = 1; i <= 5; i++) seq.push((i + offset) * (i + offset));
      const answer = (6 + offset) * (6 + offset);
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Ce sont des carrés parfaits !`,
        explanation: `${seq[0]}=${1+offset}², ${seq[1]}=${2+offset}², ... Le suivant est ${6+offset}² = ${answer}.` };
    }
    case 3: { // Geometric ×
      const start = rand(2, 5);
      const factor = rand(2, 4);
      const seq = [];
      let val = start;
      for (let i = 0; i < 4; i++) { seq.push(val); val *= factor; }
      const answer = val;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Chaque nombre est multiplié par le même facteur.`,
        explanation: `On multiplie par ${factor} à chaque fois. ${seq[3]} × ${factor} = ${answer}.` };
    }
    case 4: { // Fibonacci-style: each = sum of 2 previous
      const a = rand(1, 5), b = rand(1, 5);
      const seq = [a, b];
      for (let i = 2; i < 6; i++) seq.push(seq[i-1] + seq[i-2]);
      const answer = seq[5] + seq[4];
      seq.push(answer);
      const shown = seq.slice(0, 6);
      return { category: 'logique', text: `Trouve le nombre suivant : ${shown.join(', ')}, ?`, unit: '', answer,
        hint: `Chaque nombre est la somme des deux précédents.`,
        explanation: `${seq[4]} + ${seq[5]} = ${answer}. Chaque terme = somme des 2 précédents.` };
    }
    case 5: { // Double then add: ×2, +k
      const k = rand(1, 4);
      let val = rand(1, 4);
      const seq = [val];
      for (let i = 0; i < 4; i++) { val = val * 2 + k; seq.push(val); }
      const answer = val * 2 + k;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Essaie : doubler puis ajouter un petit nombre.`,
        explanation: `Chaque terme = précédent × 2 + ${k}. ${seq[4]} × 2 + ${k} = ${answer}.` };
    }
    case 6: { // Alternating +a, ×b
      const a = rand(2, 6);
      const b = rand(2, 3);
      let val = rand(2, 6);
      const seq = [val];
      for (let i = 0; i < 4; i++) {
        val = (i % 2 === 0) ? val + a : val * b;
        seq.push(val);
      }
      const answer = (4 % 2 === 0) ? val + a : val * b;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Regarde : une fois on ajoute, une fois on multiplie…`,
        explanation: `Le motif alterne : +${a}, ×${b}. Le suivant est ${answer}.` };
    }
    case 7: { // Two interleaved sequences: a, b, a+step, b+step, ...
      const a = rand(1, 10), b = rand(20, 40);
      const stepA = rand(2, 5), stepB = rand(3, 7);
      const seq = [];
      for (let i = 0; i < 3; i++) { seq.push(a + stepA * i); seq.push(b + stepB * i); }
      const answer = a + stepA * 3;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `Et si c'étaient deux suites entrelacées ? Regarde un nombre sur deux.`,
        explanation: `Deux suites : ${a}, ${a+stepA}, ${a+stepA*2} (+${stepA}) et ${b}, ${b+stepB}, ${b+stepB*2} (+${stepB}). Le suivant est ${answer}.` };
    }
    case 8: { // Triangular numbers or step-increasing: +1, +2, +3, +4...
      const start = rand(1, 8);
      const seq = [start];
      let val = start;
      for (let i = 1; i <= 5; i++) { val += i; seq.push(val); }
      const answer = val + 6;
      return { category: 'logique', text: `Trouve le nombre suivant : ${seq.join(', ')}, ?`, unit: '', answer,
        hint: `La différence entre chaque nombre augmente de 1 à chaque fois.`,
        explanation: `On ajoute +1, +2, +3, +4, +5, +6. ${seq[5]} + 6 = ${answer}.` };
    }
  }
}

function generateGeometrie(subLevel) {
  if (subLevel === 1) {
    // CE2 (8-9 ans): périmètre carré/rectangle, compter les côtés
    const scenarios = [
      () => {
        const side = rand(2, 12);
        const answer = 4 * side;
        return {
          text: `Un carré a un côté de ${side} cm. Quel est son périmètre ?`,
          unit: 'cm', answer,
          hint: `Périmètre du carré = 4 × côté.`,
          explanation: `4 × ${side} = ${answer} cm.`,
          ficheKey: 'perimetre'
        };
      },
      () => {
        const l = rand(3, 15);
        const w = rand(2, 10);
        const answer = 2 * (l + w);
        return {
          text: `Un rectangle mesure ${l} cm de long et ${w} cm de large. Quel est son périmètre ?`,
          unit: 'cm', answer,
          hint: `Périmètre = 2 × (longueur + largeur).`,
          explanation: `2 × (${l} + ${w}) = 2 × ${l + w} = ${answer} cm.`,
          ficheKey: 'perimetre'
        };
      },
      () => {
        const shapes = [
          { name: 'triangle', sides: 3 },
          { name: 'carré', sides: 4 },
          { name: 'pentagone', sides: 5 },
          { name: 'hexagone', sides: 6 }
        ];
        const shape = pick(shapes);
        return {
          text: `Combien de côtés a un ${shape.name} ?`,
          unit: '', answer: shape.sides,
          hint: `Dessine la forme dans ta tête et compte les côtés.`,
          explanation: `Un ${shape.name} a ${shape.sides} côtés.`,
          ficheKey: 'perimetre'
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'geometrie', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation, ficheKey: s.ficheKey };

  } else if (subLevel === 2) {
    // CM2 (10 ans): aire du rectangle
    const l = rand(3, 12);
    const w = rand(2, 9);
    const answer = l * w;
    return {
      category: 'geometrie',
      text: `Un rectangle mesure ${l} cm de long et ${w} cm de large. Quelle est son aire ?`,
      unit: 'cm²',
      answer,
      hint: `Aire = longueur × largeur.`,
      explanation: `${l} × ${w} = ${answer} cm².`,
      ficheKey: 'aire'
    };

  } else {
    // 6e (11-12 ans): aires composées, aire triangle, volume pavé
    const scenarios = [
      () => {
        const rl = rand(5, 10);
        const rw = rand(3, 6);
        const side = rand(2, 4);
        const answer = rl * rw + side * side;
        return {
          text: `Une forme est composée d'un rectangle de ${rl} cm × ${rw} cm et d'un carré de côté ${side} cm. Quelle est l'aire totale ?`,
          unit: 'cm²', answer,
          hint: `Calcule l'aire de chaque forme, puis additionne.`,
          explanation: `Rectangle : ${rl} × ${rw} = ${rl * rw}. Carré : ${side} × ${side} = ${side * side}. Total = ${answer} cm².`,
          ficheKey: 'aire'
        };
      },
      () => {
        const base = rand(4, 12) * 2; // ensure even for clean division
        const hauteur = rand(3, 10);
        const answer = base * hauteur / 2;
        return {
          text: `Un triangle a une base de ${base} cm et une hauteur de ${hauteur} cm. Quelle est son aire ?`,
          unit: 'cm²', answer,
          hint: `Aire du triangle = (base × hauteur) ÷ 2.`,
          explanation: `(${base} × ${hauteur}) ÷ 2 = ${base * hauteur} ÷ 2 = ${answer} cm².`,
          ficheKey: 'aire'
        };
      },
      () => {
        const l = rand(3, 8);
        const w = rand(2, 6);
        const h = rand(2, 5);
        const answer = l * w * h;
        return {
          text: `Un pavé droit mesure ${l} cm de long, ${w} cm de large et ${h} cm de haut. Quel est son volume ?`,
          unit: 'cm³', answer,
          hint: `Volume = longueur × largeur × hauteur.`,
          explanation: `${l} × ${w} × ${h} = ${answer} cm³.`,
          ficheKey: 'volume'
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'geometrie', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation, ficheKey: s.ficheKey };
  }
}

function generateFractions(subLevel) {
  if (subLevel === 1) {
    // CE2 (8-9 ans): parts de pizza, moitié, quart
    const scenarios = [
      () => {
        const total = pick([4, 6, 8]);
        const eaten = rand(1, total - 1);
        const answer = total - eaten;
        return {
          text: `Une pizza est coupée en ${total} parts. Tu en manges ${eaten}. Combien de parts reste-t-il ?`,
          unit: 'parts', answer,
          hint: `C'est une simple soustraction.`,
          explanation: `${total} − ${eaten} = ${answer} parts restantes.`
        };
      },
      () => {
        const x = rand(4, 50) * 2; // divisible by 2
        const answer = x / 2;
        return {
          text: `Combien vaut la moitié de ${x} ?`,
          unit: '', answer,
          hint: `Divise ${x} par 2.`,
          explanation: `${x} ÷ 2 = ${answer}.`
        };
      },
      () => {
        const x = rand(3, 25) * 4; // divisible by 4
        const answer = x / 4;
        return {
          text: `Combien vaut le quart de ${x} ?`,
          unit: '', answer,
          hint: `Divise ${x} par 4.`,
          explanation: `${x} ÷ 4 = ${answer}.`
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'fractions', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation, ficheKey: 'fractions_lire' };

  } else if (subLevel === 2) {
    // CM2 (10 ans): fraction of a number 1/n of X
    const n = pick([2, 3, 4, 5]);
    const x = n * rand(3, 10);
    const answer = x / n;
    return {
      category: 'fractions',
      text: `Combien vaut 1/${n} de ${x} ?`,
      unit: '',
      answer,
      hint: `Divise ${x} par ${n}.`,
      explanation: `${x} ÷ ${n} = ${answer}.`,
      ficheKey: 'fractions_lire'
    };

  } else {
    // 6e (11-12 ans): addition fractions, p/n de X, addition décimale
    const scenarios = [
      () => {
        const d = pick([4, 5, 6, 8]);
        const a = rand(1, d - 2);
        const b = rand(1, d - a);
        const answer = a + b;
        return {
          text: `Combien font ${a}/${d} + ${b}/${d} ? Donne le numérateur (le dénominateur reste ${d}).`,
          unit: '', answer,
          hint: `Quand les dénominateurs sont les mêmes, on additionne les numérateurs.`,
          explanation: `${a}/${d} + ${b}/${d} = ${a + b}/${d}. Le numérateur est ${answer}.`,
          ficheKey: 'fractions_additionner'
        };
      },
      () => {
        const n = pick([4, 5, 8, 10]);
        const p = rand(2, n - 1);
        const base = n * rand(2, 10);
        const answer = base * p / n;
        return {
          text: `Combien valent ${p}/${n} de ${base} ?`,
          unit: '', answer,
          hint: `Calcule d'abord 1/${n} de ${base}, puis multiplie par ${p}.`,
          explanation: `1/${n} de ${base} = ${base / n}. ${p} × ${base / n} = ${answer}.`,
          ficheKey: 'fractions_lire'
        };
      },
      () => {
        // Decimal addition using integer arithmetic (cents) to avoid FP issues
        const a_cents = pick([125, 150, 175, 225, 250, 275, 325, 350, 450, 475]);
        const b_cents = pick([125, 150, 175, 225, 250, 275, 325, 350, 450, 475]);
        const sum_cents = a_cents + b_cents;
        const a_str = (a_cents / 100).toFixed(2).replace('.', ',');
        const b_str = (b_cents / 100).toFixed(2).replace('.', ',');
        const answer_str = (sum_cents / 100).toFixed(2);
        const answer = sum_cents / 100;
        return {
          text: `Combien font ${a_str} + ${b_str} ?`,
          unit: '', answer,
          hint: `Additionne d'abord les centièmes, puis les dixièmes, puis les unités.`,
          explanation: `${a_str} + ${b_str} = ${answer_str.replace('.', ',')}.`,
          ficheKey: 'fractions_decimales'
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'fractions', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation, ficheKey: s.ficheKey || 'fractions_lire' };
  }
}

function generateMesures(subLevel) {
  if (subLevel === 1) {
    // CE2 (8-9 ans): conversions simples entières
    const scenarios = [
      () => {
        const m = rand(1, 9);
        const answer = m * 100;
        return {
          text: `${m} mètres = combien de centimètres ?`,
          unit: 'cm', answer,
          hint: `1 mètre = 100 centimètres.`,
          explanation: `${m} × 100 = ${answer} cm.`,
          ficheKey: 'longueurs'
        };
      },
      () => {
        const h = rand(1, 5);
        const answer = h * 60;
        return {
          text: `${h} heure${h > 1 ? 's' : ''} = combien de minutes ?`,
          unit: 'min', answer,
          hint: `1 heure = 60 minutes.`,
          explanation: `${h} × 60 = ${answer} minutes.`,
          ficheKey: 'durees'
        };
      },
      () => {
        const kg = rand(1, 9);
        const answer = kg * 1000;
        return {
          text: `${kg} kg = combien de grammes ?`,
          unit: 'g', answer,
          hint: `1 kg = 1 000 grammes.`,
          explanation: `${kg} × 1 000 = ${answer} g.`,
          ficheKey: 'masses'
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'mesures', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation, ficheKey: s.ficheKey };

  } else if (subLevel === 2) {
    // CM2 (10 ans): m+cm→cm, h+min→min, kg+g→g
    const scenarios = [
      () => {
        const m = rand(1, 9);
        const cm = rand(10, 90);
        const answer = m * 100 + cm;
        return {
          text: `Convertis ${m} m et ${cm} cm en centimètres.`,
          unit: 'cm', answer,
          hint: `1 mètre = 100 centimètres.`,
          explanation: `${m} × 100 + ${cm} = ${answer} cm.`,
          ficheKey: 'longueurs'
        };
      },
      () => {
        const h = rand(1, 4);
        const m = rand(5, 55);
        const answer = h * 60 + m;
        return {
          text: `Convertis ${h} h ${m} min en minutes.`,
          unit: 'min', answer,
          hint: `1 heure = 60 minutes.`,
          explanation: `${h} × 60 + ${m} = ${answer} minutes.`,
          ficheKey: 'durees'
        };
      },
      () => {
        const kg = rand(1, 5);
        const g = rand(50, 900);
        const answer = kg * 1000 + g;
        return {
          text: `Convertis ${kg} kg ${g} g en grammes.`,
          unit: 'g', answer,
          hint: `1 kg = 1 000 g.`,
          explanation: `${kg} × 1 000 + ${g} = ${answer} g.`,
          ficheKey: 'masses'
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'mesures', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation, ficheKey: s.ficheKey };

  } else {
    // 6e (11-12 ans): km+m→m, vitesse×temps=distance, surface rectangulaire (m²)
    const scenarios = [
      () => {
        const km = rand(1, 9);
        const m = rand(50, 900);
        const answer = km * 1000 + m;
        return {
          text: `Convertis ${km} km et ${m} m en mètres.`,
          unit: 'm', answer,
          hint: `1 km = 1 000 m.`,
          explanation: `${km} × 1 000 + ${m} = ${answer} m.`,
          ficheKey: 'longueurs'
        };
      },
      () => {
        const vitesse = pick([30, 40, 50, 60, 80, 90, 100, 120]);
        const temps = rand(2, 5);
        const answer = vitesse * temps;
        return {
          text: `Une voiture roule à ${vitesse} km/h pendant ${temps} heures. Quelle distance parcourt-elle ?`,
          unit: 'km', answer,
          hint: `Distance = vitesse × temps.`,
          explanation: `${vitesse} × ${temps} = ${answer} km.`,
          ficheKey: 'vitesse'
        };
      },
      () => {
        const l = rand(5, 20);
        const w = rand(3, 15);
        const answer = l * w;
        return {
          text: `Un terrain rectangulaire mesure ${l} m de long et ${w} m de large. Quelle est sa surface ?`,
          unit: 'm²', answer,
          hint: `Surface = longueur × largeur.`,
          explanation: `${l} × ${w} = ${answer} m².`,
          ficheKey: 'aire'
        };
      }
    ];
    const s = pick(scenarios)();
    return { category: 'mesures', text: s.text, unit: s.unit, answer: s.answer, hint: s.hint, explanation: s.explanation, ficheKey: s.ficheKey };
  }
}

function generateOuvert(subLevel) {
  if (subLevel === 1) {
    // CE2 (8-9 ans): combinaisons simples, compléments
    const scenarios = [
      () => {
        const couleurs = rand(2, 5);
        const feuilles = rand(2, 4);
        const answer = couleurs * feuilles;
        return {
          text: `Tu as ${couleurs} couleurs de crayons et ${feuilles} feuilles différentes. Combien de dessins différents peux-tu faire (1 couleur par feuille) ?`,
          answer,
          hint: `Pour chaque couleur, tu peux choisir n'importe quelle feuille.`,
          explanation: `${couleurs} × ${feuilles} = ${answer} dessins possibles.`
        };
      },
      () => {
        const total = rand(20, 35);
        const aiment = rand(8, total - 5);
        const answer = total - aiment;
        return {
          text: `Dans une classe de ${total} élèves, ${aiment} aiment les maths. Combien préfèrent autre chose ?`,
          answer,
          hint: `Soustrais du total.`,
          explanation: `${total} − ${aiment} = ${answer} élèves.`
        };
      }
    ];
    const s = pick(scenarios)();
    return {
      category: 'ouvert',
      text: s.text,
      unit: '',
      answer: s.answer,
      hint: s.hint,
      explanation: s.explanation
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
    explanation: '20 − 5 + 8 = 23. Puis 23 − 3 + 9 = 29 passagers.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Tu as un billet de 20 €. Tu achètes un cahier à 5 € et 2 stylos à 3 € chacun. Combien te reste-t-il ?',
    unit: '€',
    answer: 9,
    hint: 'Calcule d\'abord le total dépensé.',
    explanation: 'Cahier : 5 €. Stylos : 2 × 3 = 6 €. Total : 11 €. Rendu : 20 − 11 = 9 €.',
    ficheKey: 'prix',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Au supermarché, Maman achète 3 paquets de biscuits à 4 € et 2 bouteilles de jus à 3 €. Papa lui donne un bon de réduction de 5 €. Combien paie-t-elle ?',
    unit: '€',
    answer: 13,
    hint: 'Additionne tout, puis retire la réduction.',
    explanation: 'Biscuits : 3 × 4 = 12 €. Jus : 2 × 3 = 6 €. Total : 18 €. Avec réduction : 18 − 5 = 13 €.',
    ficheKey: 'prix',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un boulanger prépare 12 croissants par fournée. Il fait 5 fournées le matin et 3 l\'après-midi. Il en donne 15 à ses voisins. Combien lui en reste-t-il ?',
    unit: '',
    answer: 81,
    hint: 'Calcule le total de fournées, puis retire les croissants donnés.',
    explanation: 'Total fournées : 5 + 3 = 8. Croissants : 8 × 12 = 96. Reste : 96 − 15 = 81.',
    ficheKey: 'multiplication',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Pour son anniversaire, Léa reçoit 25 € de ses parents, 15 € de sa mamie et 10 € de son oncle. Elle achète un livre à 18 € et un bracelet à 12 €. Combien lui reste-t-il ?',
    unit: '€',
    answer: 20,
    hint: 'Additionne les cadeaux, puis soustrais les achats.',
    explanation: 'Reçu : 25 + 15 + 10 = 50 €. Dépensé : 18 + 12 = 30 €. Reste : 50 − 30 = 20 €.',
    ficheKey: 'prix',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un cinéma a 15 rangées de 12 sièges. 47 places sont occupées. Combien de places sont libres ?',
    unit: '',
    answer: 133,
    hint: 'Calcule d\'abord le nombre total de sièges.',
    explanation: 'Total : 15 × 12 = 180 sièges. Libres : 180 − 47 = 133.',
    ficheKey: 'multiplication',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Dans un parking, il y a 4 étages. Chaque étage a 25 places pour les voitures et 10 places pour les motos. Combien de véhicules le parking peut-il accueillir en tout ?',
    unit: '',
    answer: 140,
    hint: 'Calcule les places par étage, puis multiplie par 4.',
    explanation: 'Par étage : 25 + 10 = 35 places. Total : 4 × 35 = 140 places.',
    ficheKey: 'multiplication',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un fermier ramasse 8 œufs par jour. Combien d\'œufs ramasse-t-il en 3 semaines ?',
    unit: '',
    answer: 168,
    hint: 'Combien de jours y a-t-il dans 3 semaines ?',
    explanation: '3 semaines = 21 jours. 21 × 8 = 168 œufs.',
    ficheKey: 'multiplication',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Au marché, tu achètes 4 pommes à 0,50 €, 3 bananes à 0,30 € et 1 pastèque à 3 €. Tu paies avec un billet de 10 €. Combien te rend-on ?',
    unit: '€',
    answer: 4.1,
    hint: 'Calcule le prix total de chaque fruit, puis soustrais de 10 €.',
    explanation: 'Pommes : 4 × 0,50 = 2 €. Bananes : 3 × 0,30 = 0,90 €. Pastèque : 3 €. Total : 5,90 €. Rendu : 10 − 5,90 = 4,10 €.',
    ficheKey: 'prix',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Une voiture roule à 60 km/h. Quelle distance parcourt-elle en 3 heures et demie ?',
    unit: 'km',
    answer: 210,
    hint: 'Distance = vitesse × temps. 3h30 = 3,5 heures.',
    explanation: '60 × 3,5 = 210 km.',
    ficheKey: 'vitesse',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Dans un stade, 25% des 400 spectateurs sont des enfants. Combien d\'adultes y a-t-il ?',
    unit: '',
    answer: 300,
    hint: '25% = un quart. Calcule les enfants, puis déduis les adultes.',
    explanation: '25% de 400 = 100 enfants. Adultes : 400 − 100 = 300.',
    ficheKey: 'pourcentages',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Pour faire un gâteau, il faut 200 g de farine. Tu veux faire 3 gâteaux et demi. Combien de grammes de farine te faut-il ?',
    unit: 'g',
    answer: 700,
    hint: 'Multiplie 200 g par 3,5.',
    explanation: '200 × 3,5 = 700 g de farine.',
    ficheKey: 'proportionnalite',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un magasin fait une réduction de 10 € sur un article à 65 €. Tu achètes 2 de ces articles en promotion. Combien paies-tu ?',
    unit: '€',
    answer: 110,
    hint: 'Calcule d\'abord le prix réduit d\'un article.',
    explanation: 'Prix réduit : 65 − 10 = 55 €. Pour 2 articles : 55 × 2 = 110 €.',
    ficheKey: 'prix',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Au football, l\'équipe A marque 3 buts en 1re mi-temps et 2 en 2e. L\'équipe B marque 1 but en 1re mi-temps et 4 en 2e. Combien de buts au total dans le match ?',
    unit: '',
    answer: 10,
    hint: 'Additionne tous les buts des deux équipes.',
    explanation: 'Équipe A : 3 + 2 = 5. Équipe B : 1 + 4 = 5. Total : 5 + 5 = 10 buts.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un avion transporte 180 passagers. 50% sont en classe économique, 30% en classe affaires et le reste en première classe. Combien sont en première classe ?',
    unit: '',
    answer: 36,
    hint: '50% + 30% = 80%. Combien reste-t-il de pourcentage ?',
    explanation: 'Première classe : 100% − 50% − 30% = 20%. 20% de 180 = 36 passagers.',
    ficheKey: 'pourcentages',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un libraire commande 5 cartons de 24 livres. Il en vend 78 le lundi et 32 le mardi. Combien lui en reste-t-il ?',
    unit: '',
    answer: 10,
    hint: 'Calcule le stock total, puis retire les ventes.',
    explanation: 'Stock : 5 × 24 = 120 livres. Vendus : 78 + 32 = 110. Reste : 120 − 110 = 10.',
    ficheKey: 'multiplication',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Mamie prépare des confitures. Elle remplit 12 pots le matin et 8 l\'après-midi. Chaque pot contient 250 g. Quel est le poids total de confiture en kg ?',
    unit: 'kg',
    answer: 5,
    hint: 'Calcule le nombre total de pots, puis le poids en grammes, et convertis en kg.',
    explanation: '12 + 8 = 20 pots. 20 × 250 = 5000 g = 5 kg.',
    ficheKey: 'masses',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Tu fais les courses avec 50 €. Tu achètes : 2 pizzas à 8 € chacune, 1 salade à 3 €, 4 yaourts à 1,50 € chacun et 1 jus à 2 €. Combien te reste-t-il ?',
    unit: '€',
    answer: 23,
    hint: 'Calcule le prix de chaque article puis le total.',
    explanation: 'Pizzas : 2 × 8 = 16 €. Salade : 3 €. Yaourts : 4 × 1,50 = 6 €. Jus : 2 €. Total : 27 €. Reste : 50 − 27 = 23 €.',
    ficheKey: 'prix',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un car scolaire fait 3 voyages par jour. Chaque voyage transporte 45 élèves. Combien d\'élèves le car transporte-t-il en 5 jours d\'école ?',
    unit: '',
    answer: 675,
    hint: 'Voyages par jour × élèves par voyage × nombre de jours.',
    explanation: '3 × 45 = 135 élèves/jour. 135 × 5 = 675 élèves.',
    ficheKey: 'multiplication',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Dans un jeu vidéo, tu gagnes 150 pièces par niveau. Tu perds 40 pièces à chaque défaite. Tu réussis 6 niveaux et échoues 3 fois. Combien de pièces as-tu ?',
    unit: '',
    answer: 780,
    hint: 'Calcule les gains et les pertes séparément.',
    explanation: 'Gains : 6 × 150 = 900. Pertes : 3 × 40 = 120. Total : 900 − 120 = 780 pièces.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un voyage en Suisse coûte 120 CHF pour un adulte et moitié prix pour un enfant. Combien paie une famille de 2 adultes et 3 enfants ?',
    unit: 'CHF',
    answer: 420,
    hint: 'Un enfant paie la moitié du prix adulte.',
    explanation: 'Adultes : 2 × 120 = 240 CHF. Enfants : 3 × 60 = 180 CHF. Total : 240 + 180 = 420 CHF.',
    ficheKey: 'prix',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un marathon fait 42 km. Un coureur a déjà parcouru les 3/4 de la course. Combien de km lui reste-t-il à courir ?',
    unit: 'km',
    answer: 10.5,
    hint: 'Calcule 3/4 de 42, puis soustrais de 42.',
    explanation: '3/4 de 42 = 31,5 km parcourus. Reste : 42 − 31,5 = 10,5 km.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Au zoo, il y a 3 fois plus de singes que de lions. Il y a 8 lions. Avec les 15 éléphants, combien d\'animaux y a-t-il en tout (singes + lions + éléphants) ?',
    unit: '',
    answer: 47,
    hint: 'Calcule d\'abord le nombre de singes.',
    explanation: 'Singes : 3 × 8 = 24. Total : 24 + 8 + 15 = 47 animaux.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Une piscine se remplit de 200 litres par heure. Elle contient déjà 1500 litres et doit atteindre 2300 litres. Dans combien d\'heures sera-t-elle pleine ?',
    unit: 'heures',
    answer: 4,
    hint: 'Calcule combien de litres manquent, puis divise par le débit.',
    explanation: 'Il manque : 2300 − 1500 = 800 litres. 800 ÷ 200 = 4 heures.',
    level: 2
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
    explanation: 'Les chiffres sont 7 et 3 (7+3=10, 7−3=4). Le nombre est 73.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Un escargot grimpe un mur de 10 m. Chaque jour il monte de 3 m, mais chaque nuit il redescend de 2 m. En combien de jours atteint-il le sommet ?',
    unit: 'jours',
    answer: 8,
    hint: 'Il progresse de 1 m par jour… mais le dernier jour, il ne redescend pas !',
    explanation: 'Chaque jour net : +1 m. Après 7 jours il est à 7 m. Le 8e jour il monte de 3 m → 10 m. Arrivé !',
    level: 2
  },
  {
    category: 'logique',
    text: 'Dans une ferme, il y a des poules et des lapins. On compte 20 têtes et 56 pattes. Combien y a-t-il de lapins ?',
    unit: '',
    answer: 8,
    hint: 'Chaque poule a 2 pattes, chaque lapin en a 4. Essaie avec des nombres !',
    explanation: 'Si 20 poules → 40 pattes. Il y a 56 − 40 = 16 pattes en trop. Chaque lapin ajoute 2 pattes. 16 ÷ 2 = 8 lapins.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Lors d\'une course, Léo dépasse le 2e. Emma est devant Léo. Hugo est juste derrière Léo. Qui est 2e ?',
    unit: '',
    answer: null,
    textAnswer: 'léo',
    hint: 'Si tu dépasses le 2e, tu prends sa place.',
    explanation: 'Léo dépasse le 2e → Léo est 2e. Emma est devant → Emma est 1re. Hugo derrière → Hugo est 3e.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Je suis un nombre. Si tu me multiplies par 6 et que tu ajoutes 4, tu obtiens 40. Qui suis-je ?',
    unit: '',
    answer: 6,
    hint: 'Pars de 40, retire 4, puis divise.',
    explanation: '40 − 4 = 36. 36 ÷ 6 = 6. Vérification : 6 × 6 + 4 = 40. ✓',
    level: 2
  },
  {
    category: 'logique',
    text: 'Alice a le double de l\'âge de Ben. La somme de leurs âges est 24 ans. Quel âge a Alice ?',
    unit: 'ans',
    answer: 16,
    hint: 'Si Ben a un âge, Alice a le double. Les deux ensemble font 24.',
    explanation: 'Ben = x, Alice = 2x. x + 2x = 24 → 3x = 24 → x = 8. Alice a 2 × 8 = 16 ans.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Je suis un nombre à deux chiffres. Mon chiffre des unités est le triple de mon chiffre des dizaines. La somme de mes chiffres est 8. Qui suis-je ?',
    unit: '',
    answer: 26,
    hint: 'Le chiffre des unités = 3 × le chiffre des dizaines.',
    explanation: 'Si dizaines = 2, unités = 3 × 2 = 6. Vérif : 2 + 6 = 8. ✓ Le nombre est 26.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Un père a 40 ans. Son fils a 12 ans. Dans combien d\'années le père aura-t-il exactement le double de l\'âge de son fils ?',
    unit: 'ans',
    answer: 16,
    hint: 'Appelle x le nombre d\'années. Le père aura 40+x, le fils 12+x.',
    explanation: '40 + x = 2 × (12 + x) → 40 + x = 24 + 2x → 16 = x. Dans 16 ans : père = 56, fils = 28. ✓',
    level: 2
  },
  {
    category: 'logique',
    text: 'Je pense à un nombre. Je le multiplie par 5, j\'ajoute 3, puis je divise par 2. J\'obtiens 14. Quel est mon nombre ?',
    unit: '',
    answer: 5,
    hint: 'Remonte les opérations à l\'envers : multiplie par 2, retire 3, divise par 5.',
    explanation: '14 × 2 = 28. 28 − 3 = 25. 25 ÷ 5 = 5. Vérif : 5 × 5 = 25, + 3 = 28, ÷ 2 = 14. ✓',
    level: 2
  },
  {
    category: 'logique',
    text: 'Je suis un nombre à deux chiffres. Je suis un multiple de 7 et la somme de mes chiffres est 9. Qui suis-je ?',
    unit: '',
    answer: 63,
    hint: 'Liste les multiples de 7 à deux chiffres et vérifie la somme des chiffres.',
    explanation: 'Multiples de 7 à 2 chiffres : 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84, 91, 98. Seul 63 a une somme de chiffres = 9 (6+3=9). ✓',
    level: 2
  },
  {
    category: 'logique',
    text: 'Marie a 3 ans de plus que Lucas. Ensemble, ils ont 19 ans. Quel âge a Lucas ?',
    unit: 'ans',
    answer: 8,
    hint: 'Si Lucas a x ans, Marie a x + 3.',
    explanation: 'Lucas = x, Marie = x + 3. x + x + 3 = 19 → 2x = 16 → x = 8. Lucas a 8 ans.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Trois amis comparent leurs tailles. Tom est plus grand que Jules. Jules est plus grand que Sara. Qui est le plus petit ?',
    unit: '',
    answer: null,
    textAnswer: 'sara',
    hint: 'Classe-les du plus grand au plus petit.',
    explanation: 'Tom > Jules > Sara. Sara est la plus petite.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Je suis un nombre. Si tu m\'ajoutes 7 puis tu multiplies par 3, tu obtiens 42. Qui suis-je ?',
    unit: '',
    answer: 7,
    hint: 'Pars de 42, divise par 3, puis retire 7.',
    explanation: '42 ÷ 3 = 14. 14 − 7 = 7. Vérif : (7 + 7) × 3 = 14 × 3 = 42. ✓',
    level: 2
  },
  {
    category: 'logique',
    text: 'Dans un tiroir, il y a des chaussettes rouges et des bleues. Il fait noir. Combien de chaussettes dois-tu prendre au minimum pour être sûr d\'avoir une paire de la même couleur ?',
    unit: '',
    answer: 3,
    hint: 'Pense au pire cas : les 2 premières pourraient être de couleurs différentes.',
    explanation: 'Pire cas : 1re rouge, 2e bleue. La 3e sera forcément rouge ou bleue → tu auras une paire. Réponse : 3.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Aujourd\'hui c\'est mercredi. Quel jour serons-nous dans 10 jours ?',
    unit: '',
    answer: null,
    textAnswer: 'samedi',
    hint: '7 jours = 1 semaine complète. 10 = 7 + 3.',
    explanation: '10 jours = 1 semaine + 3 jours. Mercredi + 3 jours = samedi.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Trouve le nombre suivant : 1, 1, 2, 3, 5, 8, 13, ?',
    unit: '',
    answer: 21,
    hint: 'Chaque nombre est la somme des deux précédents.',
    explanation: 'Suite de Fibonacci : 8 + 13 = 21.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Un nombre palindrome se lit de la même façon dans les deux sens (ex : 121). Combien y a-t-il de palindromes à 3 chiffres entre 100 et 200 ?',
    unit: '',
    answer: 10,
    hint: 'Le 1er et le 3e chiffre doivent être identiques. Le 1er chiffre est 1.',
    explanation: 'Forme : 1_1. Le chiffre du milieu peut être 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 → 10 palindromes (101, 111, 121… 191).',
    level: 2
  },
  {
    category: 'logique',
    text: 'Paul, Léa et Tom font la queue. Paul n\'est pas premier. Tom est juste après Léa. Qui est en 2e position ?',
    unit: '',
    answer: null,
    textAnswer: 'tom',
    hint: 'Tom est juste après Léa, donc Léa est avant Tom.',
    explanation: 'Tom est après Léa → Léa puis Tom. Paul n\'est pas 1er → Paul est 3e. Ordre : Léa, Tom, Paul. Tom est 2e.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Je suis un nombre entre 1 et 50. Je suis un multiple de 3 ET de 5. Combien de nombres correspondent ?',
    unit: '',
    answer: 3,
    hint: 'Un multiple de 3 ET de 5 est un multiple de 15.',
    explanation: 'Multiples de 15 entre 1 et 50 : 15, 30, 45. Il y en a 3.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Une maman a 3 enfants : Anna, Bianca et Carlos. Anna a 5 ans de plus que Bianca. Carlos a 2 ans de moins que Bianca. La somme de leurs âges est 30. Quel âge a Bianca ?',
    unit: 'ans',
    answer: 9,
    hint: 'Pose Bianca = x. Exprime les autres en fonction de x.',
    explanation: 'Bianca = x, Anna = x + 5, Carlos = x − 2. x + (x+5) + (x−2) = 30 → 3x + 3 = 30 → 3x = 27 → x = 9. Bianca a 9 ans.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Sur une balance, 3 pommes pèsent autant que 6 oranges. Si une orange pèse 100 g, combien pèse une pomme ?',
    unit: 'g',
    answer: 200,
    hint: '3 pommes = 6 oranges. Simplifie : 1 pomme = ? oranges.',
    explanation: '3 pommes = 6 oranges → 1 pomme = 2 oranges = 2 × 100 = 200 g.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Je pense à un nombre. Je le double, j\'ajoute 10, puis je divise par 4. J\'obtiens 5. Quel est mon nombre ?',
    unit: '',
    answer: 5,
    hint: 'Remonte à l\'envers : multiplie par 4, retire 10, divise par 2.',
    explanation: '5 × 4 = 20. 20 − 10 = 10. 10 ÷ 2 = 5. Vérif : 5 × 2 = 10, + 10 = 20, ÷ 4 = 5. ✓',
    level: 2
  },
  {
    category: 'logique',
    text: 'Trouve le nombre suivant : 2, 6, 12, 20, 30, ?',
    unit: '',
    answer: 42,
    hint: 'Regarde les différences entre chaque nombre : 4, 6, 8, 10…',
    explanation: 'Différences : 4, 6, 8, 10 → la suivante est 12. Donc 30 + 12 = 42.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Dans un groupe de 25 élèves, 15 aiment le foot, 12 aiment le basket, et 5 aiment les deux. Combien d\'élèves n\'aiment ni le foot ni le basket ?',
    unit: '',
    answer: 3,
    hint: 'Ceux qui aiment au moins un sport = foot + basket − les deux.',
    explanation: 'Au moins un sport : 15 + 12 − 5 = 22. Ni l\'un ni l\'autre : 25 − 22 = 3 élèves.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Un gardien de phare dit toujours la vérité. Il dit : « J\'ai plus de 30 ans mais moins de 40 ans. Mon âge est un multiple de 6. » Quel âge a-t-il ?',
    unit: 'ans',
    answer: 36,
    hint: 'Liste les multiples de 6 entre 30 et 40.',
    explanation: 'Multiples de 6 entre 30 et 40 : 36. C\'est le seul ! Il a 36 ans.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Trouve le nombre suivant : 1, 4, 9, 16, 25, ?',
    unit: '',
    answer: 36,
    hint: 'Ce sont des carrés parfaits : 1², 2², 3²…',
    explanation: '1², 2², 3², 4², 5², 6² = 36.',
    level: 2
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
    explanation: 'Côté = 36 ÷ 4 = 9 cm. Aire = 9 × 9 = 81 cm².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un rectangle a une aire de 48 cm² et une largeur de 6 cm. Quel est son périmètre ?',
    unit: 'cm',
    answer: 28,
    hint: 'Trouve d\'abord la longueur à partir de l\'aire.',
    explanation: 'Longueur = 48 ÷ 6 = 8 cm. Périmètre = 2 × (8 + 6) = 28 cm.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Combien de faces a un cube ?',
    unit: '',
    answer: 6,
    hint: 'Pense à un dé : dessus, dessous, devant, derrière, gauche, droite.',
    explanation: 'Un cube a 6 faces carrées.',
    ficheKey: 'solides',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un triangle a des côtés de 7 cm, 8 cm et 5 cm. Quel est son périmètre ?',
    unit: 'cm',
    answer: 20,
    hint: 'Le périmètre, c\'est la somme de tous les côtés.',
    explanation: '7 + 8 + 5 = 20 cm.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un terrain de foot rectangulaire mesure 100 m de long et 60 m de large. Un joueur fait le tour complet du terrain en courant. Quelle distance parcourt-il ?',
    unit: 'm',
    answer: 320,
    hint: 'C\'est le périmètre du rectangle.',
    explanation: 'Périmètre = 2 × (100 + 60) = 2 × 160 = 320 m.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'On veut carreler un sol rectangulaire de 4 m sur 3 m avec des carreaux carrés de 1 m de côté. Combien faut-il de carreaux ?',
    unit: '',
    answer: 12,
    hint: 'C\'est l\'aire du rectangle.',
    explanation: 'Aire = 4 × 3 = 12 m². Il faut 12 carreaux.',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Combien d\'arêtes a un cube ?',
    unit: '',
    answer: 12,
    hint: 'Une arête est un segment entre deux sommets. Compte les arêtes du haut, du bas, et les verticales.',
    explanation: '4 arêtes en haut + 4 en bas + 4 verticales = 12 arêtes.',
    ficheKey: 'solides',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Une piscine rectangulaire mesure 10 m de long et 5 m de large. On veut poser une barrière tout autour avec un portillon de 1 m. Quelle longueur de barrière faut-il acheter ?',
    unit: 'm',
    answer: 29,
    hint: 'Calcule le périmètre, puis retire la largeur du portillon.',
    explanation: 'Périmètre = 2 × (10 + 5) = 30 m. On retire 1 m pour le portillon : 30 − 1 = 29 m.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Quel est le volume d\'un cube de 4 cm de côté ?',
    unit: 'cm³',
    answer: 64,
    hint: 'Volume du cube = côté × côté × côté.',
    explanation: '4 × 4 × 4 = 64 cm³.',
    ficheKey: 'volume',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Combien de faces a une pyramide à base carrée ?',
    unit: '',
    answer: 5,
    hint: 'Compte la base et les faces triangulaires sur les côtés.',
    explanation: '1 base carrée + 4 faces triangulaires = 5 faces.',
    ficheKey: 'solides',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un cercle a un diamètre de 10 cm. Quel est son rayon ?',
    unit: 'cm',
    answer: 5,
    hint: 'Le rayon est la moitié du diamètre.',
    explanation: 'Rayon = diamètre ÷ 2 = 10 ÷ 2 = 5 cm.',
    ficheKey: 'droites',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un triangle a deux angles de 45° et 90°. Combien mesure le troisième angle ?',
    unit: '°',
    answer: 45,
    hint: 'La somme des angles d\'un triangle fait toujours 180°.',
    explanation: '180 − 45 − 90 = 45°.',
    ficheKey: 'angles',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Une chambre rectangulaire mesure 5 m de long et 4 m de large. On veut la couvrir de moquette à 12 € le m². Combien coûte la moquette ?',
    unit: '€',
    answer: 240,
    hint: 'Calcule l\'aire de la chambre, puis multiplie par le prix au m².',
    explanation: 'Aire = 5 × 4 = 20 m². Coût : 20 × 12 = 240 €.',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Combien de sommets a un cube ?',
    unit: '',
    answer: 8,
    hint: 'Un sommet est un coin. Compte ceux du haut et du bas.',
    explanation: '4 sommets en haut + 4 sommets en bas = 8 sommets.',
    ficheKey: 'solides',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Une forme en L est composée de 2 rectangles : un de 6 cm × 2 cm et un de 3 cm × 2 cm. Quelle est l\'aire totale ?',
    unit: 'cm²',
    answer: 18,
    hint: 'Calcule l\'aire de chaque rectangle et additionne.',
    explanation: 'Rectangle 1 : 6 × 2 = 12 cm². Rectangle 2 : 3 × 2 = 6 cm². Total : 12 + 6 = 18 cm².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un jardin carré a un côté de 8 m. On veut l\'entourer d\'une clôture qui coûte 15 € par mètre. Quel est le coût total ?',
    unit: '€',
    answer: 480,
    hint: 'Calcule d\'abord le périmètre du carré.',
    explanation: 'Périmètre = 4 × 8 = 32 m. Coût : 32 × 15 = 480 €.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Combien d\'axes de symétrie possède un carré ?',
    unit: '',
    answer: 4,
    hint: 'Pense aux axes horizontaux, verticaux et diagonaux.',
    explanation: '1 horizontal + 1 vertical + 2 diagonaux = 4 axes de symétrie.',
    ficheKey: 'symetrie',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un triangle équilatéral a un périmètre de 27 cm. Quelle est la longueur d\'un côté ?',
    unit: 'cm',
    answer: 9,
    hint: 'Dans un triangle équilatéral, les 3 côtés sont égaux.',
    explanation: '27 ÷ 3 = 9 cm par côté.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Sur un quadrillage, on dessine un rectangle de 5 cases de long et 3 cases de large. Combien de cases couvre-t-il ?',
    unit: '',
    answer: 15,
    hint: 'C\'est comme calculer une aire.',
    explanation: '5 × 3 = 15 cases.',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un prisme triangulaire (comme une boîte de Toblerone) a combien de faces ?',
    unit: '',
    answer: 5,
    hint: 'Il a 2 bases triangulaires et des faces rectangulaires sur les côtés.',
    explanation: '2 faces triangulaires (bases) + 3 faces rectangulaires (côtés) = 5 faces.',
    ficheKey: 'solides',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un terrain rectangulaire mesure 12 m sur 8 m. On place une allée de 2 m de large tout le long d\'un côté de 12 m. Quelle est l\'aire de l\'allée ?',
    unit: 'm²',
    answer: 24,
    hint: 'L\'allée est un rectangle de 12 m × 2 m.',
    explanation: 'Aire de l\'allée = 12 × 2 = 24 m².',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Dans un triangle, un angle mesure 60° et un autre mesure 70°. Combien mesure le troisième ?',
    unit: '°',
    answer: 50,
    hint: 'La somme des 3 angles d\'un triangle = 180°.',
    explanation: '180 − 60 − 70 = 50°.',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Combien d\'axes de symétrie possède un triangle équilatéral ?',
    unit: '',
    answer: 3,
    hint: 'Chaque axe passe par un sommet et le milieu du côté opposé.',
    explanation: 'Un triangle équilatéral a 3 axes de symétrie.',
    ficheKey: 'symetrie',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un cube a un volume de 27 cm³. Quelle est la longueur de son côté ?',
    unit: 'cm',
    answer: 3,
    hint: 'Quel nombre multiplié par lui-même 3 fois donne 27 ?',
    explanation: '3 × 3 × 3 = 27. Le côté mesure 3 cm.',
    ficheKey: 'volume',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Une forme en T est composée d\'un rectangle de 6 cm × 2 cm (horizontal) et d\'un rectangle de 2 cm × 4 cm (vertical, centré en dessous). Quelle est l\'aire totale ?',
    unit: 'cm²',
    answer: 20,
    hint: 'Calcule l\'aire de chaque rectangle séparément.',
    explanation: 'Rectangle horizontal : 6 × 2 = 12 cm². Rectangle vertical : 2 × 4 = 8 cm². Total : 12 + 8 = 20 cm².',
    ficheKey: 'aire',
    level: 2
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
    explanation: '6 − 2 − 3 = 1 part restante.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Une pizza est coupée en 8 parts égales. Tu en manges 3/8 et ton ami en mange 2/8. Combien de parts reste-t-il ?',
    unit: '',
    answer: 3,
    hint: 'Additionne les parts mangées, puis soustrais du total.',
    explanation: '3 + 2 = 5 parts mangées. 8 − 5 = 3 parts restantes.',
    ficheKey: 'fractions_additionner',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Dans une classe de 30 élèves, 1/3 des élèves portent des lunettes. Combien d\'élèves portent des lunettes ?',
    unit: '',
    answer: 10,
    hint: 'Divise le nombre d\'élèves par 3.',
    explanation: '1/3 de 30 = 30 ÷ 3 = 10 élèves.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Tu as 24 bonbons. Tu en donnes 1/4 à ton frère et 1/6 à ta sœur. Combien t\'en reste-t-il ?',
    unit: '',
    answer: 14,
    hint: 'Calcule 1/4 de 24 et 1/6 de 24 séparément.',
    explanation: '1/4 de 24 = 6 bonbons. 1/6 de 24 = 4 bonbons. Donné : 6 + 4 = 10. Reste : 24 − 10 = 14.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Quelle fraction est la plus grande : 3/4 ou 2/3 ? Donne le numérateur de la plus grande.',
    unit: '',
    answer: 3,
    hint: 'Mets les deux fractions au même dénominateur pour comparer.',
    explanation: '3/4 = 9/12 et 2/3 = 8/12. Comme 9/12 > 8/12, c\'est 3/4 la plus grande. Numérateur = 3.',
    ficheKey: 'fractions_comparer',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un réservoir de 60 litres est rempli aux 3/5. Combien de litres contient-il ?',
    unit: 'litres',
    answer: 36,
    hint: 'Calcule d\'abord 1/5 de 60, puis multiplie par 3.',
    explanation: '1/5 de 60 = 12 litres. 3/5 = 3 × 12 = 36 litres.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Une tablette de chocolat a 24 carrés. Emma mange 1/4 de la tablette, puis Lucas mange 1/3 de ce qui reste. Combien de carrés reste-t-il ?',
    unit: '',
    answer: 12,
    hint: 'Attention : Lucas mange 1/3 de ce qui RESTE, pas de la tablette entière.',
    explanation: 'Emma : 1/4 de 24 = 6 carrés. Reste : 24 − 6 = 18. Lucas : 1/3 de 18 = 6 carrés. Reste : 18 − 6 = 12.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un ruban mesure 40 cm. On en coupe les 3/8. Quelle est la longueur du morceau coupé ?',
    unit: 'cm',
    answer: 15,
    hint: 'Calcule 3/8 de 40.',
    explanation: '1/8 de 40 = 5 cm. 3/8 = 3 × 5 = 15 cm.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Combien font 1/4 en pourcentage ?',
    unit: '%',
    answer: 25,
    hint: 'Divise 100 par 4.',
    explanation: '1/4 = 1 ÷ 4 = 0,25 = 25%.',
    ficheKey: 'fractions_decimales',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Combien font 3/5 en pourcentage ?',
    unit: '%',
    answer: 60,
    hint: '1/5 = 20%. Multiplie par 3.',
    explanation: '3/5 = 3 ÷ 5 = 0,60 = 60%.',
    ficheKey: 'fractions_decimales',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un héritage de 12 000 € est partagé entre 3 frères. L\'aîné reçoit 1/2, le cadet 1/3 et le benjamin le reste. Combien reçoit le benjamin ?',
    unit: '€',
    answer: 2000,
    hint: 'Calcule la part de l\'aîné et du cadet, puis déduis le reste.',
    explanation: 'Aîné : 1/2 de 12 000 = 6 000 €. Cadet : 1/3 de 12 000 = 4 000 €. Benjamin : 12 000 − 6 000 − 4 000 = 2 000 €.',
    ficheKey: 'partage',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Classe ces fractions de la plus petite à la plus grande : 1/2, 1/3, 1/4. Quel est le dénominateur de la plus petite ?',
    unit: '',
    answer: 4,
    hint: 'Plus le dénominateur est grand, plus la fraction est petite.',
    explanation: '1/4 < 1/3 < 1/2. La plus petite est 1/4, son dénominateur est 4.',
    ficheKey: 'fractions_comparer',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Quelle fraction est équivalente à 2/6 ? Donne le dénominateur de la fraction simplifiée.',
    unit: '',
    answer: 3,
    hint: 'Divise le numérateur et le dénominateur par le même nombre.',
    explanation: '2/6 = 1/3 (on divise par 2). Le dénominateur simplifié est 3.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Dans une classe de 32 élèves, 3/8 sont des filles. Combien y a-t-il de garçons ?',
    unit: '',
    answer: 20,
    hint: 'Calcule d\'abord le nombre de filles.',
    explanation: 'Filles : 3/8 de 32 = 12. Garçons : 32 − 12 = 20.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Tu manges 1/3 d\'une tarte le lundi, puis 1/4 de ce qui reste le mardi. Il restait 24 parts à l\'origine. Combien de parts reste-t-il après mardi ?',
    unit: '',
    answer: 12,
    hint: 'Attention : mardi tu manges 1/4 du RESTE, pas de la tarte entière.',
    explanation: 'Lundi : 1/3 de 24 = 8 parts mangées. Reste : 24 − 8 = 16. Mardi : 1/4 de 16 = 4 parts mangées. Reste : 16 − 4 = 12.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Combien font 2/3 + 1/6 ? Donne le numérateur (sur un dénominateur de 6).',
    unit: '',
    answer: 5,
    hint: 'Mets 2/3 au dénominateur 6 : 2/3 = ?/6.',
    explanation: '2/3 = 4/6. Donc 4/6 + 1/6 = 5/6. Le numérateur est 5.',
    ficheKey: 'fractions_additionner',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un aquarium contient 60 poissons. 2/5 sont rouges, 1/3 sont bleus, le reste sont jaunes. Combien y a-t-il de poissons jaunes ?',
    unit: '',
    answer: 16,
    hint: 'Calcule les rouges et les bleus, puis déduis les jaunes.',
    explanation: 'Rouges : 2/5 de 60 = 24. Bleus : 1/3 de 60 = 20. Jaunes : 60 − 24 − 20 = 16.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Combien vaut 3/4 de 48 bonbons ?',
    unit: '',
    answer: 36,
    hint: 'Calcule d\'abord 1/4 de 48.',
    explanation: '1/4 de 48 = 12. 3/4 = 3 × 12 = 36 bonbons.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Quel nombre est le plus grand : 5/8 ou 7/12 ? Donne le numérateur du plus grand.',
    unit: '',
    answer: 5,
    hint: 'Mets les deux au même dénominateur (24).',
    explanation: '5/8 = 15/24. 7/12 = 14/24. 15/24 > 14/24. Le plus grand est 5/8, numérateur = 5.',
    ficheKey: 'fractions_comparer',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un terrain de 120 m² est divisé en 4 parcelles égales. On plante des fleurs sur 3 parcelles. Quelle surface est fleurie ?',
    unit: 'm²',
    answer: 90,
    hint: '3 parcelles sur 4, c\'est 3/4 du terrain.',
    explanation: '3/4 de 120 = 90 m².',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Combien font 1/2 en pourcentage ?',
    unit: '%',
    answer: 50,
    hint: 'La moitié de 100, c\'est…',
    explanation: '1/2 = 0,50 = 50%.',
    ficheKey: 'fractions_decimales',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Une recette demande 3/4 de litre de lait. Tu veux faire la moitié de la recette. Combien de mL de lait te faut-il ?',
    unit: 'mL',
    answer: 375,
    hint: '3/4 de litre = 750 mL. La moitié de ça…',
    explanation: '3/4 L = 750 mL. La moitié : 750 ÷ 2 = 375 mL.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Tu as 36 billes. Tu en donnes 2/9 à Paul et 1/4 à Marie. Combien t\'en reste-t-il ?',
    unit: '',
    answer: 19,
    hint: 'Calcule 2/9 de 36 et 1/4 de 36 séparément.',
    explanation: 'Paul : 2/9 de 36 = 8. Marie : 1/4 de 36 = 9. Donné : 8 + 9 = 17. Reste : 36 − 17 = 19.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Quelle fraction de 1 heure représente 15 minutes ? Donne le dénominateur.',
    unit: '',
    answer: 4,
    hint: '1 heure = 60 minutes. 15/60 = ?',
    explanation: '15/60 = 1/4. Le dénominateur est 4.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un sac contient 40 bonbons. 1/5 sont à la fraise, 3/10 au citron, et le reste au chocolat. Combien sont au chocolat ?',
    unit: '',
    answer: 20,
    hint: 'Calcule les bonbons fraise et citron, puis déduis.',
    explanation: 'Fraise : 1/5 de 40 = 8. Citron : 3/10 de 40 = 12. Chocolat : 40 − 8 − 12 = 20.',
    level: 2
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
    explanation: '1h55 = 60 + 55 = 115 minutes.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un train part à 9h15 et arrive à 11h45. Combien de minutes a duré le trajet ?',
    unit: 'minutes',
    answer: 150,
    hint: 'Calcule d\'abord les heures, puis les minutes.',
    explanation: 'De 9h15 à 11h15 = 2h = 120 min. De 11h15 à 11h45 = 30 min. Total : 120 + 30 = 150 minutes.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un cycliste roule à 15 km/h pendant 2 heures. Quelle distance a-t-il parcourue ?',
    unit: 'km',
    answer: 30,
    hint: 'Distance = vitesse × temps.',
    explanation: '15 km/h × 2 h = 30 km.',
    ficheKey: 'vitesse',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un sac de pommes pèse 2 kg 350 g. Un sac de poires pèse 1 kg 700 g. Quel est le poids total en grammes ?',
    unit: 'g',
    answer: 4050,
    hint: 'Convertis d\'abord tout en grammes.',
    explanation: '2 kg 350 g = 2350 g. 1 kg 700 g = 1700 g. Total : 2350 + 1700 = 4050 g.',
    ficheKey: 'masses',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Il est 16h40. Le cours de natation commence dans 1h35. À quelle heure commence-t-il ? Donne uniquement les minutes de l\'heure de début.',
    unit: '',
    answer: 15,
    hint: '16h40 + 1h35 : attention au passage au-dessus de 60 minutes.',
    explanation: '16h40 + 1h = 17h40. 17h40 + 35 min = 18h15. Les minutes sont 15.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Tu achètes 3 baguettes à 1,20 € chacune et un croissant à 1,50 €. Tu paies avec un billet de 10 €. Combien te rend-on ?',
    unit: '€',
    answer: 4.9,
    hint: 'Calcule le total dépensé, puis soustrais de 10 €.',
    explanation: '3 × 1,20 = 3,60 €. Total : 3,60 + 1,50 = 5,10 €. Rendu : 10 − 5,10 = 4,90 €.',
    ficheKey: 'prix',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Le matin il fait −3°C. L\'après-midi la température monte de 11 degrés. Quelle est la température l\'après-midi ?',
    unit: '°C',
    answer: 8,
    hint: 'Pars de −3 et ajoute 11.',
    explanation: '−3 + 11 = 8°C.',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Une corde mesure 2 m 40 cm. On en coupe un morceau de 85 cm. Combien de centimètres reste-t-il ?',
    unit: 'cm',
    answer: 155,
    hint: 'Convertis d\'abord tout en centimètres.',
    explanation: '2 m 40 cm = 240 cm. 240 − 85 = 155 cm.',
    ficheKey: 'longueurs',
    level: 2
  },
  {
    category: 'mesures',
    text: 'À Paris il est 14h00. À New York, il y a 6 heures de décalage en moins. Quelle heure est-il à New York ?',
    unit: 'h',
    answer: 8,
    hint: 'New York est en retard sur Paris.',
    explanation: '14h − 6h = 8h. Il est 8h du matin à New York.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un sprinter court le 100 m en 10 secondes. Quelle est sa vitesse en km/h ?',
    unit: 'km/h',
    answer: 36,
    hint: '100 m en 10 s → combien en 1 seconde ? Et en 1 heure (3600 secondes) ?',
    explanation: '100 m / 10 s = 10 m/s. En km/h : 10 × 3,6 = 36 km/h.',
    ficheKey: 'vitesse',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Sur une carte, 1 cm représente 5 km. Deux villes sont séparées de 7 cm sur la carte. Quelle est la distance réelle ?',
    unit: 'km',
    answer: 35,
    hint: 'Multiplie la distance sur la carte par l\'échelle.',
    explanation: '7 × 5 = 35 km.',
    ficheKey: 'conversions',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Une bouteille contient 1,5 L de jus. Tu verses 3 verres de 250 mL. Combien de mL reste-t-il dans la bouteille ?',
    unit: 'mL',
    answer: 750,
    hint: '1,5 L = 1500 mL. Soustrais les 3 verres.',
    explanation: '1,5 L = 1500 mL. Versé : 3 × 250 = 750 mL. Reste : 1500 − 750 = 750 mL.',
    ficheKey: 'capacites',
    level: 2
  },
  {
    category: 'mesures',
    text: 'L\'eau gèle à 0°C et bout à 100°C. Quelle est la différence de température entre le point d\'ébullition et le point de congélation ?',
    unit: '°C',
    answer: 100,
    hint: 'C\'est une simple soustraction.',
    explanation: '100 − 0 = 100°C de différence.',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un film dure 2 heures 15 minutes et 30 secondes. Combien de secondes cela fait-il au total ?',
    unit: 's',
    answer: 8130,
    hint: 'Convertis d\'abord les heures en minutes, puis tout en secondes.',
    explanation: '2h = 120 min. 120 + 15 = 135 min. 135 × 60 = 8100 s. 8100 + 30 = 8130 s.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Pour une recette, il faut 750 g de farine et 500 mL de lait. Tu as 2 kg de farine. Combien de recettes peux-tu faire (en te basant sur la farine seulement) ?',
    unit: '',
    answer: 2,
    hint: '2 kg = 2000 g. Divise par 750 g et prends la partie entière.',
    explanation: '2000 ÷ 750 = 2,67. On ne peut faire que 2 recettes complètes.',
    ficheKey: 'masses',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un match de foot dure 2 × 45 minutes avec 15 minutes de pause. Combien de minutes dure le match au total ?',
    unit: 'min',
    answer: 105,
    hint: 'Additionne les deux mi-temps et la pause.',
    explanation: '45 + 45 + 15 = 105 minutes.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un coureur fait 3 tours de piste de 400 m en 4 minutes et 30 secondes. Quelle distance a-t-il parcourue en mètres ?',
    unit: 'm',
    answer: 1200,
    hint: 'Le temps ne compte pas ici, seulement la distance.',
    explanation: '3 tours × 400 m = 1200 m.',
    ficheKey: 'longueurs',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Tu achètes 1 kg 250 g de pommes et 800 g de poires. Quel poids total portes-tu en grammes ?',
    unit: 'g',
    answer: 2050,
    hint: 'Convertis tout en grammes.',
    explanation: '1 kg 250 g = 1250 g. Total : 1250 + 800 = 2050 g.',
    ficheKey: 'masses',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Sur une carte au 1/10 000, une rivière mesure 8 cm. Quelle est sa longueur réelle en mètres ?',
    unit: 'm',
    answer: 800,
    hint: '1 cm sur la carte = 10 000 cm en réalité = 100 m.',
    explanation: '8 cm × 10 000 = 80 000 cm = 800 m.',
    ficheKey: 'conversions',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Une baignoire se remplit avec un robinet qui débite 12 litres par minute. Combien de litres coulent en 8 minutes et 30 secondes ?',
    unit: 'litres',
    answer: 102,
    hint: '8 min 30 s = 8,5 minutes.',
    explanation: '12 × 8,5 = 102 litres.',
    ficheKey: 'capacites',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Il est 23h40. Dans combien de minutes sera-t-il minuit ?',
    unit: 'min',
    answer: 20,
    hint: 'Minuit = 24h00.',
    explanation: 'De 23h40 à 24h00 = 20 minutes.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un train roule à 120 km/h. Combien de temps met-il pour parcourir 60 km ?',
    unit: 'min',
    answer: 30,
    hint: 'Temps = distance ÷ vitesse.',
    explanation: '60 ÷ 120 = 0,5 heure = 30 minutes.',
    ficheKey: 'vitesse',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un gâteau nécessite un four à 180°C pendant 45 min. Tu le mets au four à 10h20. À quelle heure le sors-tu ? Donne les minutes.',
    unit: '',
    answer: 5,
    hint: '10h20 + 45 min. Attention au passage au-dessus de 60.',
    explanation: '10h20 + 40 min = 11h00. + 5 min = 11h05. Les minutes sont 5.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un nageur fait 50 m en 30 secondes. À cette vitesse, combien de mètres nage-t-il en 2 minutes ?',
    unit: 'm',
    answer: 200,
    hint: '2 minutes = 120 secondes. Combien de fois 30 s dans 120 s ?',
    explanation: '120 ÷ 30 = 4 longueurs. 4 × 50 = 200 m.',
    ficheKey: 'vitesse',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Une recette demande 3 dL de crème. Combien cela fait-il en mL ?',
    unit: 'mL',
    answer: 300,
    hint: '1 dL = 100 mL.',
    explanation: '3 dL = 3 × 100 = 300 mL.',
    ficheKey: 'capacites',
    level: 2
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
    explanation: '3 choix pour les dizaines × 2 choix pour les unités = 6 nombres : 12, 13, 21, 23, 31, 32.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Au restaurant, tu peux choisir 1 entrée parmi 3, 1 plat parmi 4 et 1 dessert parmi 2. Combien de menus différents peux-tu composer ?',
    unit: '',
    answer: 24,
    hint: 'Multiplie le nombre de choix à chaque étape.',
    explanation: '3 × 4 × 2 = 24 menus différents.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu lances 2 dés. De combien de façons peux-tu obtenir un total de 7 ?',
    unit: '',
    answer: 6,
    hint: 'Le 1er dé peut faire 1 à 6. Pour chaque valeur, cherche ce que le 2e dé doit faire.',
    explanation: '(1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 façons.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Combien y a-t-il de carrés en tout sur un échiquier 3×3 ? (Pas seulement les petits !)',
    unit: '',
    answer: 14,
    hint: 'Il y a des carrés de taille 1×1, 2×2 et 3×3.',
    explanation: '9 carrés 1×1 + 4 carrés 2×2 + 1 carré 3×3 = 14 carrés.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu as 4 drapeaux de couleurs différentes. De combien de façons peux-tu les aligner sur une rangée ?',
    unit: '',
    answer: 24,
    hint: 'Pour le 1er, tu as 4 choix. Pour le 2e, 3 choix. Et ainsi de suite.',
    explanation: '4 × 3 × 2 × 1 = 24 arrangements possibles.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Dans un carré magique 3×3, la somme de chaque ligne, colonne et diagonale est 15. Le centre est 5, le coin haut-gauche est 2. Quel nombre est dans le coin bas-droit ?',
    unit: '',
    answer: 8,
    hint: 'La diagonale haut-gauche → bas-droit doit faire 15.',
    explanation: 'Diagonale : 2 + 5 + ? = 15 → ? = 15 − 7 = 8.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'On plie une feuille de papier en 2. Puis encore en 2. Puis encore en 2. Combien de couches d\'épaisseur a la feuille ?',
    unit: '',
    answer: 8,
    hint: 'Chaque pliage double le nombre de couches.',
    explanation: '1er pliage : 2. 2e pliage : 4. 3e pliage : 8 couches.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu dois monter un escalier de 5 marches. À chaque pas, tu montes 1 ou 2 marches. De combien de façons peux-tu monter ?',
    unit: '',
    answer: 8,
    hint: 'Commence par les petits escaliers : 1 marche, 2 marches, 3 marches… et cherche le motif.',
    explanation: '1 marche : 1 façon. 2 : 2. 3 : 3. 4 : 5. 5 : 8. C\'est la suite de Fibonacci !',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu veux colorier les 3 cases d\'une rangée avec 2 couleurs (rouge ou bleu). Combien de coloriages différents peux-tu faire ?',
    unit: '',
    answer: 8,
    hint: 'Chaque case a 2 choix de couleur, indépendamment des autres.',
    explanation: '2 × 2 × 2 = 8 coloriages possibles. (RRR, RRB, RBR, RBB, BRR, BRB, BBR, BBB)',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Deux équipes de 5 joueurs se rencontrent. Chaque joueur d\'une équipe serre la main de chaque joueur de l\'autre équipe. Combien de poignées de main au total ?',
    unit: '',
    answer: 25,
    hint: 'Chaque joueur de l\'équipe A serre la main des 5 joueurs de l\'équipe B.',
    explanation: '5 × 5 = 25 poignées de main.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Sur un quadrillage 3×3, tu pars du coin bas-gauche et tu veux aller au coin haut-droit en ne montant ou n\'allant qu\'à droite. Combien de chemins différents ?',
    unit: '',
    answer: 6,
    hint: 'Tu dois faire 2 pas à droite et 2 pas en haut, dans un certain ordre.',
    explanation: 'Il faut choisir 2 pas « droite » parmi 4 pas : C(4,2) = 6 chemins.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu as des pièces de 1 €, 2 € et 5 €. De combien de façons peux-tu faire exactement 10 € ?',
    unit: '',
    answer: 10,
    hint: 'Commence par le nombre de pièces de 5 € (0, 1 ou 2), puis essaie les combinaisons.',
    explanation: 'Avec 2×5 : 1 façon. Avec 1×5 : 5 restants → (0×2,5×1), (1×2,3×1), (2×2,1×1) = 3 façons. Avec 0×5 : 10 restants → (0×2,10×1), (1×2,8×1), (2×2,6×1), (3×2,4×1), (4×2,2×1), (5×2,0×1) = 6 façons. Total : 1+3+6 = 10.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu dois transporter 15 livres. Tu peux porter au maximum 4 livres par voyage. Combien de voyages minimum te faut-il ?',
    unit: '',
    answer: 4,
    hint: 'Divise 15 par 4 et arrondis vers le haut.',
    explanation: '15 ÷ 4 = 3,75. Il faut arrondir au-dessus : 4 voyages (4+4+4+3).',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Dans une classe de 13 élèves, chacun est né un mois de l\'année (janv-déc). Est-on sûr que deux élèves sont nés le même mois ? Combien d\'élèves minimum faut-il pour en être certain ?',
    unit: '',
    answer: 13,
    hint: 'Il y a 12 mois. Si 12 élèves ont chacun un mois différent, le 13e…',
    explanation: 'Avec 12 élèves, chacun peut avoir un mois différent. Le 13e est forcément dans un mois déjà pris. Il faut 13 élèves (principe des tiroirs).',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu lances un dé à 6 faces. Quelle est la probabilité d\'obtenir un nombre pair ? Donne la réponse en sixièmes (numérateur).',
    unit: '',
    answer: 3,
    hint: 'Les nombres pairs sur un dé sont 2, 4, 6.',
    explanation: 'Nombres pairs : 2, 4, 6 → 3 résultats sur 6. Probabilité = 3/6. Numérateur = 3.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un motif se répète : ▲ ○ □ ▲ ○ □ ▲ ○ □… Quelle est la 20e forme ? (1 = triangle, 2 = cercle, 3 = carré)',
    unit: '',
    answer: 2,
    hint: 'Le motif se répète tous les 3. Quel est le reste de 20 ÷ 3 ?',
    explanation: '20 ÷ 3 = 6 reste 2. La 2e forme du motif est le cercle (○). Réponse : 2.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu as 5 chaussettes dans un tiroir : 2 rouges, 2 bleues et 1 verte. Combien dois-tu en prendre dans le noir pour être sûr d\'avoir 2 de la même couleur ?',
    unit: '',
    answer: 4,
    hint: 'Pense au pire cas : les premières pourraient être toutes de couleurs différentes.',
    explanation: 'Pire cas : 1 rouge, 1 bleue, 1 verte = 3 chaussettes, toutes différentes. La 4e sera forcément rouge ou bleue → tu auras une paire. Il faut 4 chaussettes.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu dois ranger 4 cours (maths, français, sport, musique) dans 4 créneaux. De combien de façons peux-tu organiser ton emploi du temps ?',
    unit: '',
    answer: 24,
    hint: '4 choix pour le 1er créneau, 3 pour le 2e…',
    explanation: '4 × 3 × 2 × 1 = 24 arrangements possibles.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'On tire une carte dans un jeu de 52 cartes. Combien y a-t-il de rois dans le jeu ?',
    unit: '',
    answer: 4,
    hint: 'Pense aux 4 couleurs : pique, cœur, carreau, trèfle.',
    explanation: 'Il y a 1 roi par couleur : roi de pique, roi de cœur, roi de carreau, roi de trèfle = 4 rois.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Combien y a-t-il de carrés en tout sur un échiquier 4×4 ? (De toutes les tailles !)',
    unit: '',
    answer: 30,
    hint: 'Compte les carrés 1×1, 2×2, 3×3 et 4×4.',
    explanation: '16 carrés 1×1 + 9 carrés 2×2 + 4 carrés 3×3 + 1 carré 4×4 = 30 carrés.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu as 3 boîtes et 5 billes identiques. De combien de façons peux-tu répartir toutes les billes dans les boîtes ? (Les boîtes peuvent être vides.)',
    unit: '',
    answer: 21,
    hint: 'C\'est un problème de « barres et étoiles ». Essaie de lister les cas selon le contenu de la 1re boîte.',
    explanation: 'Formule : C(5+3−1, 3−1) = C(7,2) = 21 répartitions.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un robot avance sur une grille. Il part de la case (0,0) et fait 3 pas vers la droite et 2 pas vers le haut, dans n\'importe quel ordre. Combien de chemins différents peut-il suivre ?',
    unit: '',
    answer: 10,
    hint: 'Il doit choisir quand faire ses 2 pas vers le haut parmi 5 pas au total.',
    explanation: 'C(5,2) = 5! / (2! × 3!) = 10 chemins différents.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un ascenseur peut porter 300 kg maximum. 5 personnes pesant chacune 70 kg veulent monter. Combien de voyages minimum faut-il ?',
    unit: '',
    answer: 2,
    hint: 'Calcule le poids total et combien de personnes par voyage.',
    explanation: 'Poids total : 5 × 70 = 350 kg > 300 kg. Max 4 personnes par voyage (4 × 70 = 280 kg). Il faut 2 voyages : 4 + 1.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu lances 2 dés. Quelle est la probabilité d\'obtenir un double (les 2 dés montrent le même nombre) ? Donne le dénominateur de la fraction simplifiée.',
    unit: '',
    answer: 6,
    hint: 'Il y a 36 résultats possibles. Combien sont des doubles ?',
    explanation: 'Doubles : (1,1), (2,2), (3,3), (4,4), (5,5), (6,6) = 6 sur 36. Simplifié : 1/6. Dénominateur = 6.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu as une balance à deux plateaux et tu dois peser 1 kg, 2 kg et 3 kg. Si tu as des poids de 1 kg et 2 kg, peux-tu peser 3 kg ? Combien de poids minimum te faut-il pour peser 1 kg, 2 kg et 3 kg ?',
    unit: '',
    answer: 2,
    hint: 'Avec un poids de 1 kg et un de 2 kg, tu peux aussi les combiner.',
    explanation: 'Avec 1 kg et 2 kg : tu pèses 1 kg (le poids de 1), 2 kg (le poids de 2), et 3 kg (les deux ensemble). Il suffit de 2 poids.',
    level: 2
  },

  // ═══════════════════════════════════════════════════════════════════
  // HEROIC FANTASY
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'calcul',
    text: 'Le dragon Ignar possède 7 grottes secrètes. Dans chaque grotte, il cache 144 pièces d\'or. Combien de pièces d\'or possède-t-il en tout ?',
    unit: 'pièces',
    answer: 1008,
    hint: 'Multiplie le nombre de grottes par le nombre de pièces dans chaque grotte.',
    explanation: '7 grottes × 144 pièces = 1 008 pièces d\'or au total.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'La sorcière Mélusine prépare une potion magique. Elle a besoin de 3 ingrédients rares. Le premier coûte 48 pièces, le deuxième coûte le double du premier, et le troisième coûte 35 pièces. Combien dépense-t-elle en tout ?',
    unit: 'pièces',
    answer: 179,
    hint: 'Commence par calculer le prix du deuxième ingrédient, puis additionne les trois.',
    explanation: 'Le deuxième ingrédient coûte 48 × 2 = 96 pièces. Total : 48 + 96 + 35 = 179 pièces.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Le chevalier Aldric tue 9 monstres par jour pendant 8 jours. Son écuyer en tue 3 fois moins au total. Combien de monstres ont-ils tués ensemble ?',
    unit: 'monstres',
    answer: 96,
    hint: 'Calcule d\'abord le total du chevalier, puis celui de l\'écuyer, puis additionne.',
    explanation: 'Aldric : 9 × 8 = 72 monstres. L\'écuyer : 72 ÷ 3 = 24 monstres. Ensemble : 72 + 24 = 96 monstres.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Trois elfes — Aël, Brin et Célindë — portent chacun une gemme différente : un rubis, une émeraude et un saphir. Aël ne porte pas le rubis ni l\'émeraude. Brin ne porte pas l\'émeraude. Qui porte le rubis ?',
    unit: '',
    answer: null,
    textAnswer: 'brin',
    hint: 'Commence par Aël : s\'il ne porte ni le rubis ni l\'émeraude, que lui reste-t-il ?',
    explanation: 'Aël ne porte ni rubis ni émeraude → Aël porte le saphir. Brin ne porte pas l\'émeraude → Brin porte le rubis. Célindë porte l\'émeraude.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Un magicien pense à un nombre entre 1 et 20. Il donne trois indices : le nombre est pair, il est plus grand que 12, et il n\'est pas divisible par 4. Quels sont les deux nombres possibles ? Donne le plus petit.',
    unit: '',
    answer: 14,
    hint: 'Liste les nombres pairs entre 13 et 20, puis élimine ceux divisibles par 4.',
    explanation: 'Nombres pairs > 12 et ≤ 20 : 14, 16, 18, 20. Divisibles par 4 : 16 et 20. Restent 14 et 18. Le plus petit est 14.',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Le château du roi Arthus est entouré d\'un fossé rectangulaire de 120 m de long et 80 m de large. Quelle est la longueur totale du fossé ?',
    unit: 'm',
    answer: 400,
    hint: 'Le périmètre d\'un rectangle = 2 × (longueur + largeur).',
    explanation: 'Périmètre = 2 × (120 + 80) = 2 × 200 = 400 m.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'La salle du trône est un triangle dont les côtés mesurent 15 m, 20 m et 25 m. Le roi veut tapisser les murs d\'une bordure dorée. Quelle longueur de bordure faut-il ?',
    unit: 'm',
    answer: 60,
    hint: 'Le périmètre d\'un triangle = somme de ses trois côtés.',
    explanation: 'Périmètre = 15 + 20 + 25 = 60 m de bordure.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'L\'arène des chevaliers est un carré de 35 m de côté. Un écuyer doit courir 3 fois le tour de l\'arène pour s\'entraîner. Quelle distance parcourt-il ?',
    unit: 'm',
    answer: 420,
    hint: 'Calcule d\'abord le périmètre du carré, puis multiplie par 3.',
    explanation: 'Périmètre = 4 × 35 = 140 m. Distance totale = 140 × 3 = 420 m.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Le magicien Oryn possède un grimoire de 120 sorts. Il a déjà appris 3/4 des sorts. Combien de sorts connaît-il ?',
    unit: 'sorts',
    answer: 90,
    hint: 'Divise 120 par 4 pour trouver 1/4, puis multiplie par 3.',
    explanation: '1/4 de 120 = 30 sorts. Donc 3/4 = 30 × 3 = 90 sorts.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Une fée a cueilli 48 fleurs magiques. Elle en offre 1/6 à la reine des elfes et 1/4 à son ami le lutin. Combien de fleurs lui reste-t-il ?',
    unit: 'fleurs',
    answer: 28,
    hint: 'Calcule 1/6 et 1/4 de 48 séparément, puis soustrais les deux du total.',
    explanation: '1/6 de 48 = 8 fleurs. 1/4 de 48 = 12 fleurs. Reste : 48 − 8 − 12 = 28 fleurs.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un dragon a rempli 2/3 d\'un coffre avec des rubis et 1/6 avec des émeraudes. Quelle fraction du coffre est encore vide ? Donne le dénominateur.',
    unit: '',
    answer: 6,
    hint: 'Convertis les fractions avec le même dénominateur, additionne-les, puis soustrais de 1.',
    explanation: '2/3 = 4/6. Total rempli : 4/6 + 1/6 = 5/6. Vide : 6/6 − 5/6 = 1/6. Le dénominateur est 6.',
    ficheKey: 'fractions_additionner',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Le jeune apprenti sorcier doit marcher jusqu\'à la tour enchantée, distante de 3 km et 400 m. Il a déjà parcouru 1 750 m. Combien de mètres lui reste-t-il ?',
    unit: 'm',
    answer: 1650,
    hint: 'Convertis 3 km 400 m en mètres, puis soustrais.',
    explanation: '3 km 400 m = 3 400 m. Distance restante : 3 400 − 1 750 = 1 650 m.',
    ficheKey: 'longueurs',
    level: 2
  },
  {
    category: 'mesures',
    text: 'La potion de guérison nécessite 2 kg et 300 g de racines de mandragore. L\'herboriste a déjà préparé 850 g. Combien de grammes manque-t-il ?',
    unit: 'g',
    answer: 1450,
    hint: 'Convertis la quantité totale en grammes, puis soustrais.',
    explanation: '2 kg 300 g = 2 300 g. Quantité manquante : 2 300 − 850 = 1 450 g.',
    ficheKey: 'masses',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Le roi dispose de 3 bannières (rouge, bleue, dorée) et de 2 emblèmes (aigle, dragon). Combien d\'étendards différents peut-il créer en combinant une bannière et un emblème ?',
    unit: '',
    answer: 6,
    hint: 'Chaque bannière peut être associée à chaque emblème.',
    explanation: '3 bannières × 2 emblèmes = 6 étendards différents.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Quatre aventuriers — un guerrier, un mage, un archer et un voleur — doivent traverser un pont en équipe de 2. Combien de duos différents peuvent-ils former ?',
    unit: '',
    answer: 6,
    hint: 'Liste tous les duos possibles sans compter deux fois la même paire.',
    explanation: 'Guerrier+Mage, Guerrier+Archer, Guerrier+Voleur, Mage+Archer, Mage+Voleur, Archer+Voleur = 6 duos.',
    level: 2
  },

  // ═══════════════════════════════════════════════════════════════════
  // ESPACE
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'calcul',
    text: 'Une fusée met 8 minutes pour atteindre l\'orbite. Elle effectue 6 tours de la Terre (92 minutes chacun), puis revient en 8 minutes. Combien de minutes dure le voyage ?',
    unit: 'minutes',
    answer: 568,
    hint: 'Calcule la durée des 6 tours, puis ajoute montée et descente.',
    explanation: '6 × 92 = 552 minutes. Montée + descente : 8 + 8 = 16 min. Total : 552 + 16 = 568 minutes.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'La Station Spatiale tourne autour de la Terre 16 fois par jour. En 3 jours, combien de tours aura-t-elle effectués ?',
    unit: 'tours',
    answer: 48,
    hint: 'Multiplie le nombre de tours par jour par le nombre de jours.',
    explanation: '16 × 3 = 48 tours.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un astronaute pèse 72 kg sur Terre. Sur la Lune, il ne pèse qu\'un sixième de son poids terrestre. Quel est son poids sur la Lune ?',
    unit: 'kg',
    answer: 12,
    hint: 'Divise le poids terrestre par 6.',
    explanation: '72 ÷ 6 = 12 kg sur la Lune.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Un alien a 3 têtes et chaque tête a 4 yeux. Un autre alien a 2 têtes et chaque tête a 7 yeux. Lequel a le plus d\'yeux, et de combien ?',
    unit: '',
    answer: 2,
    hint: 'Calcule le total d\'yeux de chaque créature, puis fais la différence.',
    explanation: 'Alien 1 : 3 × 4 = 12 yeux. Alien 2 : 2 × 7 = 14 yeux. La différence : 14 − 12 = 2 yeux de plus.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Une sonde spatiale envoie un signal toutes les 9 secondes, une autre toutes les 12 secondes. Elles envoient un signal en même temps à t=0. Après combien de secondes enverront-elles à nouveau un signal simultanément ?',
    unit: 'secondes',
    answer: 36,
    hint: 'Cherche le plus petit multiple commun de 9 et de 12.',
    explanation: 'Multiples de 9 : 9, 18, 27, 36… Multiples de 12 : 12, 24, 36… Le PPCM est 36 secondes.',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un cratère lunaire est parfaitement circulaire avec un diamètre de 10 km. Quelle est sa circonférence ? (π ≈ 3)',
    unit: 'km',
    answer: 30,
    hint: 'Circonférence = π × diamètre.',
    explanation: 'Circonférence ≈ 3 × 10 = 30 km.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Une fenêtre carrée d\'une capsule spatiale mesure 40 cm de côté. Quelle est son aire ?',
    unit: 'cm²',
    answer: 1600,
    hint: 'Aire d\'un carré = côté × côté.',
    explanation: '40 × 40 = 1 600 cm².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Une antenne de vaisseau spatial a la forme d\'un triangle rectangle. Ses deux côtés autour de l\'angle droit mesurent 6 m et 8 m. Quelle est son aire ?',
    unit: 'm²',
    answer: 24,
    hint: 'Aire d\'un triangle = (base × hauteur) ÷ 2.',
    explanation: '(6 × 8) ÷ 2 = 48 ÷ 2 = 24 m².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un vaisseau transporte 120 kg de nourriture. Les astronautes mangent 1/4 le premier mois et 1/3 le deuxième. Combien de kg reste-t-il ?',
    unit: 'kg',
    answer: 50,
    hint: 'Calcule ce qui est mangé chaque mois, puis soustrais du total.',
    explanation: '1/4 de 120 = 30 kg. 1/3 de 120 = 40 kg. Consommé : 70 kg. Reste : 120 − 70 = 50 kg.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Sur 48 étoiles observées au télescope, 3/8 sont des géantes rouges. Combien d\'étoiles sont des géantes rouges ?',
    unit: '',
    answer: 18,
    hint: 'Divise 48 par 8, puis multiplie par 3.',
    explanation: '48 ÷ 8 = 6. 6 × 3 = 18 géantes rouges.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Une mission spatiale dure 180 jours. L\'équipage a déjà effectué 5/12 de la mission. Combien de jours reste-t-il ?',
    unit: 'jours',
    answer: 105,
    hint: 'Calcule les jours effectués, puis soustrais du total.',
    explanation: '5/12 de 180 = 15 × 5 = 75 jours effectués. Reste : 180 − 75 = 105 jours.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un scaphandre pèse 20 kg sur Terre. Sur Mars, les objets pèsent environ 4/10 de leur poids terrestre. Quel est le poids du scaphandre sur Mars ?',
    unit: 'kg',
    answer: 8,
    hint: 'Multiplie le poids terrestre par 4/10.',
    explanation: '20 × 4/10 = 20 × 0,4 = 8 kg.',
    ficheKey: 'masses',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Une navette spatiale consomme 500 litres de carburant par minute au décollage. Le réservoir contient 6 000 litres. Combien de minutes de décollage sont possibles ?',
    unit: 'minutes',
    answer: 12,
    hint: 'Divise la quantité de carburant par la consommation par minute.',
    explanation: '6 000 ÷ 500 = 12 minutes.',
    ficheKey: 'capacites',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un commandant veut former une équipe de 2 astronautes parmi 4 candidats : Ada, Bruno, Cara et Diego. Combien d\'équipes différentes peut-il former ?',
    unit: '',
    answer: 6,
    hint: 'Liste toutes les paires possibles sans doublon.',
    explanation: 'Ada-Bruno, Ada-Cara, Ada-Diego, Bruno-Cara, Bruno-Diego, Cara-Diego = 6 équipes.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un vaisseau doit ravitailler 3 stations : Alpha, Bêta et Gamma, dans n\'importe quel ordre. Combien d\'itinéraires différents peut-il choisir ?',
    unit: '',
    answer: 6,
    hint: 'Combien de choix pour la 1ère station ? Pour la 2e ? La 3e ?',
    explanation: '3 × 2 × 1 = 6 itinéraires différents.',
    level: 2
  },

  // ═══════════════════════════════════════════════════════════════════
  // SPORT
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'calcul',
    text: 'Un basketteur marque 8 paniers à 2 points et 5 paniers à 3 points. Combien de points a-t-il marqué en tout ?',
    unit: '',
    answer: 31,
    hint: 'Calcule séparément les points à 2 et à 3, puis additionne.',
    explanation: '8 × 2 = 16 points. 5 × 3 = 15 points. Total : 16 + 15 = 31 points.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un stade a 4 tribunes. Deux ont 3 200 places chacune et les deux autres 1 850 places chacune. Combien de spectateurs le stade peut-il accueillir ?',
    unit: '',
    answer: 10100,
    hint: 'Calcule le total de chaque paire, puis additionne.',
    explanation: '2 × 3 200 = 6 400. 2 × 1 850 = 3 700. Total : 6 400 + 3 700 = 10 100 places.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Lors d\'un tournoi de tennis, chaque joueur affronte tous les autres une seule fois. Il y a 6 joueurs. Combien de matchs seront joués ?',
    unit: '',
    answer: 15,
    hint: 'Le premier joue 5 matchs, le deuxième 4 nouveaux matchs, et ainsi de suite.',
    explanation: '5 + 4 + 3 + 2 + 1 = 15 matchs au total.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Cinq coureurs franchissent la ligne d\'arrivée. Lucas arrive avant Emma mais après Théo. Sofia arrive juste après Emma. Hugo arrive en dernier. Qui arrive en 3e position ?',
    unit: '',
    answer: null,
    textAnswer: 'emma',
    hint: 'Place Théo et Lucas d\'abord, puis Emma, puis les autres.',
    explanation: 'Théo 1er, Lucas 2e (après Théo, avant Emma), Emma 3e, Sofia 4e (juste après Emma), Hugo 5e.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Dans une compétition de natation, les Requins ont 12 points de plus que les Dauphins. Les Dauphins ont le double des Orques. Les Orques ont 9 points. Combien de points ont les Requins ?',
    unit: '',
    answer: 30,
    hint: 'Commence par les Orques, puis calcule les Dauphins, puis les Requins.',
    explanation: 'Orques : 9. Dauphins : 9 × 2 = 18. Requins : 18 + 12 = 30 points.',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un terrain de basketball mesure 28 m de long et 15 m de large. Quelle est son aire ?',
    unit: 'm²',
    answer: 420,
    hint: 'Aire d\'un rectangle = longueur × largeur.',
    explanation: '28 × 15 = 420 m².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Le sol d\'un vestiaire carré mesure 6 m de côté. On le carrele avec des dalles de 30 cm de côté. Combien de dalles faut-il ?',
    unit: '',
    answer: 400,
    hint: 'Convertis 6 m en cm, puis calcule combien de dalles par rangée.',
    explanation: '6 m = 600 cm. Par rangée : 600 ÷ 30 = 20 dalles. Total : 20 × 20 = 400 dalles.',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Lors d\'un match de handball, la France marque 24 buts. 3/8 sont marqués en 1re mi-temps. Combien de buts en 1re mi-temps ?',
    unit: '',
    answer: 9,
    hint: 'Calcule 3/8 de 24.',
    explanation: '24 ÷ 8 = 3. 3 × 3 = 9 buts en première mi-temps.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un cycliste parcourt 120 km en une journée. Il a déjà fait 2/5 du trajet. Combien de km lui reste-t-il ?',
    unit: 'km',
    answer: 72,
    hint: 'Calcule la distance parcourue, puis la distance restante.',
    explanation: '2/5 de 120 = 48 km parcourus. Reste : 120 − 48 = 72 km.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Dans une équipe de 30 gymnastes, 1/3 sont des garçons. Parmi les filles, 1/4 ont remporté une médaille. Combien de filles sont médaillées ?',
    unit: '',
    answer: 5,
    hint: 'Trouve d\'abord le nombre de filles, puis calcule 1/4.',
    explanation: '1/3 de 30 = 10 garçons. Filles : 30 − 10 = 20. 1/4 de 20 = 5 filles médaillées.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un match de rugby dure 2 × 40 minutes avec 15 minutes de pause. S\'il commence à 14h30, à quelle heure se termine-t-il ? Donne les minutes.',
    unit: '',
    answer: 5,
    hint: 'Calcule la durée totale, puis ajoute à 14h30.',
    explanation: '40 + 15 + 40 = 95 minutes. 14h30 + 1h35 = 16h05. Les minutes sont 05.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un athlète s\'entraîne 45 min/jour du lundi au vendredi et 1h30 le samedi. Combien de minutes s\'entraîne-t-il par semaine ?',
    unit: 'minutes',
    answer: 315,
    hint: 'Calcule les minutes en semaine, puis ajoute le samedi.',
    explanation: '5 × 45 = 225 min. Samedi : 1h30 = 90 min. Total : 225 + 90 = 315 minutes.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un saut en longueur mesure 7 m 45 cm. Le record précédent était de 7 m 12 cm. De combien de cm le nouveau record dépasse-t-il l\'ancien ?',
    unit: 'cm',
    answer: 33,
    hint: 'Convertis les deux distances en centimètres.',
    explanation: '745 cm − 712 cm = 33 cm.',
    ficheKey: 'longueurs',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un entraîneur doit former une équipe de 5 joueurs parmi 7 candidats, dont le capitaine obligatoire. De combien de façons peut-il choisir les 4 autres parmi les 6 restants ?',
    unit: '',
    answer: 15,
    hint: 'Il faut choisir 4 parmi 6 : (6×5×4×3) ÷ (4×3×2×1).',
    explanation: '(6×5×4×3) ÷ (4×3×2×1) = 360 ÷ 24 = 15 façons.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Aux JO, un pays remporte 3 médailles d\'or (5 pts), 4 d\'argent (3 pts) et 6 de bronze (1 pt). Quel est son score total ?',
    unit: '',
    answer: 33,
    hint: 'Calcule les points de chaque type de médaille, puis additionne.',
    explanation: '3 × 5 = 15. 4 × 3 = 12. 6 × 1 = 6. Total : 15 + 12 + 6 = 33 points.',
    level: 2
  },

  // ═══════════════════════════════════════════════════════════════════
  // GAMER
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'calcul',
    text: 'Dans un RPG, ton héros gagne 125 XP par monstre vaincu. Il en bat 8 pour passer au niveau suivant. Combien d\'XP gagne-t-il ?',
    unit: 'XP',
    answer: 1000,
    hint: 'Multiplie le gain par combat par le nombre de combats.',
    explanation: '125 × 8 = 1 000 XP.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Dans Minecraft, tu as 432 blocs de pierre. Tu construis un mur de 16 blocs par rangée. Combien de rangées complètes peux-tu faire ?',
    unit: '',
    answer: 27,
    hint: 'Divise le total de blocs par le nombre de blocs par rangée.',
    explanation: '432 ÷ 16 = 27 rangées complètes.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un chasseur de trésors collecte 47 pièces dans la 1re salle, 83 dans la 2e et 69 dans la 3e. Le boss final lui en vole 35. Combien lui en reste-t-il ?',
    unit: 'pièces',
    answer: 164,
    hint: 'Additionne tout, puis retire les pièces volées.',
    explanation: '47 + 83 + 69 = 199. 199 − 35 = 164 pièces.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Un coffre magique s\'ouvre avec un code à 3 chiffres. La somme des 3 chiffres est 12, le 1er chiffre est le double du 3e, et le 2e chiffre est 3. Quel est le code ?',
    unit: '',
    answer: 633,
    hint: 'Le 2e chiffre est 3. Pose une équation pour les deux autres.',
    explanation: '2e = 3. Reste 12 − 3 = 9. Le 1er = 2 × le 3e, donc 2x + x = 9, x = 3. Code : 633.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Dans un jeu de plateforme, tu avances de 1, 2 ou 3 cases par saut. Combien de chemins différents pour atteindre la case 4 depuis la case 0 ?',
    unit: '',
    answer: 7,
    hint: 'Liste toutes les combinaisons de sauts qui totalisent 4.',
    explanation: '1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2, 1+3, 3+1 = 7 chemins.',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'La carte d\'un jeu vidéo est un rectangle de 12 cm sur 7 cm. Quelle est son aire ?',
    unit: 'cm²',
    answer: 84,
    hint: 'Aire d\'un rectangle = longueur × largeur.',
    explanation: '12 × 7 = 84 cm².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Dans un jeu de construction, tu entoures ta base carrée de 9 m de côté avec une clôture. Quelle longueur de clôture te faut-il ?',
    unit: 'm',
    answer: 36,
    hint: 'Périmètre d\'un carré = 4 × côté.',
    explanation: '4 × 9 = 36 m de clôture.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Tu as 24 potions magiques. Tu en utilises 1/4 contre un ogre, puis 1/3 de ce qui reste contre le boss. Combien de potions te reste-t-il ?',
    unit: '',
    answer: 12,
    hint: 'Calcule après l\'ogre, puis enlève 1/3 de ce qui reste.',
    explanation: '24 × 1/4 = 6 contre l\'ogre. Reste 18. 18 × 1/3 = 6 contre le boss. Reste : 12 potions.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Dans un jeu de stratégie, 3/5 de ton armée sont des archers. Si tu as 40 soldats, combien d\'archers as-tu ?',
    unit: '',
    answer: 24,
    hint: 'Multiplie le total par 3/5.',
    explanation: '40 × 3/5 = 120 ÷ 5 = 24 archers.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Une partie de jeu commence à 14h35 et se termine à 17h10. Combien de minutes a-t-elle duré ?',
    unit: 'min',
    answer: 155,
    hint: 'Calcule la durée en heures et minutes, puis convertis en minutes.',
    explanation: 'De 14h35 à 17h10 = 2h35 = 2 × 60 + 35 = 155 minutes.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un personnage de jeu court à 8 m/s. En combien de secondes parcourt-il 120 m pour atteindre le portail ?',
    unit: 's',
    answer: 15,
    hint: 'Divise la distance par la vitesse.',
    explanation: '120 ÷ 8 = 15 secondes.',
    ficheKey: 'vitesse',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Dans un jeu de survie, ton personnage mange 250 g de nourriture par heure. Il part avec 2 kg. Combien d\'heures peut-il explorer ?',
    unit: 'heures',
    answer: 8,
    hint: 'Convertis en grammes, puis divise.',
    explanation: '2 kg = 2 000 g. 2 000 ÷ 250 = 8 heures.',
    ficheKey: 'masses',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Dans une boutique de jeu, une potion coûte 8 pièces et une flèche 3 pièces. Tu veux acheter exactement 10 objets pour 50 pièces. Combien de potions achètes-tu ?',
    unit: '',
    answer: 4,
    hint: 'Si tu achètes p potions, tu achètes (10 − p) flèches. Pose l\'équation.',
    explanation: '8p + 3(10−p) = 50 → 8p + 30 − 3p = 50 → 5p = 20 → p = 4 potions (et 6 flèches).',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un plateau de jeu carré de 5×5 cases est colorié en échiquier (cases alternées). Si le coin haut-gauche est rouge, combien de cases rouges y a-t-il ?',
    unit: '',
    answer: 13,
    hint: 'Dessine le quadrillage et compte. Les rangées impaires et paires n\'ont pas le même nombre de cases rouges.',
    explanation: 'Rangées 1, 3, 5 : 3 cases rouges chacune. Rangées 2, 4 : 2 chacune. Total : 3+2+3+2+3 = 13.',
    level: 2
  },

  // ═══════════════════════════════════════════════════════════════════
  // CUISINE
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'calcul',
    text: 'Une pâtissière fait 4 fournées de 18 éclairs au chocolat par jour. Elle en mange 3 avec son apprenti. Combien lui en reste-t-il à vendre ?',
    unit: '',
    answer: 69,
    hint: 'Calcule le total, puis retire les 3 mangés.',
    explanation: '4 × 18 = 72 éclairs. 72 − 3 = 69 à vendre.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Au marché, un boucher vend des côtelettes à 8 € et des saucisses à 3 € le paquet. Maman achète 5 côtelettes et 4 paquets de saucisses. Combien dépense-t-elle ?',
    unit: '€',
    answer: 52,
    hint: 'Calcule chaque produit séparément, puis additionne.',
    explanation: '5 × 8 = 40 €. 4 × 3 = 12 €. Total : 40 + 12 = 52 €.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un chef prépare 9 tartes aux pommes avec 7 pommes chacune. Il avait 80 pommes. Combien lui en reste-t-il ?',
    unit: '',
    answer: 17,
    hint: 'Calcule le total utilisé, puis soustrais.',
    explanation: '9 × 7 = 63 pommes. 80 − 63 = 17 pommes restantes.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Léa prépare des crêpes. Chaque face met 2 minutes à cuire. Sa poêle peut cuire 2 crêpes à la fois. Combien de minutes minimum pour cuire 3 crêpes ?',
    unit: 'minutes',
    answer: 6,
    hint: 'Pense à retourner les crêpes astucieusement pour ne pas perdre de temps.',
    explanation: 'Min 1-2 : face 1 de A et B. Min 3-4 : face 2 de A + face 1 de C. Min 5-6 : face 2 de B et C. Total : 6 min.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Dans une boulangerie, il y a des baguettes (1 €) et des pains au chocolat (3 €). En tout : 20 articles et 46 € en caisse. Combien de pains au chocolat ?',
    unit: '',
    answer: 13,
    hint: 'Si P = pains au chocolat, les baguettes = 20 − P.',
    explanation: '3P + (20 − P) = 46 → 2P + 20 = 46 → 2P = 26 → P = 13 pains au chocolat.',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un moule à cake rectangulaire mesure 25 cm de long et 10 cm de large. Quelle est l\'aire du fond ?',
    unit: 'cm²',
    answer: 250,
    hint: 'Aire d\'un rectangle = longueur × largeur.',
    explanation: '25 × 10 = 250 cm².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Une pizza ronde a un diamètre de 30 cm. Quelle est la longueur de sa croûte tout autour ? (π ≈ 3)',
    unit: 'cm',
    answer: 90,
    hint: 'Périmètre d\'un cercle = π × diamètre.',
    explanation: '3 × 30 = 90 cm de croûte.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un chef a préparé 24 macarons. Il en offre 1/3 à ses apprentis et en mange 1/8 lui-même. Combien en reste-t-il ?',
    unit: '',
    answer: 13,
    hint: 'Calcule 1/3 de 24 et 1/8 de 24, puis soustrais les deux du total.',
    explanation: '1/3 de 24 = 8. 1/8 de 24 = 3. Reste : 24 − 8 − 3 = 13 macarons.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Une recette demande 3/4 de tasse de sucre. Tom veut faire la moitié de la recette. Quelle fraction de tasse lui faut-il ? Donne le dénominateur.',
    unit: '',
    answer: 8,
    hint: 'La moitié de 3/4 = 3/4 × 1/2.',
    explanation: '3/4 × 1/2 = 3/8. Le dénominateur est 8.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Pour une soupe, Mamie utilise 1,5 L de bouillon, 300 mL de lait de coco et 200 mL de crème. Quel est le total en millilitres ?',
    unit: 'mL',
    answer: 2000,
    hint: 'Convertis 1,5 L en mL (1 L = 1 000 mL), puis additionne.',
    explanation: '1,5 L = 1 500 mL. Total : 1 500 + 300 + 200 = 2 000 mL.',
    ficheKey: 'capacites',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un pain au levain lève pendant 1h45, puis cuit 35 minutes. Si on le met à lever à 7h00, à quelle heure est-il cuit ? Donne les minutes.',
    unit: '',
    answer: 20,
    hint: 'Additionne le temps de levée et de cuisson, puis ajoute à 7h00.',
    explanation: '1h45 + 35 min = 2h20. 7h00 + 2h20 = 9h20. Les minutes sont 20.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Une recette de confiserie demande de chauffer le caramel à 160 °C, puis de le laisser refroidir à 40 °C. De combien de degrés la température doit-elle baisser ?',
    unit: '°C',
    answer: 120,
    hint: 'Calcule la différence entre les deux températures.',
    explanation: '160 − 40 = 120 °C.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un chef dispose de 3 fromages (brie, comté, roquefort) et veut mettre exactement 2 fromages par plateau. Combien de plateaux différents peut-il composer ?',
    unit: '',
    answer: 3,
    hint: 'Liste toutes les paires possibles.',
    explanation: 'Brie+comté, brie+roquefort, comté+roquefort = 3 plateaux.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Zoé décore un gâteau en choisissant 1 couleur de glaçage parmi 4 et 1 décoration parmi 3. Combien de combinaisons différentes peut-elle créer ?',
    unit: '',
    answer: 12,
    hint: 'Multiplie le nombre de couleurs par le nombre de décorations.',
    explanation: '4 × 3 = 12 combinaisons.',
    level: 2
  },

  // ═══════════════════════════════════════════════════════════════════
  // FAMILLE
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'calcul',
    text: 'Jules gagne 8 € par semaine en rangeant sa chambre. Après 6 semaines, il dépense 17 € pour un jeu. Combien lui reste-t-il ?',
    unit: '€',
    answer: 31,
    hint: 'Calcule d\'abord ce qu\'il a gagné en 6 semaines.',
    explanation: '6 × 8 = 48 €. 48 − 17 = 31 €.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Pour l\'anniversaire de Maman, Papa prépare 5 tables de 6 couverts. 4 invités ne peuvent pas venir. Combien de personnes seront à table ?',
    unit: '',
    answer: 26,
    hint: 'Calcule le nombre total de couverts, puis retire les absents.',
    explanation: '5 × 6 = 30. 30 − 4 = 26 personnes.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Maman donne 3 € par corvée. Lola fait 4 corvées et Tom en fait 6. Combien reçoivent-ils ensemble ?',
    unit: '€',
    answer: 30,
    hint: 'Compte le total de corvées, puis multiplie par 3.',
    explanation: '4 + 6 = 10 corvées. 10 × 3 = 30 €.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Le papa d\'Emma a 36 ans. Emma est 3 fois plus jeune que lui. Dans 8 ans, quel âge aura Emma ?',
    unit: 'ans',
    answer: 20,
    hint: 'Trouve d\'abord l\'âge actuel d\'Emma.',
    explanation: 'Emma : 36 ÷ 3 = 12 ans. Dans 8 ans : 12 + 8 = 20 ans.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Grand-Mère distribue des bonbons à 4 enfants : chacun reçoit 9 et il en reste 5. Combien en avait-elle ?',
    unit: '',
    answer: 41,
    hint: 'Calcule le total distribué, puis ajoute le reste.',
    explanation: '4 × 9 = 36 distribués. 36 + 5 = 41 bonbons au départ.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Papa plante 8 plants de tomates en ligne droite, espacés de 30 cm. Quelle est la longueur de la rangée ?',
    unit: 'cm',
    answer: 210,
    hint: 'Entre 8 plants, il y a 7 espaces.',
    explanation: '7 espaces × 30 cm = 210 cm.',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Le salon est un rectangle de 6 m sur 4 m. Quel est son périmètre ?',
    unit: 'm',
    answer: 20,
    hint: 'Périmètre d\'un rectangle = 2 × (longueur + largeur).',
    explanation: '2 × (6 + 4) = 20 m.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Papa couvre l\'allée du jardin de gravillons. L\'allée mesure 12 m sur 3 m. Quelle est son aire ?',
    unit: 'm²',
    answer: 36,
    hint: 'Aire d\'un rectangle = longueur × largeur.',
    explanation: '12 × 3 = 36 m².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Maman pose des carreaux carrés de 20 cm de côté. Quelle est l\'aire d\'un seul carreau ?',
    unit: 'cm²',
    answer: 400,
    hint: 'Aire d\'un carré = côté × côté.',
    explanation: '20 × 20 = 400 cm².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Théo reçoit 24 € d\'argent de poche. Il dépense 1/4 en bonbons et 1/3 en autocollants. Combien a-t-il dépensé en tout ?',
    unit: '€',
    answer: 14,
    hint: 'Calcule 1/4 de 24 et 1/3 de 24 séparément.',
    explanation: '1/4 de 24 = 6 €. 1/3 de 24 = 8 €. Total : 6 + 8 = 14 €.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'La recette de Mamie pour 6 personnes demande 200 g de farine. Ce dimanche, 9 personnes sont invitées. Quelle quantité de farine faut-il ?',
    unit: 'g',
    answer: 300,
    hint: 'Trouve la quantité pour 1 personne, puis multiplie par 9.',
    explanation: '200 × 9 ÷ 6 = 1 800 ÷ 6 = 300 g.',
    ficheKey: 'proportionnalite',
    level: 2
  },
  {
    category: 'mesures',
    text: 'La famille part en vacances à 80 km/h et doit parcourir 240 km. Combien d\'heures dure le trajet ?',
    unit: 'h',
    answer: 3,
    hint: 'Temps = distance ÷ vitesse.',
    explanation: '240 ÷ 80 = 3 heures.',
    ficheKey: 'vitesse',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Papa a un tuyau de 15 m. Il coupe 3 morceaux de 4 m chacun. Combien de mètres reste-t-il ?',
    unit: 'm',
    answer: 3,
    hint: 'Calcule la longueur totale coupée, puis soustrais.',
    explanation: '3 × 4 = 12 m coupés. 15 − 12 = 3 m.',
    ficheKey: 'longueurs',
    level: 2
  },
  {
    category: 'mesures',
    text: 'On charge 4 valises de 7 kg et 1 carton de 5 kg dans le coffre. Quel est le poids total ?',
    unit: 'kg',
    answer: 33,
    hint: 'Calcule le poids des valises, puis ajoute le carton.',
    explanation: '4 × 7 = 28 kg. 28 + 5 = 33 kg.',
    ficheKey: 'masses',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Dans notre immeuble, chaque famille a 2 enfants. Il y a 9 familles par étage et 4 étages. Combien d\'enfants dans l\'immeuble ?',
    unit: '',
    answer: 72,
    hint: 'Calcule le total de familles, puis multiplie par 2.',
    explanation: '9 × 4 = 36 familles. 36 × 2 = 72 enfants.',
    level: 2
  },

  // ═══════════════════════════════════════════════════════════════════
  // ORDINATEUR
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'calcul',
    text: 'Un robot assemble 6 pièces par minute pendant 8 minutes. Son bras tombe en panne et 5 pièces se détachent. Combien de pièces reste-t-il ?',
    unit: '',
    answer: 43,
    hint: 'Calcule le total assemblé, puis retire les pièces perdues.',
    explanation: '6 × 8 = 48 pièces. 48 − 5 = 43.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Tu t\'abonnes à une application à 3 € par mois. Combien paies-tu en 1 an ?',
    unit: '€',
    answer: 36,
    hint: '1 an = 12 mois.',
    explanation: '12 × 3 = 36 €.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'La batterie de ton smartphone est à 100 %. Chaque heure de jeu en consomme 8 %. Tu joues 7 heures. Quel pourcentage reste-t-il ?',
    unit: '%',
    answer: 44,
    hint: 'Calcule la consommation totale, puis soustrais de 100.',
    explanation: '7 × 8 = 56 %. 100 − 56 = 44 %.',
    level: 2
  },
  {
    category: 'logique',
    text: 'En binaire, les positions valent 8, 4, 2, 1. Le nombre 1010 vaut 1×8 + 0×4 + 1×2 + 0×1. Quel est ce nombre en décimal ?',
    unit: '',
    answer: 10,
    hint: 'Additionne uniquement les positions où il y a un "1".',
    explanation: '1×8 + 0×4 + 1×2 + 0×1 = 8 + 2 = 10.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Un programme prend un nombre, lui ajoute 3, puis le double. Le résultat est 22. Quel était le nombre de départ ?',
    unit: '',
    answer: 8,
    hint: 'Remonte à l\'envers : divise par 2, puis retire 3.',
    explanation: '22 ÷ 2 = 11. 11 − 3 = 8. Vérif : (8 + 3) × 2 = 22. ✓',
    level: 2
  },
  {
    category: 'logique',
    text: 'Un virus double le nombre d\'ordinateurs infectés chaque heure. On commence avec 2. Quel est le nombre suivant : 2, 4, 8, 16, 32, ?',
    unit: '',
    answer: 64,
    hint: 'Chaque nombre est le double du précédent.',
    explanation: '32 × 2 = 64.',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un écran de tablette mesure 12 cm de large et 9 cm de haut. Quelle est son aire ?',
    unit: 'cm²',
    answer: 108,
    hint: 'Aire d\'un rectangle = longueur × largeur.',
    explanation: '12 × 9 = 108 cm².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Une imprimante 3D fabrique un cube de 5 cm de côté. Quelle est l\'aire d\'une seule face ?',
    unit: 'cm²',
    answer: 25,
    hint: 'Chaque face est un carré.',
    explanation: '5 × 5 = 25 cm².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un pixel art est dessiné sur une grille de 8 cases de large et 6 de haut (1 cm par case). Quel est le périmètre de la grille ?',
    unit: 'cm',
    answer: 28,
    hint: 'Périmètre d\'un rectangle = 2 × (longueur + largeur).',
    explanation: '2 × (8 + 6) = 28 cm.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un disque dur de 500 Go est rempli aux 2/5. Combien de Go sont utilisés ?',
    unit: 'Go',
    answer: 200,
    hint: 'Calcule 2/5 de 500.',
    explanation: '500 ÷ 5 = 100. 100 × 2 = 200 Go.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Une carte mémoire de 32 Go est remplie aux 3/8. Combien de Go sont encore libres ?',
    unit: 'Go',
    answer: 20,
    hint: 'Calcule les Go utilisés, puis soustrais du total.',
    explanation: '3/8 de 32 = 12 Go utilisés. 32 − 12 = 20 Go libres.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un dossier de 120 Mo contient des photos (1/4), des vidéos (1/3) et des musiques (le reste). Combien de Mo de musiques ?',
    unit: 'Mo',
    answer: 50,
    hint: 'Calcule photos et vidéos, puis soustrais du total.',
    explanation: 'Photos : 120/4 = 30 Mo. Vidéos : 120/3 = 40 Mo. Musiques : 120 − 30 − 40 = 50 Mo.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Tu télécharges un jeu de 48 Mo à 4 Mo/s. Combien de secondes dure le téléchargement ?',
    unit: 's',
    answer: 12,
    hint: 'Temps = taille ÷ vitesse.',
    explanation: '48 ÷ 4 = 12 secondes.',
    ficheKey: 'vitesse',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Lila utilise son téléphone 45 minutes par jour. Combien de minutes en une semaine ?',
    unit: 'min',
    answer: 315,
    hint: '1 semaine = 7 jours.',
    explanation: '45 × 7 = 315 minutes.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Tu crées un mot de passe : 1 lettre (A, B ou C) puis 1 chiffre (1, 2, 3 ou 4). Combien de mots de passe différents ?',
    unit: '',
    answer: 12,
    hint: 'Pour chaque lettre, tu as 4 choix de chiffres.',
    explanation: '3 × 4 = 12 mots de passe (A1, A2, …, C4).',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un robot peut aller en Avant, Arrière, Gauche ou Droite. Tu programmes 2 mouvements. Combien de séquences différentes (répétitions autorisées) ?',
    unit: '',
    answer: 16,
    hint: '4 choix pour chaque mouvement.',
    explanation: '4 × 4 = 16 séquences.',
    level: 2
  },

  // ═══════════════════════════════════════════════════════════════════
  // LITTÉRAIRE
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'calcul',
    text: 'Dans la bibliothèque de Poudlard, 9 étagères contiennent chacune 12 livres de sorts et 7 grimoires. Combien de livres en tout ?',
    unit: '',
    answer: 171,
    hint: 'Calcule le total par étagère, puis multiplie par 9.',
    explanation: 'Par étagère : 12 + 7 = 19. Total : 9 × 19 = 171 livres.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Le Petit Prince visite 6 planètes. Sur chacune, il cueille 8 roses et en offre 3 au roi. Combien de roses lui reste-t-il après toutes ses visites ?',
    unit: '',
    answer: 30,
    hint: 'Calcule combien il garde par planète, puis multiplie par 6.',
    explanation: 'Par planète : 8 − 3 = 5 roses. Total : 6 × 5 = 30 roses.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Jules Verne écrit 4 pages par jour pendant 11 semaines. Combien de pages a-t-il écrites ?',
    unit: '',
    answer: 308,
    hint: 'Calcule d\'abord le nombre de jours en 11 semaines.',
    explanation: '11 × 7 = 77 jours. 77 × 4 = 308 pages.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Quatre personnages de contes attendent devant une bibliothèque. Le Chaperon Rouge arrive avant le Loup, mais après Cendrillon. Le Chat Botté arrive en dernier. Qui arrive en 3e position ?',
    unit: '',
    answer: null,
    textAnswer: 'le loup',
    hint: 'Classe-les du premier au dernier.',
    explanation: 'Cendrillon 1re, Chaperon Rouge 2e (après Cendrillon, avant le Loup), Loup 3e, Chat Botté 4e.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Dans une bibliothèque mystérieuse, un livre rouge vaut 3 points et un bleu 5 points. Alice a 7 livres et totalise 27 points. Combien de livres rouges ?',
    unit: '',
    answer: 4,
    hint: 'Si elle a x rouges, elle a (7 − x) bleus.',
    explanation: '3x + 5(7 − x) = 27 → 3x + 35 − 5x = 27 → −2x = −8 → x = 4 livres rouges.',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Le théâtre du Roi Lion a une scène rectangulaire de 8 m sur 5 m. Les acteurs posent un tapis sur toute la scène. Quelle est son aire ?',
    unit: 'm²',
    answer: 40,
    hint: 'Aire d\'un rectangle = longueur × largeur.',
    explanation: '8 × 5 = 40 m².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Le chapelier fou prépare une nappe triangulaire. Les trois côtés mesurent 12 cm, 9 cm et 15 cm. Quel est son périmètre ?',
    unit: 'cm',
    answer: 36,
    hint: 'Périmètre d\'un triangle = somme des trois côtés.',
    explanation: '12 + 9 + 15 = 36 cm.',
    ficheKey: 'perimetre',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Les trois petits cochons coupent une tarte en parts égales. Le 1er mange 1/4, le 2e mange 2/4. Quelle fraction reste pour le 3e ? Donne le dénominateur.',
    unit: '',
    answer: 4,
    hint: 'Additionne les parts mangées, puis soustrais de 1.',
    explanation: '1/4 + 2/4 = 3/4. Reste : 1 − 3/4 = 1/4. Dénominateur = 4.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Dans « La Belle et la Bête », la Bête possède 48 livres. Elle en offre 1/6 à Belle, puis 1/4 des restants aux serviteurs. Combien lui reste-t-il ?',
    unit: '',
    answer: 30,
    hint: 'Calcule d\'abord les livres offerts à Belle. Puis 1/4 des restants.',
    explanation: '1/6 de 48 = 8 à Belle. Reste : 40. 1/4 de 40 = 10 aux serviteurs. Reste : 30 livres.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Nemo nage 3 km le matin et 1 500 m l\'après-midi. Quelle distance totale en mètres ?',
    unit: 'm',
    answer: 4500,
    hint: 'Convertis les km en mètres, puis additionne.',
    explanation: '3 km = 3 000 m. 3 000 + 1 500 = 4 500 m.',
    ficheKey: 'longueurs',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Pinocchio part à 7h45 et arrive à l\'école à 8h20. Combien de minutes a duré son trajet ?',
    unit: '',
    answer: 35,
    hint: 'Calcule la différence entre l\'heure de départ et d\'arrivée.',
    explanation: '7h45 à 8h00 = 15 min. 8h00 à 8h20 = 20 min. Total : 35 minutes.',
    ficheKey: 'durees',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un imprimeur numérote les pages 1 à 50. Les pages 1-9 ont 1 chiffre, les pages 10-50 en ont 2. Combien de chiffres écrit-il en tout ?',
    unit: '',
    answer: 91,
    hint: 'Compte les chiffres des pages à 1 chiffre et à 2 chiffres séparément.',
    explanation: 'Pages 1-9 : 9 × 1 = 9 chiffres. Pages 10-50 : 41 × 2 = 82 chiffres. Total : 9 + 82 = 91.',
    level: 2
  },

  // ═══════════════════════════════════════════════════════════════════
  // HISTOIRE
  // ═══════════════════════════════════════════════════════════════════
  {
    category: 'calcul',
    text: 'Les bâtisseurs de la pyramide de Khéops travaillent en équipes de 20. 8 équipes le matin, 5 l\'après-midi. Combien d\'ouvriers par jour ?',
    unit: '',
    answer: 260,
    hint: 'Calcule matin et après-midi séparément, puis additionne.',
    explanation: 'Matin : 8 × 20 = 160. Après-midi : 5 × 20 = 100. Total : 260 ouvriers.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Jules César a conquis la Gaule en 52 av. J.-C. Napoléon est né en 1769. Combien d\'années les séparent ?',
    unit: 'ans',
    answer: 1821,
    hint: 'Pour un écart entre avant et après J.-C., additionne les deux nombres.',
    explanation: '52 + 1769 = 1 821 ans.',
    level: 2
  },
  {
    category: 'calcul',
    text: 'Un corsaire capture 3 navires. Le 1er contient 144 pièces d\'or, le 2e la moitié, le 3e le double du 1er. Combien de pièces en tout ?',
    unit: '',
    answer: 504,
    hint: 'Calcule chaque navire séparément, puis additionne.',
    explanation: '144 + 72 + 288 = 504 pièces d\'or.',
    level: 2
  },
  {
    category: 'logique',
    text: 'Trois explorateurs — Marco, Ibn et Zheng — découvrent chacun un continent : Amérique, Afrique, Asie. Zheng découvre l\'Asie. Ibn ne découvre pas l\'Amérique. Quel continent pour Marco ?',
    unit: '',
    answer: null,
    textAnswer: 'amérique',
    hint: 'Place Zheng d\'abord, puis déduis Ibn, puis Marco.',
    explanation: 'Zheng → Asie. Ibn pas l\'Amérique (et l\'Asie est prise) → Ibn → Afrique. Reste l\'Amérique pour Marco.',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'La base de la Grande Pyramide est un carré de 230 m de côté. Quelle est l\'aire de sa base ?',
    unit: 'm²',
    answer: 52900,
    hint: 'Aire d\'un carré = côté × côté.',
    explanation: '230 × 230 = 52 900 m².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'geometrie',
    text: 'Un forum romain est un carré de 45 m de côté. Quelle est son aire ?',
    unit: 'm²',
    answer: 2025,
    hint: 'Aire d\'un carré = côté × côté.',
    explanation: '45 × 45 = 2 025 m².',
    ficheKey: 'aire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un pirate partage 360 pièces d\'or. Il donne 1/4 au 1er mousse, 1/3 au 2e et 1/6 au 3e. Combien garde-t-il ?',
    unit: 'pièces',
    answer: 90,
    hint: 'Calcule la part de chaque mousse, additionne, puis soustrais du total.',
    explanation: '1/4 de 360 = 90. 1/3 de 360 = 120. 1/6 de 360 = 60. Distribué : 270. Reste : 90 pièces.',
    ficheKey: 'partage',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Les chevaliers de la Table Ronde partagent un sanglier en 8 parts. Le roi Arthur en mange 3. Quelle fraction reste pour les autres ? Donne le numérateur.',
    unit: '',
    answer: 5,
    hint: 'Le sanglier entier = 8/8. Arthur mange 3/8.',
    explanation: '8/8 − 3/8 = 5/8. Numérateur = 5.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'fractions',
    text: 'Un alchimiste a 240 mL de potion. Il utilise 3/4 pour un sortilège. Combien de mL lui reste-t-il ?',
    unit: 'mL',
    answer: 60,
    hint: 'Calcule 3/4 de 240, puis soustrais.',
    explanation: '3/4 de 240 = 180 mL utilisés. Reste : 240 − 180 = 60 mL.',
    ficheKey: 'fractions_lire',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Un légionnaire romain marche 24 km par jour à 4 km/h. Combien d\'heures marche-t-il ?',
    unit: 'heures',
    answer: 6,
    hint: 'Temps = distance ÷ vitesse.',
    explanation: '24 ÷ 4 = 6 heures.',
    ficheKey: 'vitesse',
    level: 2
  },
  {
    category: 'mesures',
    text: 'Les Égyptiens utilisaient la "coudée" (≈ 52 cm). Si une statue mesure 7 coudées, quelle est sa hauteur en cm ?',
    unit: 'cm',
    answer: 364,
    hint: 'Multiplie le nombre de coudées par la valeur d\'une coudée.',
    explanation: '7 × 52 = 364 cm.',
    ficheKey: 'longueurs',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un pharaon dispose de 3 hiéroglyphes (scarabée, œil, serpent). Il crée des codes de 2 symboles différents, où l\'ordre compte. Combien de codes possibles ?',
    unit: '',
    answer: 6,
    hint: 'Chaque symbole en 1re position peut être suivi de 2 autres.',
    explanation: '3 choix × 2 choix = 6 codes différents.',
    level: 2
  },
  {
    category: 'ouvert',
    text: 'Un capitaine pirate veut 1 navigateur parmi 4 candidats et 1 canonnier parmi 3. Combien de duos différents peut-il former ?',
    unit: '',
    answer: 12,
    hint: 'Pour chaque navigateur, il y a 3 canonniers.',
    explanation: '4 × 3 = 12 duos.',
    level: 2
  },
];

// ── Geography Data ──────────────────────────────────────────────────

const GEO_DATA = [
  // Level 1 — très connus (CE2, 8 ans)
  { country: 'France',       flag: '🇫🇷', capital: 'Paris',       continent: 'Europe',  level: 1 },
  { country: 'Allemagne',    flag: '🇩🇪', capital: 'Berlin',      continent: 'Europe',  level: 1 },
  { country: 'Espagne',      flag: '🇪🇸', capital: 'Madrid',      continent: 'Europe',  level: 1 },
  { country: 'Italie',       flag: '🇮🇹', capital: 'Rome',        continent: 'Europe',  level: 1 },
  { country: 'Royaume-Uni',  flag: '🇬🇧', capital: 'Londres',     continent: 'Europe',  level: 1 },
  { country: 'États-Unis',   flag: '🇺🇸', capital: 'Washington',  continent: 'Amérique', level: 1 },
  { country: 'Brésil',       flag: '🇧🇷', capital: 'Brasilia',    continent: 'Amérique', level: 1 },
  { country: 'Chine',        flag: '🇨🇳', capital: 'Pékin',       continent: 'Asie',    level: 1 },
  { country: 'Japon',        flag: '🇯🇵', capital: 'Tokyo',       continent: 'Asie',    level: 1 },
  { country: 'Australie',    flag: '🇦🇺', capital: 'Canberra',    continent: 'Océanie', level: 1 },
  { country: 'Canada',       flag: '🇨🇦', capital: 'Ottawa',      continent: 'Amérique', level: 1 },
  { country: 'Russie',       flag: '🇷🇺', capital: 'Moscou',      continent: 'Europe',  level: 1 },
  { country: 'Inde',         flag: '🇮🇳', capital: 'New Delhi',   continent: 'Asie',    level: 1 },
  { country: 'Mexique',      flag: '🇲🇽', capital: 'Mexico',      continent: 'Amérique', level: 1 },
  { country: 'Égypte',       flag: '🇪🇬', capital: 'Le Caire',    continent: 'Afrique', level: 1 },
  // Level 2 — Europe + grands pays (CM2, 10 ans)
  { country: 'Suisse',       flag: '🇨🇭', capital: 'Berne',       continent: 'Europe',  level: 2 },
  { country: 'Belgique',     flag: '🇧🇪', capital: 'Bruxelles',   continent: 'Europe',  level: 2 },
  { country: 'Portugal',     flag: '🇵🇹', capital: 'Lisbonne',    continent: 'Europe',  level: 2 },
  { country: 'Pays-Bas',     flag: '🇳🇱', capital: 'Amsterdam',   continent: 'Europe',  level: 2 },
  { country: 'Autriche',     flag: '🇦🇹', capital: 'Vienne',      continent: 'Europe',  level: 2 },
  { country: 'Grèce',        flag: '🇬🇷', capital: 'Athènes',     continent: 'Europe',  level: 2 },
  { country: 'Suède',        flag: '🇸🇪', capital: 'Stockholm',   continent: 'Europe',  level: 2 },
  { country: 'Norvège',      flag: '🇳🇴', capital: 'Oslo',        continent: 'Europe',  level: 2 },
  { country: 'Pologne',      flag: '🇵🇱', capital: 'Varsovie',    continent: 'Europe',  level: 2 },
  { country: 'Turquie',      flag: '🇹🇷', capital: 'Ankara',      continent: 'Asie',    level: 2 },
  { country: 'Argentine',    flag: '🇦🇷', capital: 'Buenos Aires', continent: 'Amérique', level: 2 },
  { country: 'Maroc',        flag: '🇲🇦', capital: 'Rabat',       continent: 'Afrique', level: 2 },
  { country: 'Afrique du Sud', flag: '🇿🇦', capital: 'Pretoria',  continent: 'Afrique', level: 2 },
  { country: 'Corée du Sud', flag: '🇰🇷', capital: 'Séoul',       continent: 'Asie',    level: 2 },
  { country: 'Thaïlande',    flag: '🇹🇭', capital: 'Bangkok',     continent: 'Asie',    level: 2 },
  // Level 3 — pays moins connus (6ème, 12 ans)
  { country: 'Irlande',      flag: '🇮🇪', capital: 'Dublin',      continent: 'Europe',  level: 3 },
  { country: 'Finlande',     flag: '🇫🇮', capital: 'Helsinki',    continent: 'Europe',  level: 3 },
  { country: 'Danemark',     flag: '🇩🇰', capital: 'Copenhague',  continent: 'Europe',  level: 3 },
  { country: 'Croatie',      flag: '🇭🇷', capital: 'Zagreb',      continent: 'Europe',  level: 3 },
  { country: 'Roumanie',     flag: '🇷🇴', capital: 'Bucarest',    continent: 'Europe',  level: 3 },
  { country: 'Hongrie',      flag: '🇭🇺', capital: 'Budapest',    continent: 'Europe',  level: 3 },
  { country: 'Tchéquie',     flag: '🇨🇿', capital: 'Prague',      continent: 'Europe',  level: 3 },
  { country: 'Colombie',     flag: '🇨🇴', capital: 'Bogota',      continent: 'Amérique', level: 3 },
  { country: 'Pérou',        flag: '🇵🇪', capital: 'Lima',        continent: 'Amérique', level: 3 },
  { country: 'Chili',        flag: '🇨🇱', capital: 'Santiago',    continent: 'Amérique', level: 3 },
  { country: 'Vietnam',      flag: '🇻🇳', capital: 'Hanoï',       continent: 'Asie',    level: 3 },
  { country: 'Philippines',  flag: '🇵🇭', capital: 'Manille',     continent: 'Asie',    level: 3 },
  { country: 'Indonésie',    flag: '🇮🇩', capital: 'Jakarta',     continent: 'Asie',    level: 3 },
  { country: 'Nigeria',      flag: '🇳🇬', capital: 'Abuja',       continent: 'Afrique', level: 3 },
  { country: 'Kenya',        flag: '🇰🇪', capital: 'Nairobi',     continent: 'Afrique', level: 3 },
  { country: 'Nouvelle-Zélande', flag: '🇳🇿', capital: 'Wellington', continent: 'Océanie', level: 3 },
];

const GEO_CONTINENTS = ['Europe', 'Amérique', 'Asie', 'Afrique', 'Océanie'];

function normalizeGeo(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function generateGeographie(subLevel) {
  const pool = GEO_DATA.filter(g => g.level <= subLevel);
  const entry = pick(pool);
  const questionType = pick(['flag', 'continent', 'capital']);

  if (questionType === 'flag') {
    // Quel pays a ce drapeau ?
    return {
      category: 'geographie',
      text: `Quel pays est représenté par ce drapeau ? ${entry.flag}`,
      answer: null,
      textAnswer: entry.country,
      acceptedAnswers: [entry.country],
      unit: '',
      hint: `Ce pays se trouve en ${entry.continent}.`,
      explanation: `${entry.flag} est le drapeau de ${entry.country} (capitale : ${entry.capital}).`,
    };
  }

  if (questionType === 'continent') {
    // Sur quel continent se trouve ce pays ? (QCM)
    const choices = shuffleArray([...GEO_CONTINENTS]);
    return {
      category: 'geographie',
      text: `Sur quel continent se trouve ${entry.country} ${entry.flag} ?`,
      answer: null,
      textAnswer: entry.continent,
      qcmChoices: choices,
      unit: '',
      hint: `La capitale de ${entry.country} est ${entry.capital}.`,
      explanation: `${entry.country} se trouve en ${entry.continent}.`,
    };
  }

  // Capital — réponse texte, indice = 2 premières lettres
  const hintLetters = entry.capital.slice(0, 2);
  return {
    category: 'geographie',
    text: `Quelle est la capitale de ${entry.country} ${entry.flag} ?`,
    answer: null,
    textAnswer: entry.capital,
    acceptedAnswers: [entry.capital],
    unit: '',
    hint: `La capitale commence par "${hintLetters}..."`,
    explanation: `La capitale de ${entry.country} est ${entry.capital}.`,
  };
}

// ── Main Entry Point ────────────────────────────────────────────────
const GENERATORS = {
  calcul:    generateCalcul,
  logique:   generateLogique,
  geometrie: generateGeometrie,
  fractions: generateFractions,
  mesures:   generateMesures,
  ouvert:    generateOuvert,
  geographie: generateGeographie
};

function generateQuestion(category, subLevel, lastCategory) {
  // Resolve 'all' to a random category, avoiding the last one
  const catKeys = Object.keys(CATEGORIES);
  let cat;
  if (category === 'all') {
    const available = lastCategory ? catKeys.filter(k => k !== lastCategory && k !== 'revision') : catKeys.filter(k => k !== 'revision');
    cat = pick(available);
  } else {
    cat = category;
  }

  // If subLevel is a catLevel map (object), resolve to number for this category
  let level = subLevel;
  if (typeof subLevel === 'object' && subLevel !== null) {
    level = Math.max(1, Math.min(3, subLevel[cat] || 2));
  }

  // 20% chance to pick from RIDDLE_BANK
  if (Math.random() < 0.2) {
    const matches = RIDDLE_BANK.filter(r => r.category === cat && (!r.level || r.level === level));
    if (matches.length > 0) {
      return { ...pick(matches) };
    }
  }

  // Use the generator
  const generator = GENERATORS[cat];
  if (generator) {
    return generator(level);
  }

  // Fallback — should not happen
  return generateCalcul(subLevel);
}

// ── Boss Fight Data ──────────────────────────────────────────────────

const BOSS_POOL = [
  { id: 'dragon',    name: 'Dragon des Fractions',     emoji: '🐉', category: 'fractions', stake: 50, hp: 5, color: '#3d1212', lootType: 'theme',   lootId: 'boss_dragon',  lootName: 'Antre du Dragon' },
  { id: 'golem',     name: 'Golem du Calcul',          emoji: '🤖', category: 'calcul',    stake: 40, hp: 4, color: '#1a2a1a', lootType: 'title',   lootId: 'boss_golem',   lootName: 'Briseur de Golem' },
  { id: 'sorcier',   name: 'Sorcier de Logique',       emoji: '🧙', category: 'logique',   stake: 60, hp: 5, color: '#1a1a3d', lootType: 'sticker', lootId: 'boss_sorcier', lootName: 'Grimoire' },
  { id: 'sphinx',    name: 'Sphinx de Géométrie',      emoji: '📐', category: 'geometrie', stake: 50, hp: 5, color: '#2a2a1a', lootType: 'badge',   lootId: 'boss_sphinx',  lootName: 'Œil du Sphinx' },
  { id: 'alchimiste',name: 'Alchimiste des Mesures',   emoji: '⚗️', category: 'mesures',   stake: 50, hp: 5, color: '#1a2a2a', lootType: 'effect',  lootId: 'boss_alchimiste', lootName: 'Potions' },
  { id: 'kraken',    name: 'Kraken des Problèmes',     emoji: '🌀', category: 'ouvert',    stake: 70, hp: 6, color: '#0a1530', lootType: 'theme',   lootId: 'boss_kraken',  lootName: 'Abysses' },
];

const BOSS_QUESTIONS = [
  // Dragon des Fractions
  {
    boss: 'dragon',
    steps: [
      { text: "Marie a 3/4 d'une pizza. Elle en mange 1/3 de ce qu'elle a. Combien de pizza a-t-elle mangé ? (en fraction décimale)", answer: 0.25, unit: '', hint: "1/3 de 3/4 = ?", explanation: "1/3 × 3/4 = 3/12 = 1/4 = 0.25" },
      { text: "Combien de pizza lui reste-t-il ? (en fraction décimale)", answer: 0.5, unit: '', hint: "3/4 − 1/4 = ?", explanation: "3/4 − 1/4 = 2/4 = 1/2 = 0.5" },
    ]
  },
  {
    boss: 'dragon',
    steps: [
      { text: "Un gâteau est partagé en 8 parts. Liam mange 3 parts, Noé mange 2 parts. Quelle fraction du gâteau reste-t-il ? Donne le numérateur (dénominateur = 8).", answer: 3, unit: '', hint: "8 − 3 − 2 = ?", explanation: "8 − 3 − 2 = 3 parts restantes, soit 3/8." },
      { text: "Si on partage ce reste entre 3 personnes, chacune reçoit combien de huitièmes ?", answer: 1, unit: '', hint: "3 parts ÷ 3 personnes", explanation: "3 ÷ 3 = 1. Chacun reçoit 1/8 du gâteau." },
    ]
  },
  {
    boss: 'dragon',
    steps: [
      { text: "Un réservoir est rempli au 2/5. On ajoute 1/5 de sa capacité. À quelle fraction est-il rempli ? Donne le numérateur (dénominateur = 5).", answer: 3, unit: '', hint: "2/5 + 1/5 = ?", explanation: "2/5 + 1/5 = 3/5" },
      { text: "Le réservoir fait 100 litres. Combien de litres contient-il maintenant ?", answer: 60, unit: 'litres', hint: "3/5 de 100", explanation: "3/5 × 100 = 60 litres" },
    ]
  },
  // Golem du Calcul
  {
    boss: 'golem',
    steps: [
      { text: "Un train roule à 120 km/h pendant 2h30. Quelle distance parcourt-il ?", answer: 300, unit: 'km', hint: "120 × 2.5", explanation: "120 × 2.5 = 300 km" },
      { text: "Il lui reste 180 km. Combien de minutes lui faut-il encore ?", answer: 90, unit: 'min', hint: "180 ÷ 120 = ? heures, puis convertis en minutes", explanation: "180 ÷ 120 = 1.5 h = 90 minutes" },
    ]
  },
  {
    boss: 'golem',
    steps: [
      { text: "Un magasin vend 3 cartons de 24 bouteilles et 5 cartons de 12 bouteilles. Combien de bouteilles en tout ?", answer: 132, unit: '', hint: "3×24 + 5×12", explanation: "3×24=72, 5×12=60, 72+60=132" },
      { text: "Chaque bouteille coûte 2€. On a une réduction de 15€. Quel est le prix final ?", answer: 249, unit: '€', hint: "132 × 2 − 15", explanation: "132 × 2 = 264, 264 − 15 = 249€" },
    ]
  },
  {
    boss: 'golem',
    steps: [
      { text: "Papa a 250€. Il achète 3 livres à 18€ chacun. Combien lui reste-t-il ?", answer: 196, unit: '€', hint: "250 − 3×18", explanation: "3×18=54, 250−54=196€" },
      { text: "Il veut acheter un jeu à 45€ et un sac à 38€. A-t-il assez ? Si oui, combien lui restera-t-il ?", answer: 113, unit: '€', hint: "196 − 45 − 38", explanation: "45+38=83, 196−83=113€. Oui, il a assez !" },
    ]
  },
  // Sorcier de Logique
  {
    boss: 'sorcier',
    steps: [
      { text: "Une suite magique : 2, 6, 18, 54, ... Quel est le nombre suivant ?", answer: 162, unit: '', hint: "Chaque nombre est multiplié par...", explanation: "×3 à chaque fois. 54 × 3 = 162" },
      { text: "Quel est le 7ème nombre de cette suite ?", answer: 1458, unit: '', hint: "Continue : 162, 486, ...", explanation: "162, 486, 1458. Le 7ème = 1458" },
    ]
  },
  {
    boss: 'sorcier',
    steps: [
      { text: "J'ai un nombre. Si je le multiplie par 3 et que j'ajoute 7, j'obtiens 34. Quel est ce nombre ?", answer: 9, unit: '', hint: "(34 − 7) ÷ 3", explanation: "34 − 7 = 27, 27 ÷ 3 = 9" },
      { text: "Si maintenant je prends ce nombre, je le mets au carré et je retire 1, qu'est-ce que j'obtiens ?", answer: 80, unit: '', hint: "9 × 9 − 1", explanation: "9² = 81, 81 − 1 = 80" },
    ]
  },
  // Sphinx de Géométrie
  {
    boss: 'sphinx',
    steps: [
      { text: "Un rectangle mesure 12 cm de long et 8 cm de large. Quel est son périmètre ?", answer: 40, unit: 'cm', hint: "2 × (12 + 8)", explanation: "2 × (12+8) = 2×20 = 40 cm" },
      { text: "On coupe ce rectangle en diagonale. Quelle est l'aire d'un des triangles obtenus ?", answer: 48, unit: 'cm²', hint: "L'aire du rectangle ÷ 2", explanation: "12×8=96, 96÷2 = 48 cm²" },
    ]
  },
  {
    boss: 'sphinx',
    steps: [
      { text: "Un carré a un périmètre de 36 cm. Quel est son côté ?", answer: 9, unit: 'cm', hint: "Périmètre ÷ 4", explanation: "36 ÷ 4 = 9 cm" },
      { text: "Ce carré a un côté de 9 cm. Quelle est son aire ?", answer: 81, unit: 'cm²', hint: "côté × côté", explanation: "9 × 9 = 81 cm²" },
    ]
  },
  // Alchimiste des Mesures
  {
    boss: 'alchimiste',
    steps: [
      { text: "Une potion nécessite 1,5 litre d'eau. Combien de millilitres cela fait-il ?", answer: 1500, unit: 'ml', hint: "1 litre = 1000 ml", explanation: "1.5 × 1000 = 1500 ml" },
      { text: "Si on divise en flacons de 250 ml, combien de flacons obtient-on ?", answer: 6, unit: 'flacons', hint: "1500 ÷ 250", explanation: "1500 ÷ 250 = 6 flacons" },
    ]
  },
  {
    boss: 'alchimiste',
    steps: [
      { text: "Un cours de magie dure 1h45. Il commence à 14h30. À quelle heure finit-il ? (format HHMM, ex: 1615)", answer: 1615, unit: '', hint: "14h30 + 1h45", explanation: "14h30 + 1h = 15h30, + 45min = 16h15" },
      { text: "Le sorcier fait 3 cours par jour avec 15 min de pause entre chaque. Combien de temps dure sa journée de travail en minutes ?", answer: 345, unit: 'min', hint: "3 × 105 min + 2 × 15 min", explanation: "3×105=315 min de cours + 2×15=30 min de pause = 345 min" },
    ]
  },
  // Kraken des Problèmes
  {
    boss: 'kraken',
    steps: [
      { text: "Un navire transporte 240 caisses. 1/3 sont déchargées au port A, puis 1/4 du reste au port B. Combien de caisses restent ?", answer: 120, unit: 'caisses', hint: "D'abord 240÷3, puis le reste ÷4", explanation: "Port A: 240÷3=80 déchargées, reste 160. Port B: 160÷4=40 déchargées, reste 120." },
      { text: "Chaque caisse pèse 15 kg. Quel est le poids total restant en kg ?", answer: 1800, unit: 'kg', hint: "120 × 15", explanation: "120 × 15 = 1800 kg" },
    ]
  },
  {
    boss: 'kraken',
    steps: [
      { text: "Un aquarium contient 5 poissons. Chaque mois, le nombre double. Combien de poissons après 4 mois ?", answer: 80, unit: '', hint: "5, 10, 20, ...", explanation: "Mois 1: 10, Mois 2: 20, Mois 3: 40, Mois 4: 80" },
      { text: "L'aquarium peut contenir 200 poissons maximum. Après combien de mois sera-t-il plein ? (en partant de 5)", answer: 6, unit: 'mois', hint: "Continue à doubler: 80, 160, ...", explanation: "Mois 5: 160, Mois 6: 320 > 200. Plein au mois 6." },
    ]
  },
];

/** Pick a random multi-step question for a given boss */
function getBossQuestion(bossId) {
  const pool = BOSS_QUESTIONS.filter(q => q.boss === bossId);
  return pick(pool);
}
