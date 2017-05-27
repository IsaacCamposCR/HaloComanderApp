(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("matchStatisticsComponent", {
        templateUrl: "/components/match-statistics-component/match.statistics.component.html",
        controllerAs: "model",
        controller: ["$resource", "gameObjectsService", "gameLeadersService", matchStatisticsController],
        bindings: {
            selected: "<"
        }
    });

    function matchStatisticsController($resource, gameObjectsService, gameLeadersService) {
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
                    model.matchResult = {};
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
                        units1.push({
                            TotalBuilt: (unitStats1[e])["TotalBuilt"],
                            TotalLost: (unitStats1[e])["TotalLost"],
                            TotalDestroyed: (unitStats1[e])["TotalDestroyed"],
                            mediaUrl: (gameObject) ? gameObject.mediaUrl : "",
                            name: (gameObject) ? gameObject.name : "unknown"
                        });
                    });

                    Object.keys(unitStats2).map((e) => {
                        var gameObject = gameObjectsService.find(e);
                        units2.push({
                            TotalBuilt: (unitStats2[e])["TotalBuilt"],
                            TotalLost: (unitStats2[e])["TotalLost"],
                            TotalDestroyed: (unitStats2[e])["TotalDestroyed"],
                            mediaUrl: (gameObject) ? gameObject.mediaUrl : "",
                            name: (gameObject) ? gameObject.name : "unknown"
                        });
                    });

                    model.matchResult.gameMode = gameMode;
                    model.matchResult.duration = duration;
                    model.matchResult.player1 = player1;
                    model.matchResult.leader1 = gameLeadersService.find(leader1);
                    model.matchResult.outcome1 = outcome1;
                    model.matchResult.units1 = units1;
                    model.matchResult.player2 = player2;
                    model.matchResult.leader2 = gameLeadersService.find(leader2);
                    model.matchResult.outcome2 = outcome2;
                    model.matchResult.units2 = units2;
                });
        };
    }
}());