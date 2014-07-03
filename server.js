var fs = require('fs'),
	https = require("https"),
	redis = require("redis"),
	options = {
		key: fs.readFileSync('key.pem'),
		cert: fs.readFileSync('cert.pem')
	};
	

function loadPostLink(response)
{
	var static = fs.readFileSync('client-side-post.html');
	response.writeHead(200, {"Content-Type": "html"});
	response.end(static);
}

function OnRequest(request, response)
{
	var client = redis.createClient();
	
	client.on('error',function(err){
		console.log('Error in redis.... ' + err);
	});
	
	if (request.method.toLowerCase() == 'post')
	{
		switch(request.url)
		{
			case '/ping':
				response.writeHead(200, {"Content-Type": "text/plain"});
				response.write("pong");
				response.end();
			break;
			
			case '/client-side-post':
				loadPostLink(response);
			break;
			
			case '/toredis':
				response.writeHead(200, {"Content-Type": "text/plain"});
		
				client.hset(["test_repo","some-key","This is REDIS!!!"], function(err, reply){
					client.end();
					response.end(reply);
				});
			break;
			
			case '/fromredis':
				response.writeHead(200, {"Content-Type": "text/plain"});
				
				client.hget(["test_repo","some-key"], function(err, reply){
					client.end();
					response.end(reply);
				});
			break;
			
			default:
				response.writeHead(403, {"Content-Type": "text/plain"});
				response.write('not found');
			break;
		}
	}
	else
	{
		//Load the static file so we can use JQuery to post tp Node server
		loadPostLink(response);
		response.end();
	}
}



https.createServer(options, OnRequest).listen(8888);
