var currentFile = null;
var currentFilePath = '';

function startFileWrite(fileName) {
  try {
    if (!app.project) {
      return '{"success":false,"error":"No project open"}';
    }
    
    var tempFolder = createTempFolder();
    currentFilePath = tempFolder + fileName;
    currentFile = new File(currentFilePath);
    currentFile.encoding = 'BINARY';
    currentFile.open('w');
    
    return '{"success":true}';
  } catch (e) {
    return '{"success":false,"error":"' + e.toString() + '"}';
  }
}

function writeFileChunk(byteArray) {
  try {
    if (!currentFile) {
      return '{"success":false,"error":"No file open"}';
    }
    
    for (var i = 0; i < byteArray.length; i++) {
      currentFile.write(String.fromCharCode(byteArray[i]));
    }
    
    return '{"success":true}';
  } catch (e) {
    return '{"success":false,"error":"' + e.toString() + '"}';
  }
}

function finishFileWrite() {
  try {
    if (!currentFile) {
      return '{"success":false,"error":"No file open"}';
    }
    
    currentFile.close();
    
    var file = new File(currentFilePath);
    if (!file.exists) {
      return '{"success":false,"error":"File not saved"}';
    }
    
    app.project.importFiles([currentFilePath]);
    
    currentFile = null;
    currentFilePath = '';
    
    return '{"success":true,"addedToTimeline":false}';
  } catch (e) {
    if (currentFile) {
      try { currentFile.close(); } catch (ce) {}
      currentFile = null;
    }
    var errorMsg = e.toString().replace(/"/g, "'");
    return '{"success":false,"error":"' + errorMsg + '"}';
  }
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

function cleanupFailedWrite() {
  try {
    if (currentFile) {
      currentFile.close();
      currentFile = null;
    }
    return '{"success":true}';
  } catch (e) {
    return '{"success":false}';
  }
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
    
    return '{"success":true}';
  } catch (e) {
    return '{"success":false}';
  }
}
