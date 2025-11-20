function importEmoteFromBase64(fileName, base64Data) {
  try {
    if (!app.project) {
      return JSON.stringify({ success: false, error: 'No project open' });
    }
    
    var tempFolder = createTempFolder();
    var filePath = tempFolder + fileName;
    
    var file = new File(filePath);
    file.encoding = 'BINARY';
    file.open('w');
    file.write(decodeBase64(base64Data));
    file.close();
    
    if (!file.exists) {
      return JSON.stringify({ success: false, error: 'Failed to save file' });
    }
    
    var importedItems = app.project.importFiles([filePath]);
    if (!importedItems || importedItems.length === 0) {
      return JSON.stringify({ success: false, error: 'Import failed' });
    }
    
    var projectItem = importedItems[0];
    
    if (app.project.activeSequence) {
      var videoTrack = app.project.activeSequence.videoTracks[0];
      var currentTime = app.project.activeSequence.getPlayerPosition();
      videoTrack.insertClip(projectItem, currentTime);
      return JSON.stringify({ success: true, addedToTimeline: true });
    }
    
    return JSON.stringify({ success: true, addedToTimeline: false });
  } catch (e) {
    return JSON.stringify({ success: false, error: e.toString() });
  }
}

function decodeBase64(base64) {
  var decoded = '';
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
  for (var i = 0; i < base64.length; i += 4) {
    var enc1 = chars.indexOf(base64.charAt(i));
    var enc2 = chars.indexOf(base64.charAt(i + 1));
    var enc3 = chars.indexOf(base64.charAt(i + 2));
    var enc4 = chars.indexOf(base64.charAt(i + 3));
    
    var chr1 = (enc1 << 2) | (enc2 >> 4);
    var chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    var chr3 = ((enc3 & 3) << 6) | enc4;
    
    decoded += String.fromCharCode(chr1);
    if (enc3 != 64) decoded += String.fromCharCode(chr2);
    if (enc4 != 64) decoded += String.fromCharCode(chr3);
  }
  
  return decoded;
}

function createTempFolder() {
  var tempPath = Folder.temp.fsName;
  if ($.os.indexOf("Windows") !== -1) {
    tempPath = tempPath.replace(/\\/g, '/');
  }
  var tempFolder = tempPath + "/7tv_emotes/";
  var folder = new Folder(tempFolder);
  
  if (!folder.exists) {
    folder.create();
  }
  
  return tempFolder;
}





function cleanupTempFiles() {
  try {
    var tempFolder = Folder.temp.fsName + "/7tv_emotes/";
    var folder = new Folder(tempFolder);
    
    if (folder.exists) {
      var files = folder.getFiles();
      for (var i = 0; i < files.length; i++) {
        if (files[i] instanceof File) {
          files[i].remove();
        }
      }
    }
    
    return JSON.stringify({ success: true });
  } catch (e) {
    return JSON.stringify({ success: false, error: e.toString() });
  }
}

function testDownload() {
  try {
    var tempFolder = createTempFolder();
    var testUrl = 'https://cdn.7tv.app/emote/01GGD5PJA8000FH13S498E9D8X/2x.webp';
    var testFile = tempFolder + 'test.webp';
    
    var success = downloadFile(testUrl, testFile);
    
    var file = new File(testFile);
    var exists = file.exists;
    var size = exists ? file.length : 0;
    
    return JSON.stringify({ 
      success: success, 
      exists: exists,
      size: size,
      path: testFile,
      tempFolder: tempFolder
    });
  } catch (e) {
    return JSON.stringify({ success: false, error: e.toString() });
  }
}
