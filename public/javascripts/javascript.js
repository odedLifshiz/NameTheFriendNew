
//var currentPlayerId=1446484204; // oded
var currentPlayerId=1378982912; // stav
var matchupStatusOfNewGame=0;

/**
 * Moves the user to the Matchups zone.
 * Checks for changes in the game every 10sec.
 */
function showMatchups() {
    window.location = "#matchups";
	buildPlayerBar();
    buildMatchupsTable();
}

function logout(){
    window.location="#main";
}


function showHallOfFame(){
	var table = document.getElementById("hallOfFameBar");
	table.innerHTML = "";		
	$.getJSON( '/hallOfFame', function( hallOfFamePlayers ) {
		window.location = "#hallOfFame";
		$("#hallOfFameBar").append("<table width=\"100%\"><th align=\"center\">" + 
		"<td>Player</td><td>Score</td></th>");
		hallOfFamePlayers.forEach(function(hallOfFamePlayer) {
			buildSingleLineOfHallOfFame(hallOfFamePlayer);
		});	
	});
}
	
function buildSingleLineOfHallOfFame(hallOfFamePlayer) {
	var linkToPicure=getPictureURLFromFacebookId(hallOfFamePlayer["playerId"]);					  
	$("#hallOfFameBar").append("<tr align=\"center\">" +
		"<td><img src=\"" +linkToPicure+ "\" />&nbsp"+ "<br>"+ hallOfFamePlayer["name"]  +"<br> "+"</td>" +
		"<td>"+ hallOfFamePlayer["score"] + "</td>" +
		"</tr>");				  
            
}			
    
 function getPictureURLFromFacebookId(faceBookId){
	return "https:\/\/graph.facebook.com\/" + faceBookId +"\/picture\/";
 }
	
/**
 * Builds The player Bar that is showen on the top of the page.
 * Display the user picture, score and Level.
 * @param {type} userData
 * @returns {undefined}
 */
function buildPlayerBar() {
	getPlayerData(currentPlayerId, function (playerData) {
		var linkToPicure=getPictureURLFromFacebookId(playerData.playerId);
		var barDiv = document.getElementById("playerBar");
		barDiv.innerHTML = "<table width=\"100%\"><tr>" +
			"<td><img src=\""+linkToPicure + "\"></td>" +
			"<td> Points: " + playerData.score + "</td>" +
			"</tr></table>";
	});
}



/**
 * Builds the matchups table.
 * Display each rival of the user with the current score.
 * 
 * @param {type} matchesData
 * @returns {undefined}
 */
function buildMatchupsTable() {
	getAllPlayerMatchups(currentPlayerId, function(matchups){
		var table = document.getElementById("matchups_tableNew");
		table.innerHTML = "";
		matchups.forEach( function(matchup) {
			getMatchupData(matchup.matchupId, function(result) {
				buildSingleLineOfMatchupsTable(result);
			});
		});		
	});
}

	
function buildSingleLineOfMatchupsTable(result){
	
	matchup=result.matchup;
	if(result.player1.playerId === currentPlayerId) {
		currentPlayer = result.player1;
		rivalPlayer = result.player2;
		scoreOfCurrentPlayerInMatchup = matchup.scorePlayer1;
		rivalScoreInMatchup = matchup.scorePlayer2;
	}
	else {
		currentPlayer = result.player2;
		rivalPlayer = result.player1;
		scoreOfCurrentPlayerInMatchup = matchup.scorePlayer2;
		rivalScoreInMatchup = matchup.scorePlayer1;
	}

	var text = ""; 
	var buttonClass = "";
	var textValue = "";
	var buttonProperty = "";
	
	if (matchup.matchupStatus === matchupStatusOfNewGame ) {
		buttonText = "New Game";
		buttonClass = "newGame";
		buttonProperty = "onClick=\"createNewGame(" + matchup.matchupId +"," + rivalPlayer.playerId + ")\"";
	}
	else if (matchup.matchupStatus === currentPlayerId) {
		buttonText = "Your Turn";
		buttonClass = "yourTurn";
		buttonProperty = "onClick=\"playTurn(" + matchup.matchupId + ")\"";
	}
	else if (matchup.matchupStatus === rivalPlayer.playerId ) {
		buttonText = "Wait";
		buttonClass = "waitForRival";
		buttonProperty = "disabled";
	}
	else {
		buttonText = "Error: " + matchup.matchupStatus;
	}

	$("#matchups_tableNew").append("<tr align=\"center\">" +
			"<td><button " + buttonProperty + " class=\"" + buttonClass + "\">" + buttonText + "</button></td>" +
			"<td>"+currentPlayer.name+"<br/>" + scoreOfCurrentPlayerInMatchup + "</td>" +
			"<td>:</td><td>" +
			"<td>" + rivalPlayer.name + "<br />" + rivalScoreInMatchup + "</td>" +
			"<td><img src=\"" + getPictureURLFromFacebookId(rivalPlayer.playerId) + "\" class=\"profile\"/>" +
			"<br />" + rivalPlayer.name + "</td></tr>");

}		





