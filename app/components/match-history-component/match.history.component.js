(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("matchHistoryComponent", {
        templateUrl: "/components/match-history-component/match.history.component.html",
        controllerAs: "model",
        controller: ["$resource", "$mdSidenav", "$mdMedia", "$mdDialog", "gameLeadersService", matchHistoryController],
        bindings: {
            selected: "="
        }
    });

    function matchHistoryController($resource, $mdSidenav, $mdMedia, $mdDialog, gameLeadersService) {
        var model = this;

        model.page = 1;
        model.searchMatch = "";
        model.start = 0;
        model.count = 10;
        model.playerRecentMatches = [];

        var resourcePlayerMatchHistory = $resource("https://www.haloapi.com/stats/hw2/players/:player/matches",
            {
                player: "@player",
                matchType: "matchmaking",
                count: "@count",
                start: "@start"
            },
            {
                query: {
                    method: "GET",
                    headers: { "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                    isArray: false
                }
            });

        var resourceMaps = $resource("https://www.haloapi.com/metadata/hw2/maps",
            {},
            {
                query: {
                    method: "GET",
                    headers: { "Accept-Language": "en", "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                    isArray: false
                }
            });

        model.$onInit = function () {
            model.page = 1;
        };

        //---------------GAME MAPS----------------------//
        var getMaps = function () {
            model.maps = [];
            if (!localStorage.getItem("gameMaps")) {
                console.log("No stored maps found. Requesting...");
                resourceMaps.query()
                    .$promise.then(function (maps) {
                        console.log("Req API");
                        createGameMaps(maps);
                        if (typeof (Storage) !== "undefined") {
                            // Code for localStorage/sessionStorage.
                            localStorage.setItem("gameMaps", LZString.compressToUTF16(JSON.stringify(model.maps)));
                            console.log("stored");
                        } else {
                            console.log("No storage found...");
                        }
                        getPlayerMatchHistory();
                    });
            }
            else {
                model.maps = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("gameMaps")));
                //console.log("Stored maps found");
                getPlayerMatchHistory();
            }
        };

        // Takes the application relevant data from the Maps API.
        var createGameMaps = function (maps) {
            var contentItems = maps["ContentItems"];

            contentItems.forEach(function (gameMap) {
                var view = gameMap["View"];
                var name = view["Title"];
                var hw2Map = view["HW2Map"];
                var id = hw2Map["ID"];
                var image = hw2Map["Image"];
                var viewImage = image["View"];
                var media = viewImage ? viewImage["Media"] : null;
                var mediaUrl = media ? media["MediaUrl"] : null;

                model.maps.push({
                    name: name,
                    id: id,
                    mediaUrl: mediaUrl
                });
            });
        };

        // Searches the game maps array for a specific map to get the map's metadata.
        function searchGameMap(id) {
            for (var i = 0; i < model.maps.length; i++) {
                if (model.maps[i].id.toLowerCase() === id.toLowerCase()) {
                    return model.maps[i];
                }
            }
        };

        //---------------PLAYER MATCH HISTORY----------------------//
        var getPlayerMatchHistory = function () {
            //model.playerRecentMatches = [];
            var playerMatchHistory = resourcePlayerMatchHistory.query({ player: model.gamertag, count: Number(model.count), start: Number(model.start) })
                .$promise.then(function (matchHistory) {
                    console.log("Req API");
                    var results = matchHistory["Results"];
                    model.start = model.start + model.count;
                    results.forEach(function (match) {
                        createMatchHistory(match);
                    });
                    if (model.count > 0) {
                        getPlayerMatchHistory();
                    }

                    model.selected = model.playerRecentMatches[0];
                });

            var createMatchHistory = function (item) {
                if (((item["Teams"])["1"])["TeamSize"] === 1) {
                    var matchId = item["MatchId"];
                    var result = item["PlayerMatchOutcome"];
                    var time = item["PlayerMatchDuration"];
                    var matchStartDate = item["MatchStartDate"];
                    var date = matchStartDate["ISO8601Date"];

                    var gameMap = searchGameMap(item["MapId"]);
                    var gameLeader = gameLeadersService.find(item["LeaderId"]);

                    model.playerRecentMatches.push({
                        matchId: matchId,
                        map: gameMap["name"],
                        mapMediaUrl: gameMap["mediaUrl"],
                        leader: gameLeader["name"],
                        leaderMediaUrl: gameLeader["mediaUrl"],
                        result: result === 1 ? "VICTORY" : "DEFEAT",
                        time: time,
                        date: date
                    });
                    model.count = model.count - 1;
                };
            }
        };

        // Requests a new set of matches starting at the next 10 games.
        model.backward = function () {
            model.start += 10;
            model.page++;
            model.playerRecentMatches = [];
            model.count = 10;
            getMaps();
        };

        // Requests the previous set of matches from 10 games ago.
        model.forward = function () {
            if (model.start < 10) {
                model.start = 0;
            }
            else {
                model.start -= 10;
            }
            model.page--;
            model.playerRecentMatches = [];
            model.count = 10;
            getMaps();
        };

        // Selects a match from the Side Nav and closes it.
        model.selectMatch = function (match) {
            model.selected = match;

            var sidenav = $mdSidenav("left");
            if (sidenav.isOpen()) {
                sidenav.close();
            }
            model.tabIndex = 0;
        };

        model.changeGamertag = function () {
            model.playerRecentMatches = [];
            model.count = 10;
            model.start = 0;
            model.match = null;
            getMaps();
        };

        /*
        model.addUser = function (ev) {
            var useFullScreen = ($mdMedia("sm") || $mdMedia("xs"));

            $mdDialog.show({
                controller: DialogController,
                templateUrl: "/components/dialog-component/dialog.component.html",
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: useFullScreen
            })
                .then(function (answer) {
                    console.log("status");
                    model.status = 'You said the information was "' + answer + '".';
                }, function () {
                    console.log("status cancel");
                    model.status = 'You cancelled the dialog.';
                });
        };
        */
    }
}());