function Resistance() {
    // Controller Initialization
    this.display = new Display($('#container'));
    this.communicator = new Communicator(this);

    // Window List
    if (this.isChild()) {
        this.parentWindow = window.opener;
    } else {
        this.windows = new Array();
        this.windows.push(window);
    }

    // Game setup
    this.playerNum = -1;
    this._sharedState = {
        numPlayers: 0
    };

    // Dev Tools
    $('#dev-tools #open-another-client').click(function() {
        this.openAnotherClient();
    }.bind(this));

    this.updateSharedStateFromParent();
}

/**
 * The rest of the setup after the shared state has been setup
 */
Resistance.prototype.setup = function() {
     // Round Initialization
    this._startRound = new StartRound(this);
    this.loadRound(this._startRound);

    // Game setup
    this.addSelfAsPlayer();

    // Re-update the game
    this.update();

    console.log("Resistance setup complete");
}

/**
 * Returns the shared state (so this can easily be overriden for G+)
 * ***** NOTHING should use this._sharedState directly *******
 * @return {object} the shared state
 */
Resistance.prototype.sharedState = function() {
    return this._sharedState;
}

Resistance.prototype.sendSharedStateToClient = function(client) {
    sendMessageToClient(client, 'iss|' + JSON.stringify(this.sharedState()));
}

Resistance.prototype.loadRound = function(round) {
    this._round = round;
    round.startRound();
    this.update();
}

Resistance.prototype.update = function(round) {
    if (this._round) {
        this._round.update();
    }
}

Resistance.prototype.getNumberOfPlayers = function() {
    return this.sharedState()['numPlayers'];
}

Resistance.prototype.updateSharedStateFromParent = function() {
    if (!this.isChild()) {
        this.setup();
        return false;
    }

    this.communicator.sendMessage('gss|');
}

/**
 * Adds the user of the app to the player list, and broadcasts it to other clients
 */
Resistance.prototype.addSelfAsPlayer = function() {
    var name = new NameGenerator().genName();
    var id = genID();
    var player = new Player(name, id);
    setTimeout(function() {
        var newPlayerNum = this.getNewPlayerNum();
        this.playerNum = newPlayerNum;
        var msg = {};
        msg['player' + newPlayerNum] = JSON.stringify(player);
        this.msg(msg);
    }.bind(this), 2000);
}

/**
 * Returns the next player number (so if there are 5 players, it will return 6)
 * @return {int} The next player number
 */
Resistance.prototype.getNewPlayerNum = function() {
    var num = this.sharedState()['numPlayers'] + 1;
    this.msg({numPlayers : num});
    return num;
}

/**
 * Used in dev tools, opens another window
 */
Resistance.prototype.openAnotherClient = function() {
    if (this.isChild()) {
        this.communicator.sendMessage('oc|');
    } else {
        this.windows.push(
            window.open(location.protocol + '//' + document.domain)
        );
    }

}

Resistance.prototype.isChild = function() {
    return (window.opener ? true : false);
}

/**
 * Actually modifies the shared state
 */
Resistance.prototype.changeSharedState = function(updates) {
    for (var index in updates) {
        this.sharedState()[index] = updates[index];
    }
    this.onSharedStateChange(updates);
}

/**
 * Listener for when the shared state changes
 * @param  {object} updates The object that was updated
 */
Resistance.prototype.onSharedStateChange = function(updates) {
    for (var index in updates) {
        if (index.indexOf('player') == 0) {
            this.update();
        }
    }
}

/**
 * Sends a message to update the shared state with the given changes
 * @param  {object} updates The updates to make
 */
Resistance.prototype.msg = function(updates) {
    this.communicator.sendMessage('uss|' + JSON.stringify(updates));
};


// ========= Starting Functions =========

/**
 * Starts up the app
 */
window.onload = function() {
    // Using window.resistance makes it accessible from the command line!
    window.resistance = new Resistance();
}

// ========= Global Functions =========

/**
 * Generates a unique string ID (it's possible for them to collide, but very
 * unlikely)
 * @return {string} a unique string that's an ID
 */
function genID() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
