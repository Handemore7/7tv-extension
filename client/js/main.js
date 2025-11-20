let allEmotes = [];
let filteredEmotes = [];
let currentPage = 1;
let totalPages = 1;
let totalCount = 0;
let currentQuery = '';
let isLoading = false;
let searchTimeout = null;
let debugMode = true;
let favorites = [];
let recentEmotes = [];
const MAX_RECENT = 20;

const Debug = {
  log(message, data = null) {
    console.log(`[7TV] ${message}`, data || '');
    if (debugMode) {
      const debugConsole = document.getElementById('debug-console');
      const entry = document.createElement('div');
      entry.textContent = `${new Date().toLocaleTimeString()} - ${message} ${data ? JSON.stringify(data) : ''}`;
      debugConsole.appendChild(entry);
      debugConsole.scrollTop = debugConsole.scrollHeight;
    }
  },
  error(message, error) {
    console.error(`[7TV ERROR] ${message}`, error);
    if (debugMode) {
      const debugConsole = document.getElementById('debug-console');
      const entry = document.createElement('div');
      entry.style.color = '#ff6b6b';
      entry.textContent = `${new Date().toLocaleTimeString()} - ERROR: ${message} - ${error}`;
      debugConsole.appendChild(entry);
      debugConsole.scrollTop = debugConsole.scrollHeight;
    }
  }
};

if (typeof console !== 'undefined') {
  const originalLog = console.log;
  const originalError = console.error;
  
  console.log = function(...args) {
    originalLog.apply(console, args);
    if (debugMode && args[0] && args[0].includes('[API]')) {
      const debugConsole = document.getElementById('debug-console');
      if (debugConsole) {
        const entry = document.createElement('div');
        entry.style.color = '#00aaff';
        entry.textContent = `${new Date().toLocaleTimeString()} - ${args.join(' ')}`;
        debugConsole.appendChild(entry);
        debugConsole.scrollTop = debugConsole.scrollHeight;
      }
    }
  };
  
  console.error = function(...args) {
    originalError.apply(console, args);
    if (debugMode && args[0] && args[0].includes('[API]')) {
      const debugConsole = document.getElementById('debug-console');
      if (debugConsole) {
        const entry = document.createElement('div');
        entry.style.color = '#ff6b6b';
        entry.textContent = `${new Date().toLocaleTimeString()} - ${args.join(' ')}`;
        debugConsole.appendChild(entry);
        debugConsole.scrollTop = debugConsole.scrollHeight;
      }
    }
  };
}

async function init() {
  Debug.log('Initializing extension...');
  
  loadFavorites();
  loadRecent();
  
  try {
    Premiere.init();
    Debug.log('Premiere bridge initialized');
  } catch (error) {
    Debug.error('Failed to initialize Premiere bridge', error);
  }
  
  document.getElementById('search').addEventListener('input', handleSearch);
  document.getElementById('filter-animated').addEventListener('change', applyFilters);
  document.getElementById('filter-static').addEventListener('change', applyFilters);
  document.getElementById('debug-console').style.display = 'block';
  document.getElementById('debug-mode').checked = true;
  
  document.getElementById('debug-mode').addEventListener('change', (e) => {
    debugMode = e.target.checked;
    document.getElementById('debug-console').style.display = debugMode ? 'block' : 'none';
    Debug.log('Debug mode toggled', debugMode);
  });
  
  document.getElementById('prev-page').addEventListener('click', () => goToPage(currentPage - 1));
  document.getElementById('next-page').addEventListener('click', () => goToPage(currentPage + 1));
  
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', (e) => handleTabChange(e.target.dataset.tab));
  });
  
  Debug.log('Starting to load emotes...');
  await loadEmotes(1);
}

async function loadEmotes(page = 1) {
  const grid = document.getElementById('emote-grid');
  
  if (isLoading) {
    Debug.log('Already loading, skipping...');
    return;
  }
  isLoading = true;
  grid.innerHTML = '<div class="loading">Loading emotes...</div>';
  
  try {
    Debug.log('Fetching all emotes page', page);
    const result = await API.fetchAllEmotes(page);
    Debug.log('Emotes fetched', { count: result.emotes.length, total: result.total });
    
    filteredEmotes = result.emotes;
    totalCount = result.total;
    currentPage = page;
    totalPages = result.total > 100 ? 999 : Math.ceil(result.total / 100);
    currentQuery = '';
    
    Debug.log('Rendering emotes...');
    renderEmotes();
    updatePagination();
    Debug.log('Emotes rendered successfully');
  } catch (error) {
    Debug.error('Failed to load emotes', error);
    grid.innerHTML = `<div class="error">Failed to load emotes: ${error.message}</div>`;
  } finally {
    isLoading = false;
  }
}

