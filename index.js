var express = require("express"),
	routes = require("./routes"),
	mongo_service = require("./mongo-service"),
	postgres_service = require("./postgres-service"),
	redis_service = require("./redis-service"),
	port = process.env.PORT || 3000;
var app = express();

app.get('/', routes.index);

app.get('/mongo/user/:id', mongo_service.getUser);
app.get('/mongo/users/', mongo_service.getUsers);
app.post('/mongo/user/', mongo_service.saveUser);

app.get('/postgres/user/:id', postgres_service.getUser);
app.get('/postgres/users/', postgres_service.getUsers);
app.post('/postgres/user/', postgres_service.saveUser);

app.get('/redis/:key', redis_service.getValue);
app.post('/redis/', redis_service.setValue);


app.listen(port);
console.log('Server started and listening on port ' + port);
