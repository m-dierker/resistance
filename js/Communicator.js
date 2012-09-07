function Communicator(controller) {
    this._controller = controller;
    window.addEventListener(
        'message',
        function(e) {this.handleIncomingMessage(e)}.bind(this),
        true
    );
}

/**
 * Handles incoming commands for the game, and actually executes it
 * To add a new command, you'll add it to the switch statement here
 * @param  {string} cmd the command given
 * @param  {string} msg the other stuff (probably JSON) included after the |
 */
Communicator.prototype.handleCommand = function(cmd, msg, src) {
    console.log("Command Received: '" + cmd + "' from " + (src == window ? 'me' : 'another window'));
    console.log("Message Received: '" + msg + "'");

    switch (cmd) {
        // Update element(s) in the shared state
        case 'uss':
            var update = JSON.parse(msg);
            this._controller.changeSharedState(update);
            break;
        // Initializes the shared state, and completes setup
        case 'iss':
            var update = JSON.parse(msg);
            this._controller.changeSharedState(update);
            this._controller.setup();
            break;
        // Sends a message up the chain (if necessary)
        case 'msg':
            this.sendMessage(msg);
            break;
        // Opens another client
        case 'oc':
            this._controller.openAnotherClient();
            break;
        // Gets the shared state and sends to a client
        case 'gss':
            this._controller.sendSharedStateToClient(src);
            break;
    }
}

/**
 * Handles incoming messages, and sends them off to this.handleCommand()
 * @param  {event} e The incoming message event
 */
Communicator.prototype.handleIncomingMessage = function(e) {
    if (e.origin === 'http://' + document.domain) {
        var separator_index;
        if ((separator_index = e.data.indexOf("|")) !== -1) {
            var cmd = e.data.substring(0, separator_index);
            var msg = (e.data.length <= separator_index + 1 ? '' :
                e.data.substring(separator_index+1));
            this.handleCommand(cmd, msg, e.source);
        } else {
            console.log("Invalid message format received from self: " + e.data);
        }
    } else {
        console.log("Invalid Message Received from " + e.origin);
        console.log('http://' + document.domain);
    }
}

/**
 * Sends the message to other clients.
 * G+ will have its own functions for this
 *
 * @param  {object} msg The objects to update
 */
Communicator.prototype.sendMessage = function(msg) {
    if (this._controller.isChild()) {
        sendMessageToWindow(this._controller.parentWindow, 'msg|' + msg);
    } else {
        for (var a = 0; a < this._controller.windows.length; a++) {
            sendMessageToWindow(this._controller.windows[a], msg);
       }
    }
}

/**
 * Convience function to send a message to a client
 * @param  {window} client The client
 * @param  {string} msg    the message
 */
function sendMessageToWindow(client, msg) {
    return client.postMessage(msg, location.protocol + '//' + document.domain);
}

function sendMessageToParent(msg) {
    return sendMessageToWindow(window.opener, msg);
}
