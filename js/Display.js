function Display(container) {
    this._container = container;
}

Display.prototype.setRoundTitle = function(title) {
    changeTextWithFade('#round-title', title);
}

Display.prototype.setRoundInstructions = function(inst) {
    changeTextWithFade('#round-instructions', inst);
}

Display.prototype.setContentText = function(text) {
    changeTextWithFade('#round-text', text);
}
