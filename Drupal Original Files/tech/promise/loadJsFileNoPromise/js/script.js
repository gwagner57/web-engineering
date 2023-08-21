function loadJsFile(filePath) {
  return new Promise( function (resolve, reject) {
    var scriptElem = document.createElement('script');
    scriptElem.onload = resolve;
    scriptElem.onerror = reject;
    // trigger the file loading
    scriptElem.src = filePath;
    // append element to head
    document.head.appendChild(scriptElem );
  });
};