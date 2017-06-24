(function () {

    "use strict";

    var module = angular.module("haloCommander");

    module.factory("gameLeadersService", function ($resource) {

        var resourceLeaders = $resource("https://www.haloapi.com/metadata/hw2/leaders",
            {},
            {
                query: {
                    method: "GET",
                    headers: { "Accept-Language": "en", "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                    isArray: false
                }
            });

        //---------------GAME LEADERS----------------------//
        var gameLeaders = [];
        var getLeaders = function () {
            if (!localStorage.getItem("gameLeaders")) {
                console.log("No stored leaders found. Requesting...");
                resourceLeaders.query()
                    .$promise.then(function (leaders) {
                        createGameLeaders(leaders);
                        if (typeof (Storage) !== "undefined") {
                            // Code for localStorage/sessionStorage.
                            localStorage.setItem("gameLeaders", JSON.stringify(gameLeaders));
                            //console.log("stored", gameLeaders);
                        } else {
                            //console.log("No storage found...");
                        }
                    });
            }
            else {
                gameLeaders = JSON.parse(localStorage.getItem("gameLeaders"));
                //console.log("Stored leaders found", gameLeaders);
            }
        };

        var createGameLeaders = function (leaders) {
            var contentItems = leaders["ContentItems"];

            contentItems.forEach(function (gameLeader) {
                var view = gameLeader["View"];
                var hw2Leader = view["HW2Leader"];
                var id = hw2Leader["Id"];
                var displayInfo = hw2Leader["DisplayInfo"];
                var viewDisplayInfo = displayInfo["View"];
                var hw2LeaderDisplayInfo = viewDisplayInfo["HW2LeaderDisplayInfo"];
                var name = hw2LeaderDisplayInfo["Name"];
                var image = hw2Leader["Image"];
                var viewImage = image["View"];
                var media = viewImage ? viewImage["Media"] : null;
                var mediaUrl = media ? media["MediaUrl"] : null;

                gameLeaders.push({
                    name: name,
                    id: id,
                    mediaUrl: mediaUrl
                });
            });
        }

        // Searches the game maps array for a specific map to get the map's metadata.
        function searchGameLeader(id) {
            if (!gameLeaders || gameLeaders.length === 0) {
                getLeaders();
            }
            for (var i = 0; i < gameLeaders.length; i++) {
                if (gameLeaders[i].id === id) {
                    return gameLeaders[i];
                }
            }
        };

        return {
            find: searchGameLeader
        }
    });

}());