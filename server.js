var http = require("http");

function OnRequest(request, response) 
{
	response.writeHead(200, {"Content-Type": "text/plain"});
  	
  	if (request.url == '/ping')
  		response.write("pong");
  	else
  		response.write("not found");

  	response.end();
}

http.createServer(OnRequest).listen(8888);
