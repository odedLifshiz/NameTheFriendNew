
databaseObjectMongo = function(config, connection) {
	this.connection = connection;
};

databaseObjectMongo.prototype.findAllPlayers = function(callback){
    this.connection.collection('players').find({}).toArray(function (err, items) {
		callback(err, items);
    });
};

databaseObjectMongo.prototype.findPlayer = function(playerId, callback){
	this.connection.collection('players').findOne({'playerId':playerId},function (err,player) {
		callback(err, player);
    });
};

databaseObjectMongo.prototype.findAllMatchups = function(callback){
    this.connection.collection('matchups').find({}).toArray(function (err, items) {
		callback(err, items);
    });
};

databaseObjectMongo.prototype.findAllPlayerMatchups = function(playerId, callback){
    this.connection.collection('matchups').find({$or: [ {"player1Id":playerId},{"player2Id":playerId}]}).toArray(function (err, items) {
		callback(err, items);
    });
};

databaseObjectMongo.prototype.addNewGame = function(game, callback){
	this.connection.collection('games').insert(game, function(err, result){
		callback(err, result);
	});
};


databaseObjectMongo.prototype.updateMatchupStatus = function(matchupId, newMatchupStatus, callback){
	this.connection.collection('matchups').update({'matchupId': matchupId},{$set:{matchupStatus:newMatchupStatus}}, function(err, result) {
        callback(err, result);
	});
};

databaseObjectMongo.prototype.findGame = function(matchupId, callback){
	this.connection.collection('games').findOne({'matchupId':matchupId},function (err,game) {
		callback(err, game);
    });
};

databaseObjectMongo.prototype.addPoint = function(playerId, callback){
    this.connection.collection('players').update({'playerId':playerId},{$inc:{score:1}},function (err,item) {
		callback(err, item);
    });
};

databaseObjectMongo.prototype.deleteGame = function(matchupId, callback){
    this.connection.collection('games').remove({'matchupId':matchupId},function (err,item) {
		callback(err, item);
    });
};

databaseObjectMongo.prototype.addPointInMatchup = function(matchupId, playerIdToAddPoint, callback){
	var me=this;
	this.connection.collection('matchups').findOne({'matchupId':matchupId},function (err, matchup) {
		if(matchup.player1Id == playerIdToAddPoint){
			me.connection.collection('matchups').update({'matchupId':matchupId},{$inc:{scorePlayer1:1}}, function (err,item) {
				callback(err, item);
			});
		}
		else{
			me.connection.collection('matchups').update({'matchupId':matchupId},{$inc:{scorePlayer2:1}}, function (err,item) {
				callback(err, item);
			});			
		}
    });
};


databaseObjectMongo.prototype.findHallOfFamePlayers = function(callback){
	var options = {
		"limit": 3,
		"sort": [['score','desc']]
	};
    this.connection.collection('players').find({}, options).toArray(function (err, items) {
		callback(err, items);
    });
};


databaseObjectMongo.prototype.getLastIndex = function(callback){
	var options = {
		"limit": 1,
		"sort": [['matchupId','desc']]
	};
    this.connection.collection('matchups').find({}, options).toArray(function (err, items) {
		callback(err, items[0].matchupId);
    });
};

databaseObjectMongo.prototype.addNewMatchup = function(newMatchup, callback){
	this.connection.collection('matchups').insert(newMatchup, function(err, result){
		callback(err, result);
	});
};



module.exports = databaseObjectMongo;