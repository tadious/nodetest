var express = require("express"),
	routes = require("./routes"),
	mongo = require("./mongo"),
	postgres = require("./postgres"),
	redis_service = require("./redis-service"),
	port = process.env.PORT || 3000;
var app = express();

app.get('/', routes.index);

app.get('/mongo/user/:id', mongo.getUser);
app.get('/mongo/users/', mongo.getUsers);
app.post('/mongo/user/', mongo.saveUser);

app.get('/postgres/user/:id', postgres.getUser);
app.get('/postgres/users/', postgres.getUsers);
app.post('/postgres/user/', postgres.saveUser);

app.get('/redis/:key', redis_service.getValue);
app.post('/redis/', redis_service.setValue);


app.listen(port);
console.log('Server started and listening on port ' + port);
