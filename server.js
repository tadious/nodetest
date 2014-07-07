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
				console.log(users);
				response.writeHead(200, {"Content-Type": "plain/text"});
				response.end(JSON.stringify(users) + ' <<<<<<<<<<  USERS');
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
