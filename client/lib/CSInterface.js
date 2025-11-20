function CSInterface() {}

CSInterface.prototype.evalScript = function(script, callback) {
  if (callback) {
    window.__adobe_cep__.evalScript(script, callback);
  } else {
    window.__adobe_cep__.evalScript(script);
  }
};

CSInterface.prototype.getSystemPath = function(pathType) {
  var path = decodeURI(window.__adobe_cep__.getSystemPath(pathType));
  return path;
};

CSInterface.prototype.getOSInformation = function() {
  var userAgent = navigator.userAgent;
  return userAgent;
};

CSInterface.THEME_COLOR_CHANGED_EVENT = "com.adobe.csxs.events.ThemeColorChanged";
