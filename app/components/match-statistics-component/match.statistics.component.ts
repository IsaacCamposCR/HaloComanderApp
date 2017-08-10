(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("matchStatisticsComponent", {
        templateUrl: "/components/match-statistics-component/match.statistics.component.html",
        controllerAs: "model",
        bindings: {
            selected: "<",
            disableSelecting: "<",
            shareMatch: "="
        },
        controller: ["$resource", "gameObjectsService", "gameLeadersService", "playerSeasonService", "gameMapsService",

            class MatchStatisticsCtrl {

                resourceMatchResult: any;
                gameObjectsService: any;
                gameLeadersService: any;
                playerSeasonService: any;
                gameMapsService: any;

                constructor($resource, gameObjectsService, gameLeadersService, playerSeasonService, gameMapsService) {
                    this.gameObjectsService = gameObjectsService;
                    this.gameLeadersService = gameLeadersService;
                    this.playerSeasonService = playerSeasonService;
                    this.gameMapsService = gameMapsService;

                    this.resourceMatchResult = $resource("https://www.haloapi.com/stats/hw2/matches/:matchId",
                        {
                            matchId: "@matchId"
                        },
                        {
                            query: {
                                method: "GET",
                                headers: { "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                                isArray: false
                            }
                        });

                    if (this.selected) {
                        this.getMatchResults();
                    }
                }

                $onChanges(changes) {
                    if (changes.selected && this.selected) {
                        this.getMatchResults();
                    }
                }

                shareMatch: string;
                matchResult: any;
                playerSeasons: any;
                getMatchResults() {
                    this.determinateValue = 0;
                    this.matchResult = null;

                    this.resourceMatchResult.query({ matchId: this.selected.matchId })
                        .$promise.then((objects) => {

                            this.determinateValue = 20;
                            //console.log("Req API");
                            this.matchResult = {};
                            this.playerSeasons = {};

                            let gameMode: any = objects["GameMode"];
                            let duration: any = objects["MatchDuration"];
                            let gameMap: any = this.gameMapsService.find(objects["MapId"]);
                            let date: any = (objects["MatchStartDate"])["ISO8601Date"];
                            let player1: string = (((objects["Players"])["1"])["HumanPlayerId"])["Gamertag"];
                            let outcome1: any = ((objects["Players"])["1"])["PlayerMatchOutcome"];
                            let leader1: string = ((objects["Players"])["1"])["LeaderId"];
                            let unitStats1: any = ((objects["Players"])["1"])["UnitStats"];
                            let player2: string = (((objects["Players"])["2"])["HumanPlayerId"])["Gamertag"];
                            let outcome2: any = ((objects["Players"])["2"])["PlayerMatchOutcome"];
                            let leader2: string = ((objects["Players"])["2"])["LeaderId"];
                            let unitStats2: any = ((objects["Players"])["2"])["UnitStats"];
                            let units1: Array<any> = [];
                            let units2: Array<any> = [];

                            Object.keys(unitStats1).map((e) => {
                                let gameObject: any = this.gameObjectsService.find(e);
                                if (gameObject != null) {
                                    units1.push({
                                        TotalBuilt: (unitStats1[e])["TotalBuilt"],
                                        TotalLost: (unitStats1[e])["TotalLost"],
                                        TotalDestroyed: (unitStats1[e])["TotalDestroyed"],
                                        mediaUrl: gameObject.mediaUrl,
                                        name: gameObject.name
                                    });
                                }
                            });
                            this.determinateValue = 30;

                            Object.keys(unitStats2).map((e) => {
                                let gameObject: any = this.gameObjectsService.find(e);
                                if (gameObject != null) {
                                    units2.push({
                                        TotalBuilt: (unitStats2[e])["TotalBuilt"],
                                        TotalLost: (unitStats2[e])["TotalLost"],
                                        TotalDestroyed: (unitStats2[e])["TotalDestroyed"],
                                        mediaUrl: gameObject.mediaUrl,
                                        name: gameObject.name
                                    });
                                }
                            });
                            this.determinateValue = 40;

                            this.matchResult.gameMode = gameMode;
                            let isoDuration: any = this.parseISO(duration);
                            this.matchResult.date = date;
                            this.matchResult.duration = ((isoDuration.hours < 10) ? "0" + isoDuration.hours : isoDuration.hours) + ":" + ((isoDuration.minutes < 10) ? "0" + isoDuration.minutes : isoDuration.minutes) + ":" + ((isoDuration.seconds < 10) ? "0" + Math.trunc(isoDuration.seconds) : Math.trunc(isoDuration.seconds));
                            this.matchResult.player1 = player1;
                            this.selected.player1 = player1;
                            this.selected.leader1 = this.gameLeadersService.find(leader1);
                            this.determinateValue = 50;
                            this.matchResult.outcome1 = outcome1;
                            this.matchResult.units1 = units1;
                            this.matchResult.player2 = player2;
                            this.selected.player2 = player2;
                            this.selected.leader2 = this.gameLeadersService.find(leader2);
                            this.determinateValue = 60;
                            this.matchResult.outcome2 = outcome2;
                            this.matchResult.units2 = units2;
                            this.selected.map = gameMap.name;
                            this.selected.mapMediaUrl = gameMap.mediaUrl;
                            this.shareMatch = { waypoint: "", tracker: "" };
                            this.shareMatch.waypoint = `https://www.halowaypoint.com/en-us/games/halo-wars-2/matches/${this.selected.matchId}/players/${this.selected.player1}?gameHistoryMatchIndex=0&gameHistoryGameModeFilter=All`;
                            this.shareMatch.tracker = `https://www.commanderapp.net/match/${this.selected.matchId}`;
                            this.getPlayerSeasons();
                        })
                        .catch((error) => {
                            alert("Could not contact the HALO API Match Result services.")
                            console.log(error);
                        });
                }

                getPlayerSeasons() {
                    this.playerSeasonService.find(this.selected.player1).$promise
                        .then((playerSeasonData) => {
                            this.matchResult.season1 = this.playerSeasonService.create(playerSeasonData);
                            this.determinateValue += 20;
                        })
                        .catch((error) => {
                            alert("Could not contact the HALO API Player Season services.")
                            console.log(error);
                        });
                    this.playerSeasonService.find(this.selected.player2).$promise
                        .then((playerSeasonData) => {
                            this.matchResult.season2 = this.playerSeasonService.create(playerSeasonData);
                            this.determinateValue += 20;
                        })
                        .catch((error) => {
                            alert("Could not contact the HALO API Player Season services.")
                            console.log(error);
                        });
                }

                numbers: string = '\\d+(?:[\\.,]\\d{0,3})?';
                weekPattern: string = '(' + this.numbers + 'W)';
                datePattern: string = '(' + this.numbers + 'Y)?(' + this.numbers + 'M)?(' + this.numbers + 'D)?';
                timePattern: string = 'T(' + this.numbers + 'H)?(' + this.numbers + 'M)?(' + this.numbers + 'S)?';
                iso8601: string = 'P(?:' + this.weekPattern + '|' + this.datePattern + '(?:' + this.timePattern + ')?)';
                objMap: Array<string> = ['weeks', 'years', 'months', 'days', 'hours', 'minutes', 'seconds'];
                pattern: any = new RegExp(this.iso8601);
                parseISO(durationString: string) {
                    // slice away first entry in match-array
                    return durationString.match(this.pattern).slice(1).reduce((prev, next, idx) => {
                        prev[this.objMap[idx]] = parseFloat(next) || 0;
                        return prev;
                    }, {});
                };
            }]
    });
}());