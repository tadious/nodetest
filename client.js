var http = require('http');

var options = {
  host: 'http://localhost:8888',
  path: '/ping',
  port: '8888',
  method: 'POST'
};

callback = function(response) {
  var str = ''
  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    console.log(str);
  });
}

var req = http.request(options, callback);
req.end();
