(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("matchBattlesComponent", {
        templateUrl: "/components/match-battles-component/match.battles.component.html",
        controllerAs: "model",
        bindings: {
            match: "<",
            selected: "<",
            disablePaging: "<",
            disableSelecting: "="
        },
        controller: class MatchBattlesCtrl {
            $mdToast: any;
            $mdBottomSheet: any;
            $timeout: any;
            gameObjectsService: any;
            unitTypeService: any;

            battles: Array<any> = [];

            trainEvents: Array<any> = [];
            deathEvents: Array<any> = [];
            analizedArmiesPlayer1: Array<any> = [];
            analizedArmiesPlayer2: Array<any> = [];
            reinforcementsPlayer1: Array<any> = [];
            reinforcementsPlayer2: Array<any> = [];

            armiesPlayer1: Array<any> = [];
            armiesPlayer2: Array<any> = [];

            newArmyPlayer1: Array<any> = [];
            newArmyPlayer2: Array<any> = [];
            newReinforcementsPlayer1: Array<any> = [];
            newReinforcementsPlayer2: Array<any> = [];
            currentUnit: number = 0;

            small: boolean = true;
            hasSmall: boolean = false;
            medium: boolean = true;
            hasMedium: boolean = false;
            large: boolean = true;
            hasLarge: boolean = false;

            resourceMatchEvents: any;
            constructor($resource, $mdToast, $mdBottomSheet, $timeout, gameObjectsService, unitTypeService) {
                this.$mdToast = $mdToast;
                this.$mdBottomSheet = $mdBottomSheet;
                this.$timeout = $timeout;
                this.gameObjectsService = gameObjectsService;
                this.unitTypeService = unitTypeService;

                this.resourceMatchEvents = $resource("https://www.haloapi.com/stats/hw2/matches/:match/events",
                    {
                        match: "@match"
                    },
                    {
                        query: {
                            method: "GET",
                            headers: { "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                            isArray: false
                        }
                    });

                if (this.match != undefined) {
                    this.getMatchEvents();
                }
            }

            $onChanges(changes: any) {
                if (changes.match && this.match) {
                    this.hasSmall = false;
                    this.hasMedium = false;
                    this.hasLarge = false;

                    this.armiesPlayer1 = [];
                    this.reinforcementsPlayer1 = [];
                    this.armiesPlayer2 = [];
                    this.reinforcementsPlayer2 = [];

                    this.newArmyPlayer1 = [];
                    this.newArmyPlayer2 = [];
                    this.newReinforcementsPlayer1 = [];
                    this.newReinforcementsPlayer2 = [];
                    this.currentUnit = 0;
                    this.trainEvents = [];
                    this.deathEvents = [];
                    this.battles = [];
                    this.analizedArmiesPlayer1 = [];
                    this.analizedArmiesPlayer2 = [];
                    this.reinforcementsPlayer1 = [];
                    this.reinforcementsPlayer2 = [];
                    this.getMatchEvents();
                }
            }

            getNumber(num: number) {
                return new Array(num);
            }

            //---------------MATCH EVENTS----------------------//
            private getMatchEvents() {
                this.trainEvents = [];
                this.deathEvents = [];

                this.resourceMatchEvents.query({ match: this.match })
                    .$promise.then((events) => {
                        //console.log("Req API");
                        events = events["GameEvents"];
                        events.forEach((event) => {
                            this.createPlayerEvents(event);
                        });

                        this.processBattles();
                        this.processArmies();
                        this.battleAnalytics();
                        this.settleLastBattle();
                        this.getTotalArmyCost();
                        this.battles[0].chart = true;
                        if (this.disablePaging === true) {
                            this.disableSelecting = true;
                        }
                        else {
                            this.disableSelecting = false;
                            this.disablePaging = false;
                        }

                        // Emptying unused arrays.
                        this.armiesPlayer1 = null;
                        this.armiesPlayer2 = null;
                        this.deathEvents = null;
                        this.newArmyPlayer1 = null;
                        this.newArmyPlayer2 = null;
                        this.newReinforcementsPlayer1 = null;
                        this.newReinforcementsPlayer2 = null;
                        this.player1TemporaryArmy = null;
                        this.player2TemporaryArmy = null;
                        this.trainEvents = null;
                        this.fanalizedArmiesPlayer1 = this.analizedArmiesPlayer1;
                        this.freinforcementsPlayer1 = this.reinforcementsPlayer1;
                        this.fanalizedArmiesPlayer2 = this.analizedArmiesPlayer2;
                        this.freinforcementsPlayer2 = this.reinforcementsPlayer2;
                        this.fbattles = this.battles;
                    })
                    .catch((error) => {
                        alert("Could not contact the HALO API Match Events services.")
                        console.log(error);
                    });
            }

            // Takes the application relevant data from the Events API.
            private createPlayerEvents(item: any) {
                if (item["EventName"] === "UnitTrained") {
                    if (item["SquadId"].includes("cov") || item["SquadId"].includes("unsc")) {
                        this.trainEvents.push(item);
                    }
                }

                if (item["EventName"] === "Death") {
                    if (item["VictimObjectTypeId"].includes("cov") || item["VictimObjectTypeId"].includes("unsc")) {
                        this.deathEvents.push(item);
                    }
                }
            }

            //---------------PROCESS BATTLES----------------------//
            // Process which units died at each battle and classifies battles by size 
            // When units die in quick succession they are linked inside a single battle. 
            // When the killing stops, the battle is classified and logged in the "battles" array.
            private processBattles() {
                let newBattle: Array<any> = [];
                let gameObject: any = this.gameObjectsService.find(this.deathEvents[0].VictimObjectTypeId);
                if (gameObject) {
                    this.deathEvents[0].mediaUrl = gameObject.mediaUrl;
                    this.deathEvents[0].name = gameObject.name;
                }
                newBattle.push(this.deathEvents[0]);

                for (var i = 1; i < this.deathEvents.length; i++) {
                    let death: any = this.deathEvents[i];
                    gameObject = this.gameObjectsService.find(death.VictimObjectTypeId);
                    if (gameObject) {
                        death.mediaUrl = gameObject.mediaUrl;
                        death.name = gameObject.name;
                    }
                    if (((this.deathEvents[i])["TimeSinceStartMilliseconds"] - (this.deathEvents[i - 1])["TimeSinceStartMilliseconds"]) <= 30000) {
                        newBattle.push(death);
                    }
                    else {
                        this.classifyBattle(newBattle, (newBattle[0])["TimeSinceStartMilliseconds"], (newBattle[newBattle.length - 1])["TimeSinceStartMilliseconds"]);
                        newBattle = [];
                        newBattle.push(death);
                    }

                    if (i === (this.deathEvents.length - 1)) {
                        this.classifyBattle(newBattle, (newBattle[0])["TimeSinceStartMilliseconds"], (newBattle[newBattle.length - 1])["TimeSinceStartMilliseconds"]);
                    }
                }
            }

            // Converts flat integer value of time into hours:minutes:seconds format.
            secondsToTime = function (time: any) {
                time = time / 1000;
                let hours: number = Math.floor((time / 60) / 60);
                let minutes: number = Math.floor(time / 60);
                let seconds: number = Math.floor(time - ((hours * 60) * 60) - (minutes * 60));
                return (minutes < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
            }

            // Determines if a battle is small, medium or large scale. It adds the starting and finishing time to the object.
            private classifyBattle(deathsByBattle: any, start: number, finish: number) {
                if (deathsByBattle.length > 0) {
                    if (deathsByBattle.length > 0 && deathsByBattle.length <= 10) {
                        this.hasSmall = true;
                        this.battles.push({
                            start: start,
                            finish: finish,
                            deaths: deathsByBattle,
                            size: "Small",
                            chart: false
                        });
                    }
                    if (deathsByBattle.length > 10 && deathsByBattle.length <= 30) {
                        this.hasMedium = true;
                        this.battles.push({
                            start: start,
                            finish: finish,
                            deaths: deathsByBattle,
                            size: "Medium",
                            chart: false
                        });
                    }
                    if (deathsByBattle.length > 30) {
                        this.hasLarge = true;
                        this.battles.push({
                            start: start,
                            finish: finish,
                            deaths: deathsByBattle,
                            size: "Large",
                            chart: false
                        });
                    }
                }
            }

            //---------------PROCESS ARMIES----------------------//
            // Process which units composed the armies at each battle  
            // Units that were trained before the battle starts are considered starting armies. 
            // Units that were trained after the battle stats and before it ends are considered reinforcement armies.
            private processArmies() {
                this.battles.forEach((battle) => {
                    this.armiesPlayer1.push([]);
                    this.armiesPlayer2.push([]);
                    this.reinforcementsPlayer1.push([]);
                    this.reinforcementsPlayer2.push([]);
                });
                this.trainEvents.forEach((unit) => {
                    for (var i = 0; i < this.battles.length; i++) {
                        if (unit["TimeSinceStartMilliseconds"] <= (this.battles[i])["start"]) {
                            this.classifyArmy(unit, i);
                            i = 1000;
                        }
                        else {
                            if (unit["TimeSinceStartMilliseconds"] <= (this.battles[i]["finish"])) {
                                this.classifyReinforcement(unit, i);
                                i = 1000;
                            }
                        }
                    }
                });
            };

            // Adds the game object data to the unit and splits the armies into players.
            private classifyArmy(unit: any, i: number) {
                unit = this.populateUnitData(unit);
                if (unit["PlayerIndex"] === 1) {
                    //newArmyPlayer1.push(unit);
                    this.armiesPlayer1[i].push(unit);
                }
                if (unit["PlayerIndex"] === 2) {
                    //newArmyPlayer2.push(unit);
                    this.armiesPlayer2[i].push(unit);
                }
            };

            // Adds the game object data to the unit and splits the reinforcements into players.
            private classifyReinforcement(unit: any, i: number) {
                unit = this.populateUnitData(unit);
                if (unit["PlayerIndex"] === 1) {
                    this.reinforcementsPlayer1[i].push(unit);
                }
                if (unit["PlayerIndex"] === 2) {
                    this.reinforcementsPlayer2[i].push(unit);
                }
            };

            // Whether the unit is a reinforcement or an army piece, there's basic data the unit needs.
            private populateUnitData(unit: any) {
                let gameObject: any = this.gameObjectsService.find(unit.SquadId);
                if (gameObject != null) {
                    unit.mediaUrl = gameObject.mediaUrl;
                    unit.category = gameObject.category;
                    unit.name = gameObject.name;
                    unit.affinities = {
                        air: gameObject.againstAir,
                        vehicle: gameObject.againstVehicles,
                        infantry: gameObject.againstInfantry
                    };
                }
                else {
                    unit.mediaUrl = "";
                    unit.category = "";
                    unit.name = unit.SquadId;
                    unit.affinities = {
                        air: "NotApplicable",
                        vehicle: "NotApplicable",
                        infantry: "NotApplicable"
                    };
                }
                unit.type = this.unitTypeService.find(unit.SquadId);
                unit.span = (unit.type === "SUPER" || unit.type === "ULTIMATE") ? 2 : 1;
                if (unit["PlayerIndex"] === 1) {
                    unit.background = (unit.type === "HERO") ? "#FFC107" : ((unit.type === "UNIT") ? "#ff8a80" : "rgb(75,50,50)");
                }
                if (unit["PlayerIndex"] === 2) {
                    unit.background = (unit.type === "HERO") ? "#FFC107" : ((unit.type === "UNIT") ? "#80d8ff" : "rgb(50,50,75)");
                }
                return unit;
            }

            //---------------BATTLE ANALYTICS----------------------//
            // (Army + Reinforcement) - Deaths = Remainder.
            // Remainder is then added to the next army.
            // The end result of the 3 arrays is what will be displayed in the UI.
            player1TemporaryArmy: Array<any> = [];
            player2TemporaryArmy: Array<any> = [];
            private battleAnalytics() {
                this.player1TemporaryArmy = [];
                this.player2TemporaryArmy = [];
                //model.killCount = 0;

                for (var i = 0; i < this.battles.length; i++) {
                    this.armiesPlayer1[i] = (this.armiesPlayer1[i]).concat(this.player1TemporaryArmy);
                    this.armiesPlayer2[i] = (this.armiesPlayer2[i]).concat(this.player2TemporaryArmy);
                    this.player1TemporaryArmy = (this.armiesPlayer1[i]).concat(this.reinforcementsPlayer1[i]);
                    this.player2TemporaryArmy = (this.armiesPlayer2[i]).concat(this.reinforcementsPlayer2[i]);

                    this.tagUnitsKilled(i);
                    this.killUnits(i);

                    this.player1TemporaryArmy = JSON.parse(JSON.stringify(this.player1TemporaryArmy));
                    this.player2TemporaryArmy = JSON.parse(JSON.stringify(this.player2TemporaryArmy));
                }

                this.analizedArmiesPlayer1 = JSON.parse(JSON.stringify(this.armiesPlayer1));
                this.analizedArmiesPlayer2 = JSON.parse(JSON.stringify(this.armiesPlayer2));
                this.reinforcementsPlayer1 = JSON.parse(JSON.stringify(this.reinforcementsPlayer1));
                this.reinforcementsPlayer2 = JSON.parse(JSON.stringify(this.reinforcementsPlayer2));
            }

            // Tags the units from the armies as killed but does not remove them from the arrays.
            // The UI will then show these tagged units as killed in a different color for easy reference.
            private tagUnitsKilled(battleIndex: number) {
                (this.battles[battleIndex])["deaths"].forEach((kill) => {
                    for (var i = 0; i < this.player1TemporaryArmy.length; i++) {
                        let unit: any = this.player1TemporaryArmy[i];
                        if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                            this.tagUnit(unit, kill);
                            i = this.player1TemporaryArmy.length + 1;
                        }
                    }

                    for (var i = 0; i < this.player2TemporaryArmy.length; i++) {
                        let unit: any = this.player2TemporaryArmy[i];
                        if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                            this.tagUnit(unit, kill);
                            i = this.player2TemporaryArmy.length + 1;
                        }
                    }
                });
            }

            private tagUnit(unit: any, kill: any) {
                unit.killed = true;
                unit.Killers = [];
                kill.Killers = [];
                let Participants: Array<any> = kill["Participants"];

                Object.keys(Participants).map((e) => {
                    let participant: any = (Participants[e])["ObjectParticipants"];
                    Object.keys(participant).map((a) => {
                        let gameObject: any = this.gameObjectsService.find(a);
                        unit.Killers.push({
                            mediaUrl: (gameObject) ? gameObject.mediaUrl : "",
                            name: (gameObject) ? gameObject.name : a
                        });
                        kill.Killers.push({
                            mediaUrl: (gameObject) ? gameObject.mediaUrl : "",
                            name: (gameObject) ? gameObject.name : a
                        });
                    });
                });
            }

            // Takes a specific battle to remove units from the temporary armies before adding them to each player.
            private killUnits(battleIndex: number) {
                this.deathEvents.forEach((kill) => {
                    if (kill["TimeSinceStartMilliseconds"] <= (this.battles[battleIndex])["finish"]) {
                        let gameObject: any = this.gameObjectsService.find(kill["VictimObjectTypeId"]); //searchGameObject(kill["VictimObjectTypeId"]);
                        kill.SupplyCost = (gameObject) ? gameObject.supplyCost : 0;
                        kill.EnergyCost = (gameObject) ? gameObject.energyCost : 0;
                        kill.PopulationCost = (gameObject) ? gameObject.populationCost : 0;

                        for (var i = 0; i < this.player1TemporaryArmy.length; i++) {
                            let unit: any = this.player1TemporaryArmy[i];
                            if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                                this.player1TemporaryArmy.splice(i, 1);
                                //model.killCount++;
                                kill.processed = true;
                                i = this.player1TemporaryArmy.length + 1;
                            }
                        }

                        for (var i = 0; i < this.player2TemporaryArmy.length; i++) {
                            let unit: any = this.player2TemporaryArmy[i];
                            if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                                this.player2TemporaryArmy.splice(i, 1);
                                //model.killCount++;
                                kill.processed = true;
                                i = this.player2TemporaryArmy.length + 1;
                            }
                        }
                    }
                    return;
                });
            }

            private settleLastBattle() {
                this.analizedArmiesPlayer1[this.analizedArmiesPlayer1.length - 1].forEach((unit) => {
                    this.deathEvents.forEach((death) => {
                        if ((unit["InstanceId"] === death["VictimInstanceId"]) && (!unit.killed)) {
                            this.tagUnit(unit, death);
                            this.battles[this.battles.length - 1].deaths.push(death);
                        }
                    });
                });
                this.analizedArmiesPlayer2[this.analizedArmiesPlayer2.length - 1].forEach((unit) => {
                    this.deathEvents.forEach((death) => {
                        if ((unit["InstanceId"] === death["VictimInstanceId"]) && (!unit.killed)) {
                            this.tagUnit(unit, death);
                            this.battles[this.battles.length - 1].deaths.push(death);
                        }
                    });
                });
                this.reinforcementsPlayer1[this.reinforcementsPlayer1.length - 1].forEach((unit) => {
                    this.deathEvents.forEach((death) => {
                        if ((unit["InstanceId"] === death["VictimInstanceId"]) && (!unit.killed)) {
                            this.tagUnit(unit, death);
                            this.battles[this.battles.length - 1].deaths.push(death);
                        }
                    });
                });
                this.reinforcementsPlayer2[this.reinforcementsPlayer2.length - 1].forEach((unit) => {
                    this.deathEvents.forEach((death) => {
                        if ((unit["InstanceId"] === death["VictimInstanceId"]) && (!unit.killed)) {
                            this.tagUnit(unit, death);
                            this.battles[this.battles.length - 1].deaths.push(death);
                        }
                    });
                });
            }

            // Calculate army costs, losses and battle winner.
            private getTotalArmyCost() {
                for (var i = 0; i < this.battles.length; i++) {
                    let battle: any = this.battles[i];
                    battle.SupplyLost1 = 0;
                    battle.RSupplyLost1 = 0;
                    battle.SupplyCost1 = 0;
                    battle.RSupplyCost1 = 0;

                    battle.EnergyCost1 = 0;
                    battle.REnergyCost1 = 0;
                    battle.EnergyLost1 = 0;
                    battle.REnergyLost1 = 0;

                    battle.PopulationCost1 = 0;
                    battle.RPopulationCost1 = 0;
                    battle.PopulationLost1 = 0;
                    battle.RPopulationLost1 = 0;

                    battle.SupplyCost2 = 0;
                    battle.RSupplyCost2 = 0;
                    battle.SupplyLost2 = 0;
                    battle.RSupplyLost2 = 0;

                    battle.EnergyCost2 = 0;
                    battle.REnergyCost2 = 0;
                    battle.EnergyLost2 = 0;
                    battle.REnergyLost2 = 0;

                    battle.PopulationCost2 = 0;
                    battle.RPopulationCost2 = 0;
                    battle.PopulationLost2 = 0;
                    battle.RPopulationLost2 = 0;

                    this.analizedArmiesPlayer1[i].forEach((unit) => {
                        battle.SupplyCost1 = ((battle.SupplyCost1) ? battle.SupplyCost1 : 0) + Number(unit.SupplyCost);
                        battle.EnergyCost1 = ((battle.EnergyCost1) ? battle.EnergyCost1 : 0) + Number(unit.EnergyCost);
                        battle.PopulationCost1 = ((battle.PopulationCost1) ? battle.PopulationCost1 : 0) + Number(unit.PopulationCost);
                        if (unit.killed) {
                            battle.SupplyLost1 = ((battle.SupplyLost1) ? battle.SupplyLost1 : 0) + Number(unit.SupplyCost);
                            battle.EnergyLost1 = ((battle.EnergyLost1) ? battle.EnergyLost1 : 0) + Number(unit.EnergyCost);
                            battle.PopulationLost1 = ((battle.PopulationLost1) ? battle.PopulationLost1 : 0) + Number(unit.PopulationCost);
                        }
                    });
                    this.analizedArmiesPlayer2[i].forEach((unit) => {
                        battle.SupplyCost2 = ((battle.SupplyCost2) ? battle.SupplyCost2 : 0) + Number(unit.SupplyCost);
                        battle.EnergyCost2 = ((battle.EnergyCost2) ? battle.EnergyCost2 : 0) + Number(unit.EnergyCost);
                        battle.PopulationCost2 = ((battle.PopulationCost2) ? battle.PopulationCost2 : 0) + Number(unit.PopulationCost);
                        if (unit.killed) {
                            battle.SupplyLost2 = ((battle.SupplyLost2) ? battle.SupplyLost2 : 0) + Number(unit.SupplyCost);
                            battle.EnergyLost2 = ((battle.EnergyLost2) ? battle.EnergyLost2 : 0) + Number(unit.EnergyCost);
                            battle.PopulationLost2 = ((battle.PopulationLost2) ? battle.PopulationLost2 : 0) + Number(unit.PopulationCost);
                        }
                    });
                    this.reinforcementsPlayer1[i].forEach((unit) => {
                        battle.RSupplyCost1 = ((battle.RSupplyCost1) ? battle.RSupplyCost1 : 0) + Number(unit.SupplyCost);
                        battle.REnergyCost1 = ((battle.REnergyCost1) ? battle.REnergyCost1 : 0) + Number(unit.EnergyCost);
                        battle.RPopulationCost1 = ((battle.RPopulationCost1) ? battle.RPopulationCost1 : 0) + Number(unit.PopulationCost);
                        if (unit.killed) {
                            battle.RSupplyLost1 = ((battle.RSupplyLost1) ? battle.RSupplyLost1 : 0) + Number(unit.SupplyCost);
                            battle.REnergyLost1 = ((battle.REnergyLost1) ? battle.REnergyLost1 : 0) + Number(unit.EnergyCost);
                            battle.RPopulationLost1 = ((battle.RPopulationLost1) ? battle.RPopulationLost1 : 0) + Number(unit.PopulationCost);
                        }
                    });
                    this.reinforcementsPlayer2[i].forEach((unit) => {
                        battle.RSupplyCost2 = ((battle.RSupplyCost2) ? battle.RSupplyCost2 : 0) + Number(unit.SupplyCost);
                        battle.REnergyCost2 = ((battle.REnergyCost2) ? battle.REnergyCost2 : 0) + Number(unit.EnergyCost);
                        battle.RPopulationCost2 = ((battle.RPopulationCost2) ? battle.RPopulationCost2 : 0) + Number(unit.PopulationCost);
                        if (unit.killed) {
                            battle.RSupplyLost2 = ((battle.RSupplyLost2) ? battle.RSupplyLost2 : 0) + Number(unit.SupplyCost);
                            battle.REnergyLost2 = ((battle.REnergyLost2) ? battle.REnergyLost2 : 0) + Number(unit.EnergyCost);
                            battle.RPopulationLost2 = ((battle.RPopulationLost2) ? battle.RPopulationLost2 : 0) + Number(unit.PopulationCost);
                        }
                    });

                    if (
                        (Number(battle.RPopulationCost1 - battle.RPopulationLost1) + Number(battle.PopulationCost1 - battle.PopulationLost1))
                        >
                        (Number(battle.RPopulationCost2 - battle.RPopulationLost2) + Number(battle.PopulationCost2 - battle.PopulationLost2))
                    ) {
                        battle.winner = 1;
                    }

                    if (
                        ((battle.RPopulationCost1 - battle.RPopulationLost1) + (battle.PopulationCost1 - battle.PopulationLost1))
                        <
                        ((battle.RPopulationCost2 - battle.RPopulationLost2) + (battle.PopulationCost2 - battle.PopulationLost2))
                    ) {
                        battle.winner = 2;
                    }
                }
            }

            showCharts(battle: any) {
                battle.chart = !battle.chart;
            }

            // Removes a battle from the arrays, this allows the user to clean up undesired battles.
            removeBattle = function (battle: any) {
                let foundIndex: number = this.battles.indexOf(battle);
                this.battles.splice(foundIndex, 1);
                this.analizedArmiesPlayer1.splice(foundIndex, 1);
                this.analizedArmiesPlayer2.splice(foundIndex, 1);
                this.reinforcementsPlayer1.splice(foundIndex, 1);
                this.reinforcementsPlayer2.splice(foundIndex, 1);
                this.openToast("Battle was removed");
            }

            // Shows a brief toast message when a battle is removed.
            private openToast(message: string) {
                this.$mdToast.show(this.$mdToast.simple()
                    .textContent(message)
                    .position("top right")
                    .hideDelay(3000));
            }

            // Shows only the battles filtered.
            showBattle(index: number) {
                let size: number = this.battles[index].size;
                if ((this.battles[index].size === "Small") && (this.small)) {
                    return true;
                }
                if ((this.battles[index].size === "Medium") && (this.medium)) {
                    return true;
                }
                if ((this.battles[index].size === "Large") && (this.large)) {
                    return true;
                }
                return false;
            }

            // An unit from the battle can be clicked to reveal detailed information for that specific unit.
            // This creates a Bottom Sheet component from Angular Material to display the information.
            selectUnit($event: any, unit: any) {
                this.$mdBottomSheet.show({
                    parent: angular.element(document.getElementById("wrapper")),
                    templateUrl: "/components/unit-panel-component/unit.panel.component.html",
                    controller: UnitPanelController,
                    locals: {
                        Item: {
                            "unit": unit
                        }
                    },
                    controllerAs: "model",
                    bindToController: true,
                    targetEvent: $event
                }).then((clickedItem) => {
                    ///clickedItem && console.log(clickedItem.SquadId + "clicked!");
                })
            }

            // This is a callback function that executes whenever the battle component finishes rendering.
            display() {
                this.$timeout(() => {
                    this.disableSelecting = false;
                }, 0);
            }

            switchSmall() {
                if (this.small === true) {
                    this.disableSelecting = true;
                }
            }

            switchMedium() {
                if (this.medium === true) {
                    this.disableSelecting = true;
                }
            }

            switchLarge() {
                if (this.large === true) {
                    this.disableSelecting = true;
                }
            };
        }
    });
}());