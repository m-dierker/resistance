function StartRound(controller) {
    this._controller = controller;
}

StartRound.prototype.setRoundTitle = function() {
    this._controller.display.setRoundTitle('Welcome to Resistance!');
}

StartRound.prototype.setRoundInstructions = function() {
    this._controller.display.setRoundInstructions(
        'Currently waiting for more players'
    );
}

StartRound.prototype.setContentText = function() {
    this._controller.display.setContentText(
        'Players: 1/1'
    );
}

StartRound.prototype.startRound = function() {
    this._controller.setLoading(true);
    setTimeout(function() {
        this._controller.setLoading(false);
        this.setRoundTitle();
        this.setRoundInstructions();
        this.setContentText();
    }.bind(this), 1000);
}
