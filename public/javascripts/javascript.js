
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
	debugger;
	$.getJSON( '/hallOfFame', function( hallOfFamePlayers ) {
		debugger;
		window.location = "#hallOfFame";
		$("#hallOfFameBar").append("<table width=\"100%\"><th align=\"center\">" + 
		"<td>Player</td><td>Score</td></th>");
		hallOfFamePlayers.forEach(function(hallOfFamePlayer) {
			buildSingelLineOfHallOfFame(hallOfFamePlayer);
		});	
	});
}
	
function buildSingelLineOfHallOfFame(hallOfFamePlayer) {
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
		matchups.forEach(function(matchup) {
			buildSingelLineOfMatchupsTable(matchup);
		});
	});
}

	
function buildSingelLineOfMatchupsTable(matchupData){
	// when we have a matchup data we want the data of the current logged in player on the right
	player1Id=matchupData["player1Id"];
	player2Id=matchupData["player2Id"];
	if(player1Id === currentPlayerId){
		rivalId=player2Id;
	}
	else {
		rivalId=player1Id;
	}

	getPlayerData(currentPlayerId, function (currentPlayerData){
		getPlayerData(rivalId, function (rivalPlayerData){
			var text = ""; 
			var buttonClass = "";
			var textValue = "";
			var buttonProperty = "";
			
			if (matchupData["matchupStatus"] === matchupStatusOfNewGame ) {
				buttonText = "New Game";
				buttonClass = "newGame";
				buttonProperty = "onClick=\"createNewGame(" + matchupData["matchupId"] +","+rivalId + ")\"";
			}
			else if (matchupData["matchupStatus"] === currentPlayerId) {
				buttonText = "Your Turn";
				buttonClass = "yourTurn";
				buttonProperty = "onClick=\"playTurn(" + matchupData["matchupId"] + ")\"";
			}
			else if (matchupData["matchupStatus"] === rivalId) {
				buttonText = "Wait";
				buttonClass = "waitForRival";
				buttonProperty = "disabled";
			}
			else {
				buttonText = "Error" + matchupData["matchupStatus"];
			}

			$("#matchups_tableNew").append("<tr align=\"center\">" +
					"<td><button " + buttonProperty + " class=\"" + buttonClass + "\">" + buttonText + "</button></td>" +
					"<td>"+currentPlayerData["name"]+"<br/>" + matchupData["scorePlayer1"] + "</td>" +
					"<td>:</td><td>" +
					"<td>" + rivalPlayerData["name"] + "<br />" + matchupData["scorePlayer2"] + "</td>" +
					"<td><img src=\"" + getPictureURLFromFacebookId(rivalId) + "\" class=\"profile\"/>" +
					"<br />" + rivalPlayerData["name"] + "</td></tr>");
		});
	});
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
    var friendsInGame = [{"rivalId": "1", "rivalName": "or maoz", "rivalImg": "https:\/\/graph.facebook.com\/or.maoz\/picture\/"},
        {"rivalId": "2", "rivalName": "danny nave", "rivalImg": "https:\/\/graph.facebook.com\/danny.nave\/picture\/"}];
    var friendsNotInGame = [{"rivalId": "1", "rivalName": "oran cohen", "rivalImg": "https:\/\/graph.facebook.com\/oran.cohen\/picture\/"},
        {"rivalId": "2", "rivalName": "danit nall", "rivalImg": "https:\/\/graph.facebook.com\/danit.nave\/picture\/"}];
    if (InviteOrNot) {
        buildFriendsTable(friendsNotInGame, InviteOrNot);
    } else {
        buildFriendsTable(friendsInGame, InviteOrNot);
    }
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
 * @param {type} matchesData
 * @param {type} toInvite
 * @returns {undefined}
 */
function buildFriendsTable(matchesData, toInvite) {

    document.getElementById("friends_bar").style.display = "block";
    // document.getElementById("matchups_tableNew").style.display = "none";
    document.getElementById("friends_table").innerHTML = "";
    var table = document.getElementById("friends_table");
    var numOfMatchups = matchesData.length;
    /*//alert(numOfMatchups);
     //alert(table.innerHTML);*/
    var index;
    for (index = 0; index < numOfMatchups; ++index) {

        var text = "";
        var buttonProperty = "";
        // Decide button
        if (toInvite) {
            text = "Invite";
            buttonProperty = "onClick=\"InviteFriend()\"";
        } else {
            text = "Play";
            buttonProperty = "onClick=\"startGameWithNewPlayer(" + matchesData[index]["rivalId"] + ")\"";
        }

        $("#friends_table").append("<tr align=\"center\">" +
                "<td><button " + buttonProperty + " >" + text + "</button></td>" +
                "<td><img src=\"" + matchesData[index]["rivalImg"] + "\" />" +
                "<br />" + matchesData[index]["rivalName"] + "</td></tr>");
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
    window.location = "#step1";
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
			moveToStep2(matchupId,initiatorId,rivalId,imageSelectedAsBase64);
        };
		
        fileReader.readAsDataURL(fileToLoad);
    }
}
function moveToStep2(matchupId,initiatorId,rivalId,imageSelectedAsBase64) {
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
		$("#option1").attr("value",gameData.options[0]);		
		$("#option2").attr("value",gameData.options[1]);		
		$("#option3").attr("value",gameData.options[2]);		
		$("#option4").attr("value",gameData.options[3]);
		$("#matchupId").attr("value",gameData.matchupId);
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
	$.getJSON( '/matchups/' + matchupId ,function( matchupData ) {
		callback(matchupData);
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