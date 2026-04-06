/**
 * Lyric Live — Wheelie Fun Hub Integration
 * Arts Mobile Community Center
 *
 * Main application logic
 */

'use strict';

/* ─── Configuration ──────────────────────────────────────── */

const APP_CONFIG = {
  name: 'Lyric Live',
  venue: 'Wheelie Fun Hub',
  organization: 'Arts Mobile Community Center',
  version: '1.0.0',
  defaultTier: 'free',
  tiers: {
    free: {
      label: 'Free',
      maxSetlistItems: 5,
      themes: ['dark'],
      fontSizes: ['md', 'lg'],
      projectionMode: false,
      autoAdvance: false,
    },
    basic: {
      label: 'Basic',
      maxSetlistItems: 20,
      themes: ['dark', 'light', 'pink'],
      fontSizes: ['sm', 'md', 'lg', 'xl'],
      projectionMode: true,
      autoAdvance: false,
    },
    pro: {
      label: 'Pro',
      maxSetlistItems: Infinity,
      themes: ['dark', 'light', 'pink', 'blue', 'wheelie'],
      fontSizes: ['sm', 'md', 'lg', 'xl', 'xxl'],
      projectionMode: true,
      autoAdvance: true,
    },
  },
};

/* ─── Display label maps ─────────────────────────────────── */

const THEME_LABELS = {
  dark:    'Dark',
  light:   'Light',
  pink:    'Pink Night',
  blue:    'Ocean Blue',
  wheelie: 'Wheelie Fun',
};

const FONT_SIZE_LABELS = {
  sm:  'Small',
  md:  'Medium',
  lg:  'Large',
  xl:  'Extra Large',
  xxl: 'Giant',
};

const KEYBOARD_EXCLUDED_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

/* ─── State ──────────────────────────────────────────────── */

const state = {
  tier: APP_CONFIG.defaultTier,
  songs: [],
  filteredSongs: [],
  currentSong: null,
  currentVerseIndex: 0,
  setlist: [],
  currentSetlistIndex: -1,
  searchQuery: '',
  activeCategory: 'all',
  activeTab: 'songs',
  settings: {
    theme: 'dark',
    fontSize: 'lg',
    showVerseLabels: true,
    autoAdvance: false,
    autoAdvanceDelay: 8,
    watermark: true,
  },
  projectionOpen: false,
  savedSetlistIds: null,
};

/* ─── Persistence (localStorage) ────────────────────────── */

const STORAGE_KEY = 'lyricLive_state';

function saveState() {
  try {
    const persist = {
      tier: state.tier,
      settings: state.settings,
      setlist: state.setlist.map(s => s.id),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persist));
  } catch (_) {
    // localStorage unavailable (private mode, storage quota, etc.) — ignore
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.tier && APP_CONFIG.tiers[saved.tier]) {
      state.tier = saved.tier;
    }
    if (saved.settings && typeof saved.settings === 'object') {
      const s = saved.settings;
      const allThemes = Object.keys(THEME_LABELS);
      const allFontSizes = Object.keys(FONT_SIZE_LABELS);
      if (allThemes.includes(s.theme))         state.settings.theme            = s.theme;
      if (allFontSizes.includes(s.fontSize))   state.settings.fontSize         = s.fontSize;
      if (typeof s.showVerseLabels === 'boolean') state.settings.showVerseLabels = s.showVerseLabels;
      if (typeof s.autoAdvance    === 'boolean') state.settings.autoAdvance     = s.autoAdvance;
      if (typeof s.autoAdvanceDelay === 'number' &&
          s.autoAdvanceDelay >= 1 && s.autoAdvanceDelay <= 60) {
        state.settings.autoAdvanceDelay = s.autoAdvanceDelay;
      }
      if (typeof s.watermark === 'boolean')    state.settings.watermark        = s.watermark;
    }
    if (Array.isArray(saved.setlist)) {
      state.savedSetlistIds = saved.setlist;
    }
  } catch (_) {
    // Corrupt or unreadable data — start fresh
  }
}

