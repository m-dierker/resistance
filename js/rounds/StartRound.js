/**
 * The starting round for resistance (while gathering players)
 * @param {Resistance} controller The controller for the game
 */
function StartRound(controller) {
    this._controller = controller;
}

StartRound.prototype.startRound = function() {
    this.setRoundTitle();
    this.setRoundInstructions();
}

StartRound.prototype.setRoundTitle = function() {
    this._controller.display.setRoundTitle('Welcome to Resistance!');
}

StartRound.prototype.setRoundInstructions = function() {
    this._controller.display.setRoundInstructions(
        'Resistance is a fun game of intrigue. Players are assigned to two teams, either Resistance (the good guys) or Spies (the bad guys). Resistance members always tell the truth, and spies should lie to confuse the resistance.'
    );
}

StartRound.prototype.update = function() {
    this.render();
}

StartRound.prototype.render = function() {
    this.setContentText();
}

StartRound.prototype.setContentText = function() {

    var output =
        '5 minimum players needed... <img src="img/ajax-loader.gif"> <hr> <h4 class="center">Players (' + this._controller.getNumberOfPlayers() + ')</h4> <ul>';

    for (var a = 1; a <= this._controller.getNumberOfPlayers(); a++) {
        var player = JSON.parse(this._controller.sharedState()['player' + a]);
        console.log("player: ", player);
        output += '<li>#' + a + ': ' + player.name + (this._controller.playerNum == a ? ' (you)' : '') + '</li>';
    }

    this._controller.display.setContentText(output);
}