function handleSearch(e) {
  const query = e.target.value.trim();
  
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(async () => {
    Debug.log('Search query', query);
    
    if (query.length === 0) {
      await loadEmotes(1);
    } else if (query.length >= 2) {
      await performSearch(query, 1);
    }
  }, 300);
}

async function performSearch(query, page = 1) {
  const grid = document.getElementById('emote-grid');
  grid.innerHTML = '<div class="loading">Searching...</div>';
  
  Debug.log('Searching for', query + ' page ' + page);
  currentQuery = query;
  currentPage = page;
  
  try {
    const result = await API.searchEmotes(query, page);
    Debug.log('Search results', { count: result.emotes.length, total: result.total });
    filteredEmotes = result.emotes;
    totalCount = result.total;
    totalPages = Math.ceil(result.total / 100);
    applyFilters();
    updatePagination();
  } catch (error) {
    Debug.error('Search failed', error.message);
    grid.innerHTML = `<div class="error">Search failed: ${error.message}</div>`;
  }
}

function updatePagination() {
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  
  pagination.style.display = 'flex';
  
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageInfo = document.getElementById('page-info');
  
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = false;
  
  if (totalPages === 999) {
    pageInfo.textContent = `Page ${currentPage} of many...`;
  } else {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  }
}

async function goToPage(page) {
  if (page < 1 || isLoading) return;
  if (page > totalPages && totalPages !== 999) return;
  
  if (currentQuery) {
    await performSearch(currentQuery, page);
  } else {
    await loadEmotes(page);
  }
}

function applyFilters() {
  const showAnimated = document.getElementById('filter-animated').checked;
  const showStatic = document.getElementById('filter-static').checked;
  
  const filtered = filteredEmotes.filter(emote => {
    if (emote.animated && !showAnimated) return false;
    if (!emote.animated && !showStatic) return false;
    return true;
  });
  
  renderEmotes(filtered);
}

function renderEmotes(emotes = filteredEmotes) {
  const grid = document.getElementById('emote-grid');
  const countEl = document.getElementById('emote-count');
  const statusBar = document.getElementById('status-bar');
  
  Debug.log('Rendering emotes', { count: emotes.length });
  
  const start = currentQuery ? (currentPage - 1) * 100 + 1 : 1;
  const end = currentQuery ? Math.min(start + emotes.length - 1, totalCount) : emotes.length;
  
  if (totalCount > emotes.length) {
    countEl.textContent = `${start}-${end} of ${totalCount}`;
  } else {
    countEl.textContent = `${emotes.length} emote${emotes.length !== 1 ? 's' : ''}`;
  }
  
  if (emotes.length === 0) {
    grid.innerHTML = '<div class="loading">No emotes found</div>';
    statusBar.textContent = 'No results';
    return;
  }
  
  grid.innerHTML = '';
  
  if (totalCount > emotes.length) {
    statusBar.textContent = `Showing ${start}-${end} of ${totalCount} emotes`;
  } else {
    statusBar.textContent = `Showing ${emotes.length} emotes`;
  }
  
  emotes.forEach(emote => {
    const item = document.createElement('div');
    item.className = 'emote-item';
    item.title = `${emote.name}${emote.animated ? ' (Animated)' : ''}`;
    
    const img = document.createElement('img');
    const format = API.getBestFormat(emote.animated);
    img.src = API.getEmoteUrl(emote.id, '2x', format);
    img.alt = emote.name;
    img.loading = 'lazy';
    
    img.onerror = () => {
      img.src = API.getEmoteUrl(emote.id, '1x', 'webp');
    };
    
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = emote.name;
    
    if (emote.animated) {
      const badge = document.createElement('span');
      badge.className = 'animated-badge';
      badge.textContent = 'GIF';
      item.appendChild(badge);
    }
    
    item.appendChild(img);
    item.appendChild(name);
    
    const favBtn = document.createElement('button');
    favBtn.className = 'fav-btn';
    favBtn.innerHTML = isFavorite(emote.id) ? '★' : '☆';
    favBtn.title = 'Add to favorites';
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(emote);
      favBtn.innerHTML = isFavorite(emote.id) ? '★' : '☆';
    });
    item.appendChild(favBtn);
    
    item.addEventListener('click', () => handleEmoteClick(emote));
    
    grid.appendChild(item);
  });
}

