(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("matchStatisticsComponent", {
        templateUrl: "/components/match-statistics-component/match.statistics.component.html",
        controllerAs: "model",
        controller: ["$resource", "gameObjectsService", "gameLeadersService", "playerSeasonService", matchStatisticsController],
        bindings: {
            selected: "<",
            disableSelecting: "<"
        }
    });

    function matchStatisticsController($resource, gameObjectsService, gameLeadersService, playerSeasonService) {
        var model = this;

        var resourceMatchResult = $resource("https://www.haloapi.com/stats/hw2/matches/:matchId",
            {
                matchId: "@matchId"
            },
            {
                query: {
                    method: "GET",
                    headers: { "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                    isArray: false
                }
            });

        model.$onInit = function () {
            if (model.selected) {
                getMatchResults();
            }
        };

        model.$onChanges = function (changes) {
            if (changes.selected && model.selected) {
                getMatchResults();
            }
        };

        var getMatchResults = function () {

            model.matchResult = null;

            resourceMatchResult.query({ matchId: model.selected.matchId })
                .$promise.then(function (objects) {
                    //console.log("Req API");
                    model.matchResult = {};
                    model.playerSeasons = {};
                    var gameMode = objects["GameMode"];
                    var duration = objects["MatchDuration"];
                    var player1 = (((objects["Players"])["1"])["HumanPlayerId"])["Gamertag"];
                    var outcome1 = ((objects["Players"])["1"])["PlayerMatchOutcome"];
                    var leader1 = ((objects["Players"])["1"])["LeaderId"];
                    var unitStats1 = ((objects["Players"])["1"])["UnitStats"];
                    var player2 = (((objects["Players"])["2"])["HumanPlayerId"])["Gamertag"];
                    var outcome2 = ((objects["Players"])["2"])["PlayerMatchOutcome"];
                    var leader2 = ((objects["Players"])["2"])["LeaderId"];
                    var unitStats2 = ((objects["Players"])["2"])["UnitStats"];
                    var units1 = [];
                    var units2 = [];

                    Object.keys(unitStats1).map((e) => {
                        var gameObject = gameObjectsService.find(e);
                        if (gameObject != null) {
                            units1.push({
                                TotalBuilt: (unitStats1[e])["TotalBuilt"],
                                TotalLost: (unitStats1[e])["TotalLost"],
                                TotalDestroyed: (unitStats1[e])["TotalDestroyed"],
                                mediaUrl: gameObject.mediaUrl,
                                name: gameObject.name
                            });
                        }
                    });

                    Object.keys(unitStats2).map((e) => {
                        var gameObject = gameObjectsService.find(e);
                        if (gameObject != null) {
                            units2.push({
                                TotalBuilt: (unitStats2[e])["TotalBuilt"],
                                TotalLost: (unitStats2[e])["TotalLost"],
                                TotalDestroyed: (unitStats2[e])["TotalDestroyed"],
                                mediaUrl: gameObject.mediaUrl,
                                name: gameObject.name
                            });
                        }
                    });

                    model.matchResult.gameMode = gameMode;
                    var isoDuration = parseISO(duration);
                    model.matchResult.duration = ((isoDuration.hours < 10) ? "0" + isoDuration.hours : isoDuration.hours) + ":" + ((isoDuration.minutes < 10) ? "0" + isoDuration.minutes : isoDuration.minutes) + ":" + ((isoDuration.seconds < 10) ? "0" + Math.trunc(isoDuration.seconds) : Math.trunc(isoDuration.seconds));
                    model.matchResult.player1 = player1;
                    model.selected.player1 = player1;
                    model.selected.leader1 = gameLeadersService.find(leader1);
                    model.matchResult.outcome1 = outcome1;
                    model.matchResult.units1 = units1;
                    model.matchResult.player2 = player2;
                    model.selected.player2 = player2;
                    model.selected.leader2 = gameLeadersService.find(leader2);
                    model.matchResult.outcome2 = outcome2;
                    model.matchResult.units2 = units2;
                    getPlayerSeasons();
                });
        };

        var getPlayerSeasons = function () {
            playerSeasonService.find(model.selected.player1).$promise
                .then(function (playerSeasonData) {
                    model.matchResult.season1 = playerSeasonService.create(playerSeasonData);
                });
            playerSeasonService.find(model.selected.player2).$promise
                .then(function (playerSeasonData) {
                    model.matchResult.season2 = playerSeasonService.create(playerSeasonData);
                });

        };

        var numbers = '\\d+(?:[\\.,]\\d{0,3})?';
        var weekPattern = '(' + numbers + 'W)';
        var datePattern = '(' + numbers + 'Y)?(' + numbers + 'M)?(' + numbers + 'D)?';
        var timePattern = 'T(' + numbers + 'H)?(' + numbers + 'M)?(' + numbers + 'S)?';
        var iso8601 = 'P(?:' + weekPattern + '|' + datePattern + '(?:' + timePattern + ')?)';
        var objMap = ['weeks', 'years', 'months', 'days', 'hours', 'minutes', 'seconds'];
        var pattern = new RegExp(iso8601);
        var parseISO = function (durationString) {
            // slice away first entry in match-array
            return durationString.match(pattern).slice(1).reduce(function (prev, next, idx) {
                prev[objMap[idx]] = parseFloat(next) || 0;
                return prev;
            }, {});
        };
    }
}());