const Premiere = {
  csInterface: null,

  init() {
    this.csInterface = new CSInterface();
  },

  async importEmote(emoteData) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify(emoteData);
      this.csInterface.evalScript(`importEmote('${payload}')`, (result) => {
        if (result === 'EvalScript error') {
          reject(new Error('Failed to import emote'));
        } else {
          resolve(result);
        }
      });
    });
  },

  async downloadAndImport(emoteId, emoteName, emoteUrl, isAnimated) {
    const emoteData = {
      id: emoteId,
      name: emoteName,
      url: emoteUrl,
      animated: isAnimated
    };
    
    try {
      await this.importEmote(emoteData);
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    }
  }
};
