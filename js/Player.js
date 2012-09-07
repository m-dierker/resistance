function Player(name, id) {

    // General
    this.name = name;
    this.id = id;
    this.team = TEAM_NOT_SET;
    this.leader = 0;

    // Round Votes
    this.round1GoVote = -1;
    this.round2GoVote = -1;
    this.round3GoVote = -1;
    this.round4GoVote = -1;
    this.round5GoVote = -1;

    // Mission Votes
    this.round1MissionVote = -1;
    this.round2MissionVote = -1;
    this.round3MissionVote = -1;
    this.round4MissionVote = -1;
    this.round5MissionVote = -1;

    // Ready to start
    this.readyToStartGame = 0;
}

Player.isSpy = function(player) {
    return player.team == TEAM_SPY;
}

Player.isResistance = function(player) {
    return player.team == TEAM_RESISTANCE;
}