function restoreSetlist() {
  if (!state.savedSetlistIds) return;
  state.setlist = state.savedSetlistIds
    .map(id => state.songs.find(s => s.id === id))
    .filter(Boolean);
  state.savedSetlistIds = null;
}

/* ─── DOM refs ───────────────────────────────────────────── */

const dom = {
  songList: null,
  setlistItems: null,
  lyricsPreview: null,
  verseNav: null,
  songTitleDisplay: null,
  verseCounter: null,
  searchInput: null,
  categoryFilter: null,
  tierBadge: null,
  projectionOverlay: null,
  projLyrics: null,
  projVerseLabel: null,
  projVerseCounter: null,
  toastContainer: null,
  upgradeModal: null,
  setlistEmpty: null,
  statusSongCount: null,
  statusSetlistCount: null,
};

/* ─── Initialisation ─────────────────────────────────────── */

async function init() {
  cacheDomRefs();
  loadState();
  await loadSongs();
  restoreSetlist();
  renderSongList();
  renderCategories();
  renderSetlist();
  applySettings();
  bindEvents();
  updateStatusBar();
  toast('info', '🎡 Wheelie Fun Hub — Lyric Live ready!');
}

function cacheDomRefs() {
  dom.songList           = document.getElementById('song-list');
  dom.setlistItems       = document.getElementById('setlist-items');
  dom.lyricsPreview      = document.getElementById('lyrics-preview');
  dom.verseNav           = document.getElementById('verse-nav');
  dom.songTitleDisplay   = document.getElementById('song-title-display');
  dom.verseCounter       = document.getElementById('verse-counter');
  dom.searchInput        = document.getElementById('search-input');
  dom.categoryFilter     = document.getElementById('category-filter');
  dom.tierBadge          = document.getElementById('tier-badge');
  dom.projectionOverlay  = document.getElementById('projection-overlay');
  dom.projLyrics         = document.getElementById('proj-lyrics');
  dom.projVerseLabel     = document.getElementById('proj-verse-label');
  dom.projVerseCounter   = document.getElementById('proj-verse-counter');
  dom.toastContainer     = document.getElementById('toast-container');
  dom.upgradeModal       = document.getElementById('upgrade-modal');
  dom.setlistEmpty       = document.getElementById('setlist-empty');
  dom.statusSongCount    = document.getElementById('status-song-count');
  dom.statusSetlistCount = document.getElementById('status-setlist-count');
}

async function loadSongs() {
  try {
    const response = await fetch('data/songs.json');
    if (!response.ok) throw new Error('Could not load song library');
    state.songs = await response.json();
    state.filteredSongs = [...state.songs];
  } catch (err) {
    console.error('Song load error:', err);
    toast('warning', '⚠️ Could not load song library');
    state.songs = [];
    state.filteredSongs = [];
  }
}

/* ─── Rendering ──────────────────────────────────────────── */