/**
 * Build the Friends List.
 * @param {type} toInvite
 * @returns {undefined}
 */
function showFriendsZone(InviteOrNot) {

    var htmlCode = "";
    window.location = "#friends";
    document.getElementById("friends_table").innerHTML = "";
    getPlayersToPlayWith(currentPlayerId, function (playersToPlayWith) {
		buildFriendsTable(playersToPlayWith, false);
	});


}


function buildFriendsBar(matchup) {
    document.getElementById("matchups_table").style.display = "none";
    document.getElementById("friends_bar").innerHTML = "";
    var table = document.getElementById("friends_bar");
    var play_button = document.createElement("button");
    var invite_button = document.createElement("button");
    var textPlay = document.createTextNode(text = "Play Friends");
    var textInvite = document.createTextNode(text = "Invite Friends");
    var onclick = document.createAttribute(on)

    play_button.appendChild(textInvite);
    invite_button.appendChild(textPlay);
    play_button.setAttribute("onClick", buildFriendsTable(matchup, false));
    invite_button.onClick = buildFriendsTable(matchup, true);
    var row = document.createElement("tr");
    var button_col = document.createElement("td");
    button_col.appendChild(play_button);
    var button_col2 = document.createElement("td");
    button_col2.appendChild(invite_button);
    row.appendChild(button_col);
    row.appendChild(button_col2);
    table.appendChild(row);
}

/**
 * Display user's friends from facebook. 
 * If they are allready registerd to the game (toInvite = false) start a new game, 
 * else Invite them to register to the app.  
 * @param {type} playersNotInMatchups
 * @param {type} toInvite
 * @returns {undefined}
 */
function buildFriendsTable(playersNotInMatchups, toInvite) {
	
    document.getElementById("friends_bar").style.display = "block";
    document.getElementById("friends_table").innerHTML = "";
    var table = document.getElementById("friends_table");
    var numOfMatchups = playersNotInMatchups.length;
    var index;
    for (index = 0; index < numOfMatchups; ++index) {

        var text = "";
        var buttonProperty = "";
        if (toInvite) {
            text = "Invite";
            buttonProperty = "onClick=\"InviteFriend()\"";
        } else {
            text = "Play";
            buttonProperty = "onClick=\"startGameWithNewPlayer(" + playersNotInMatchups[index].playerId + ")\"";
        }

        $("#friends_table").append("<tr align=\"center\">" +
                "<td><button " + buttonProperty + " >" + text + "</button></td>" +
                "<td><img src=\"" + getPictureURLFromFacebookId(playersNotInMatchups[index].playerId) + "\" />" +
                "<br />" + playersNotInMatchups[index].name + "</td></tr>");
    }
}

/**
 * --- NOT IMPLEMENTED YET ---
 * 
 * Send an invitation through Facebook to register the game.
 * @returns {undefined}
 */
function inviteFriend() {
    alert("Invitation was sent through facebook");
}


function startGameWithNewPlayer(rivalId) {
	createNewMatchup(currentPlayerId, rivalId, function(newMatchupId) {
		createNewGame(newMatchupId, rivalId);
	});
}

function playerTurn() {
	window.location = "#guessPersonInPicture";
}

/* Converts the image to base 64 and moves to the next step*/
function handleImageSelected(matchupId,initiatorId,rivalId) {
	
    var filesSelected = document.getElementById("inputFileToLoad").files;
    if (filesSelected.length > 0)
    {
        var fileToLoad = filesSelected[0];

        var fileReader = new FileReader();

        fileReader.onload = function(fileLoadedEvent) {
			var imageSelectedAsBase64 = fileLoadedEvent.target.result; // <--- data: base64 
			moveToStep2(matchupId, initiatorId, rivalId, imageSelectedAsBase64);
        };
		
        fileReader.readAsDataURL(fileToLoad);
    }
}
function moveToStep2(matchupId, initiatorId, rivalId, imageSelectedAsBase64) {
	var imageSrc=document.getElementById("imageToBlur");
	imageSrc.setAttribute("src", imageSelectedAsBase64);    
	
	var chooseFileElement=document.getElementById("moveToStep3");
	chooseFileElement.setAttribute("onclick", "moveToStep3(" + matchupId + "," + initiatorId + "," + rivalId + "," + "'"+imageSelectedAsBase64+"'" + ")");
	window.location = "#step2";
    document.getElementById("imageToBlur").setAttribute("src", imageSelectedAsBase64);
    $("#slider-fill").val(0).slider('refresh');
}

function moveToStep3(matchupId,initiatorId,rivalId,imageSelectedAsBase64) {
	var canvas = document.getElementById("canvasForBlurredImage");
    var imageBlurredAsBase64 = canvas.toDataURL('image/jpeg');
	
	// add all the values of the new game as hidden values in the form
	document.getElementById("hiddenMatchupId").setAttribute("value", matchupId);
	document.getElementById("hiddenInitiatorId").setAttribute("value", initiatorId);
	document.getElementById("hiddenRivalId").setAttribute("value", rivalId);
	document.getElementById("hiddenImageSelectedAsBase64").setAttribute("value", imageSelectedAsBase64);
	document.getElementById("hiddenImageBlurredAsBase64").setAttribute("value", imageBlurredAsBase64);
	
	window.location = "#step3";	
}

