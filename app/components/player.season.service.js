(function () {

    "use strict";

    var module = angular.module("haloCommander");

    module.factory("playerSeasonService", function ($resource) {

        var resourcePlayers = $resource("https://www.haloapi.com/stats/hw2/players/:player/stats/seasons/:seasonId",
            {
                player: "@player",
                seasonId: "@seasonId"
            },
            {
                query: {
                    method: "GET",
                    headers: { "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                    isArray: false
                }
            });

        var resourceSeasons = $resource("https://www.haloapi.com/metadata/hw2/seasons",
            {
            },
            {
                query: {
                    method: "GET",
                    headers: { "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                    isArray: false
                }
            });

        var resourceCSRDesignations = $resource("https://www.haloapi.com/metadata/hw2/csr-designations",
            {
            },
            {
                query: {
                    method: "GET",
                    headers: { "Accept-Language": "en", "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                    isArray: false
                }
            });

        //---------------PLAYER SEASON----------------------//
        var getPlayerSeasonStats = function (player) {
            if (!localStorage.getItem("season")) {
                resourceSeasons.query()
                    .$promise.then(function (data) {
                        createSeason(data);
                        if (typeof (Storage) !== "undefined") {
                            // Code for localStorage/sessionStorage.
                            localStorage.setItem("season", JSON.stringify(season));
                            console.log("stored");
                        }
                        else {
                            console.log("No storage found...");
                        }
                        getCSRDesignations();
                        getPlayerSeason(player);
                    });
            }
            else {
                season = JSON.parse(localStorage.getItem("season"));
                console.log("Stored objects found");
                getCSRDesignations();
                getPlayerSeason(player);
            }
        };

        var season = null;
        var createSeason = function (data) {
            var contentItems = data["ContentItems"];
            var view = (contentItems[0])["View"];
            var id = view["Identity"];
            var name = ((((view["HW2Season"])["DisplayInfo"])["View"])["HW2SeasonDisplayInfo"])["Name"];
            var viewImage = ((view["HW2Season"])["Image"])["View"];
            var media = viewImage ? viewImage["Media"] : null;
            var mediaUrl = media ? media["MediaUrl"] : null;

            season = {
                id: id,
                name: name,
                mediaUrl: mediaUrl
            };
        };

        var designations = [];
        var getCSRDesignations = function () {
            if (!localStorage.getItem("designations")) {
                resourceCSRDesignations.query()
                    .$promise.then(function (data) {
                        console.log("Designations", data);
                        data.map(function (designation) {
                            createDesignation(designation);
                        });
                        if (typeof (Storage) !== "undefined") {
                            // Code for localStorage/sessionStorage.
                            localStorage.setItem("designations", JSON.stringify(designations));
                            console.log("stored");
                        }
                        else {
                            console.log("No storage found...");
                        }
                    });
            }
            else {
                designations = JSON.parse(localStorage.getItem("designations"));
                console.log("Stored objects found");
            }
        };

        var createDesignation = function (designation) {
            var newDesignation = {};

            var contentItems = designation["ContentItems"];
            var DisplayInfoId = (((contentItems["View"])["HW2CsrDesignation"])["DisplayInfo"])["Id"];
            var Identity = ((((contentItems["View"])["HW2CsrDesignation"])["DisplayInfo"])["View"])["Identity"];
            var Name = (((((contentItems["View"])["HW2CsrDesignation"])["DisplayInfo"])["View"])["HW2CsrDesignationDisplayInfo"])["Name"];
            var DesignationId = ((contentItems["View"])["HW2CsrDesignation"])["ID"];
            var tiers = ((contentItems["View"])["HW2CsrDesignation"])["Tiers"];

            newDesignation.tiers = [];
            tiers.map(function (tier) {
                var tierId = tier["Id"];
                var mediaUrl = (((tier["Image"])["View"])["Media"])["MediaUrl"];
                newDesignation.tiers.push({
                    Id: tierId,
                    mediaUrl: mediaUrl
                });
            });
            newDesignation.identity = Identity;
            newDesignation.name = Name;
            newDesignation.designationId = DesignationId;

            designations.push(newDesignation);

            /*View
                HW2CsrDesignation
                    DisplayInfo
                        Id
                        View
                            Identity
                            HW2CsrDesignationDisplayInfo
                                Name
                    ID
                    Tiers []
                        Id
                        View
                            HW2CsrDesignationTier
                                ID
                                Image
                                    View
                                        Media
                                            MediaUrl
                                            */
        };

        var getPlayerSeason = function (player) {
            console.log(season);
            resourcePlayers.query({ player: player, seasonId: season.id })
                .$promise.then(function (playerSeasonData) {
                    console.log("Player Season", playerSeasonData);
                });
        };

        var createPlayerSeason = function (data) {
        };

        // Searches the game maps array for a specific map to get the map's metadata.
        function searchPlayerSeason(player) {
            getPlayerSeasonStats(player);
        };

        return {
            find: searchPlayerSeason
        }
    });

}());