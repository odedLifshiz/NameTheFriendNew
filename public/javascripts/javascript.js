
var test = false;
var currentPlayerId = 0;
fbIdOded = 10204510892599438;
fbIdStav = 10204520458916340;
var testid = fbIdOded; 
//var testid = fbIdStav; 
//var testid = 0;
var geoLocationsSqliteTable = "geoLocations";
var matchupStatusOfNewGame = 0;
var database;
var gameInBuild = {};



function setupTest(){
	test = true;
	testid = fbIdOded;
	alert("test mode: active, no facebook login required, current player id = " + testid + " press login to continue" );
}

function teardownTest(){
	test = false;
	testid = 0;
	alert("test mode: inactive");
}

function switchPlayer() {
	if(testid === fbIdOded) {
		testid = fbIdStav;
	}
	else {
		testid == fbIdOded;
	}
	alert("switched player to " + testid);
}





$(document).ready(function() {
    window.fbAsyncInit = function() {
        FB.init({
            appId: '434847823321597',
            xfbml: true,
            version: 'v2.0'
        });
    };
    (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    var shortName = 'db';
    var version = '1.0';
    var displayName = 'NameTheFriendDB';
    var maxSize = 65536;
    database = openDatabase(shortName, version, displayName, maxSize);
    database.transaction(
            function(transaction) {
                transaction.executeSql("CREATE TABLE IF NOT EXISTS geoLocations (" +
                        "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT," +
                        "fbid INTEGER NOT NULL, name TEXT NOT NULL, latitude INTEGER ,longtitude INTEGER);");
                console.log("db created");
            }, nullDataHandler, showError);

		
});

function savePlayerLocationToMySqLite(fbid, name, latitude, longtitude, callback) {
	
	
	database.transaction(
			function(transaction) {
				transaction.executeSql(("INSERT INTO " + geoLocationsSqliteTable +  " (fbid,name,latitude,longtitude) VALUES (?,?,?,?);"),
						[fbid, name, latitude, longtitude],
						function(transaction, results) {
							callback(results.insertId);
						}
				);
				console.log("db insert success: " + fbid + " " + name);
			}
	, nullDataHandler, showError);
};

function deleteAllPreviousGeoLocationsFromSqLite(fbid) {
	database.transaction(
			function(transaction) {
				transaction.executeSql(("DELETE FROM " + geoLocationsSqliteTable + " WHERE fbid = ?"),
						[Number(fbid)],
						function() {
							console.log("db deleted user " + fbid);
						}
				);
			}
	);
};
	
function getPlayerLastGeoLocation(fbid, callback) {
	
	 database.transaction( function(tx) {
	   tx.executeSql("SELECT * FROM " + geoLocationsSqliteTable + " WHERE fbid = ? LIMIT 1", 
					 [Number(fbid)],
					 function(tx, lastGeoLocation)
					 {
						callback(lastGeoLocation.rows.item(0));
					 },
					 function(tx, error)
					 {
						geoLocationHolder.innerHTML = "Geolocation is not supported by this browser.";					 
						alert("could not find last geoLocation");
						console.log(tx);
						console.log(error);
					 }
	   );
	});
}


/**
 * Moves the user to the Matchups zone.
 * Checks for changes in the game every 10sec.
 */
function showMatchups() {
    window.location = "#matchups";
    buildPlayerBar();
    buildMatchupsTable();
}

function showHallOfFame() {
    var table = document.getElementById("hallOfFameBar");
    table.innerHTML = "";
    $.getJSON('/hallOfFame', function(hallOfFamePlayers) {
        window.location = "#hallOfFame";
        $("#hallOfFameBar").append("<table width=\"100%\"><th align=\"center\">" +
                "<td>Player</td><td>Score</td></th>");
        hallOfFamePlayers.forEach(function(hallOfFamePlayer) {
            buildSingleLineOfHallOfFame(hallOfFamePlayer);
        });
    });
}

function buildSingleLineOfHallOfFame(hallOfFamePlayer) {
    var linkToPicure = getPictureURLFromFacebookId(hallOfFamePlayer["playerId"]);
    $("#hallOfFameBar").append("<tr align=\"center\">" +
            "<td><img src=\"" + linkToPicure + "\" />&nbsp" + "<br>" + hallOfFamePlayer["name"] + "<br> " + "</td>" +
            "<td>" + hallOfFamePlayer["score"] + "</td>" +
            "</tr>");

}

function getPictureURLFromFacebookId(faceBookId) {
    return "https:\/\/graph.facebook.com\/" + faceBookId + "\/picture\/";
}

/**
 * Builds The player Bar that is showen on the top of the page.
 * Display the user picture, score and Level.
 * @param {type} userData
 * @returns {undefined}
 */
function buildPlayerBar() {
    getPlayerData(currentPlayerId, function(playerData) {
        var linkToPicure = getPictureURLFromFacebookId(playerData.playerId);
        var barDiv = document.getElementById("playerBar");
        barDiv.innerHTML = "<table width=\"100%\"><tr>" +
                "<td><img src=\"" + linkToPicure + "\"></td>" +
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
    getAllPlayerMatchups(currentPlayerId, function(matchups) {
        var table = document.getElementById("matchups_tableNew");
        table.innerHTML = "";
        matchups.forEach(function(matchup) {
            getMatchupData(matchup.matchupId, function(result) {
                buildSingleLineOfMatchupsTable(result);
            });
        });
    });
}


function buildSingleLineOfMatchupsTable(result) {
    matchup = result.matchup;
    if (result.player1.playerId == currentPlayerId) {
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

    if (matchup.matchupStatus == matchupStatusOfNewGame) {
        buttonText = "New Game";
        buttonClass = "newGame";
        buttonProperty = "onClick=\"createNewGame(" + matchup.matchupId + "," + rivalPlayer.playerId + ")\"";
    }
    else if (matchup.matchupStatus == currentPlayerId) {
        buttonText = "Your Turn";
        buttonClass = "yourTurn";
        buttonProperty = "onClick=\"playTurn(" + matchup.matchupId + ")\"";
    }
    else if (matchup.matchupStatus == rivalPlayer.playerId) {
        buttonText = "Wait";
        buttonClass = "waitForRival";
        buttonProperty = "disabled";
    }
    else {
        buttonText = "Error: " + matchup.matchupStatus;
    }

    $("#matchups_tableNew").append("<tr align=\"center\">" +
            "<td><button " + buttonProperty + " class=\"" + buttonClass + "\">" + buttonText + "</button></td>" +
            "<td>" + currentPlayer.name + "<br/>" + scoreOfCurrentPlayerInMatchup + "</td>" +
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
function showFriendsZone() {

    var htmlCode = "";
    window.location = "#friends";
    document.getElementById("friends_table").innerHTML = "";

    getRegisteredPlayersThatIDidntPlayWith(currentPlayerId, function(playersToPlayWith) {
        buildFriendsTable(playersToPlayWith);
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
    play_button.setAttribute("onClick", buildFriendsTable(matchup));
    invite_button.onClick = buildFriendsTable(matchup);
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
function buildFriendsTable(playersNotInMatchups) {

    document.getElementById("friends_bar").style.display = "block";
    document.getElementById("friends_table").innerHTML = "";
    var table = document.getElementById("friends_table");
    var numOfMatchups = playersNotInMatchups.length;
    var index;
    for (index = 0; index < numOfMatchups; ++index) {

        var text = "";
        var buttonProperty = "";
        text = "Play";
        buttonProperty = "onClick=\"startGameWithNewPlayer(" + playersNotInMatchups[index].playerId + ")\"";

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
function handleImageSelected() {

    var filesSelected = document.getElementById("inputFileToLoad").files;
    if (filesSelected.length > 0)
    {
        var fileToLoad = filesSelected[0];

        var fileReader = new FileReader();

        fileReader.onload = function(fileLoadedEvent) {
            gameInBuild.imageSelectedAsBase64 = fileLoadedEvent.target.result; // <--- data: base64 
            moveToStep2();
        };

        fileReader.readAsDataURL(fileToLoad);
    }
}

function moveToStep2() {
    document.getElementById("imageToBlur").setAttribute("src", gameInBuild.imageSelectedAsBase64);
    document.getElementById("imageToBlur").setAttribute("src", gameInBuild.imageSelectedAsBase64);
    
	window.location = "#step2";
	myBlur();
}

function moveToStep3() {
	gameInBuild.imageBlurredAsBase64 = document.getElementById("canvasForBlurredImage").toDataURL('image/jpeg');
    window.location = "#step3";
}

function moveToStep4() {
	
	gameInBuild.options = [
		$('#options fieldset input#correctAnswer').val(),
		$('#options fieldset input#firstOption').val(),
		$('#options fieldset input#secondOption').val(),
		$('#options fieldset input#thirdOption').val()
	];
	gameInBuild.correctOptionIndex = 0;
	
    window.location = "#step4";
}


function moveToStep5() {
    addGameToDb(gameInBuild);
    
	window.location = "#step5";
}


function addCurrentGeoLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
                function(geoLocation) {
					deleteAllPreviousGeoLocationsFromSqLite(currentPlayerId);
					savePlayerLocationToMySqLite(currentPlayerId, "", geoLocation.coords.latitude, geoLocation.coords.longitude, function () { } );	
                    handleAfterGettingGeoLocation(geoLocation.coords.latitude, geoLocation.coords.longitude);
                }
        , showError);
    } else {
    }
}


function getUrlShowingGeoLocation(latitude, longitude){
	return "http://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," +  longitude + "&zoom=14&size=400x300&sensor=false";
}


function loadPreviousGeoLocation() {
	getPlayerLastGeoLocation(currentPlayerId, function(lastGeoLocation) {
		handleAfterGettingGeoLocation(lastGeoLocation.latitude, lastGeoLocation.longitude);
	});
}

/* shows the geoLocation on the map and updates the buttons 
    this function is used for both the geo location object loaded from sqlite and the browser
	geoLocation object */
function handleAfterGettingGeoLocation (latitude, longitude) {
    
	gameInBuild.geoLocation = {
		"latitude" : latitude,
		"longitude": longitude
	};
	
	document.getElementById("geoLocationHolder").innerHTML = "The following position will be added as hint:";
    document.getElementById("mapholder").innerHTML = "<img src='" + getUrlShowingGeoLocation(latitude, longitude) + "'>";	
	$('#geoLocationHolder').hide();
	$('#buttonAddGeoLocation').hide();
	$('#buttonLoadPreviousGeoLocation').hide();
	
}






function showError(error) {
    var geoLocationHolder = document.getElementById("geoLocationHolder");
    switch (error.code) {
        case error.PERMISSION_DENIED:
            geoLocationHolder.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            geoLocationHolder.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            geoLocationHolder.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            geoLocationHolder.innerHTML = "An unknown error occurred."
            break;
    }
}





function playTurn(matchupId) {

    getGame(matchupId, function(game) {

        $("#blurredImage").attr("src", game.imageBlurredAsBase64);
        $("#option1").attr("value", game.options[0]);
        $("#option2").attr("value", game.options[1]);
        $("#option3").attr("value", game.options[2]);
        $("#option4").attr("value", game.options[3]);
        $("#matchupId").attr("value", game.matchupId);
		
		if(game.geoLocation) {
			document.getElementById("showHint").setAttribute("onclick", "showGeoLocationAsHint(" + game.geoLocation.latitude + "," + game.geoLocation.longtitude + ")");
		}
		else {
			document.getElementById("showHint").setAttribute("onclick", "noHintAvailableMessage()");
		}
		
        window.location = "#yourTurn";
    });
}

function noHintAvailableMessage() {
	document.getElementById("showHint").innerHTML = "No hint available.";	
}

function showGeoLocationAsHint(latitude, longtitude) {
	document.getElementById("showHint").innerHTML = "<img height=\"450\" width=\"450\" src='" + getUrlShowingGeoLocation(latitude, longtitude)+ "'>";
}

function checkAnswer(playerAnswer) {
    matchupId = $("#matchupId").val();
    $.getJSON('/games/handlePlayerGuess/' + matchupId + '/' + playerAnswer, function(result) {
        if (result.isPlayerAnswerCorrect) {
            message = "You are Right! The answer was: " + result.correctAnswer + "!";
        } else {
            message = "You are Wrong! The answer was: " + result.correctAnswer + "!";
        }
        document.getElementById("messageAfterGuess").innerHTML = message;
        $("#originalImage").attr("src", result.imageSelectedAsBase64);
        window.location = "#EndGame";
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

function createNewGame(matchupId, rivalId) {
	gameInBuild.matchupId = matchupId;
	gameInBuild.challengerId = currentPlayerId;
	gameInBuild.rivalId = rivalId;
	
    window.location = "#step1";
}



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// database access functions
function getPlayerData(playerId, callback) {
    $.getJSON('/players/' + playerId, function(playerData) {
        callback(playerData);
    });
}
function getAllPlayerMatchups(playerId, callback) {
    $.getJSON('/matchups/' + playerId, function(matchups) {
        callback(matchups);
    });
}

function addGameToDb(newGame) {
    $.ajax({
        type: 'POST',
        data: newGame,
        url: '/games',
        dataType: 'JSON'
    }).done(function(response) {
        alert(response.msg);
    });
}

function getGame(matchupId, callback) {
    $.getJSON('/games/' + matchupId, function(gameData) {
        callback(gameData);
    });
}

function getMatchup(matchupId, callback) {
    // first we get the matchup and find the current game id and get it
    $.getJSON('/matchups/' + matchupId, function(matchup) {
        callback(matchup);
    });
}


function getMatchupData(matchupId, callback) {
    // first we get the matchup and find the current game id and get it
    $.getJSON('/matchupData/' + matchupId, function(matchup) {
        callback(matchup);
    });
}

function updateMatchupStatus(matchupId, matchupStatusToUpdateTo) {
    $.ajax({
        type: 'PUT',
        url: '/matchups/updateStatus/' + matchupId + '/' + matchupStatusOfNewGame,
    }).done(function(response) {
        console.log(response.msg);
    });
}

function createNewMatchup(currentPlayerId, rivalId, callback) {
    $.getJSON('/matchups/' + currentPlayerId + "/" + rivalId, function(newMatchupId) {
        callback(newMatchupId);
    });
}

function getRegisteredPlayersThatIDidntPlayWith(currentPlayerId, callback) {
    $.getJSON('/playersRegisteredThatIDidntPlayWith/' + currentPlayerId, function(playersToPlayWith) {
        callback(playersToPlayWith);
    });
}

function getLoginStatus() {
    if (!test) {
        console.log("Attempting to connect via facebook login");
        try {
            FB.getLoginStatus(function(response) {
                if (response.status == 'connected') {
                    fbId = response.authResponse.userID;
                    FB.api('/me', function(response) {
                        login(response.id, response.first_name);
                    });

                } else {
                    signIn();
                }
            }
            , {scope: 'email, public_profile, user_about_me, user_birthday, user_friends'}
            );
        }
        catch (err) {
            console.trace("Couldn't use facebook login, calling loginFromWeb and loading hardcoded value");
        }
    } else {
        login(testid, "stav");
    }
}

function login(fbId, name) {
    currentPlayerId = fbId;
    //saveNewPlayer(fbId, name);
    showMatchups();
}

function signIn() {
    try {
        FB.login(
                function(response) {
                    if (response.authResponse) {
                        FB.api('/me', function(response) {
                            signUp(response.first_name, response.last_name, response.id);
                        });
                    } else {
                        //alert('not logged in');
                    }
                },
                {scope: 'email, public_profile, user_about_me, user_birthday, user_friends'}
        );
    }
    catch (e) {
        // TODO: log error
    }
}

function signUp(first_name, last_name, fbID) {
    var newPlayer = {
        "playerId": fbID,
        "name": first_name,
        "lastName": last_name
    };

    $.ajax({
        type: 'POST',
        data: newPlayer,
        url: '/players',
        dataType: 'JSON'
    }).done(function(response) {
        console.log(response.msg);
    });

    login(fbID, first_name);
}

function logout() {
    FB.logout(function(response) {
        currentPlayerId = 0;
        window.location = "#main";
    });
}


$(document).on("pagebeforeshow", "#matchups", function() {
    if (currentPlayerId == 0) {
        window.location = "#main";
    }
});


$(document).on("pagebeforeshow", "#step1", function() {
    if (currentPlayerId == 0) {
        window.location = "#main";
    }
});

$(document).on("pagebeforeshow", "#step2", function() {
    if (currentPlayerId == 0) {
        window.location = "#main";
    }
});

$(document).on("pagebeforeshow", "#step3", function() {
    if (currentPlayerId == 0) {
        window.location = "#main";
    }
});

$(document).on("pagebeforeshow", "#step4", function() {
    if (currentPlayerId == 0) {
        window.location = "#main";
    }
});


$(document).on("pagebeforeshow", "#friends", function() {
    if (currentPlayerId == 0) {
        window.location = "#main";
    }
});

$(document).on("pagebeforeshow", "#step5", function() {
    if (currentPlayerId == 0) {
        window.location = "#main";
    }
});

$(document).on("pagebeforeshow", "#yourTurn", function() {
    if (currentPlayerId == 0) {
        window.location = "#main";
    }
});

$(document).on("pagebeforeshow", "#EndGame", function() {
    if (currentPlayerId == 0) {
        window.location = "#main";
    }
});


$(document).on("pagebeforeshow", "#hallOfFame", function() {
    if (currentPlayerId == 0) {
        window.location = "#main";
    }
});


function createPlayersTable() {

}


function saveNewPlayer(fbid, name) {
    savePlayer(
            fbid, name,
            function() {
                alert("name: " + name);
            }
    );
}


function showError(transaction, error)
{
    console.log("error occured: this=" + this);//error.message+" error.code:"+error.code);
    return true;
}

function nullDataHandler(transaction, results)
{
    console.log("nullDataHandler=" + this);
}

