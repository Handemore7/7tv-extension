let allEmotes = [];
let filteredEmotes = [];

async function init() {
  Premiere.init();
  
  document.getElementById('search').addEventListener('input', handleSearch);
  document.getElementById('filter-animated').addEventListener('change', applyFilters);
  document.getElementById('filter-static').addEventListener('change', applyFilters);
  
  await loadEmotes();
}

async function loadEmotes() {
  const grid = document.getElementById('emote-grid');
  
  try {
    allEmotes = await API.fetchGlobalEmotes();
    filteredEmotes = [...allEmotes];
    renderEmotes();
  } catch (error) {
    grid.innerHTML = '<div class="error">Failed to load emotes. Check your connection.</div>';
  }
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  
  if (query.length === 0) {
    filteredEmotes = [...allEmotes];
  } else {
    filteredEmotes = allEmotes.filter(emote => 
      emote.name.toLowerCase().includes(query)
    );
  }
  
  applyFilters();
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
  
  if (emotes.length === 0) {
    grid.innerHTML = '<div class="loading">No emotes found</div>';
    return;
  }
  
  grid.innerHTML = '';
  
  emotes.forEach(emote => {
    const item = document.createElement('div');
    item.className = 'emote-item';
    
    const img = document.createElement('img');
    const format = emote.animated ? 'gif' : 'webp';
    img.src = API.getEmoteUrl(emote.id, '2x', format);
    img.alt = emote.name;
    img.loading = 'lazy';
    
    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = emote.name;
    
    item.appendChild(img);
    item.appendChild(name);
    
    item.addEventListener('click', () => handleEmoteClick(emote, format));
    
    grid.appendChild(item);
  });
}

async function handleEmoteClick(emote, format) {
  const url = API.getEmoteUrl(emote.id, '4x', format);
  
  try {
    await Premiere.downloadAndImport(emote.id, emote.name, url, emote.animated);
    console.log(`Imported: ${emote.name}`);
  } catch (error) {
    alert(`Failed to import ${emote.name}`);
  }
}

document.addEventListener('DOMContentLoaded', init);
