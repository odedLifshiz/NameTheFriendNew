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

function randomIntFromInterval(min, max)
{
    return Math.floor(Math.random()*(max - min +1 ) + min);
}

function getNewCorrectOptionIndex(correctOption, options) {
	for(index = 0; index < options.length; index++) {
		if(options[index] === correctOption) {
			return index;
		}
	}
}

function shuffleArray(array) {
	var arrayCopy = [];
	for(index = 0; index < array.length; index++) {
		random = randomIntFromInterval(0, array.length - index);
		arrayCopy.push(array[random]);
		array[random] = array[ array.length - 1 - index ];
	}
	array = arrayCopy;
}


businessLayer.prototype.addNewPlayer = function(player, callback) {
	// set the score of the new player to 0
	player.score = 0;
	this.databaseObject.addNewPlayer(player, function(err, result) {
		if(err===null){
			callback(err, result);
		}
		else {
			console.log("could not add new player, the error was: " + err);
		}
	});
};


businessLayer.prototype.addNewGame = function(game, callback) {
	var me = this;
	
	// change the order of the answers options in the game object
	var options = game.options;
	var newCorrectOptionIndex = randomIntFromInterval(0, options.length - 1);
	var optionInRandom = options[newCorrectOptionIndex];
	var correctOption = options[game.correctOptionIndex];
	options[game.correctOptionIndex] = optionInRandom;
	options[newCorrectOptionIndex] = correctOption;
	game.correctOptionIndex = newCorrectOptionIndex;
	
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
			console.log("could not add new game, the error was: " + err);
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
		imageSelectedAsBase64 = game.imageSelectedAsBase64;
		var returnObject = { "isPlayerAnswerCorrect" : false, "correctAnswer" : correctAnswer, "imageSelectedAsBase64" : imageSelectedAsBase64};
		if(answer == correctAnswer){
			returnObject.isPlayerAnswerCorrect = true;
			playerIdToAddPoint = rivalId;
		}
		else{
			returnObject.isPlayerAnswerCorrect = false;
			playerIdToAddPoint = challengerId;	
		}
		var me2 = me;
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

businessLayer.prototype.findPlayersRegisteredThatIDidntPlayWith = function(playerId, callback) {
	var playersToPlayWith = [];
	var me=this;
	
	this.databaseObject.findAllPlayerMatchups(playerId, function(err, matchups) {
			me.databaseObject.findAllPlayers(function(err, players) {
				for (indexInPlayers = 0; indexInPlayers < players.length; indexInPlayers++) { 				
					var playedWithBefore = false;
					var currentPlayerId = players[indexInPlayers].playerId;	
					if( currentPlayerId !== playerId) {
						// Go over all matchup and check if the current player played.
						for (i = 0; i < matchups.length; i++) { 
							if(currentPlayerId === matchups[i].player1Id || currentPlayerId === matchups[i].player2Id) {
								playedWithBefore = true;
							}	
						}	
						// If the current player haven't played in any matchup - add him to the player to play with list. 
						if (!playedWithBefore) {
							playersToPlayWith.push(players[indexInPlayers]);
						}
					}
				};
				callback(err, playersToPlayWith);		
			});	
		});
}



businessLayer.prototype.addNewMatchup = function(currentPlayerId, rivalId, callback) {
	var me=this;
	this.databaseObject.getLastIndex( function (err, lastIndex) {
		var nextIndex=parseInt(lastIndex) + 1;
		var buildNewMatchup = { 
						   "matchupId"      : nextIndex,
						   "player1Id"      : currentPlayerId,
						   "player2Id"      : rivalId,
						   "scorePlayer1"   : 0,
						   "scorePlayer2"   : 0,
						   "matchupStatus"  : 0
						 };
		me.databaseObject.addNewMatchup( buildNewMatchup, function(err, result) {
			callback(err, nextIndex);
		});			
	});
};


businessLayer.prototype.findMatchupData = function(matchupId, callback) {
	var me=this;
	this.databaseObject.findMatchup(matchupId, function (err, matchup) {
		var me2=me;
		me.databaseObject.findPlayer(matchup.player1Id, function(err, player1) {
			me2.databaseObject.findPlayer(matchup.player2Id, function(err, player2) {
				result = { "matchup" : matchup,
						   "player1" : player1,
						   "player2" : player2
				};
				callback(err, result);
			});
		});
	});
};





module.exports = businessLayer;