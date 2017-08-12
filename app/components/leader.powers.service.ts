(function () {

    "use strict";

    var module = angular.module("haloCommander");

    module.service("leaderPowersService", ["$resource",
        class LeaderPowersService {

            resourceLeaderPowers: any;

            constructor($resource) {
                this.resourceLeaderPowers = $resource("https://www.haloapi.com/metadata/hw2/leader-powers",
                    {},
                    {
                        query: {
                            method: "GET",
                            headers: { "Accept-Language": "en", "Ocp-Apim-Subscription-Key": "2f9542f34a49497a984e0e70b58eb37d" },
                            isArray: false
                        }
                    });
            }

            //---------------LEADER POWERS----------------------//
            powers: Array<any>;
            getLeaderPowers() {
                this.powers = [];
                if (!localStorage.getItem("leaderPowers")) {
                    //console.log("No stored maps found. Requesting...");
                    this.resourceLeaderPowers.query()
                        .$promise.then((leaderPowers) => {
                            //console.log("Req API");
                            this.createLeaderPowers(leaderPowers);
                            if (typeof (Storage) !== "undefined") {
                                // Code for localStorage/sessionStorage.
                                localStorage.setItem("leaderPowers", LZString.compressToUTF16(JSON.stringify(this.powers)));
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
                    this.powers = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("leaderPowers")));
                    //console.log("Stored maps found");
                }
            }

            // Takes the application relevant data from the Maps API.
            createLeaderPowers(powers) {
                let contentItems: Array<any> = powers["ContentItems"];

                contentItems.forEach((gameMap) => {
                    let view: any = gameMap["View"];
                    let name: string = view["Title"];
                    let hw2LeaderPower: any = view["HW2LeaderPower"];
                    let id: string = hw2LeaderPower["ObjectTypeId"];
                    // Do not delete these comments, in case the Devs decide to add Media to Leader Powers.
                    // let image: any = hw2Map["Image"];
                    // let viewImage: any = image["View"];
                    // let media: any = viewImage ? viewImage["Media"] : null;
                    // let mediaUrl: string = media ? media["MediaUrl"] : null;

                    this.powers.push({
                        name: name,
                        id: id
                    });
                });
            }

            // Searches the game maps array for a specific map to get the map's metadata.
            find(id) {
                this.store();
                for (var i = 0; i < this.powers.length; i++) {
                    if (this.powers[i].id === id) {
                        return this.powers[i];
                    }
                }
            }

            // Requests the Halo API for the leader data to store it in cache.
            store() {
                if (!this.powers || this.powers.length === 0) {
                    this.getLeaderPowers();
                }
            };

        }]);
})();