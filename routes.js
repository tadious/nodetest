function index(request, response) {
	response.writeHead(200, {"Content-Type": "plain/text"});
	response.end("Welcome to our Node-Express App.");
}

exports.index = index;
