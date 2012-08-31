function Resistance() {
    this.display = new Display($('#container'));
    this._startRound = new StartRound(this);
    this.loadRound(this._startRound);
}

Resistance.prototype.loadRound = function(round) {
    round.startRound();
}

Resistance.prototype.setLoading = function(loading) {
    if (loading) {
        $('#loading-div').show();
    } else {
        $('#loading-div').fadeOut();
    }
}

window.onload = function() {
    var resistance = new Resistance();
}

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
