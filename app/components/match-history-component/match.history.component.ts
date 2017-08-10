(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("matchHistoryComponent", {
        templateUrl: "/components/match-history-component/match.history.component.html",
        controllerAs: "model",
        bindings: {
            selected: "=",
            disablePaging: "=",
            disableSelecting: "="
        },
        controller: ["$resource", "$mdSidenav", "$mdMedia", "$mdDialog", "gameLeadersService", "gameMapsService",
            class MatchHistoryController {

                $resource: any;
                $mdSidenav: any;
                $mdMedia: any;
                $mdDialog: any;

                gameMapsService: any;
                gameLeadersService: any;

                resourcePlayerMatchHistory: any;
                resourceMaps: any;

                page: number = 1;
                disablePaging: boolean = false;
                disableSelecting: boolean = false;
                forwardPaging: boolean;
                pageStart: number;
                pageFinish: number;
                start: number = 0;
                count: number = 10;

                tabIndex: number;

                searchMatch: string = "";
                gamertag: string = "";
                playerRecentMatches: Array<any> = [];

                constructor($resource, $mdSidenav, $mdMedia, $mdDialog, gameLeadersService, gameMapsService) {
                    this.$resource = $resource;
                    this.$mdSidenav = $mdSidenav;
                    this.$mdMedia = $mdMedia;
                    this.$mdDialog = $mdDialog;
                    this.gameLeadersService = gameLeadersService;
                    this.gameMapsService = gameMapsService;

                    this.resourcePlayerMatchHistory = $resource("https://www.haloapi.com/stats/hw2/players/:player/matches",
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
                }

                //---------------PLAYER MATCH HISTORY----------------------//
                // Attempts is used to stop the app from endlessly trying to query all the games in a player's history. 
                // Querying 10 attempts equals 500 games. Games older than 500 games will not be retrieved.
                attempts: number = 0;
                getPlayerMatchHistoryBackwards() {
                    this.sleep(1000);
                    let playerMatchHistory: any = this.resourcePlayerMatchHistory.query({ player: this.gamertag, count: 50, start: Number(this.start) })
                        .$promise.then((matchHistory) => {
                            this.attempts++;
                            //console.log("Req API");
                            let results: Array<any> = matchHistory["Results"];
                            if (results.length > 0) {
                                this.pageStart = this.pageStart;
                                for (var i = 0; i < results.length; i++) {
                                    let match: any = results[i];
                                    if (this.playerRecentMatches.length < 10) {
                                        this.createMatchHistory(match);
                                        this.start++;
                                    }
                                    else {
                                        i = results.length;
                                    }
                                }
                                this.start = this.start;
                                if (this.count > 0 && this.attempts <= 10) {
                                    this.getPlayerMatchHistoryBackwards();
                                }
                                else {
                                    this.disablePaging = false;
                                    this.disableSelecting = false;
                                    this.pageFinish = this.start;
                                    this.start = this.pageFinish;
                                }
                            }
                            else {
                                alert("This player has no Ranked 1v1 matches played!");
                                this.disablePaging = false;
                                this.disableSelecting = false;
                            }
                        })
                        .catch((error) => {
                            if (error.status === 404) {
                                alert("The gamertag you entered does not exist!");
                            }
                            else {
                                alert("Could not contact the HALO API Match History services.");
                                console.log(error);
                            }
                            this.disablePaging = false;
                            this.disableSelecting = false;
                        });
                }

                getPlayerMatchHistoryForwards() {
                    this.sleep(1000);
                    let playerMatchHistory: any = this.resourcePlayerMatchHistory.query({ player: this.gamertag, count: Number(this.count), start: Number(this.start) })
                        .$promise.then((matchHistory) => {
                            //console.log("Req API");
                            let results: Array<any> = matchHistory["Results"];
                            if (results.length === 0) {
                                alert("This player has no Ranked 1v1 matches played!");
                            }
                            this.pageStart = this.start;
                            results.forEach((match) => {
                                this.createMatchHistory(match);
                            });
                            this.start = this.start - this.count;
                            if (this.count > 0) {
                                this.getPlayerMatchHistoryForwards();
                            }
                            else {
                                this.disablePaging = false;
                                this.disableSelecting = false;
                                this.pageFinish = this.pageFinish;
                                this.start = this.pageFinish;
                            }
                        })
                        .catch((error) => {
                            if (error.status === 404) {
                                alert("The gamertag you entered does not exist!");
                            }
                            else {
                                alert("Could not contact the HALO API Match History services.");
                                console.log(error);
                            }
                        });
                }

                createMatchHistory(item) {
                    if (((item["Teams"])["1"])["TeamSize"] === 1) {
                        let matchId: string = item["MatchId"];
                        let result: any = item["PlayerMatchOutcome"];
                        let time: any = item["PlayerMatchDuration"];
                        let matchStartDate: any = item["MatchStartDate"];
                        let date: string = matchStartDate["ISO8601Date"];

                        let gameMap: any = this.gameMapsService.find(item["MapId"]);//this.searchGameMap(item["MapId"]);
                        let gameLeader: any = this.gameLeadersService.find(item["LeaderId"]);

                        let recentMatch: any = {
                            matchId: matchId,
                            map: gameMap["name"],
                            mapMediaUrl: gameMap["mediaUrl"],
                            leader: gameLeader["name"],
                            leaderMediaUrl: gameLeader["mediaUrl"],
                            result: result === 1 ? "VICTORY" : "DEFEAT",
                            time: time,
                            date: date
                        };

                        if (this.forwardPaging) {
                            this.playerRecentMatches.unshift(recentMatch);
                        }
                        else {
                            this.playerRecentMatches.push(recentMatch);
                        }
                        this.count = this.count - 1;
                        return true;
                    }
                    else {
                        return false;
                    }
                }

                sleep(delay) {
                    let start: any = new Date().getTime();
                    while (new Date().getTime() < start + delay);
                }

                // Requests a new set of matches starting at the next 10 games.
                backward() {
                    if (this.playerRecentMatches.length === 10) {
                        this.disablePaging = true;
                        this.disableSelecting = true;
                        this.forwardPaging = false;
                        this.pageStart = this.start;
                        this.page++;
                        this.playerRecentMatches = [];
                        this.count = 10;
                        this.getPlayerMatchHistoryBackwards();
                    }
                }

                // Requests the previous set of matches from 10 games ago.
                forward() {
                    if (this.page > 1) {
                        this.disablePaging = true;
                        this.disableSelecting = true;
                        this.forwardPaging = true;
                        this.start = this.pageStart - 10;
                        this.pageFinish = this.pageStart;
                        this.page--;
                        this.playerRecentMatches = [];
                        this.count = 10;
                        this.getPlayerMatchHistoryForwards();
                    }
                }

                // Selects a match from the Side Nav and closes it.
                selectMatch(match) {
                    if (!(match === this.selected)) {
                        this.disableSelecting = true;
                        this.selected = match;

                        let sidenav: any = this.$mdSidenav("left");
                        if (sidenav.isOpen()) {
                            sidenav.close();
                        }
                        this.tabIndex = 0;
                    }
                }

                changeGamertag = function () {
                    this.disablePaging = true;
                    this.disableSelecting = true;
                    this.forwardPaging = false;
                    this.playerRecentMatches = [];
                    this.page = 1;
                    this.count = 10;
                    this.start = 0;
                    this.pageStart = 0;
                    this.match = null;
                    this.getPlayerMatchHistoryBackwards();
                }
            }]
    });
})();