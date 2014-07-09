var databaseUrl = "test";// "username:password@example.com/test"
var collections = ["users"];
var db = require("mongojs").connect(databaseUrl, collections);


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

function saveUser(request, response) {
  processPost(request, response, saveUserToDB);
}

function saveUserToDB(user) {
  var userData = JSON.parse(user);
  db.users.save({id:userData.id,name:userData.name,surname:userData.surname,sex:userData.sex}, function(err, saved){
    if(err || !saved) {
      response.writeHead(500, {"Content-Type": "plain/text"});
      response.end("Error");
    }else {
      response.writeHead(201, {"Content-Type": "plain/text"});
      response.end("Saved");
    }
  });
}

function getUser(request, response) {
  db.users.find({id:request.param('id')}, function(err, users){
    if(err || !users) {
      response.writeHead(200, {"Content-Type": "plain/text"});
      response.end("No users found.");
    }else {
      response.writeHead(200, {"Content-Type": "plain/text"});
      response.end(JSON.stringify(users));
    }
  });
}

function getUsers(request, response) {
  db.users.find({}, function(err, users){
    if(err || !users) {
      response.writeHead(200, {"Content-Type": "plain/text"});
      response.end("No users found.");
    }else {
      response.writeHead(200, {"Content-Type": "plain/text"});
      response.end(JSON.stringify(users));
    }
  });
}

exports.saveUser = saveUser;
exports.getUser = getUser;
exports.getUsers = getUsers;
