const Premiere = {
  csInterface: null,

  init() {
    try {
      if (typeof CSInterface !== 'undefined' && window.__adobe_cep__) {
        this.csInterface = new CSInterface();
        console.log('[Premiere] CSInterface initialized successfully');
      } else {
        console.error('[Premiere] CSInterface or __adobe_cep__ not available');
      }
    } catch (error) {
      console.error('[Premiere] Failed to initialize CSInterface:', error);
    }
  },

  async evalScript(script) {
    return new Promise((resolve, reject) => {
      if (!this.csInterface) {
        reject(new Error('CSInterface not initialized'));
        return;
      }
      
      this.csInterface.evalScript(script, (result) => {
        if (result === 'EvalScript error' || result === undefined) {
          reject(new Error('ExtendScript execution failed'));
        } else {
          try {
            const parsed = JSON.parse(result);
            if (parsed.success) {
              resolve(parsed);
            } else {
              reject(new Error(parsed.error || 'Unknown error'));
            }
          } catch (e) {
            reject(new Error('Parse error: ' + result.substring(0, 100)));
          }
        }
      });
    });
  },

  async downloadAndImport(emoteId, emoteName, emoteUrl, isAnimated, progressCallback) {
    try {
      const response = await fetch(emoteUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      Debug.log('Downloaded', bytes.length + ' bytes');
      
      const extension = isAnimated ? 'gif' : 'webp';
      const fileName = emoteName.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + emoteId.substring(0, 8) + '.' + extension;
      
      Debug.log('Starting file write', fileName);
      await this.evalScript(`startFileWrite('${fileName}')`);
      
      const chunkSize = 1000;
      const totalChunks = Math.ceil(bytes.length / chunkSize);
      
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunkNum = Math.floor(i / chunkSize) + 1;
        const progress = (chunkNum / totalChunks) * 100;
        if (progressCallback) progressCallback(progress);
        
        Debug.log(`Writing chunk ${chunkNum}/${totalChunks}`);
        const chunk = Array.from(bytes.slice(i, Math.min(i + chunkSize, bytes.length)));
        await this.evalScript(`writeFileChunk([${chunk.join(',')}])`);
      }
      
      Debug.log('Finishing import...');
      const result = await this.evalScript('finishFileWrite()');
      
      Debug.log('Import complete');
      return result;
    } catch (error) {
      Debug.error('Import failed', error.message);
      try {
        await this.evalScript('cleanupFailedWrite()');
      } catch (e) {}
      throw error;
    }
  },

  async cleanupTempFiles() {
    try {
      await this.evalScript('cleanupTempFiles()');
    } catch (error) {
      console.error('[Premiere] Cleanup failed:', error);
    }
  }
};

window.Premiere = Premiere;
