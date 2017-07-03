(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("matchStatisticsComponent", {
        templateUrl: "/components/match-statistics-component/match.statistics.component.html",
        controllerAs: "model",
        controller: ["$resource", "gameObjectsService", "gameLeadersService", "playerSeasonService", matchStatisticsController],
        bindings: {
            selected: "<"
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
            //playerSeasonService.find("ll blaky ll");
            if (model.selected) {
                getMatchResults();
            }

            //playerSeasonService.find("ll Blaky ll");
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
                    console.log("Req API");
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
                    model.matchResult.duration = duration;
                    model.matchResult.player1 = player1;
                    model.selected.player1 = player1;
                    model.matchResult.leader1 = gameLeadersService.find(leader1);
                    model.matchResult.outcome1 = outcome1;
                    model.matchResult.units1 = units1;
                    model.matchResult.player2 = player2;
                    model.selected.player2 = player2;
                    model.matchResult.leader2 = gameLeadersService.find(leader2);
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
    }
}());