(function () {

    "use strict";

    var module = angular.module("haloCommander");

    module.factory("gameObjectsService", function ($resource) {

        var resourceGameObjects = $resource("https://www.haloapi.com/metadata/hw2/game-objects",
            {
                startAt: "@startAt"
            },
            {
                query: {
                    method: "GET",
                    headers: { "Accept-Language": "en", "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                    isArray: false
                }
            });

        //---------------GAME OBJECTS----------------------//
        var gameObjects = [];
        var getGameObjects = function () {

            if (!localStorage.getItem("gameObjects")) {
                //console.log("No stored objects found. Requesting...");
                resourceGameObjects.query({ startAt: "0" })
                    .$promise.then(function (objects) {
                        //console.log("Req API");
                        createGameObjects(objects);
                        resourceGameObjects.query({ startAt: "100" })
                            .$promise.then(function (objects) {
                                //console.log("Req API");
                                createGameObjects(objects);
                                resourceGameObjects.query({ startAt: "200" })
                                    .$promise.then(function (objects) {
                                        //console.log("Req API");
                                        createGameObjects(objects);
                                        if (typeof (Storage) !== "undefined") {
                                            // Code for localStorage/sessionStorage.
                                            localStorage.setItem("gameObjects", LZString.compressToUTF16(JSON.stringify(gameObjects)));
                                            //console.log("stored");
                                        } else {
                                            //console.log("No storage found...");
                                        }
                                    })
                                    .catch(function (error) {
                                        alert("Could not contact the HALO API Game Objects Metadata services.")
                                        console.log(error);
                                    });
                            })
                            .catch(function (error) {
                                alert("Could not contact the HALO API Game Objects Metadata services.")
                                console.log(error);
                            });
                    })
                    .catch(function (error) {
                        alert("Could not contact the HALO API Game Objects Metadata services.")
                        console.log(error);
                    });
            }
            else {
                gameObjects = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("gameObjects")));
                //console.log("Stored objects found");
            }
        };

        function sleep(delay) {
            var start = new Date().getTime();
            while (new Date().getTime() < start + delay);
        }

        // Takes the application relevant data from the Game Objects API.
        var createGameObjects = function (objects) {
            var contentItems = objects["ContentItems"];

            contentItems.forEach(function (gameObject) {

                var view = gameObject["View"];
                var name = view["Title"];
                var hw2Object = view["HW2Object"];
                var id = hw2Object["ObjectTypeId"];
                var categories = hw2Object["Categories"];
                var image = hw2Object["Image"];
                var viewImage = image["View"];
                var media = viewImage ? viewImage["Media"] : null;
                var mediaUrl = media ? media["MediaUrl"] : null;

                gameObjects.push({
                    name: name,
                    id: id,
                    category: (categories.length > 0) ? (categories[0])["Id"] : 0,
                    mediaUrl: mediaUrl,
                    supplyCost: hw2Object["StandardSupplyCost"],
                    energyCost: hw2Object["StandardEnergyCost"],
                    populationCost: hw2Object["StandardPopulationCost"],
                    againstInfantry: hw2Object["EffectivenessAgainstInfantry"],
                    againstVehicles: hw2Object["EffectivenessAgainstVehicles"],
                    againstAir: hw2Object["EffectivenessAgainstAir"]
                });
            });
        };

        // Searches the game object array for a specific unit to get the unit's metadata.
        function searchGameObject(id) {
            storeGameObjects();

            if (id.includes("cov_bldg_heavy")) {
                id = id.replace("heavy", "light");
            }
            if (id.includes("suicideGrunt")) {
                id = "cov_inf_generic_suicidegrunt";
            }
            if (id.includes("for_air_sentinel_01")) {
                id = "neutralfor_sentineltier2_generic";
            }

            for (var i = 0; i < gameObjects.length; i++) {
                if (gameObjects[i].id.toLowerCase() === id.toLowerCase()) {
                    return gameObjects[i];
                }
            }
            return null;
        };

        // Requests the Halo API for the game object data to store it in cache.
        function storeGameObjects() {
            if (!gameObjects || gameObjects.length === 0) {
                getGameObjects();
            }
        };

        return {
            find: searchGameObject,
            store: storeGameObjects
        }
    });

}());