function addGame() {	
	var newGame=getNewGameData();
	addGameToDb(newGame);
	window.location = "#step4";
}

function getNewGameData(){
	var newGame = {
		'matchupId': $('#addGame fieldset input#hiddenMatchupId').val(),
		'challengerId': $('#addGame fieldset input#hiddenInitiatorId').val(),
		'rivalId': $('#addGame fieldset input#hiddenRivalId').val(),
		'originalImage': $('#addGame fieldset input#hiddenImageSelectedAsBase64').val(),
		'blurredImage': $('#addGame fieldset input#hiddenImageBlurredAsBase64').val(),
        'options': [ $('#addGame fieldset input#nameOfPersonInImage').val(),
					 $('#addGame fieldset input#firstOption').val(),
                     $('#addGame fieldset input#secondOption').val(),
                     $('#addGame fieldset input#thirdOption').val()
					 ],
        'correctOptionIndex': 0,
		'geoLocation' : 'some where in the mediterenian'
	}
	return newGame;
}


function playTurn(matchupId) {
	
	getGame(matchupId, function(gameData){
		$("#blurredImage").attr("src",gameData.blurredImage);
		$("#option1").attr("value", gameData.options[0]);		
		$("#option2").attr("value", gameData.options[1]);		
		$("#option3").attr("value", gameData.options[2]);		
		$("#option4").attr("value", gameData.options[3]);
		$("#matchupId").attr("value", gameData.matchupId);
		window.location = "#yourTurn";
	});
}

function checkAnswer(playerAnswer) {
	matchupId=$("#matchupId").val();
	$.getJSON( '/games/handlePlayerGuess/' + matchupId + '/' + playerAnswer, function(result) {
		if (result.isPlayerAnswerCorrect) {
			message = "You are Right! The answer was: " + result.correctAnswer + "!";
		} else {
			message = "You are Wrong! The answer was: " + result.correctAnswer + "!";
		}
		document.getElementById("messageAfterGuess").innerHTML=message;		
		$("#originalImage").attr("src", result.originalImage);
		window.location="#EndGame";			
	});	
}


function buildPlayerBarForFriends(userData) {
    var barDiv = document.getElementById("playerBar2");
    barDiv.innerHTML = "<table width=\"100%\"><tr>" +
            "<td><img src=\"" + userData["imgURL"] + "\" />&nbsp" + userData["fullName"] + "</td>" +
            "<td> Level:" + userData["level"] + "</td>" +
            "<td> Points: " + userData["score"] + "</td>" +
            "<td></td>" +
            "</tr></table>";
}


function myBlur() {
    var blur = $("#slider-fill").val();
    stackBlurImage("imageToBlur", "canvasForBlurredImage", blur);

}

function createNewGame(matchupId,rivalId) {
	var initiatorId=currentPlayerId;
	var chooseFileElement=document.getElementById("inputFileToLoad");
	chooseFileElement.setAttribute("onchange", "handleImageSelected("+matchupId+","+initiatorId+","+rivalId+")");
    window.location = "#step1";
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// database access functions
function getPlayerData(playerId, callback){
	$.getJSON( '/players/' + playerId ,function( playerData ) {
		callback(playerData);
	});
}
function getAllPlayerMatchups(playerId, callback){
	$.getJSON( '/matchups/' + playerId, function( matchups ) {
		callback(matchups);
	});	
}

function addGameToDb(newGame){
	 $.ajax({
            type: 'POST',
            data: newGame,
            url: '/games',
            dataType: 'JSON'
        }).done(function( response ) {
			alert(response.msg);
        });
}

function getGame(matchupId,callback){
	$.getJSON( '/games/' + matchupId, function( gameData ) {
		callback(gameData);
	});	
}

function getMatchup(matchupId,callback){
	// first we get the matchup and find the current game id and get it
	$.getJSON( '/matchups/' + matchupId ,function( matchup ) {
		callback(matchup);
	});
}


function getMatchupData(matchupId,callback){
	// first we get the matchup and find the current game id and get it
	$.getJSON( '/matchupData/' + matchupId ,function( matchup ) {
		callback(matchup);
	});
}

function updateMatchupStatus(matchupId,matchupStatusToUpdateTo){
 $.ajax({
		type: 'PUT',
		url: '/matchups/updateStatus/' + matchupId + '/' + matchupStatusOfNewGame,
	}).done(function( response ) {
		console.log(response.msg);
	});
}

function createNewMatchup(currentPlayerId, rivalId, callback){

	$.getJSON( '/matchups/' + currentPlayerId + "/" + rivalId, function( newMatchupId ) {
		callback(newMatchupId);
	});	
}

function getPlayersToPlayWith(currentPlayerId, callback) {
	$.getJSON( '/playersToPlayWith/' + currentPlayerId, function( playersToPlayWith ) {
		callback(playersToPlayWith);
	});		

}