function handleTabChange(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  
  const searchInput = document.getElementById('search');
  const pagination = document.getElementById('pagination');
  
  if (tab === 'favorites') {
    searchInput.disabled = true;
    pagination.style.display = 'none';
    filteredEmotes = favorites;
    renderEmotes();
  } else if (tab === 'recent') {
    searchInput.disabled = true;
    pagination.style.display = 'none';
    filteredEmotes = recentEmotes;
    renderEmotes();
  } else {
    searchInput.disabled = false;
    if (searchInput.value.trim()) {
      performSearch(searchInput.value.trim(), 1);
    } else {
      loadEmotes(1);
    }
  }
}

function loadFavorites() {
  try {
    const stored = localStorage.getItem('7tv_favorites');
    favorites = stored ? JSON.parse(stored) : [];
  } catch (e) {
    favorites = [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem('7tv_favorites', JSON.stringify(favorites));
  } catch (e) {
    Debug.error('Failed to save favorites', e);
  }
}

function isFavorite(emoteId) {
  return favorites.some(e => e.id === emoteId);
}

function toggleFavorite(emote) {
  const index = favorites.findIndex(e => e.id === emote.id);
  if (index > -1) {
    favorites.splice(index, 1);
    showNotification(`Removed ${emote.name} from favorites`);
  } else {
    favorites.unshift(emote);
    showNotification(`Added ${emote.name} to favorites`);
  }
  saveFavorites();
  
  const activeTab = document.querySelector('.tab.active').dataset.tab;
  if (activeTab === 'favorites') {
    handleTabChange('favorites');
  }
}

function loadRecent() {
  try {
    const stored = localStorage.getItem('7tv_recent');
    recentEmotes = stored ? JSON.parse(stored) : [];
  } catch (e) {
    recentEmotes = [];
  }
}

function saveRecent() {
  try {
    localStorage.setItem('7tv_recent', JSON.stringify(recentEmotes));
  } catch (e) {
    Debug.error('Failed to save recent', e);
  }
}

function addToRecent(emote) {
  recentEmotes = recentEmotes.filter(e => e.id !== emote.id);
  recentEmotes.unshift(emote);
  if (recentEmotes.length > MAX_RECENT) {
    recentEmotes = recentEmotes.slice(0, MAX_RECENT);
  }
  saveRecent();
}

async function handleEmoteClick(emote, isFavoriteAction = false) {
  if (isFavoriteAction) {
    toggleFavorite(emote);
    return;
  }
  
  const item = event.currentTarget;
  item.classList.add('importing');
  
  const format = API.getBestFormat(emote.animated);
  const url = API.getEmoteUrl(emote.id, '4x', format);
  
  Debug.log('Importing emote', { name: emote.name, url, animated: emote.animated });
  
  try {
    const result = await Premiere.downloadAndImport(emote.id, emote.name, url, emote.animated);
    
    addToRecent(emote);
    
    if (result.addedToTimeline) {
      showNotification(`✓ ${emote.name} added to timeline`);
    } else {
      showNotification(`✓ ${emote.name} imported to project`);
    }
    
    Debug.log('Import successful', result);
  } catch (error) {
    Debug.error('Import failed', error);
    showNotification(`✗ Failed: ${error.message}`, true);
  } finally {
    item.classList.remove('importing');
  }
}

function showNotification(message, isError = false) {
  const notification = document.createElement('div');
  notification.className = `notification ${isError ? 'error' : 'success'}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

window.addEventListener('beforeunload', () => {
  Debug.log('Cleaning up before close...');
  Premiere.cleanupTempFiles();
});

document.addEventListener('DOMContentLoaded', init);
