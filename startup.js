'use strict';
var app = null;

/**
* Main entry point. This is not meant to be compiled so suppressing missing
* goog.require checks.
*/
var initialize = function() {
	var castReceiverManager;
	window.castReceiverManager = castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
	var appConfig = new cast.receiver.CastReceiverManager.Config();

	appConfig.statusText = 'BlocklyCodingGame';
	// In production, use the default maxInactivity instead of using this.
	appConfig.maxInactivity = 10000;

	// Create the app before starting castReceiverManager to make sure any extra
	// cast namespaces can be set up.
	/** @suppress {missingRequire} */
	var gameConfig = new cast.receiver.games.GameManagerConfig();
	gameConfig.applicationName = 'BlocklyCodingGame';
	gameConfig.maxPlayers = 10;

	/** @suppress {missingRequire} */
	var gameManager = new cast.receiver.games.GameManager(gameConfig);

	/** @suppress {missingRequire} */
	app = new BlocklyCodingGame.Game(gameManager);

	var startGame = function() {
		app.run(function() {
			console.log('Game running.');
			gameManager.updateGameStatusText('Game running.');
		});
	};

	castReceiverManager.onReady = function(event) {
		if (document.readyState === 'complete') {
			startGame();
		} else {
			window.onload = startGame;
		}
	};
	castReceiverManager.start(appConfig);


	var $body = $(document.body);
    $body.on("game-state-changed", function(e, d){
    	var data = gameManager.getGameData();
    	data.__gameState = d.running;
    	console.log("game-state-changed: data", data, d)
    	gameManager.updateGameData(data);
    });

	//testing UI
	var steps = [];
	$(".game-action").on("click", function(){
		var type = $(this).data("type");
		console.log("type", type)
		if(type == "START"){
			var message = new BlocklyCodingGame.Message(BlocklyCodingGame.MessageType[type]);
			$(document.body).trigger("game-action", message);
		}else if(type == "FINISH"){
			steps.push(BlocklyCodingGame.MessageType.FINISH);
			var message = new BlocklyCodingGame.Message(BlocklyCodingGame.MessageType.STEPS);
			message.steps = game.copy(steps);
			steps = [];
			console.log("message", message.steps.join(","))
			$(document.body).trigger("game-action", message);
		}else{
			steps.push(BlocklyCodingGame.MessageType[type]);
			console.log("steps", steps)
		}
	});

	$(".game-action").each(function(){
		var type = $(this).data("type");
		$(this).html($(this).html() + " ("+ BlocklyCodingGame.MessageType[type] +")")
	})
};

if (document.readyState === 'complete') {
	initialize();
} else {
	/** Main entry point. */
	window.onload = initialize;
}
