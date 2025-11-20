const API = {
  BASE_URL: 'https://7tv.io/v3',
  CDN_URL: 'https://cdn.7tv.app/emote',
  cache: new Map(),

  async fetchAllEmotes(page = 1, limit = 100) {
    const cacheKey = `all_${page}`;
    if (this.cache.has(cacheKey)) {
      console.log('[API] Returning cached all emotes page', page);
      return this.cache.get(cacheKey);
    }

    try {
      const gqlQuery = `
        query AllEmotes($query: String!, $page: Int, $limit: Int) {
          emotes(query: $query, page: $page, limit: $limit) {
            count
            items {
              id
              name
              flags
              animated
              owner {
                username
                display_name
              }
            }
          }
        }
      `;
      
      console.log('[API] Fetching all emotes page', page);
      
      const response = await fetch('https://7tv.io/v3/gql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: gqlQuery,
          variables: { query: '', page, limit }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[API] All emotes response:', JSON.stringify(data).substring(0, 500));
      console.log('[API] Has data.data?', !!data.data);
      console.log('[API] Has emotes?', !!data.data?.emotes);
      console.log('[API] Has items?', !!data.data?.emotes?.items);
      
      if (data.data?.emotes?.items) {
        const result = {
          emotes: this.normalizeEmotes(data.data.emotes.items),
          total: data.data.emotes.count
        };
        this.cache.set(cacheKey, result);
        return result;
      }
      
      throw new Error('No data in response');
    } catch (error) {
      console.error('[API] Failed to fetch all emotes:', error);
      throw error;
    }
  },

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

  async searchEmotes(query, page = 1, limit = 100) {
    const cacheKey = `search_${query}_${page}`;
    if (this.cache.has(cacheKey)) {
      console.log('[API] Returning cached search results');
      return this.cache.get(cacheKey);
    }

    try {
      const gqlQuery = `
        query SearchEmotes($query: String!, $page: Int, $limit: Int) {
          emotes(query: $query, page: $page, limit: $limit) {
            count
            items {
              id
              name
              flags
              animated
              owner {
                username
                display_name
              }
            }
          }
        }
      `;
      
      console.log('[API] Sending GQL request...');
      
      const response = await fetch('https://7tv.io/v3/gql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: gqlQuery,
          variables: { query, page, limit }
        })
      });
      
      console.log('[API] GQL response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[API] GQL full response:', JSON.stringify(data).substring(0, 500));
      console.log('[API] GQL data keys:', data ? Object.keys(data).join(',') : 'null');
      console.log('[API] GQL data.data:', data.data ? Object.keys(data.data).join(',') : 'null');
      console.log('[API] GQL data received, count:', data.data?.emotes?.count);
      console.log('[API] GQL items:', data.data?.emotes?.items?.length);
      
      if (data.data?.emotes?.items) {
        const normalized = this.normalizeEmotes(data.data.emotes.items);
        console.log('[API] Normalized:', normalized.length, 'emotes');
        
        const result = {
          emotes: normalized,
          total: data.data.emotes.count
        };
        this.cache.set(cacheKey, result);
        return result;
      }
      
      throw new Error('No data in response');
    } catch (error) {
      console.error('[API] Search failed:', error.message);
      console.error('[API] Error stack:', error.stack);
      console.log('[API] Falling back to local filter');
      const allEmotes = await this.fetchGlobalEmotes();
      const filtered = allEmotes.filter(emote => 
        emote.name.toLowerCase().includes(query.toLowerCase())
      );
      console.log('[API] Local filter found:', filtered.length);
      return { emotes: filtered, total: filtered.length };
    }
  },

  normalizeEmotes(emotes) {
    console.log('[API] Normalizing emotes, count:', emotes.length);
    if (emotes.length > 0) {
      console.log('[API] Sample raw emote:', JSON.stringify(emotes[0]).substring(0, 200));
    }
    
    if (!Array.isArray(emotes)) {
      console.error('[API] Emotes is not an array:', emotes);
      return [];
    }
    
    return emotes.map(emote => {
      const data = emote.data || emote;
      const flags = data.flags || 0;
      const animated = data.animated || (flags & 1) === 1;
      
      return {
        id: data.id,
        name: data.name,
        animated: animated,
        tags: data.tags || [],
        owner: data.owner?.display_name || data.owner?.username || 'Unknown'
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
