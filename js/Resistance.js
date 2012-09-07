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
    this.startRound = new StartRound(this);
    this.loadRound(this.startRound);

    // Game setup
    this.addSelfAsPlayer();

    // Re-update the game, after waiting to ensure that this player gets through
    setTimeout(this.update.bind(this), 200);

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
    sendMessageToWindow(client, 'iss|' + JSON.stringify(this.sharedState()));
}

Resistance.prototype.loadRound = function(round) {
    if (this._round) {
        this._round.endRound();
    }

    this._round = round;
    round.startRound();
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
    console.log("Updating the shared state from the parent");
    if (!this.isChild()) {
        this.setup();
        return false;
    }

    sendMessageToParent('gss|');
}

/**
 * Adds the user of the app to the player list, and broadcasts it to other clients
 */
Resistance.prototype.addSelfAsPlayer = function() {
    var player = new Player(new NameGenerator().genName(), genID());
    var newPlayerNum = this.getNewPlayerNum();
    this.playerNum = newPlayerNum;
    var msg = {};
    msg['player' + newPlayerNum] = JSON.stringify(player);
    this.msg(msg);
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
        sendMessageToParent('oc|');
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
 * Actually changes the shared state, and calls onSharedStateChange
 * *** The VALUES included in updates should already be strings
 * @param  {object} updates The updates.
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
        // Update the game if there's been a change to the player
        if (index.indexOf('player') == 0) {
            this.update();
        }
    }
}

/**
 * Sends a message to update the shared state with the given changes
 * Note that if you try to send an object, it will be stringified automatically. Everything read on the other end will be a string, even if you send it as an object (since an object can't be sent)
 * @param  {object} updates The updates to make
 */
Resistance.prototype.msg = function(updates) {
    for (var index in updates) {
        if (typeof updates[index] == 'object') {
            updates[index] = JSON.stringify(updates[index]);
        }
    }
    var u = JSON.stringify(updates);
    this.communicator.sendMessage('uss|' + JSON.stringify(updates));
};

/**
 * Returns the game info for the game, such as how many spies, and how many
 * resistance and how many spies. This will (eventually) also return card info.
 * @return {object} Game info
 */
Resistance.prototype.getGameInfo = function() {
    var size = this.getNumberOfPlayers();
    var info = {};

    switch(size) {
        // The actual game won't start below 5, but I'm debugging with less
        case 2:
            info['spies'] = 1;
            info['resistance'] = 1;
            break;
        case 3:
            info['spies'] = 1;
            info['resistance'] = 2;
            break;
        case 4:
            info['spies'] = 2;
            info['resistance'] = 2;
            break;
        // Start actual cases
        case 5:
            info['spies'] = 2;
            info['resistance'] = 3;
            break;
        case 6:
            info['spies'] = 2;
            info['resistance'] = 4;
            break;
        case 7:
            info['spies'] = 3;
            info['resistance'] = 4;
            break;
        case 8:
            info['spies'] = 3;
            info['resistance'] = 5;
            break;
        case 9:
            info['spies'] = 3;
            info['resistance'] = 6;
            break;
        case 10:
            info['spies'] = 4;
            info['resistance'] = 6;
            break;
    }

    return info;
}

// ========= Starting Functions =========

/**
 * Starts up the app
 */
window.onload = function() {
    // Using window.resistance makes it accessible from the JS console!
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


// Constants
var TEAM_NOT_SET = -1;
var TEAM_RESISTANCE = 0;
var TEAM_SPY = 1;
