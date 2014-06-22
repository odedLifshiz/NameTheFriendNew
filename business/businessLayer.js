businessLayer = function(app) {
	this.databaseObject = app.databaseObject;
};
 
businessLayer.prototype.findAllPlayers = function(callback) {
	this.databaseObject.findAllPlayers(function(err, result) {
		callback(err, result);
	});
};

businessLayer.prototype.findPlayer = function(playerId, callback) {
	this.databaseObject.findPlayer(playerId, function(err, result) {
		callback(err, result);
	});
};



businessLayer.prototype.findAllMatchups = function(callback) {
	this.databaseObject.findAllMatchups(function(err, result) {
		callback(err, result);
	});
};

businessLayer.prototype.findAllPlayerMatchups = function(playerId, callback) {
	this.databaseObject.findAllPlayerMatchups(playerId, function(err, result) {
		callback(err, result);
	});
};

businessLayer.prototype.addNewGame = function(game, callback) {
	var me = this;
	this.databaseObject.addNewGame(game, function(err, result) {
		if(err===null){
			// if the game was added successfully update the status of parent matchup (change turns)
			var matchupId = game.matchupId;
			var newMatchupStatus = game.rivalId;
			me.databaseObject.updateMatchupStatus(matchupId, newMatchupStatus, function(err, result) {
				callback(err, result);
			});
		}
		else {
			console.log("could not add new game");
		}
	});
};

businessLayer.prototype.findGame = function(matchupId, callback) {
	this.databaseObject.findGame(matchupId, function(err, result) {
		callback(err, result);
	});
};

businessLayer.prototype.addPoint = function(playerId, callback) {
	this.databaseObject.addPoint(playerId, function(err, result) {
		callback(err, result);
	});
};

businessLayer.prototype.deleteGame = function(matchupId, callback) {
	this.databaseObject.deleteGame(matchupId, function(err, result) {
		callback(err, result);
	});
};

businessLayer.prototype.handlePlayerGuess = function(matchupId, answer, callback) {
	// 1) Delete the game and return a message
	// 2) Get the current game of the mathchup
	// 3) Check if the answer is correct
	// 4) Add point to the rival or challenger
	// 5) Update the mathup status to new game
	var me=this;
	this.databaseObject.findGame(matchupId, function(err, game) {
		correctOptionIndex = parseInt(game.correctOptionIndex);
		correctAnswer = game.options[correctOptionIndex];
		challengerId = game.challengerId;
		rivalId = game.rivalId
		originalImage = game.originalImage;
		var returnObject = { "isPlayerAnswerCorrect" : false, "correctAnswer" : correctAnswer, "originalImage" : originalImage};
		if(answer == correctAnswer){
			returnObject.isPlayerAnswerCorrect = true;
			playerIdToAddPoint = rivalId;
		}
		else{
			returnObject.isPlayerAnswerCorrect = false;
			playerIdToAddPoint = challengerId;	
		}
		var me2=me;
		me.databaseObject.addPoint(playerIdToAddPoint, function(err, result) {
			var me3=me2;
			me2.databaseObject.addPointInMatchup(matchupId, playerIdToAddPoint, function(err, result) {
				var me4=me3;
				me3.databaseObject.updateMatchupStatus(matchupId, 0, function(err, result) {
					me4.databaseObject.deleteGame(matchupId, function(err, result) {
						callback(err, returnObject);
					});					
				});
			});
		});			
	});
};


businessLayer.prototype.findHallOfFamePlayers = function(callback) {
	this.databaseObject.findHallOfFamePlayers(function(err, result) {
		callback(err, result);
	});
};



module.exports = businessLayer;