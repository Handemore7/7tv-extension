const Premiere = {
  csInterface: null,

  init() {
    try {
      if (typeof CSInterface !== 'undefined' && window.__adobe_cep__) {
        this.csInterface = new CSInterface();
        console.log('[Premiere] CSInterface initialized successfully');
      } else {
        console.error('[Premiere] CSInterface or __adobe_cep__ not available');
        console.log('[Premiere] CSInterface type:', typeof CSInterface);
        console.log('[Premiere] __adobe_cep__:', window.__adobe_cep__);
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
        if (result === 'EvalScript error') {
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
            resolve({ success: true, result });
          }
        }
      });
    });
  },

  async downloadAndImport(emoteId, emoteName, emoteUrl, isAnimated) {
    console.log('[Premiere] Starting download:', emoteName, emoteUrl);
    
    try {
      const response = await fetch(emoteUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      
      const blob = await response.blob();
      const reader = new FileReader();
      
      const base64Data = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
      console.log('[Premiere] Downloaded, size:', blob.size, 'bytes');
      
      const extension = isAnimated ? 'gif' : 'webp';
      const fileName = emoteName.replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + emoteId.substring(0, 8) + '.' + extension;
      
      const script = `importEmoteFromBase64('${fileName}', '${base64Data}')`;
      const result = await this.evalScript(script);
      
      console.log('[Premiere] Import result:', result);
      return result;
    } catch (error) {
      console.error('[Premiere] Import failed:', error);
      throw error;
    }
  },

  async cleanupTempFiles() {
    console.log('[Premiere] Cleaning up temp files...');
    try {
      await this.evalScript('cleanupTempFiles()');
      console.log('[Premiere] Cleanup complete');
    } catch (error) {
      console.error('[Premiere] Cleanup failed:', error);
    }
  },

  async testDownload() {
    console.log('[Premiere] Testing download...');
    try {
      const result = await this.evalScript('testDownload()');
      console.log('[Premiere] Test result:', result);
      return result;
    } catch (error) {
      console.error('[Premiere] Test failed:', error);
      throw error;
    }
  }
};

window.Premiere = Premiere;
