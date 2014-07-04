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
			var key = urlMatch[1];
			mapRequest(key, request.method, response, postedData);
			return;
		}
		
		//test for mongo db persist
		urlMatch = request.url.match(/^\/persist\/(.*)/);
		if(urlMatch) {
			var key = urlMatch[1];
			mapRequest(key, request.method, response, postedData);
		}else {
			response.writeHead(404, {"Content-Type": "plain/text"});
			response.end();
		}
	});
	
	
}

function mapRequest(key, method, response, postedData) {
	var redis = require("redis"),
	    client = redis.createClient();
	
	client.on('error', function(err){
		console.log('Error in redis: ' + err);
	});
	
	if(method == 'POST') {
		client.hset(["map",key,postedData], function(err, reply) {
			if(err) {
				throw err;
			}else {
				console.log("value=" + postedData);
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
		client.hget(["map",key], function(err, reply) {
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
