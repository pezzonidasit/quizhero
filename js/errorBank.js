/* QuizHero — Error Bank (répétition espacée des erreurs)
 * Depends on: profiles.js (ProfileManager).
 * buildRevancheQuestion vit dans app.js (a besoin de getSubLevel + generateUniqueQuestion).
 * Le cœur pur ci-dessous ne touche NI le DOM NI ProfileManager → testable en hermétique.
 */

// ── Pure core ────────────────────────────────────────────────────────
const EB_BOX_INTERVALS = [1, 3, 7, 16, 35]; // jours, index = box-1
const EB_MAX_BOX = 5;
const EB_MAX_REVANCHE = 2;   // injectées par partie normale
const EB_MAX_SESSION = 10;   // taille max de l'écran dédié
const EB_BADGE_THRESHOLDS = [10, 50];

function ebIntervalForBox(box) {
  const i = Math.max(1, Math.min(EB_MAX_BOX, box)) - 1;
  return EB_BOX_INTERVALS[i];
}

function ebNextBox(box, correct) {
  if (!correct) return 1;
  return Math.min(EB_MAX_BOX, (box || 1) + 1);
}

function ebAddDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function ebNextDue(todayStr, box) {
  return ebAddDays(todayStr, ebIntervalForBox(box));
}

function ebIsDue(card, todayStr) {
  return !!card && card.due <= todayStr;
}

function ebCardKeyFor(q) {
  return (q && (q.ficheKey || q.category)) || null;
}

function ebSelectDue(cardsObj, todayStr) {
  return Object.entries(cardsObj || {})
    .filter(([, c]) => ebIsDue(c, todayStr))
    .sort((a, b) =>
      a[1].due < b[1].due ? -1 :
      a[1].due > b[1].due ? 1 :
      (a[1].box - b[1].box))
    .map(([key, c]) => Object.assign({ key }, c));
}

// ── State wrappers (ProfileManager) ──────────────────────────────────
function ebToday() { return new Date().toISOString().slice(0, 10); }

const ErrorBank = {
  _get() {
    const d = ProfileManager.get('errorBank', { cards: {}, cleared: 0 });
    // Firebase strips empty objects, so a restored bank may arrive without `cards`.
    if (!d.cards) d.cards = {};
    return d;
  },
  _set(data) { ProfileManager.set('errorBank', data); },

  recordError(q) {
    const key = ebCardKeyFor(q);
    if (!key || q.category === 'revision') return;
    const data = this._get();
    const today = ebToday();
    const existing = data.cards[key];
    data.cards[key] = {
      category: q.category,
      ficheKey: q.ficheKey || null,
      box: 1,
      due: ebAddDays(today, 1),
      sampleText: q.text || (existing && existing.sampleText) || '',
      misses: (existing ? existing.misses : 0) + 1,
      createdAt: existing ? existing.createdAt : today,
    };
    this._set(data);
  },

  review(cardKey, correct) {
    const data = this._get();
    const card = data.cards[cardKey];
    if (!card) return;
    const today = ebToday();
    if (correct) {
      card.box = ebNextBox(card.box, true);
      card.due = ebNextDue(today, card.box);
      data.cleared = (data.cleared || 0) + 1;
    } else {
      card.box = 1;
      card.due = ebAddDays(today, 1);
    }
    this._set(data);
  },

  handleAnswer(q, isCorrect) {
    if (!q) return;
    if (q._revanche && q._cardKey) this.review(q._cardKey, isCorrect);
    else if (!isCorrect) this.recordError(q);
  },

  getDueCards() { return ebSelectDue(this._get().cards, ebToday()); },
  getDueCount() { return this.getDueCards().length; },
  getCleared() { return this._get().cleared || 0; },
};
