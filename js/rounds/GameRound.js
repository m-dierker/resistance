/**
 * The actual round that controls the game
 * @param {Resistance} controller The controller for the game
 */
function GameRound(controller) {
    this._controller = controller;
}

/**
 * Called automatically to setup the round
 */
GameRound.prototype.startRound = function() {
    console.log("Starting the round");
    this.setRoundTitle();
    $('#game-round').fadeIn();

    console.log("Checking the player num of " + this._controller.playerNum);
    if (this._controller.playerNum == 1) {
        this.gameSetup();
    }


    $('#game-round-mission-noton, #game-round-mission-on').sortable({
        connectWith: ".missionList"
    }).disableSelection();
}

GameRound.prototype.endRound = function() {
    $('#game-round').fadeOut();
}


/**
 * Sets up the game (assigns spies and resistance and such)
 * This is done by the first player's client, because even though the game is
 * a distrubuted shared state, it's far simpler to have just one client do it
 * than anything else
 */
GameRound.prototype.gameSetup = function() {
    console.log("Game Setup");
    var gameInfo = this._controller.getGameInfo();
    var spies = gameInfo['spies'];
    var resistance = gameInfo['resistance'];

    // TODO(mdierker): Make Tingley a spy here. Also make sure David and Mike aren't on the same team.

    var msg = {};

    for (var a = 1; a <= this._controller.getNumberOfPlayers(); a++) {
        var rand_team = (Math.random() >= resistance/this._controller.getNumberOfPlayers() ? TEAM_SPY : TEAM_RESISTANCE);

        var team;
        switch (rand_team) {
            case TEAM_SPY:
                if (spies > 0) {
                    spies--;
                    team = TEAM_SPY;
                } else {
                    resistance--;
                    team = TEAM_RESISTANCE;
                }
                break;
            case TEAM_RESISTANCE:
                if (resistance > 0) {
                    resistance--;
                    team = TEAM_RESISTANCE;
                } else {
                    spies--;
                    team = TEAM_SPY;
                }
                break;
        }

        var player = JSON.parse(this._controller.sharedState()['player' + a]);
        player['team'] = team;

        msg['player' + a] = player;
    }

    console.log("message before setting leader", msg);

    // Set the leader to a random player
    var leader = Math.floor(Math.random() * this._controller.getNumberOfPlayers()) + 1;
    console.log("Making " + leader + " the leader");
    msg['player' + leader].leader = 1;

    console.log("message after setting leader", msg);

    this._controller.msg(msg);
}

/**
 * Sets the title for the round
 */
GameRound.prototype.setRoundTitle = function() {
    var gameInfo = this._controller.getGameInfo();
    this._controller.display.setRoundTitle('<span class="resistance">Resistance (' + gameInfo['resistance'] + ')</span> - <span class="spy">Spies (' + gameInfo['spies'] + ')</span>');
}

/**
 * Sets the round instructions for the round
 */
GameRound.prototype.setRoundInstructions = function() {
    var leader = this.getLeader();
    if (leader != null) {
        this._controller.display.setRoundInstructions('<b>Leader: </b>' + this.getLeader().name);
    } else {
        this._controller.display.setRoundInstructions('Loading Leader... <img src="img/ajax-loader.gif">');
    }
}

/**
 * Returns the leader object
 */
GameRound.prototype.getLeader = function() {

    for (var a = 1; a <= this._controller.getNumberOfPlayers(); a++) {
        var player = JSON.parse(this._controller.sharedState()['player'+a]);
        if (player.leader == 1) {
            return player;
        }
    }
    return null;
}

/**
 * Called automatically when something has changed that might trigger a round re-render. This is called as sparingly as possible, but at the same time, called enough that the round can effectively update any changes.
 */
GameRound.prototype.update = function() {
    this.render();
}

/**
 * Renders the round
 */
GameRound.prototype.render = function() {
    this.setRoundInstructions();
    this.setContentText();
}

GameRound.prototype.setContentText = function() {
    var player = JSON.parse(this._controller.sharedState()['player' + this._controller.playerNum]);

    switch (player.team) {
        case TEAM_SPY:
            $('#game-round-identity-spy').show();
            break;
        case TEAM_RESISTANCE:
            $('#game-round-identity-resistance').show();
            break;
    }
}
