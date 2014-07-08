var fs = require('fs'),
	https = require("https"),
	options = {
		key: fs.readFileSync('key.pem'),
		cert: fs.readFileSync('cert.pem')
	},
	port = process.env.PORT || 8888;
	
function onRequest(request, response) {
    var postedData = '';
	//Get post data
	request.on('data', function(chunk){
		postedData += chunk;
	});
	
	request.on('end', function(){
		var urlMatch = request.url.match(/^\/map\/(.*)/);
		if(urlMatch) {
			request.mapKey = urlMatch[1];
			request.postedData = postedData;
			mapRequest(request, response);
			return;
		}

		//test for postgres db persist
		urlMatch = request.url.match(/^\/db\/(.*)/);
		if(urlMatch) {
			request.dbKey = urlMatch[1];
			request.postedData = postedData;
			postgresRequest(request, response);
			return;
		}
		
		//test for mongo db persist
		urlMatch = request.url.match(/^\/persist\/(.*)/);
		if(urlMatch) {
			request.persistKey = urlMatch[1];
			request.postedData = postedData;
			persistRequest(request, response);
		}else {
			response.writeHead(404, {"Content-Type": "plain/text"});
			response.end();
		}
	});
		
}

function postgresRequest(request, response) {
	var pg = require('pg');
	var dbUrl = "tcp://postgres:crazylongpassword@localhost/postgres";

	if (request.method == 'POST') {
		var userData = JSON.parse(request.postedData);
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
	}else {
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
}

function persistRequest(request, response) {
	var databaseUrl = "test";// "username:password@example.com/test"
	var collections = ["users"];
	var db = require("mongojs").connect(databaseUrl, collections);

	if(request.method == 'POST') {
		var userData = JSON.parse(request.postedData);
		db.users.save({id:userData.id,name:userData.name,surname:userData.surname,sex:userData.sex}, function(err, saved){
			if(err || !saved) {
				response.writeHead(500, {"Content-Type": "plain/text"});
				response.end("Error");
			}else {
				response.writeHead(201, {"Content-Type": "plain/text"});
				response.end("Saved");
			}
		});
	}else {
		console.log(request.persistKey);
		db.users.find({name:request.persistKey}, function(err, users){
			if(err || !users) {
				response.writeHead(200, {"Content-Type": "plain/text"});
				response.end("No users found.");
			}else {
				response.writeHead(200, {"Content-Type": "plain/text"});
				response.end(JSON.stringify(users));
			}
		})
	}
}

function mapRequest(request, response) {
	var redis = require("redis"),
	    client = redis.createClient();
	
	client.on('error', function(err){
		console.log('Error in redis: ' + err);
	});
	
	if(request.method == 'POST') {
		client.hset(["map",request.mapKey,request.postedData], function(err, reply) {
			if(err) {
				throw err;
			}else {
				console.log("value=" + request.postedData);
				if(reply == 1) {
					response.writeHead(201, {"Content-Type": "plain/text"});
					response.end();
				}else {
					response.writeHead(202, {"Content-Type": "plain/text"});
					response.end();
				}
			}
		});
		
	}else {
		client.hget(["map",request.mapKey], function(err, reply) {
			if(err) {
				throw err;
			}else {
				response.writeHead(200, {"Content-Type": "plain/text"});
				response.end(reply);
			}
		});
	}
}

https.createServer(options, onRequest).listen(port);
console.log('Listening on port ' + port);
