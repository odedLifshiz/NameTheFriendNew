var express	= require('express')
  , http	= require('http')
  , path	= require('path');

var config = require('config');
var MongoClient = require('mongodb').MongoClient;


var mainPageController = require('./application/mainPageController');
var businessLayer = require('./business/businessLayer');
var databaseObjectMongo = require('./persistence/databaseObjectMongo');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.use(express.favicon(path.join(__dirname, 'public', 'resources', 'images', 'favicon.ico')));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var connection;
MongoClient.connect("mongodb://" + config.url + ":" + config.port+ "/" + config.databaseName, function(err, db) {
  if(err) {
    console.log("Could not connect to database, exiting");
	process.exit(1);
  }
  else{
	connection=db;
	console.log("Connected to database");
	
	var myApp = {};
	myApp.databaseObject = new databaseObjectMongo(config, connection);
	myApp.businessLayer = new businessLayer(myApp);
	myApp.mainPageController = new mainPageController(myApp);

	app.get('/players', myApp.mainPageController.findAllPlayers.bind(myApp.mainPageController));
	app.get('/players/:playerId', myApp.mainPageController.findPlayer.bind(myApp.mainPageController));
	app.get('/hallOfFame', myApp.mainPageController.findHallOfFamePlayers.bind(myApp.mainPageController));
	
	app.get('/matchups', myApp.mainPageController.findAllMatchups.bind(myApp.mainPageController));
	app.get('/matchups/:playerId', myApp.mainPageController.findAllPlayerMatchups.bind(myApp.mainPageController));
	
	app.post('/games', myApp.mainPageController.addNewGame.bind(myApp.mainPageController));
	app.get('/games/:matchupId', myApp.mainPageController.findGame.bind(myApp.mainPageController));
	app.get('/games/handlePlayerGuess/:matchupId/:answer', myApp.mainPageController.handlePlayerGuess.bind(myApp.mainPageController));

	
	http.createServer(app).listen(app.get('port'), function(){
	  console.log("Express server listening on port " + app.get('port'));
	});

  }
});
