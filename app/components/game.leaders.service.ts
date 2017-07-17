(function () {

    "use strict";

    var module = angular.module("haloCommander");

    module.service("gameLeadersService", class GameLeadersService {

        resourceLeaders: any;

        constructor($resource) {
            this.resourceLeaders = $resource("https://www.haloapi.com/metadata/hw2/leaders",
                {},
                {
                    query: {
                        method: "GET",
                        headers: { "Accept-Language": "en", "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                        isArray: false
                    }
                });;
        }

        //---------------GAME LEADERS----------------------//
        gameLeaders: Array<any> = [];
        getLeaders() {
            if (!localStorage.getItem("gameLeaders")) {
                //console.log("No stored leaders found. Requesting...");
                this.resourceLeaders.query()
                    .$promise.then((leaders) => {
                        //console.log("Req API");
                        this.createGameLeaders(leaders);
                        if (typeof (Storage) !== "undefined") {
                            // Code for localStorage/sessionStorage.
                            localStorage.setItem("gameLeaders", LZString.compressToUTF16(JSON.stringify(this.gameLeaders)));
                            //console.log("stored", gameLeaders);
                        } else {
                            //console.log("No storage found...");
                        }
                    })
                    .catch((error) => {
                        alert("Could not contact the HALO API Leader Metadata services.")
                        console.log(error);
                    });
            }
            else {
                this.gameLeaders = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("gameLeaders")));
                //console.log("Stored leaders found", gameLeaders);
            }
        };

        createGameLeaders(leaders) {
            var contentItems = leaders["ContentItems"];

            contentItems.forEach((gameLeader) => {
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

                this.gameLeaders.push({
                    name: name,
                    id: id,
                    mediaUrl: mediaUrl
                });
            });
        }

        // Searches the game maps array for a specific map to get the map's metadata.
        find(id) {
            this.store();
            for (var i = 0; i < this.gameLeaders.length; i++) {
                if (this.gameLeaders[i].id === id) {
                    return this.gameLeaders[i];
                }
            }
        }

        // Requests the Halo API for the leader data to store it in cache.
        store() {
            if (!this.gameLeaders || this.gameLeaders.length === 0) {
                this.getLeaders();
            }
        };
    });

}());