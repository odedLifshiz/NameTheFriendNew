function mainPageController(app) {
	this.businessLayer = app.businessLayer;
};

mainPageController.prototype.findAllPlayers = function findAll(req, res){
	this.businessLayer.findAllPlayers(function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});
};

mainPageController.prototype.findPlayer = function(req, res){
	var playerId = parseInt(req.param("playerId"));
	this.businessLayer.findPlayer(playerId, function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});	
};


mainPageController.prototype.findAllMatchups = function findAll(req, res){
	this.businessLayer.findAllMatchups(function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});
};


mainPageController.prototype.findAllPlayerMatchups = function(req, res){
	var playerId = parseInt(req.param("playerId"));
	this.businessLayer.findAllPlayerMatchups(playerId, function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});	
};

mainPageController.prototype.addNewGame = function(req, res){
	var game = req.body;
	// set the new game parameters as integers (instead of strings)
	game.matchupId=parseInt(game.matchupId);
	game.challengerId=parseInt(game.challengerId);
	game.rivalId=parseInt(game.rivalId);
	
	this.businessLayer.addNewGame(game, function(err, result) {
		if (err) {
			res.send(500, err);
		}
	});	
};


mainPageController.prototype.findGame = function(req, res){
	var matchupId = parseInt(req.param("matchupId"));
	this.businessLayer.findGame(matchupId, function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});	
};


mainPageController.prototype.addPoint = function(req, res){
	var playerId = parseInt(req.param("playerId"));
	this.businessLayer.addPoint(playerId, function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});	
};


mainPageController.prototype.deleteGame = function(req, res){
	var matchupId = parseInt(req.param("matchupId"));
	this.businessLayer.deleteGame(matchupId, function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.send(result);
		}
	});	
};

mainPageController.prototype.handlePlayerGuess = function(req, res){
	var matchupId = parseInt(req.param("matchupId"));
	var answer = req.param("answer");
	this.businessLayer.handlePlayerGuess(matchupId, answer, function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			res.json(result);
		}
	});	
};


mainPageController.prototype.findHallOfFamePlayers = function(req, res){
	this.businessLayer.findHallOfFamePlayers(function(err, result) {
		if (err) {
			res.send(500, err);
		} else {
			console.log("Ctrl: found em hall of famers");
			res.json(result);
		}
	});	
};





module.exports = mainPageController;