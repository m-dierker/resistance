function Resistance() {
    // Controller Initialization
    this.display = new Display($('#container'));
    this._communicator = new Communicator(this);
    this.windows = new Array();
    this.playerNum = -1;
    this.sharedState = {};

    $('#open-another-client').click(function() {
        this.openAnotherClient();
    }.bind(this));

    // Round Initialization
    this._startRound = new StartRound(this);
    this.loadRound(this._startRound);


    // Game setup
    this.addSelfAsPlayer();

    // Re-update the game
    this.update();
}

Resistance.prototype.loadRound = function(round) {
    this._round = round;
    round.startRound();
    this.update();
}

Resistance.prototype.update = function(round) {
    this._round.update();
}

Resistance.prototype.setLoading = function(loading) {
    if (loading) {
        $('#loading-div').show();
    } else {
        $('#loading-div').fadeOut();
    }
}

Resistance.prototype.getNumberOfPlayers = function() {
    return this.players.length;
}

Resistance.prototype.addPlayer = function(player) {
    this.players.push(player);
    this.update();
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
        this.msg({'player' + newPlayerNum : JSON.stringify(player)});
    }.bind(this), 5000);
}

Resistance.prototype.getNewPlayerNum() = function() {
    var a = 1;
    var found = false;
    while (!found && a <= 1000) {
        if (("player" + a) in this.sharedState) {
            found = true;
        } else {
            a++;
        }
    }
    return a;
}

/**
 * Used in dev tools, opens another window
 */
Resistance.prototype.openAnotherClient = function() {
    this.windows.push(
        window.open(location.protocol + '//' + document.domain)
    );
}

/**
 * Actually modifies the shared state
 */
Resistance.prototype.changeSharedState = function(updates) {
    for (var index in updates) {
        this.sharedState[index] = updates[index];
    }
    this.sharedStateChanged(updates);
}

Resistance.prototype.sharedStateChanged = function(updates) {
    for (var index in updates) {
        if (index.indexOf('player') == 0) {
            this.update();
        }
    }
}

Resistance.prototype.msg = function(updates) {
    this._communicator.sendMessage('uss|' + JSON.stringify(updates));
};

/**
 * Starts up the app
 */
window.onload = function() {
    var resistance = new Resistance();
}

// ========= Global Functions =========

function changeTextWithSlide(container, text) {
    $(container).slideUp();
    setTimeout(function() {
        $(container).html(text).slideDown();
    }, 400);
}

function changeTextWithFade(container, text) {
    $(container).fadeOut();
    setTimeout(function() {
        $(container).html(text).fadeIn();
    }, 400);
}

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
