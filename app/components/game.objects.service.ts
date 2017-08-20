(function () {

    "use strict";

    var module = angular.module("haloCommander");

    module.service("gameObjectsService", ["$resource",
        class GameObjectsService {

            resourceGameObjects: any;

            constructor($resource) {
                this.resourceGameObjects = $resource("https://www.haloapi.com/metadata/hw2/game-objects",
                    {
                        startAt: "@startAt"
                    },
                    {
                        query: {
                            method: "GET",
                            headers: { "Accept-Language": "en", "Ocp-Apim-Subscription-Key": "2f9542f34a49497a984e0e70b58eb37d" },//"ee5d843652484f409f5b60356142838c" },
                            isArray: false
                        }
                    });
            }

            //---------------GAME OBJECTS----------------------//
            gameObjects: Array<any> = [];
            private getGameObjects1() {

                if (!localStorage.getItem("gameObjects")) {
                    //console.log("No stored objects found. Requesting...");
                    this.resourceGameObjects.query({ startAt: "0" })
                        .$promise.then((objects) => {
                            //console.log("Req API");
                            this.createGameObjects(objects);
                            this.resourceGameObjects.query({ startAt: "100" })
                                .$promise.then((objects) => {
                                    //console.log("Req API");
                                    this.createGameObjects(objects);
                                    this.resourceGameObjects.query({ startAt: "200" })
                                        .$promise.then((objects) => {
                                            //console.log("Req API");
                                            this.createGameObjects(objects);
                                            if (typeof (Storage) !== "undefined") {
                                                // Code for localStorage/sessionStorage.
                                                localStorage.setItem("gameObjects", LZString.compressToUTF16(JSON.stringify(this.gameObjects)));
                                                //console.log("stored");
                                            } else {
                                                //console.log("No storage found...");
                                            }
                                        })
                                        .catch((error) => {
                                            alert("Could not contact the HALO API Game Objects Metadata services.")
                                            console.log(error);
                                        });
                                })
                                .catch((error) => {
                                    alert("Could not contact the HALO API Game Objects Metadata services.")
                                    console.log(error);
                                });
                        })
                        .catch((error) => {
                            alert("Could not contact the HALO API Game Objects Metadata services.")
                            console.log(error);
                        });
                }
                else {
                    this.gameObjects = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("gameObjects")));
                    //console.log("Stored objects found");
                }
            };

            startAt: number = 0;
            private getGameObjects() {
                if (!localStorage.getItem("gameObjects")) {
                    //console.log("No stored objects found. Requesting...");
                    this.resourceGameObjects.query({ startAt: this.startAt })
                        .$promise.then((objects) => {
                            //console.log("Req API");
                            this.createGameObjects(objects);

                            if (objects["ContentItems"].length < 100) {
                                //console.log("Added all items...", this.gameObjects.length);
                                if (typeof (Storage) !== "undefined") {
                                    // Code for localStorage/sessionStorage.
                                    localStorage.setItem("gameObjects", LZString.compressToUTF16(JSON.stringify(this.gameObjects)));
                                    //console.log("stored");
                                } else {
                                    //console.log("No storage found...");
                                }
                            }
                            else {
                                //console.log("Adding 100 more items...", this.startAt);
                                this.startAt = this.startAt + 100;
                                this.getGameObjects();
                            }
                        })
                        .catch((error) => {
                            alert("Could not contact the HALO API Game Objects Metadata services.")
                            console.log(error);
                        });
                }
                else {
                    this.gameObjects = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("gameObjects")));
                    //console.log("Stored objects found");
                }
            }

            private sleep(delay) {
                var start = new Date().getTime();
                while (new Date().getTime() < start + delay);
            }

            // Takes the application relevant data from the Game Objects API.
            private createGameObjects(objects) {
                var contentItems = objects["ContentItems"];

                contentItems.forEach((gameObject) => {

                    var view = gameObject["View"];
                    var name = view["Title"];
                    var hw2Object = view["HW2Object"];
                    var id = hw2Object["ObjectTypeId"];
                    var categories = hw2Object["Categories"];
                    var image = hw2Object["Image"];
                    var viewImage = image["View"];
                    var media = viewImage ? viewImage["Media"] : null;
                    var mediaUrl = media ? media["MediaUrl"] : null;

                    this.gameObjects.push({
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
            find(id) {
                this.store();

                if (id.includes("cov_bldg_heavy")) {
                    id = id.replace("heavy", "light");
                }
                if (id.includes("suicideGrunt")) {
                    id = "cov_inf_generic_suicidegrunt";
                }
                if (id.includes("for_air_sentinel_01")) {
                    id = "neutralfor_sentineltier2_generic";
                }

                for (var i = 0; i < this.gameObjects.length; i++) {
                    if (this.gameObjects[i].id.toLowerCase() === id.toLowerCase()) {
                        return this.gameObjects[i];
                    }
                }
                return null;
            };

            // Requests the Halo API for the game object data to store it in cache.
            store() {
                if (!this.gameObjects || this.gameObjects.length === 0) {
                    this.getGameObjects();
                }
            };
        }]);
})();