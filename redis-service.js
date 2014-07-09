var redis = require('redis'),
    client = redis.createClient(),
    hash_key = 'test_repo';

function processPost(request, response, callback) {
  var received = "";
  request.on('data', function(data) {
    received += data;
    if(received.length > 1e6) { // too long
      received = "";
      response.writeHead(413, {'Content-Type': 'text/plain'}).end();
      request.connection.destroy();
    }
  });
  request.on('end', function() {
    request.post = received;
    callback(received);
  });
}

function setValue(request, response) {
    processPost(request, response, saveValue);
}

function saveValue(data) {
  var dataObject = JSON.parse(data);
  client.hset([hash_key, dataObject.key, dataObject.value], function(err, reply){
    if (err || !reply) {
      response.writeHead(500, {"Content-Type": "plain/text"});
      response.end("Couldn't save the value.");
    }else {
      response.writeHead(201, {"Content-Type": "plain/text"});
      response.end("Value saved.");
    }
  });
}

function getValue(request, response) {
  client.hget([hash_key,request.param('key')], function(err, reply){
    if (err || !reply) {
      response.writeHead(500, {"Content-Type": "plain/text"});
      response.end("Couldn't get the value.");
    }else {
      response.writeHead(200, {"Content-Type": "plain/text"});
      response.end(reply);
    }
  });
}

exports.setValue = setValue;
exports.getValue = getValue;
