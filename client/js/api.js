const API = {
  BASE_URL: 'https://7tv.io/v3',
  CDN_URL: 'https://cdn.7tv.app/emote',
  cache: new Map(),

  async fetchGlobalEmotes() {
    if (this.cache.has('global')) {
      console.log('[API] Returning cached global emotes');
      return this.cache.get('global');
    }

    try {
      const url = `${this.BASE_URL}/emote-sets/global`;
      console.log('[API] Fetching from:', url);
      
      const response = await fetch(url);
      console.log('[API] Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('[API] Raw data received, emotes count:', result.emotes?.length);
      
      const emotes = this.normalizeEmotes(result.emotes || []);
      console.log('[API] Normalized emotes:', emotes.length);
      
      this.cache.set('global', emotes);
      return emotes;
    } catch (error) {
      console.error('[API] Failed to fetch emotes:', error);
      throw error;
    }
  },

  async searchEmotes(query, page = 1, limit = 50) {
    console.log('[API] Search disabled - using local filter instead');
    
    const allEmotes = await this.fetchGlobalEmotes();
    const filtered = allEmotes.filter(emote => 
      emote.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return {
      emotes: filtered,
      total: filtered.length
    };
  },

  normalizeEmotes(emotes) {
    console.log('[API] Normalizing emotes, count:', emotes.length);
    if (emotes.length > 0) {
      console.log('[API] Sample raw emote:', emotes[0]);
    }
    
    return emotes.map(emote => {
      const data = emote.data || emote;
      return {
        id: data.id,
        name: data.name,
        animated: data.animated || false,
        tags: data.tags || [],
        owner: data.owner?.display_name || 'Unknown'
      };
    });
  },

  getEmoteUrl(emoteId, size = '2x', format = 'webp') {
    return `${this.CDN_URL}/${emoteId}/${size}.${format}`;
  },

  getBestFormat(animated) {
    return animated ? 'gif' : 'webp';
  },

  clearCache() {
    this.cache.clear();
  }
};
