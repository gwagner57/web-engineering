function makeGetRequest(url) {
  return new Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = function () {
      if (req.status == 200) {
        resolve(JSON.parse(req.response));
      } else {
        reject({code: req.status, message: req.statusText});
      }
    };
    // make the request
    req.send();
  });
};