/**
 * The starting round for resistance (while gathering players)
 * @param {Resistance} controller The controller for the game
 */
function StartRound(controller) {
    this._controller = controller;
    this._hasSetupStartRound = false;
}

/**
 * Called automatically to setup the round
 */
StartRound.prototype.startRound = function() {
    this.setRoundTitle();
    this.setRoundInstructions();
}

/**
 * Sets the title for the round
 */
StartRound.prototype.setRoundTitle = function() {
    this._controller.display.setRoundTitle('Welcome to Resistance!');
}

/**
 * Sets the round instructions for the round
 */
StartRound.prototype.setRoundInstructions = function() {
    this._controller.display.setRoundInstructions(
        'Resistance is a fun game of intrigue. Players are assigned to two teams, either Resistance (the good guys) or Spies (the bad guys). Resistance members always tell the truth, and spies should lie to confuse the resistance.'
    );
}

/**
 * Called automatically when something has changed that might trigger a round re-render. This is called as sparingly as possible, but at the same time, called enough that the round can effectively update any changes.
 */
StartRound.prototype.update = function() {
    this.render();

    if (this.canStartRound()) {
        setTimeout(this.setupStartRound.bind(this), 450);
    }

    if (this.shouldTransitionRound()) {
        // this._controller.gameRound = new GameRound(this._controller);
        // this._controller.loadRound(this._controller.gameRound);
        console.log("Transitioning Round");
    }
}

/**
 * Renders the round
 */
StartRound.prototype.render = function() {
    this.setContentText();
}

StartRound.prototype.setContentText = function() {

    var output =
        '<div id="start-round">5 minimum players needed... <img src="img/ajax-loader.gif"> <hr> <h4 class="center">Players (' + this._controller.getNumberOfPlayers() + ')</h4> <ul>';

    for (var a = 1; a <= this._controller.getNumberOfPlayers(); a++) {
        var player = JSON.parse(this._controller.sharedState()['player' + a]);
        console.log('Player: ', player);
        output += '<li class="player ' + (player.readyToStartGame == 1 ? 'player-ready' : 'player-notready') + '">#' + a + ': ' + player.name + (this._controller.playerNum == a ? ' (you)' : '') + '</li>';
    }

    if (this.canStartRound()) {
        console.log("Adding the button");
        output += "<div class='start-round-button'><a href='#' id='start-round-ready' class='btn btn-primary'>Start Round</a></div>";
    }

    output += '</div>';

    this._controller.display.setContentText(output);
}

/**
 * Sets up the round after the user can potentially start it.
 * Ex: Sets up the button listener for the "Start Button" round
 */
StartRound.prototype.setupStartRound = function() {
    console.log("Setting up round start");
    if (!this._hasSetupStartRound) {
        this._hasSetupStartRound = true;
        console.log("Adding the listener", this);
        console.log("Button: ", $('#start-round-ready'));
        $('#start-round-ready').click(function() {
            console.log("Button clicked", this);
            this.readyToStart();
            console.log("Done calling readyToStart");
        }.bind(this));
        console.log("Button setup");
    }
    console.log("Done setting up round start");
}

/**
 * Indicates that the user is ready to start
 */
StartRound.prototype.readyToStart = function() {
    console.log("Ready to start");
    var player = JSON.parse(this._controller.sharedState()['player' + this._controller.playerNum]);

    player['readyToStartGame'] = 1;

    var msg = {};
    msg['player' + this._controller.playerNum] = player;
    this._controller.msg(msg);
    console.log("Done being ready to start");
}

/**
 * Returns if the player should be shown a button to transition the round (so if the round could potentially be started)
 * @return {boolean} whether to show the button
 */
StartRound.prototype.canStartRound = function() {
    return this._controller.getNumberOfPlayers() >= 2;
}

/**
 * Returns if the round should be transitioned
 * @return {boolean} whether to transition the round
 */
StartRound.prototype.shouldTransitionRound = function() {
    console.log("Checking if the round should be transitioned");
    for (var a = 1; a <= this._controller.getNumberOfPlayers(); a++) {
        var player = JSON.parse(this._controller.sharedState()['player' + a]);
        if (!player.readyToStartGame) {
            console.log("The round should not be transitioned");
            return false;
        }
    }
    console.log("Should transition the round");
    return true;
}
