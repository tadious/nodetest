var pg = require('pg');
var dbUrl = "tcp://postgres:crazylongpassword@localhost/postgres";

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
  pg.connect(dbUrl, function(err, client){
    if (err || !client) {
      response.writeHead(500, {"Content-Type": "plain/text"});
      response.end("Could not connect to the databse: " + dbUrl);
    }else {
      client.query("CREATE TABLE users(id serial PRIMARY KEY,name varchar(50),surname varchar(50),sex varchar(10));");
      client.query("INSERT INTO users(id, name, surname, sex) VALUES($1, $2, $3, $4)",[userData.id,userData.name,userData.surname,userData.sex]);
      response.writeHead(200, {"Content-Type": "plain/text"});
      response.end("Saved to the databse.");
    }
  });
}

function getUser(request, response) {
  pg.connect(dbUrl, function(err, client){
    if (err || !client) {
      response.writeHead(500, {"Content-Type": "plain/text"});
      response.end("Could not connect to the databse: " + dbUrl);
    }else {
      var sql = "SELECT * FROM users WHERE id = " + request.param('id') + ";";
      client.query(sql, function(err, result){
        if (err || !result) {
          response.writeHead(200, {"Content-Type": "plain/text"});
          response.end("Error reading the database");
        }else {
          console.log(result.rows);
          response.writeHead(200, {"Content-Type": "plain/text"});
          response.end(JSON.stringify(result.rows) + '   :  '+result.rows.length + " users returned.");
        }
      });
    }
  });
}

function getUsers(request, response) {
  pg.connect(dbUrl, function(err, client){
    if (err || !client) {
      response.writeHead(500, {"Content-Type": "plain/text"});
      response.end("Could not connect to the databse: " + dbUrl);
    }else {
      var sql = "SELECT * FROM users;";
      client.query(sql, function(err, result){
        if (err || !result) {
          response.writeHead(200, {"Content-Type": "plain/text"});
          response.end("Error reading the database");
        }else {
          console.log(result.rows);
          response.writeHead(200, {"Content-Type": "plain/text"});
          response.end(JSON.stringify(result.rows) + '   :  '+result.rows.length + " users returned.");
        }
      });
    }
  });
}

exports.saveUser = saveUser;
exports.getUser = getUser;
exports.getUsers = getUsers;
