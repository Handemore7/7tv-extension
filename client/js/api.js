const API = {
  BASE_URL: 'https://7tv.io/v3',
  CDN_URL: 'https://cdn.7tv.app/emote',

  async fetchGlobalEmotes() {
    try {
      const response = await fetch(`${this.BASE_URL}/emote-sets/global`);
      const data = await response.json();
      return data.emotes || [];
    } catch (error) {
      console.error('Failed to fetch emotes:', error);
      throw error;
    }
  },

  async searchEmotes(query) {
    try {
      const response = await fetch(`${this.BASE_URL}/emotes?query=${encodeURIComponent(query)}&limit=50`);
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Failed to search emotes:', error);
      throw error;
    }
  },

  getEmoteUrl(emoteId, size = '2x', format = 'webp') {
    return `${this.CDN_URL}/${emoteId}/${size}.${format}`;
  },

  getEmoteFormats(emote) {
    const formats = [];
    if (emote.animated) {
      formats.push('gif');
    }
    formats.push('webp', 'png');
    return formats;
  }
};
