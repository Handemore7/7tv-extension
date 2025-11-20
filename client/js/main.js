let allEmotes = [];
let filteredEmotes = [];
let currentPage = 1;
let isLoading = false;
let searchTimeout = null;
let debugMode = false;

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

async function init() {
  Debug.log('Initializing extension...');
  
  try {
    Premiere.init();
    Debug.log('Premiere bridge initialized');
  } catch (error) {
    Debug.error('Failed to initialize Premiere bridge', error);
  }
  
  document.getElementById('search').addEventListener('input', handleSearch);
  document.getElementById('filter-animated').addEventListener('change', applyFilters);
  document.getElementById('filter-static').addEventListener('change', applyFilters);
  document.getElementById('debug-mode').addEventListener('change', (e) => {
    debugMode = e.target.checked;
    document.getElementById('debug-console').style.display = debugMode ? 'block' : 'none';
    Debug.log('Debug mode toggled', debugMode);
  });
  
  const grid = document.getElementById('emote-grid');
  grid.addEventListener('scroll', handleScroll);
  
  Debug.log('Starting to load emotes...');
  await loadEmotes();
}

async function loadEmotes() {
  const grid = document.getElementById('emote-grid');
  
  if (isLoading) {
    Debug.log('Already loading, skipping...');
    return;
  }
  isLoading = true;
  
  try {
    Debug.log('Fetching global emotes from API...');
    allEmotes = await API.fetchGlobalEmotes();
    Debug.log('Emotes fetched', { count: allEmotes.length });
    
    filteredEmotes = [...allEmotes];
    Debug.log('Rendering emotes...');
    renderEmotes();
    Debug.log('Emotes rendered successfully');
  } catch (error) {
    Debug.error('Failed to load emotes', error);
    grid.innerHTML = `<div class="error">Failed to load emotes: ${error.message}</div>`;
  } finally {
    isLoading = false;
  }
}

function handleSearch(e) {
  const query = e.target.value.trim().toLowerCase();
  
  clearTimeout(searchTimeout);
  
  searchTimeout = setTimeout(() => {
    Debug.log('Search query', query);
    
    if (query.length === 0) {
      filteredEmotes = [...allEmotes];
    } else {
      filteredEmotes = allEmotes.filter(emote => 
        emote.name.toLowerCase().includes(query)
      );
      Debug.log('Filtered results', { count: filteredEmotes.length });
    }
    
    applyFilters();
  }, 300);
}

function handleScroll(e) {
  const grid = e.target;
  const scrollBottom = grid.scrollHeight - grid.scrollTop - grid.clientHeight;
  
  if (scrollBottom < 100 && !isLoading) {
    // Placeholder for pagination
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
  
  Debug.log('Rendering emotes', { count: emotes.length });
  
  if (emotes.length === 0) {
    grid.innerHTML = '<div class="loading">No emotes found</div>';
    return;
  }
  
  grid.innerHTML = '';
  
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
    
    item.addEventListener('click', () => handleEmoteClick(emote));
    
    grid.appendChild(item);
  });
}

async function handleEmoteClick(emote) {
  const format = API.getBestFormat(emote.animated);
  const url = API.getEmoteUrl(emote.id, '4x', format);
  
  try {
    await Premiere.downloadAndImport(emote.id, emote.name, url, emote.animated);
    showNotification(`Imported: ${emote.name}`);
  } catch (error) {
    showNotification(`Failed to import ${emote.name}`, true);
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

document.addEventListener('DOMContentLoaded', init);
