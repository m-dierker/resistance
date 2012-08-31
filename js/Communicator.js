function Communicator(controller) {
    this._controller = controller;
    window.addEventListener(
        'message',
        function(e) {this.handleMessage(e)}.bind(this),
        true
    );
}

/**
 * Handles messages for the game (where the actual command processing happens)
 * To add a new command, you'll add it to the switch statement here
 * @param  {string} cmd the command given
 * @param  {string} msg the other stuff (probably JSON) included after the |
 */
Communicator.prototype.handleCommand = function(cmd, msg) {
    console.log("Command Received: '" + cmd + "'");
    console.log("Message Received: '" + msg + "'");

    switch (cmd) {
        case 'uss':
            var update = JSON.parse(msg);
            this._controller.changeSharedState(update);
            break;
    }
}

Communicator.prototype.handleMessage = function(e) {
    if (e.origin === 'http://' + document.domain) {
        var separator_index;
        if ((separator_index = e.data.indexOf("|")) !== -1) {
            var cmd = e.data.substring(0, separator_index);
            var msg = (e.data.length <= separator_index + 1 ? '' :
                e.data.substring(separator_index+1));
            this.handleCommand(cmd, msg);
        } else {
            console.log("Invalid message format received from self: "
                + e.data);
        }
    } else {
        console.log("Invalid Message Received from " + e.origin);
        console.log('http://' + document.domain);
    }
}

/**
 * Sends the message to clients
 * @param  {[type]} msg [description]
 * @return {[type]}
 */
Communicator.prototype.sendMessage = function(msg) {
    for (var a = 0; a < this._controller.windows.length; a++) {
        this._controller.windows[a].postMessage(msg, location.protocol + '//' + document.domain);
    }
}
