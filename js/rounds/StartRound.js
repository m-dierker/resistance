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

    var output = '<ul>';


    $('#start-round-player-count').html(this._controller.getNumberOfPlayers());
    for (var a = 1; a <= this._controller.getNumberOfPlayers(); a++) {
        var player = JSON.parse(this._controller.sharedState()['player' + a]);
        output += '<li class="player ' + (player.readyToStartGame == 1 ? 'player-ready' : 'player-notready') + '">#' + a + ': ' + player.name + (this._controller.playerNum == a ? ' (you)' : '') + '</li>';
    }

    output += '</ul>';

    $('#start-round-players').html(output);
}

/**
 * Sets up the round after the user can potentially start it.
 * Ex: Sets up the button listener for the "Start Button" round
 */
StartRound.prototype.setupStartRound = function() {
    if (!this._hasSetupStartRound) {
        this._hasSetupStartRound = true;

        $('#start-round-ready').click(function() {
            this.readyToStart();
        }.bind(this));
    }
}

/**
 * Indicates that the user is ready to start
 */
StartRound.prototype.readyToStart = function() {
    var player = JSON.parse(this._controller.sharedState()['player' + this._controller.playerNum]);

    player['readyToStartGame'] = 1;

    var msg = {};
    msg['player' + this._controller.playerNum] = player;
    this._controller.msg(msg);
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
    for (var a = 1; a <= this._controller.getNumberOfPlayers(); a++) {
        var player = JSON.parse(this._controller.sharedState()['player' + a]);
        if (!player.readyToStartGame) {
            return false;
        }
    }
    return true;
}
