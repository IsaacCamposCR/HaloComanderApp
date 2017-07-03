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
        var getSeason = function () {
            resourceSeasons.query()
                .$promise.then(function (data) {
                    createSeason(data);
                    if (typeof (Storage) !== "undefined") {
                        // Code for localStorage/sessionStorage.
                        localStorage.setItem("season", LZString.compressToUTF16(JSON.stringify(season)));
                    }
                    else {
                        console.log("No storage found...");
                    }
                    getCSRDesignations();
                });
        };

        var season = null;
        var createSeason = function (data) {
            var seasonData = {};

            var view = ((data["ContentItems"])[0])["View"];
            seasonData.id = view["Identity"];
            seasonData.name = ((((view["HW2Season"])["DisplayInfo"])["View"])["HW2SeasonDisplayInfo"])["Name"];
            seasonData.viewImage = ((view["HW2Season"])["Image"])["View"];
            seasonData.media = seasonData.viewImage ? seasonData.viewImage["Media"] : null;
            seasonData.mediaUrl = seasonData.media ? seasonData.media["MediaUrl"] : null;

            season = {
                id: seasonData.id,
                name: seasonData.name,
                mediaUrl: seasonData.mediaUrl
            };
            seasonData = null;
        };

        var designations = [];
        var getCSRDesignations = function () {

            if (!localStorage.getItem("designations")) {
                resourceCSRDesignations.query()
                    .$promise.then(function (data) {

                        createDesignations(data);

                        if (typeof (Storage) !== "undefined") {
                            // Code for localStorage/sessionStorage.
                            localStorage.setItem("designations", LZString.compressToUTF16(JSON.stringify(designations)));
                        }
                        else {
                            console.log("No storage found...");
                        }
                    });
            }
            else {
                designations = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("designations")));
                //console.log("Stored objects found");
            }
        };

        var createDesignations = function (data) {

            var contentItemDesignations = data["ContentItems"];

            for (var i = 0; i < contentItemDesignations.length; i++) {
                var newDesignation = {};

                var designation = contentItemDesignations[i];

                newDesignation.identity = ((((designation["View"])["HW2CsrDesignation"])["DisplayInfo"])["View"])["Identity"];
                newDesignation.name = (((((designation.View)["HW2CsrDesignation"])["DisplayInfo"])["View"])["HW2CsrDesignationDisplayInfo"])["Name"];
                newDesignation.designationId = ((designation.View)["HW2CsrDesignation"])["ID"];

                var newTiers = [];
                var tiers = ((designation.View)["HW2CsrDesignation"])["Tiers"];
                tiers.map(function (tier) {
                    var tierId = ((tier["View"])["HW2CsrDesignationTier"])["ID"];
                    var name = (tier["View"])["Title"];
                    var mediaUrl = (((((tier["View"])["HW2CsrDesignationTier"])["Image"])["View"])["Media"])["MediaUrl"];
                    newTiers.push({
                        Id: tierId,
                        name: name,
                        mediaUrl: mediaUrl
                    });
                });
                newDesignation.tiers = newTiers;

                designations.push(newDesignation);
                newDesignation = null;
                newTiers = null;
                tiers = null;
            }
        };

        var getPlayerSeasonStats = function (player) {
            if (!localStorage.getItem("season")) {
                resourceSeasons.query()
                    .$promise.then(function (data) {
                        createSeason(data);
                        if (typeof (Storage) !== "undefined") {
                            // Code for localStorage/sessionStorage.
                            localStorage.setItem("season", LZString.compressToUTF16(JSON.stringify(season)));
                            season = null;
                        }
                        else {
                            console.log("No storage found...");
                        }
                        return getPlayerSeason(player);
                    });
            }
            else {
                season = JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("season")));
                //console.log("Stored objects found");
                return getPlayerSeason(player);
            }
        };

        var getPlayerSeason = function (player) {
            return resourcePlayers.query({ player: player, seasonId: season.id });
        };

        var createPlayerSeason = function (playerSeasonData) {
            var playlistData = (playerSeasonData["RankedPlaylistStats"]).find(function (playlist) {
                return playlist.PlaylistId === "532bfd6c-3db4-45b7-a010-11460b862be6";
            });

            var highestCsr = playlistData["HighestCsr"];

            var playerSeasonStats = {};

            var designationData = designations.find(function (designation) {
                if (highestCsr != null) {
                    return designation.designationId === highestCsr["Designation"];
                }
                else {
                    return designation.designationId === 0;
                }
            });

            var tierData = designationData.tiers.find(function (tier) {
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
        function searchPlayerSeason(player) {
            var pss = getPlayerSeasonStats(player);
            return pss;
        };

        // Requests the Halo API for the season data to store it in cache. 
        // This data is requested each time the app is opened. As it changes per season.
        function storeSeason() {
            getSeason();
        };


        return {
            find: searchPlayerSeason,
            create: createPlayerSeason,
            store: storeSeason
        }
    });

}());