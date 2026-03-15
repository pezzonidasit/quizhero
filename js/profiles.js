const ProfileManager = {
  // Get all profiles: returns array of {id, name, theme, createdAt}
  getAll() {
    try { return JSON.parse(localStorage.getItem('mq_profiles') || '[]'); }
    catch { return []; }
  },

  _saveList(profiles) {
    localStorage.setItem('mq_profiles', JSON.stringify(profiles));
  },

  // Create profile with name and themeId, initializes all data fields
  create(name, themeId) {
    const profiles = this.getAll();
    const id = Date.now().toString(36);
    const profile = { id, name, theme: themeId, createdAt: Date.now() };
    profiles.push(profile);
    this._saveList(profiles);

    // Initialize all data fields
    this._setData(id, 'xp', 0);
    this._setData(id, 'coins', 0);
    this._setData(id, 'gamesPlayed', 0);
    this._setData(id, 'goodGamesStreak', 0);
    this._setData(id, 'records', {});
    this._setData(id, 'badges', []);
    this._setData(id, 'catStats', {});
    this._setData(id, 'ownedThemes', [...FREE_THEMES]);
    this._setData(id, 'activeTheme', themeId);
    this._setData(id, 'inventory', []);
    this._setData(id, 'chestsOpened', []);
    this._setData(id, 'xpBoostActive', false);
    this._setData(id, 'freeHints', 0);
    this._setData(id, 'shields', 0);
    this._setData(id, 'ownedStickers', []);
    this._setData(id, 'boosts', {});

    return profile;
  },

  // Delete profile and all its namespaced data
  delete(id) {
    const profiles = this.getAll().filter(p => p.id !== id);
    this._saveList(profiles);

    // Clean all localStorage keys with prefix mq_p_{id}_
    const prefix = 'mq_p_' + id + '_';
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // Clear active profile if it matches
    if (this.getActiveId() === id) {
      localStorage.removeItem('mq_activeProfile');
    }
  },

  getActiveId() {
    return localStorage.getItem('mq_activeProfile');
  },

  setActive(id) {
    localStorage.setItem('mq_activeProfile', id);
  },

  getActive() {
    const id = this.getActiveId();
    if (!id) return null;
    return this.getAll().find(p => p.id === id) || null;
  },

  // Namespaced storage: key = 'mq_p_' + id + '_' + field
  _key(id, field) {
    return 'mq_p_' + id + '_' + field;
  },

  _setData(id, field, value) {
    localStorage.setItem(this._key(id, field), JSON.stringify(value));
  },

  _getData(id, field, fallback) {
    try {
      const raw = localStorage.getItem(this._key(id, field));
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  },

  // Convenience for active profile
  get(field, fallback) {
    const id = this.getActiveId();
    if (!id) return fallback;
    return this._getData(id, field, fallback);
  },

  set(field, value) {
    const id = this.getActiveId();
    if (!id) return;
    this._setData(id, field, value);
  },

  // Update profile metadata (name, theme, etc.)
  updateMeta(id, updates) {
    const profiles = this.getAll();
    const profile = profiles.find(p => p.id === id);
    if (!profile) return null;
    Object.assign(profile, updates);
    this._saveList(profiles);
    return profile;
  },
};
