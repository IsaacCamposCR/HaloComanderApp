(function () {

    "use strict";

    var module = angular.module("haloCommander");

    module.service("playerSeasonService", ["$resource", "gameLeadersService", "gameObjectsService", "leaderPowersService", "gameMapsService",
        class PlayerSeasonService {

            resourcePlayers: any;
            resourceSeasons: any;
            resourceCSRDesignations: any;
            gameLeadersService: any;
            gameObjectsService: any;
            leaderPowersService: any;
            gameMapsService: any;

            constructor($resource, gameLeadersService, gameObjectsService, leaderPowersService, gameMapsService) {
                this.gameLeadersService = gameLeadersService;
                this.gameObjectsService = gameObjectsService;
                this.leaderPowersService = leaderPowersService;
                this.gameMapsService = gameMapsService;

                    {
                        player: "@player",
                    },
                    {
                        query: {
                            method: "GET",
                            headers: { "Ocp-Apim-Subscription-Key": "2f9542f34a49497a984e0e70b58eb37d" },
                            isArray: false
                        }
                    });

                this.resourceSeasons = $resource("https://www.haloapi.com/metadata/hw2/seasons",
                    {
                    },
                    {
                        query: {
                            method: "GET",
                            headers: { "Ocp-Apim-Subscription-Key": "2f9542f34a49497a984e0e70b58eb37d" },
                            isArray: false
                        }
                    });

                this.resourceCSRDesignations = $resource("https://www.haloapi.com/metadata/hw2/csr-designations",
                    {
                    },
                    {
                        query: {
                            method: "GET",
                            headers: { "Accept-Language": "en", "Ocp-Apim-Subscription-Key": "2f9542f34a49497a984e0e70b58eb37d" },
                            isArray: false
                        }
                    });
            }

            //---------------PLAYER SEASON----------------------//
            private getSeason() {
                if (!localStorage.getItem("season")) {
                    //this.sleep(1000);
                    this.resourceSeasons.query()
                        .$promise.then((data) => {
                            this.createSeason(data);
                            if (typeof (Storage) !== "undefined") {
                                // Code for localStorage/sessionStorage.
                                localStorage.setItem("season", LZString.compressToUTF16(JSON.stringify(this.season)));
                            }
                            else {
                                //console.log("No storage found...");
                            }
                            this.getCSRDesignations();
                        })
                        .catch((error) => {
                            alert("Could not contact the HALO API Season services.")
                            console.log(error);
                        });
                }
                else {
                    this.season = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("season")));
                }
            };

            private sleep(delay) {
                let start: any = new Date().getTime();
                while (new Date().getTime() < start + delay);
            }

            season: any = null;
            private createSeason(data) {
                let seasonData: any = {};

                let view: any = ((data["ContentItems"])[0])["View"];
                seasonData.id = view["Identity"];
                seasonData.name = ((((view["HW2Season"])["DisplayInfo"])["View"])["HW2SeasonDisplayInfo"])["Name"];
                seasonData.viewImage = ((view["HW2Season"])["Image"])["View"];
                seasonData.media = seasonData.viewImage ? seasonData.viewImage["Media"] : null;
                seasonData.mediaUrl = seasonData.media ? seasonData.media["MediaUrl"] : null;

                this.season = {
                    id: seasonData.id,
                    name: seasonData.name,
                    mediaUrl: seasonData.mediaUrl
                };
                seasonData = null;
            };

            designations: Array<any> = [];
            private getCSRDesignations() {
                if (!localStorage.getItem("designations")) {
                    //this.sleep(1000);
                    this.resourceCSRDesignations.query()
                        .$promise.then((data) => {

                            this.createDesignations(data);

                            if (typeof (Storage) !== "undefined") {
                                // Code for localStorage/sessionStorage.
                                localStorage.setItem("designations", LZString.compressToUTF16(JSON.stringify(this.designations)));
                            }
                            else {
                                //console.log("No storage found...");
                            }
                        })
                        .catch((error) => {
                            alert("Could not contact the HALO API Designation services.")
                            console.log(error);
                        });
                }
                else {
                    this.designations = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("designations")));
                    //console.log("Stored objects found");
                }
            };

            private createDesignations(data) {
                let contentItemDesignations: Array<any> = data["ContentItems"];

                for (var i = 0; i < contentItemDesignations.length; i++) {
                    let newDesignation: any = {};

                    let designation: any = contentItemDesignations[i];

                    newDesignation.identity = ((((designation["View"])["HW2CsrDesignation"])["DisplayInfo"])["View"])["Identity"];
                    newDesignation.name = (((((designation.View)["HW2CsrDesignation"])["DisplayInfo"])["View"])["HW2CsrDesignationDisplayInfo"])["Name"];
                    newDesignation.designationId = ((designation.View)["HW2CsrDesignation"])["ID"];

                    let newTiers: Array<any> = [];
                    let tiers: any = ((designation.View)["HW2CsrDesignation"])["Tiers"];
                    tiers.map((tier) => {
                        let tierId: number = ((tier["View"])["HW2CsrDesignationTier"])["ID"];
                        let name: string = (tier["View"])["Title"];
                        let mediaUrl: string = (((((tier["View"])["HW2CsrDesignationTier"])["Image"])["View"])["Media"])["MediaUrl"];
                        newTiers.push({
                            Id: tierId,
                            name: name,
                            mediaUrl: mediaUrl
                        });
                    });
                    newDesignation.tiers = newTiers;

                    this.designations.push(newDesignation);
                    newDesignation = null;
                    newTiers = null;
                    tiers = null;
                }
            };

            private getPlayerSeasonStats(player) {
                if (!localStorage.getItem("season")) {
                    //this.sleep(1000);
                    this.resourceSeasons.query()
                        .$promise.then((data) => {
                            this.createSeason(data);
                            if (typeof (Storage) !== "undefined") {
                                // Code for localStorage/sessionStorage.
                                localStorage.setItem("season", LZString.compressToUTF16(JSON.stringify(this.season)));
                                this.season = null;
                            }
                            else {
                                //console.log("No storage found...");
                            }
                            return this.getPlayerSeason(player);
                        })
                        .catch((error) => {
                            alert("Could not contact the HALO API Season services.")
                            console.log(error);
                        });
                }
                else {
                    this.season = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("season")));
                    //console.log("Stored objects found");
                    return this.getPlayerSeason(player);
                }
            };

            private getPlayerSeason(player) {
            };

            create(playerSeasonData) {
                this.getCSRDesignations();
                    return playlist.PlaylistId === "f98a4189-b766-41fa-afe3-4ff385304ee4";
                });
                let highestCsr: any = playlistData["HighestCsr"];

                let playerSeasonStats: any = {};

                let designationData: any = this.designations.find((designation) => {
                    if (highestCsr != null) {
                        return designation.designationId === highestCsr["Designation"];
                    }
                    else {
                        return designation.designationId === 0;
                    }
                });

                let tierData: any = designationData.tiers.find((tier) => {
                    if (highestCsr != null) {
                        return tier.Id === highestCsr["Tier"];
                    }
                    else {
                        return tier.Id === playlistData["TotalMatchesStarted"];
                    }
                });

                playerSeasonStats.rank = designationData.name;
                playerSeasonStats.rankIcon = tierData.mediaUrl;
                playerSeasonStats.raw = (highestCsr != null) ? highestCsr["Raw"] : 0;

                playlistData = null;
                designationData = null;
                tierData = null;

                return playerSeasonStats;
            };

            // Searches the game maps array for a specific map to get the map's metadata.
            find(player) {
                return this.getPlayerSeasonStats(player);
            };

            // Requests the Halo API for the season data to store it in cache. 
            // This data is requested each time the app is opened. As it changes per season.
            store() {
                this.getSeason();
            };

            // Checks if the Season object has changed, if it has then the cache must be refreshed.
            isNewSeason() {
                //console.log("Is new season?");
                if (!localStorage.getItem("season")) {
                    //console.log("No season stored...");
                }
                else {
                    // There's a Season object, it needs to checked.
                    //this.sleep(1000);
                    this.resourceSeasons.query()
                        .$promise.then((data) => {
                            //console.log("Season stored, checking current one");
                            let currentSeason: any = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("season")));
                            this.createSeason(data);
                            //console.log(this.season.id, currentSeason.id);
                            if (this.season.id != currentSeason.id) {
                                //console.log("New season! storing...");
                            }
                        });
                }
            }

                // Refresh Cache
                this.gameLeadersService.store();
                this.gameObjectsService.store();
                this.leaderPowersService.store();
                this.gameMapsService.store();
                this.store();
            }
        }]);
}());