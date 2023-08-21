function makeGetRequest(url, successCallback, errCallback) {
  var req = new XMLHttpRequest();
  req.open('GET', url);
  req.onload = function () {
    if (req.status == 200) {
      successCallback(JSON.parse(req.response));
    } else {
      errCallback({code: req.status, message: req.statusText});
    }
  };
  // make the request
  req.send();
};