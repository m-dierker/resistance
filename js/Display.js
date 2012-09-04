function Display(controller) {
    this._controller = controller;
}

Display.prototype.setRoundTitle = function(title) {
    this.changeTextWithFade('#round-title', title);
}

Display.prototype.setRoundInstructions = function(inst) {
    this.changeTextWithFade('#round-instructions', inst);
}

Display.prototype.setContentText = function(text) {
    this.changeTextWithFade('#round-text', text);
}

Display.prototype.setLoading = function(loading) {
    if (loading) {
        $('#loading-div').show();
    } else {
        $('#loading-div').fadeOut();
    }
}

Display.prototype.changeTextWithSlide = function(container, text) {
    $(container).slideUp();
    setTimeout(function() {
        $(container).html(text).slideDown();
    }, 400);
}

Display.prototype.changeTextWithFade = function(container, text) {
    $(container).fadeOut();
    setTimeout(function() {
        $(container).html(text).fadeIn();
    }, 400);
}