function renderSongList() {
  dom.songList.innerHTML = '';

  if (state.filteredSongs.length === 0) {
    dom.songList.innerHTML = `
      <div style="text-align:center; padding: 2rem 1rem; color: var(--wfh-text-muted); font-size:.85rem;">
        <span style="font-size:2rem; display:block; margin-bottom:.5rem;">🔍</span>
        No songs found
      </div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  state.filteredSongs.forEach(song => {
    const item = document.createElement('div');
    item.className = 'song-item' + (state.currentSong?.id === song.id ? ' active' : '');
    item.dataset.id = song.id;
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.setAttribute('aria-label', `${song.title} by ${song.artist}`);
    item.innerHTML = `
      <span class="song-item-icon" aria-hidden="true">🎵</span>
      <div class="song-item-info">
        <div class="song-item-title">${escHtml(song.title)}</div>
        <div class="song-item-meta">
          <span>${escHtml(song.artist)}</span>
          <span class="song-category-tag">${escHtml(song.category)}</span>
        </div>
      </div>`;
    item.addEventListener('click', () => selectSong(song.id));
    item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') selectSong(song.id); });
    frag.appendChild(item);
  });
  dom.songList.appendChild(frag);
  updateStatusBar();
}

function renderCategories() {
  const cats = ['all', ...new Set(state.songs.map(s => s.category))];
  dom.categoryFilter.innerHTML = '';
  cats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (state.activeCategory === cat ? ' active' : '');
    btn.textContent = cat === 'all' ? 'All' : cat;
    btn.addEventListener('click', () => {
      state.activeCategory = cat;
      applySearch();
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
    dom.categoryFilter.appendChild(btn);
  });
}

function renderSetlist() {
  dom.setlistItems.innerHTML = '';

  if (state.setlist.length === 0) {
    dom.setlistEmpty.classList.remove('hidden');
    dom.setlistItems.appendChild(dom.setlistEmpty);
    updateStatusBar();
    return;
  }

  dom.setlistEmpty.classList.add('hidden');
  const frag = document.createDocumentFragment();
  state.setlist.forEach((song, idx) => {
    const item = document.createElement('div');
    item.className = 'setlist-item' + (idx === state.currentSetlistIndex ? ' active' : '');
    item.dataset.idx = idx;
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.innerHTML = `
      <span class="song-num">${idx + 1}</span>
      <span class="item-title">${escHtml(song.title)}</span>
      <button class="remove-btn" aria-label="Remove ${escHtml(song.title)} from setlist" title="Remove">✕</button>`;
    item.querySelector('.remove-btn').addEventListener('click', e => {
      e.stopPropagation();
      removeFromSetlist(idx);
    });
    item.addEventListener('click', () => loadFromSetlist(idx));
    item.addEventListener('keydown', e => { if (e.key === 'Enter') loadFromSetlist(idx); });
    frag.appendChild(item);
  });
  dom.setlistItems.appendChild(frag);
  updateStatusBar();
}

function renderLyricsPreview() {
  if (!state.currentSong) {
    dom.lyricsPreview.innerHTML = `
      <div class="lyrics-empty-state">
        <span class="empty-icon">🎤</span>
        <h2>Select a Song</h2>
        <p>Choose a song from the library to display lyrics</p>
      </div>`;
    dom.verseNav.innerHTML = '';
    dom.songTitleDisplay.textContent = 'No song selected';
    dom.verseCounter.textContent = '';
    return;
  }

  const song = state.currentSong;
  const verse = song.verses[state.currentVerseIndex];

  // song title in toolbar
  dom.songTitleDisplay.textContent = `${song.title} — ${song.artist}`;
  dom.verseCounter.textContent = `${state.currentVerseIndex + 1} / ${song.verses.length}`;

  // verse nav pills
  dom.verseNav.innerHTML = '';
  song.verses.forEach((v, idx) => {
    const pill = document.createElement('button');
    pill.className = 'verse-pill' + (idx === state.currentVerseIndex ? ' active' : '');
    pill.textContent = `${idx + 1}. ${v.type}`;
    pill.setAttribute('aria-label', `Go to ${v.type} ${idx + 1}`);
    pill.addEventListener('click', () => {
      state.currentVerseIndex = idx;
      renderLyricsPreview();
      if (state.projectionOpen) updateProjection();
    });
    dom.verseNav.appendChild(pill);
  });

  // lyrics block
  const fontSize = state.settings.fontSize;
  const theme    = state.settings.theme;

  dom.lyricsPreview.className = `lyrics-preview font-${fontSize} theme-${theme}`;
  dom.lyricsPreview.innerHTML = '';

  if (state.settings.showVerseLabels) {
    const label = document.createElement('div');
    label.className = 'verse-type-label';
    label.textContent = verse.type;
    dom.lyricsPreview.appendChild(label);
  }

  const lines = document.createElement('div');
  lines.className = 'lyrics-lines';
  verse.lines.forEach(line => {
    const p = document.createElement('p');
    p.className = 'lyric-line';
    p.textContent = line;
    lines.appendChild(p);
  });
  dom.lyricsPreview.appendChild(lines);
}

function updateProjection() {
  if (!state.currentSong) return;
  const verse = state.currentSong.verses[state.currentVerseIndex];
  const fontSize = state.settings.fontSize;
  const theme    = state.settings.theme;

  dom.projectionOverlay.className = `projection-overlay active font-${fontSize} theme-${theme}`;

  if (state.settings.showVerseLabels) {
    dom.projVerseLabel.textContent = verse.type;
    dom.projVerseLabel.classList.remove('hidden');
  } else {
    dom.projVerseLabel.classList.add('hidden');
  }

  dom.projLyrics.innerHTML = '';
  verse.lines.forEach(line => {
    const p = document.createElement('p');
    p.className = 'lyric-line';
    p.textContent = line;
    dom.projLyrics.appendChild(p);
  });

  dom.projVerseCounter.textContent =
    `${state.currentVerseIndex + 1} / ${state.currentSong.verses.length}`;
}

/* ─── Song selection ─────────────────────────────────────── */

function selectSong(id) {
  const song = state.songs.find(s => s.id === id);
  if (!song) return;
  state.currentSong = song;
  state.currentVerseIndex = 0;
  renderLyricsPreview();
  if (state.projectionOpen) updateProjection();
  renderSongList(); // refresh active highlight
  toast('success', `🎵 ${song.title}`);
}

/* ─── Verse navigation ───────────────────────────────────── */

function prevVerse() {
  if (!state.currentSong || state.currentVerseIndex <= 0) return;
  state.currentVerseIndex--;
  renderLyricsPreview();
  if (state.projectionOpen) updateProjection();
}

function nextVerse() {
  if (!state.currentSong) return;
  if (state.currentVerseIndex < state.currentSong.verses.length - 1) {
    state.currentVerseIndex++;
    renderLyricsPreview();
    if (state.projectionOpen) updateProjection();
  } else if (state.settings.autoAdvance) {
    advanceSetlist();
  }
}

/* ─── Setlist management ─────────────────────────────────── */

function addToSetlist() {
  if (!state.currentSong) {
    toast('warning', 'Select a song first');
    return;
  }

  const tierConfig = APP_CONFIG.tiers[state.tier];
  if (state.setlist.length >= tierConfig.maxSetlistItems) {
    showUpgradeModal(`Your ${state.tier} plan allows up to ${tierConfig.maxSetlistItems} songs in the setlist.`);
    return;
  }

  const alreadyIn = state.setlist.find(s => s.id === state.currentSong.id);
  if (alreadyIn) {
    toast('info', 'Already in setlist');
    return;
  }

  state.setlist.push(state.currentSong);
  renderSetlist();
  saveState();
  toast('success', `➕ Added to setlist`);
}

function removeFromSetlist(idx) {
  const removed = state.setlist.splice(idx, 1)[0];
  if (state.currentSetlistIndex >= state.setlist.length) {
    state.currentSetlistIndex = state.setlist.length - 1;
  }
  renderSetlist();
  saveState();
  toast('info', `Removed: ${removed.title}`);
}

function clearSetlist() {
  if (state.setlist.length === 0) return;
  state.setlist = [];
  state.currentSetlistIndex = -1;
  renderSetlist();
  saveState();
  toast('info', '🗑 Setlist cleared');
}

function loadFromSetlist(idx) {
  const song = state.setlist[idx];
  if (!song) return;
  state.currentSetlistIndex = idx;
  selectSong(song.id);
  renderSetlist();
}

function advanceSetlist() {
  const nextIdx = state.currentSetlistIndex + 1;
  if (nextIdx < state.setlist.length) {
    loadFromSetlist(nextIdx);
  }
}

/* ─── Projection mode ────────────────────────────────────── */

function openProjection() {
  const tierConfig = APP_CONFIG.tiers[state.tier];
  if (!tierConfig.projectionMode) {
    showUpgradeModal('Projection mode is available on Basic and Pro plans.');
    return;
  }
  if (!state.currentSong) {
    toast('warning', 'Select a song before opening projection');
    return;
  }
  state.projectionOpen = true;
  dom.projectionOverlay.classList.add('active');
  updateProjection();
  document.body.style.overflow = 'hidden';
}

function closeProjection() {
  state.projectionOpen = false;
  dom.projectionOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

/* ─── Search & filter ────────────────────────────────────── */

function applySearch() {
  const q    = state.searchQuery.toLowerCase().trim();
  const cat  = state.activeCategory;

  state.filteredSongs = state.songs.filter(song => {
    const matchesCat = cat === 'all' || song.category === cat;
    if (!matchesCat) return false;
    if (!q) return true;
    return (
      song.title.toLowerCase().includes(q) ||
      song.artist.toLowerCase().includes(q) ||
      song.category.toLowerCase().includes(q)
    );
  });

  renderSongList();
}

/* ─── Settings ───────────────────────────────────────────── */

function applySettings() {
  const tierConfig = APP_CONFIG.tiers[state.tier];

  // tier badge
  dom.tierBadge.textContent = tierConfig.label;
  dom.tierBadge.className   = `tier-badge ${state.tier}`;

  // theme select — populate allowed options
  const themeSelect = document.getElementById('setting-theme');
  if (themeSelect) {
    themeSelect.innerHTML = '';
    const allThemes = THEME_LABELS;
    tierConfig.themes.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = allThemes[t] || t;
      if (t === state.settings.theme) opt.selected = true;
      themeSelect.appendChild(opt);
    });
    // if current theme not available for tier, default to first
    if (!tierConfig.themes.includes(state.settings.theme)) {
      state.settings.theme = tierConfig.themes[0];
    }
  }

  // font-size select
  const fontSelect = document.getElementById('setting-font-size');
  if (fontSelect) {
    fontSelect.innerHTML = '';
    const allSizes = FONT_SIZE_LABELS;
    tierConfig.fontSizes.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = allSizes[s] || s;
      if (s === state.settings.fontSize) opt.selected = true;
      fontSelect.appendChild(opt);
    });
    if (!tierConfig.fontSizes.includes(state.settings.fontSize)) {
      state.settings.fontSize = tierConfig.fontSizes[tierConfig.fontSizes.length - 1];
    }
  }

  // auto-advance toggle
  const autoAdvToggle = document.getElementById('setting-auto-advance');
  if (autoAdvToggle) {
    autoAdvToggle.disabled = !tierConfig.autoAdvance;
    autoAdvToggle.checked  = state.settings.autoAdvance && tierConfig.autoAdvance;
  }

  // pro-locked indicators
  document.querySelectorAll('.pro-lock').forEach(el => {
    el.classList.toggle('hidden', state.tier === 'pro');
  });

  renderLyricsPreview();
}

/* ─── Tier management ────────────────────────────────────── */

function setTier(tier) {
  if (!APP_CONFIG.tiers[tier]) return;
  state.tier = tier;
  applySettings();
  saveState();
  toast('success', `✅ Switched to ${APP_CONFIG.tiers[tier].label} plan`);
}

/* ─── Upgrade modal ──────────────────────────────────────── */

function showUpgradeModal(reason) {
  document.getElementById('upgrade-reason').textContent = reason;
  dom.upgradeModal.classList.add('active');
}

function closeUpgradeModal() {
  dom.upgradeModal.classList.remove('active');
}

/* ─── Event binding ──────────────────────────────────────── */

function bindEvents() {
  // Search
  dom.searchInput.addEventListener('input', e => {
    state.searchQuery = e.target.value;
    applySearch();
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      state.activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
    });
  });

  // Toolbar buttons
  document.getElementById('btn-prev-verse').addEventListener('click', prevVerse);
  document.getElementById('btn-next-verse').addEventListener('click', nextVerse);
  document.getElementById('btn-add-setlist').addEventListener('click', addToSetlist);
  document.getElementById('btn-projection').addEventListener('click', openProjection);

  // Setlist controls
  document.getElementById('btn-clear-setlist').addEventListener('click', clearSetlist);

  // Projection overlay
  document.getElementById('proj-prev').addEventListener('click', prevVerse);
  document.getElementById('proj-next').addEventListener('click', nextVerse);
  document.getElementById('proj-close').addEventListener('click', closeProjection);

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboard);

  // Tier badge (cycle through tiers for demo)
  dom.tierBadge.addEventListener('click', () => {
    const tiers = Object.keys(APP_CONFIG.tiers);
    const nextIdx = (tiers.indexOf(state.tier) + 1) % tiers.length;
    setTier(tiers[nextIdx]);
  });

  // Settings — theme
  document.getElementById('setting-theme').addEventListener('change', e => {
    state.settings.theme = e.target.value;
    renderLyricsPreview();
    if (state.projectionOpen) updateProjection();
    saveState();
  });

  // Settings — font size
  document.getElementById('setting-font-size').addEventListener('change', e => {
    state.settings.fontSize = e.target.value;
    renderLyricsPreview();
    if (state.projectionOpen) updateProjection();
    saveState();
  });

  // Settings — verse labels
  document.getElementById('setting-verse-labels').addEventListener('change', e => {
    state.settings.showVerseLabels = e.target.checked;
    renderLyricsPreview();
    if (state.projectionOpen) updateProjection();
    saveState();
  });

  // Settings — auto-advance
  document.getElementById('setting-auto-advance').addEventListener('change', e => {
    const tierConfig = APP_CONFIG.tiers[state.tier];
    if (!tierConfig.autoAdvance) {
      e.target.checked = false;
      showUpgradeModal('Auto-advance is a Pro feature.');
      return;
    }
    state.settings.autoAdvance = e.target.checked;
    saveState();
  });

  // Settings — watermark
  document.getElementById('setting-watermark').addEventListener('change', e => {
    state.settings.watermark = e.target.checked;
    const watermark = document.getElementById('proj-watermark');
    if (watermark) watermark.classList.toggle('hidden', !e.target.checked);
    saveState();
  });

  // Upgrade modal
  document.getElementById('btn-upgrade-close').addEventListener('click', closeUpgradeModal);
  document.querySelectorAll('.tier-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.tier-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
  document.getElementById('btn-upgrade-confirm').addEventListener('click', () => {
    const selected = document.querySelector('.tier-card.selected');
    if (selected) {
      setTier(selected.dataset.tier);
      closeUpgradeModal();
    }
  });

  // Click outside upgrade modal to close
  dom.upgradeModal.addEventListener('click', e => {
    if (e.target === dom.upgradeModal) closeUpgradeModal();
  });
}

function handleKeyboard(e) {
  // Don't intercept when typing in inputs
  if (KEYBOARD_EXCLUDED_TAGS.includes(e.target.tagName)) return;

  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
    case 'PageDown':
      e.preventDefault();
      nextVerse();
      break;
    case 'ArrowLeft':
    case 'ArrowUp':
    case 'PageUp':
      e.preventDefault();
      prevVerse();
      break;
    case 'Escape':
      if (state.projectionOpen) closeProjection();
      if (dom.upgradeModal.classList.contains('active')) closeUpgradeModal();
      break;
    case 'F5':
    case 'p':
    case 'P':
      if (!e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (state.projectionOpen) closeProjection();
        else openProjection();
      }
      break;
  }
}

/* ─── Status bar ─────────────────────────────────────────── */

function updateStatusBar() {
  if (dom.statusSongCount) dom.statusSongCount.textContent = `${state.songs.length} songs`;
  if (dom.statusSetlistCount) dom.statusSetlistCount.textContent = `${state.setlist.length} in setlist`;
}

/* ─── Toast notifications ────────────────────────────────── */

function toast(type, message) {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  dom.toastContainer.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ─── Helpers ────────────────────────────────────────────── */

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── Boot ───────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', init);
