(function () {

    "use strict";

    var module = angular.module("haloCommander");

    module.service("gameMapsService", ["$resource",
        class GameMapsService {

            resourceMaps: any;

            constructor($resource) {
                this.resourceMaps = $resource("https://www.haloapi.com/metadata/hw2/maps",
                    {},
                    {
                        query: {
                            method: "GET",
                            headers: { "Accept-Language": "en", "Ocp-Apim-Subscription-Key": "2f9542f34a49497a984e0e70b58eb37d" },
                            isArray: false
                        }
                    });
            }

            //---------------GAME MAPS----------------------//
            maps: Array<any>;
            getMaps() {
                this.maps = [];
                if (!localStorage.getItem("gameMaps")) {
                    //console.log("No stored maps found. Requesting...");
                    this.resourceMaps.query()
                        .$promise.then((maps) => {
                            //console.log("Req API");
                            this.createGameMaps(maps);
                            if (typeof (Storage) !== "undefined") {
                                // Code for localStorage/sessionStorage.
                                localStorage.setItem("gameMaps", LZString.compressToUTF16(JSON.stringify(this.maps)));
                                //console.log("stored");
                            } else {
                                //console.log("No storage found...");
                            }
                        })
                        .catch((error) => {
                            alert("Could not contact the HALO API Maps Metadata services.");
                            console.log(error);
                        });
                }
                else {
                    this.maps = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("gameMaps")));
                    //console.log("Stored maps found");
                }
            }

            // Takes the application relevant data from the Maps API.
            createGameMaps(maps) {
                let contentItems: Array<any> = maps["ContentItems"];

                contentItems.forEach((gameMap) => {
                    let view: any = gameMap["View"];
                    let name: string = view["Title"];
                    let hw2Map: any = view["HW2Map"];
                    let id: string = hw2Map["ID"];
                    let image: any = hw2Map["Image"];
                    let viewImage: any = image["View"];
                    let media: any = viewImage ? viewImage["Media"] : null;
                    let mediaUrl: string = media ? media["MediaUrl"] : null;

                    this.maps.push({
                        name: name,
                        id: id,
                        mediaUrl: mediaUrl
                    });
                });
            }

            // Searches the game maps array for a specific map to get the map's metadata.
            find(id) {
                this.store();
                for (var i = 0; i < this.maps.length; i++) {
                    if (this.maps[i].id === id) {
                        return this.maps[i];
                    }
                }
            }

            // Requests the Halo API for the leader data to store it in cache.
            store() {
                if (!this.maps || this.maps.length === 0) {
                    this.getMaps();
                }
            };

        }]);
})();