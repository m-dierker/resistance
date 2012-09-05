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
    sendMessageToWindow(client, 'iss|' + JSON.stringify(this.sharedState()));
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

/*
    The problem right now is centered around the fact that when something is updated, it may not be updated correctly with strings vs. objects, and something isn't transferring correctly even though the commands are going through correctly
 */

    console.log("Shared state before", this.sharedState());
    for (var index in updates) {
        this.sharedState()[index] = updates[index];
    }
    this.onSharedStateChange(updates);
    console.log("Shared state after", this.sharedState());
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
 * Note that if you try to send an object, it will be stringified automatically. Everything read on the other end will be a string, even if you send it as an object (since an object can't be sent)
 * @param  {object} updates The updates to make
 */
Resistance.prototype.msg = function(updates) {
    console.log("Calling msg");
    for (var index in updates) {
        console.log("Checking type of " + index);
        if (typeof updates[index] == 'object') {
            console.log("Changing type of " + index);
            updates[index] = JSON.stringify(updates[index]);
        }
    }
    console.log("Sending the message");
    var u = JSON.stringify(updates);
    //start from here
    // if(!u.indexOf('\"readyToStartGame\":0'))
    this.communicator.sendMessage('uss|' + JSON.stringify(updates));
    console.log("Done sending the message");
};


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
