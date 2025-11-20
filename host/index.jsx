function importEmote(jsonData) {
  try {
    var data = JSON.parse(jsonData);
    var tempFolder = Folder.temp.fsName + "/7tv_emotes/";
    var folder = new Folder(tempFolder);
    
    if (!folder.exists) {
      folder.create();
    }
    
    var extension = data.animated ? '.gif' : '.png';
    var fileName = data.name + '_' + data.id + extension;
    var filePath = tempFolder + fileName;
    
    downloadFile(data.url, filePath);
    
    if (app.project) {
      var importedFile = app.project.importFiles([filePath]);
      
      if (importedFile && app.project.activeSequence) {
        var videoTrack = app.project.activeSequence.videoTracks[0];
        var currentTime = app.project.activeSequence.getPlayerPosition();
        videoTrack.insertClip(importedFile[0], currentTime);
      }
      
      return "success";
    }
    
    return "no_project";
  } catch (e) {
    return "error: " + e.toString();
  }
}

function downloadFile(url, destination) {
  var command = '';
  
  if ($.os.indexOf("Windows") !== -1) {
    command = 'powershell -command "Invoke-WebRequest -Uri \'' + url + '\' -OutFile \'' + destination + '\'"';
  } else {
    command = 'curl -o "' + destination + '" "' + url + '"';
  }
  
  system.callSystem(command);
}
