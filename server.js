var fs = require('fs'),
	http = require("http");
	
function loadPostLink(response)
{
	var static = fs.readFileSync('client-side-post.html');
	response.writeHead(200, {"Content-Type": "html"});
	response.end(static);
}

function OnRequest(request, response)
{
	if (request.method.toLowerCase() == 'post')
	{
		if (request.url == '/ping')
		{
			response.writeHead(200, {"Content-Type": "text/plain"});
			response.write("pong");
		}
		else if(request.url == '/client-side-post')
		{	
			loadPostLink(response);
		}
		else
		{
			response.writeHead(403, {"Content-Type": "text/plain"});
			response.write('not found');
		}
		response.end();
	}
	else
	{
		//Load the static file so we can use JQuery to post tp Node server
		loadPostLink(response);
	}
}



http.createServer(OnRequest).listen(8888);
