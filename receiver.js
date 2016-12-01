/**
* Blockly Coding Game.
*
* Adds a sprite from a pool of sprites when a sender sends a custom game
* message. Automatically transitions AVAILABLE players to the PLAYING state.
*
* @param {!cast.receiver.games.GameManager} gameManager
* @constructor
* @implements {cast.games.common.receiver.Game}
* @export
*/
var BlocklyCodingGame = window.BlocklyCodingGame || {};
BlocklyCodingGame.Game = function(gameManager) {
    /** @private {!cast.receiver.games.GameManager} */
    this.gM = gameManager;

    /**
    * Debug only. Call debugUi.open() or close() to show and hide an overlay
    * showing game manager and player information while testing and debugging.
    * @public {cast.receiver.games.debug.DebugUI}
    */
    //this.debugUi = new cast.receiver.games.debug.DebugUI(this.gM);

    /** @private {boolean} */
    this.isLoaded_ = false;

    /** @private {boolean} */
    this.isRunning_ = false;

    //this.onAssetsLoaded_.bind(this));

    /** @private {?function()} Callback used with #run. */
    this.loadedCB = null;

    /**
    * Pre-bound custom message callback.
    * @private {function(cast.receiver.games.Event)}
    */
    this.boundGameMessageCB = this.onGameMessage.bind(this);

    /**
    * Pre-bound player connect callback.
    * @private {function(cast.receiver.games.Event)}
    */
    this.boundPlayerAvailableCB = this.onPlayerAvailable.bind(this);

    /**
    * Pre-bound player quit callback.
    * @private {function(cast.receiver.games.Event)}
    */
    this.boundPlayerQuitCB = this.onPlayerQuit.bind(this);
};


/**
* Default scale of sprites.
* {number}
*/
//BlocklyCodingGame.Game.SCALE = 1;


/**
* @param {number} min
* @param {number} max
* @return {number} Returns a random integer between min and max.
*/
BlocklyCodingGame.Game.getRandomInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


/**
* Runs the game. Game should load if not loaded yet.
* @param {function()} loadedCallback This function will be called when the game
*     finishes loading or is already loaded and about to actually run.
* @export
*/
BlocklyCodingGame.Game.prototype.run = function(loadedCallback) {
    // If the game is already running, return immediately.
    if (this.isRunning_) {
        loadedCallback();
        return;
    }

    // Start loading if game not loaded yet.
    this.loadedCB = loadedCallback;

    // Start running.
    this.start();
};


/**
* Stops the game.
* @export
*/
BlocklyCodingGame.Game.prototype.stop = function() {
    if (this.loadedCB || !this.isRunning_) {
        this.loadedCB = null;
        return;
    }

    this.isRunning_ = false;

    this.gM.removeEventListener(cast.receiver.games.EventType.PLAYER_AVAILABLE, this.boundPlayerAvailableCB);
    this.gM.removeEventListener(cast.receiver.games.EventType.GAME_MESSAGE_RECEIVED, this.boundGameMessageCB);
    this.gM.removeEventListener(cast.receiver.games.EventType.PLAYER_QUIT, this.boundPlayerQuitCB);
    this.gM.removeEventListener(cast.receiver.games.EventType.PLAYER_DROPPED, this.boundPlayerQuitCB);
};


/**
* Adds the renderer and run the game. Calls loaded callback passed to #run.
* @private
*/
BlocklyCodingGame.Game.prototype.start = function() {
    // If callback is null, the game was stopped already.
    if (!this.loadedCB)
        return;

    this.isRunning_ = true;
    this.gM.updateGameplayState(cast.receiver.games.GameplayState.RUNNING, null);

    this.loadedCB();
    this.loadedCB = null;

    this.gM.addEventListener(cast.receiver.games.EventType.PLAYER_AVAILABLE, this.boundPlayerAvailableCB);
    this.gM.addEventListener(cast.receiver.games.EventType.GAME_MESSAGE_RECEIVED, this.boundGameMessageCB);
    this.gM.addEventListener(cast.receiver.games.EventType.PLAYER_QUIT, this.boundPlayerQuitCB);
    this.gM.addEventListener(cast.receiver.games.EventType.PLAYER_DROPPED, this.boundPlayerQuitCB);
};


/**
* Called when all assets are loaded.
* @private
*/
BlocklyCodingGame.Game.prototype.onAssetsLoaded_ = function() {
    this.start();
};


/**
* Handles when a player becomes available to the game manager.
* @param {cast.receiver.games.Event} event
* @private
*/
BlocklyCodingGame.Game.prototype.onPlayerAvailable = function(event) {
    if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
        console.log('Error: Event status code: ' + event.statusCode);
        console.log('Reason for error: ' + event.errorDescription);
        return;
    }
    var playerId = event.playerInfo.playerId;
    // Automatically transition available players to playing state.
    this.gM.updatePlayerState(playerId, cast.receiver.games.PlayerState.PLAYING, null);
};


/**
* Handles when a player disconnects from the game manager.
* @param {cast.receiver.games.Event} event
* @private
*/
BlocklyCodingGame.Game.prototype.onPlayerQuit = function(event) {
    if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
        console.log('Error: Event status code: ' + event.statusCode);
        console.log('Reason for error: ' + event.errorDescription);
        return;
    }
    // Tear down the game if there are no more players. Might want to show a nice
    // UI with a countdown instead of tearing down instantly.
    var connectedPlayers = this.gM.getConnectedPlayers();
    if (connectedPlayers.length == 0) {
        console.log('No more players connected. Tearing down game.');
        cast.receiver.CastReceiverManager.getInstance().stop();
    }
};


/**
* Callback for game message sent via game manager.
* @param {cast.receiver.games.Event} event
* @private
*/
BlocklyCodingGame.Game.prototype.onGameMessage = function(event) {
    if (event.statusCode != cast.receiver.games.StatusCode.SUCCESS) {
        console.log('Error: Event status code: ' + event.statusCode);
        console.log('Reason for error: ' + event.errorDescription);
        return;
    }
    var message = /** @type {!BlocklyCodingGame.SpritedemoMessage} */ (event.requestExtraMessageData);
    var MessageType = BlocklyCodingGame.MessageType;

    console.log("onGameMessage", message.type, message)
    $('#message').html(message.type);


    var $body = $(document.body);
    $body.trigger("game-action", message);
    /*
    if (message.type == MessageType.MOVE) {

    }
    */
};

