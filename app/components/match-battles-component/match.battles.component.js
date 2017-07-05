(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("matchBattlesComponent", {
        templateUrl: "/components/match-battles-component/match.battles.component.html",
        controllerAs: "model",
        controller: ["$resource", "$mdToast", "$mdBottomSheet", "gameObjectsService", matchBattlesController],
        bindings: {
            match: "<",
            selected: "<"
        }
    });

    function matchBattlesController($resource, $mdToast, $mdBottomSheet, gameObjectsService) {
        var model = this;
        model.battles = [];
        model.killCount = 0;
        model.trainEvents = [];
        model.deathEvents = [];
        //model.battles = [];
        model.analizedArmiesPlayer1 = [];
        model.analizedArmiesPlayer2 = [];
        model.reinforcementsPlayer1 = [];
        model.reinforcementsPlayer2 = [];

        model.armiesPlayer1 = [];
        //model.reinforcementsPlayer1 = [];
        model.armiesPlayer2 = [];
        //model.reinforcementsPlayer2 = [];

        var newArmyPlayer1 = [];
        var newArmyPlayer2 = [];
        var newReinforcementsPlayer1 = [];
        var newReinforcementsPlayer2 = [];
        var currentUnit = 0;
        
        var resourceMatchEvents = $resource("https://www.haloapi.com/stats/hw2/matches/:match/events",
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

        model.$onInit = function () {
            model.small = true;
            model.medium = true;
            model.large = true;
            if (model.match != undefined) {
                getMatchEvents();
            }
        };

        model.$onChanges = function (changes) {
            if (changes.match && model.match) {
                model.armiesPlayer1 = [];
                model.reinforcementsPlayer1 = [];
                model.armiesPlayer2 = [];
                model.reinforcementsPlayer2 = [];

                newArmyPlayer1 = [];
                newArmyPlayer2 = [];
                newReinforcementsPlayer1 = [];
                newReinforcementsPlayer2 = [];
                currentUnit = 0;
                model.trainEvents = [];
                model.deathEvents = [];
                model.battles = [];
                model.analizedArmiesPlayer1 = [];
                model.analizedArmiesPlayer2 = [];
                model.reinforcementsPlayer1 = [];
                model.reinforcementsPlayer2 = [];
                getMatchEvents();
            }
        };

        model.getNumber = function (num) {
            return new Array(num);
        };

        //---------------MATCH EVENTS----------------------//
        var getMatchEvents = function () {
            model.trainEvents = [];
            model.deathEvents = [];

            var matchEvents = resourceMatchEvents.query({ match: model.match })
                .$promise.then(function (events) {
                    console.log("Req API");
                    //console.log(events["IsCompleteSetOfEvents"]);
                    events = events["GameEvents"];
                    events.forEach(function (event) {
                        createPlayerEvents(event);
                    });

                    processBattles();
                    processArmies();
                    battleAnalytics();
                    settleLastBattle();
                    getTotalArmyCost();
                });

            // Takes the application relevant data from the Events API.
            var createPlayerEvents = function (item) {
                if (item["EventName"] === "UnitTrained") {
                    //console.log(item);
                    model.trainEvents.push(item);
                }

                if (item["EventName"] === "Death") {
                    //console.log(item);
                    model.deathEvents.push(item);
                }
            };
        };

        //---------------PROCESS BATTLES----------------------//
        // Process which units died at each battle and classifies battles by size 
        // When units die in quick succession they are linked inside a single battle. 
        // When the killing stops, the battle is classified and logged in the "battles" array.
        var processBattles = function () {
            var newBattle = [];
            var gameObject = gameObjectsService.find(model.deathEvents[0].VictimObjectTypeId); //searchGameObject(model.deathEvents[0].VictimObjectTypeId);
            if (gameObject) {
                model.deathEvents[0].mediaUrl = gameObject.mediaUrl;
                model.deathEvents[0].name = gameObject.name;
            }
            newBattle.push(model.deathEvents[0]);

            for (var i = 1; i < model.deathEvents.length; i++) {
                //console.log("New Kill!");
                var death = model.deathEvents[i];
                var gameObject = gameObjectsService.find(death.VictimObjectTypeId); //searchGameObject(death.VictimObjectTypeId);
                if (gameObject) {
                    death.mediaUrl = gameObject.mediaUrl;
                    death.name = gameObject.name;
                }
                if (((model.deathEvents[i])["TimeSinceStartMilliseconds"] - (model.deathEvents[i - 1])["TimeSinceStartMilliseconds"]) <= 30000) {
                    //console.log("Same Battle");
                    newBattle.push(death);
                }
                else {
                    classifyBattle(newBattle, (newBattle[0])["TimeSinceStartMilliseconds"], (newBattle[newBattle.length - 1])["TimeSinceStartMilliseconds"]);
                    //console.log("New Battle");
                    newBattle = [];
                    newBattle.push(death);
                    if (i === model.deathEvents.length) {
                        classifyBattle(newBattle, (newBattle[0])["TimeSinceStartMilliseconds"], (newBattle[newBattle.length - 1])["TimeSinceStartMilliseconds"]);
                    }
                }
            }
        };

        // Converts flat integer value of time into hours:minutes:seconds format.
        model.secondsToTime = function (time) {
            var time = time / 1000;
            var hours = Math.floor((time / 60) / 60);
            var minutes = Math.floor(time / 60);
            var seconds = Math.floor(time - ((hours * 60) * 60) - (minutes * 60));
            return (minutes < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
        };

        // Determines if a battle is small, medium or large scale. It adds the starting and finishing time to the object.
        var classifyBattle = function (deathsByBattle, start, finish) {
            if (deathsByBattle.length > 0) {
                if (deathsByBattle.length > 0 && deathsByBattle.length <= 10) {
                    model.battles.push({
                        start: start,
                        finish: finish,
                        deaths: deathsByBattle,
                        size: "Small"
                    });
                }
                if (deathsByBattle.length > 10 && deathsByBattle.length <= 30) {
                    model.battles.push({
                        start: start,
                        finish: finish,
                        deaths: deathsByBattle,
                        size: "Medium"
                    });
                }
                if (deathsByBattle.length > 30) {
                    model.battles.push({
                        start: start,
                        finish: finish,
                        deaths: deathsByBattle,
                        size: "Large"
                    });
                }
            }
        };

        //---------------PROCESS ARMIES----------------------//
        // Process which units composed the armies at each battle  
        // Units that were trained before the battle starts are considered starting armies. 
        // Units that were trained after the battle stats and before it ends are considered reinforcement armies.
        var processArmies = function () {
            for (var i = 0; i < model.battles.length; i++) {
                var battle = model.battles[i];
                newArmyPlayer1 = [];
                newArmyPlayer2 = [];
                newReinforcementsPlayer1 = [];
                newReinforcementsPlayer2 = [];
                for (var a = currentUnit; a < model.trainEvents.length; a++) {
                    var unitTrained = model.trainEvents[a];
                    //console.log("Current unit", currentUnit);
                    if (unitTrained["TimeSinceStartMilliseconds"] <= battle["start"]) {
                        classifyArmy(unitTrained);
                    }
                    else {
                        if (unitTrained["TimeSinceStartMilliseconds"] <= (model.battles[i])["finish"]) {
                            classifyReinforcement(unitTrained);
                        }
                        else {
                            currentUnit = Number(a);
                            //console.log("updating current unit", currentUnit);
                            a = model.trainEvents.length;
                        }
                    }
                }
                model.armiesPlayer1.push(newArmyPlayer1);
                model.armiesPlayer2.push(newArmyPlayer2);
                model.reinforcementsPlayer1.push(newReinforcementsPlayer1);
                model.reinforcementsPlayer2.push(newReinforcementsPlayer2);
            }
        }


        var processArmies2 = function () {
            //var armyCount = 0;
            //var reinCount = 0;
            //console.log(model.battles);
            for (var i = 0; i < model.battles.length; i++) {
                //console.log("Battle", i);
                //console.log("train", model.trainEvents.length);
                for (var a = currentUnit; a < model.trainEvents.length; a++) {
                    var battle = model.battles[i];
                    var unitTrained = model.trainEvents[a];

                    if (unitTrained["TimeSinceStartMilliseconds"] <= battle["start"]) {
                        //console.log("Army unit!");
                        //armyCount++;
                        classifyArmy(unitTrained);
                    }
                    else {
                        if (unitTrained["TimeSinceStartMilliseconds"] <= (model.battles[i])["finish"]) {
                            //console.log("Reinforcement unit!");
                            //reinCount++;
                            classifyReinforcement(unitTrained);
                        }
                        else {
                            //console.log("New Army!");
                            currentUnit = Number(a + 1);
                            a = model.trainEvents.length;
                            model.armiesPlayer1.push(newArmyPlayer1);
                            model.armiesPlayer2.push(newArmyPlayer2);
                            model.reinforcementsPlayer1.push(newReinforcementsPlayer1);
                            model.reinforcementsPlayer2.push(newReinforcementsPlayer2);
                            newArmyPlayer1 = [];
                            newArmyPlayer2 = [];
                            newReinforcementsPlayer1 = [];
                            newReinforcementsPlayer2 = [];
                            // An unit that fits nowhere is carried to the next battle.
                            classifyArmy(unitTrained);
                            //armyCount++;
                        }
                    }
                }
            }
            //console.log("Army and Reinforcements", armyCount, reinCount);
        }

        // Adds the game object data to the unit and splits the armies into players.
        var classifyArmy = function (unit) {
            var gameObject = gameObjectsService.find(unit.SquadId); //searchGameObject(unit.SquadId);
            unit.mediaUrl = (gameObject) ? gameObject.mediaUrl : "";
            unit.name = (gameObject) ? gameObject.name : unit.SquadId;
            if (unit["PlayerIndex"] === 1) {
                newArmyPlayer1.push(unit);
            }
            if (unit["PlayerIndex"] === 2) {
                newArmyPlayer2.push(unit);
            }
        }

        // Adds the game object data to the unit and splits the reinforcements into players.
        var classifyReinforcement = function (unit) {
            var gameObject = gameObjectsService.find(unit.SquadId); //searchGameObject(unit.SquadId);
            unit.mediaUrl = (gameObject) ? gameObject.mediaUrl : "";
            unit.name = (gameObject) ? gameObject.name : unit.SquadId;
            if (unit["PlayerIndex"] === 1) {
                newReinforcementsPlayer1.push(unit);
            }
            if (unit["PlayerIndex"] === 2) {
                newReinforcementsPlayer2.push(unit);
            }
        }

        //---------------BATTLE ANALYTICS----------------------//
        // (Army + Reinforcement) - Deaths = Remainder.
        // Remainder is then added to the next army.
        // The end result of the 3 arrays is what will be displayed in the UI.
        var player1TemporaryArmy = [];
        var player2TemporaryArmy = [];
        var battleAnalytics = function () {
            player1TemporaryArmy = [];
            player2TemporaryArmy = [];
            model.killCount = 0;

            for (var i = 0; i < model.battles.length; i++) {
                model.armiesPlayer1[i] = (model.armiesPlayer1[i]).concat(player1TemporaryArmy);
                model.armiesPlayer2[i] = (model.armiesPlayer2[i]).concat(player2TemporaryArmy);
                player1TemporaryArmy = (model.armiesPlayer1[i]).concat(model.reinforcementsPlayer1[i]);
                player2TemporaryArmy = (model.armiesPlayer2[i]).concat(model.reinforcementsPlayer2[i]);

                tagUnitsKilled(i);
                killUnits(i);

                player1TemporaryArmy = JSON.parse(JSON.stringify(player1TemporaryArmy));
                player2TemporaryArmy = JSON.parse(JSON.stringify(player2TemporaryArmy));
            }

            model.analizedArmiesPlayer1 = JSON.parse(JSON.stringify(model.armiesPlayer1));
            model.analizedArmiesPlayer2 = JSON.parse(JSON.stringify(model.armiesPlayer2));
            model.reinforcementsPlayer1 = JSON.parse(JSON.stringify(model.reinforcementsPlayer1));
            model.reinforcementsPlayer2 = JSON.parse(JSON.stringify(model.reinforcementsPlayer2));
        };

        // Tags the units from the armies as killed but does not remove them from the arrays.
        // The UI will then show these tagged units as killed in a different color for easy reference.
        var tagUnitsKilled = function (battleIndex) {
            (model.battles[battleIndex])["deaths"].forEach(function (kill) {
                for (var i = 0; i < player1TemporaryArmy.length; i++) {
                    var unit = player1TemporaryArmy[i];
                    if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                        tagUnit(unit, kill);
                        i = player1TemporaryArmy.length + 1;
                    }
                }

                for (var i = 0; i < player2TemporaryArmy.length; i++) {
                    var unit = player2TemporaryArmy[i];
                    if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                        tagUnit(unit, kill);
                        i = player2TemporaryArmy.length + 1;
                    }
                }
            });
        };

        var tagUnit = function (unit, kill) {
            unit.killed = true;
            unit.Killers = [];
            kill.Killers = [];
            var Participants = kill["Participants"];

            Object.keys(Participants).map((e) => {
                var participant = (Participants[e])["ObjectParticipants"];
                Object.keys(participant).map((a) => {
                    var gameObject = gameObjectsService.find(a); //searchGameObject(a);
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
        };

        // Takes a specific battle to remove units from the temporary armies before adding them to each player.
        var killUnits = function (battleIndex) {
            model.deathEvents.forEach(function (kill) {
                if (kill["TimeSinceStartMilliseconds"] <= (model.battles[battleIndex])["finish"]) {
                    var gameObject = gameObjectsService.find(kill["VictimObjectTypeId"]); //searchGameObject(kill["VictimObjectTypeId"]);
                    kill.SupplyCost = (gameObject) ? gameObject.supplyCost : 0;
                    kill.EnergyCost = (gameObject) ? gameObject.energyCost : 0;
                    kill.PopulationCost = (gameObject) ? gameObject.populationCost : 0;

                    for (var i = 0; i < player1TemporaryArmy.length; i++) {
                        var unit = player1TemporaryArmy[i];
                        if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                            player1TemporaryArmy.splice(i, 1);
                            model.killCount++;
                            kill.processed = true;
                            i = player1TemporaryArmy.length + 1;
                        }
                    }

                    for (var i = 0; i < player2TemporaryArmy.length; i++) {
                        var unit = player2TemporaryArmy[i];
                        if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                            player2TemporaryArmy.splice(i, 1);
                            model.killCount++;
                            kill.processed = true;
                            i = player2TemporaryArmy.length + 1;
                        }
                    }
                }
                return;
            });
        };

        var settleLastBattle = function () {
            model.analizedArmiesPlayer1[model.analizedArmiesPlayer1.length - 1].forEach(function (unit) {
                model.deathEvents.forEach(function (death) {
                    if ((unit["InstanceId"] === death["VictimInstanceId"]) && (!unit.killed)) {
                        tagUnit(unit, death);
                        model.battles[model.battles.length - 1].deaths.push(death);
                    }
                });
            });
            model.analizedArmiesPlayer2[model.analizedArmiesPlayer2.length - 1].forEach(function (unit) {
                model.deathEvents.forEach(function (death) {
                    if ((unit["InstanceId"] === death["VictimInstanceId"]) && (!unit.killed)) {
                        tagUnit(unit, death);
                        model.battles[model.battles.length - 1].deaths.push(death);
                    }
                });
            });
            model.reinforcementsPlayer1[model.reinforcementsPlayer1.length - 1].forEach(function (unit) {
                model.deathEvents.forEach(function (death) {
                    if ((unit["InstanceId"] === death["VictimInstanceId"]) && (!unit.killed)) {
                        tagUnit(unit, death);
                        model.battles[model.battles.length - 1].deaths.push(death);
                    }
                });
            });
            model.reinforcementsPlayer2[model.reinforcementsPlayer2.length - 1].forEach(function (unit) {
                model.deathEvents.forEach(function (death) {
                    if ((unit["InstanceId"] === death["VictimInstanceId"]) && (!unit.killed)) {
                        tagUnit(unit, death);
                        model.battles[model.battles.length - 1].deaths.push(death);
                    }
                });
            });
        };

        // Calculate army costs, losses and battle winner.
        var getTotalArmyCost = function () {
            for (var i = 0; i < model.battles.length; i++) {
                var battle = model.battles[i];
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

                model.analizedArmiesPlayer1[i].forEach(function (unit) {
                    battle.SupplyCost1 = ((battle.SupplyCost1) ? battle.SupplyCost1 : 0) + Number(unit.SupplyCost);
                    battle.EnergyCost1 = ((battle.EnergyCost1) ? battle.EnergyCost1 : 0) + Number(unit.EnergyCost);
                    battle.PopulationCost1 = ((battle.PopulationCost1) ? battle.PopulationCost1 : 0) + Number(unit.PopulationCost);
                    if (unit.killed) {
                        battle.SupplyLost1 = ((battle.SupplyLost1) ? battle.SupplyLost1 : 0) + Number(unit.SupplyCost);
                        battle.EnergyLost1 = ((battle.EnergyLost1) ? battle.EnergyLost1 : 0) + Number(unit.EnergyCost);
                        battle.PopulationLost1 = ((battle.PopulationLost1) ? battle.PopulationLost1 : 0) + Number(unit.PopulationCost);
                    }
                });
                model.analizedArmiesPlayer2[i].forEach(function (unit) {
                    battle.SupplyCost2 = ((battle.SupplyCost2) ? battle.SupplyCost2 : 0) + Number(unit.SupplyCost);
                    battle.EnergyCost2 = ((battle.EnergyCost2) ? battle.EnergyCost2 : 0) + Number(unit.EnergyCost);
                    battle.PopulationCost2 = ((battle.PopulationCost2) ? battle.PopulationCost2 : 0) + Number(unit.PopulationCost);
                    if (unit.killed) {
                        battle.SupplyLost2 = ((battle.SupplyLost2) ? battle.SupplyLost2 : 0) + Number(unit.SupplyCost);
                        battle.EnergyLost2 = ((battle.EnergyLost2) ? battle.EnergyLost2 : 0) + Number(unit.EnergyCost);
                        battle.PopulationLost2 = ((battle.PopulationLost2) ? battle.PopulationLost2 : 0) + Number(unit.PopulationCost);
                    }
                });
                model.reinforcementsPlayer1[i].forEach(function (unit) {
                    battle.RSupplyCost1 = ((battle.RSupplyCost1) ? battle.RSupplyCost1 : 0) + Number(unit.SupplyCost);
                    battle.REnergyCost1 = ((battle.REnergyCost1) ? battle.REnergyCost1 : 0) + Number(unit.EnergyCost);
                    battle.RPopulationCost1 = ((battle.RPopulationCost1) ? battle.RPopulationCost1 : 0) + Number(unit.PopulationCost);
                    if (unit.killed) {
                        battle.RSupplyLost1 = ((battle.RSupplyLost1) ? battle.RSupplyLost1 : 0) + Number(unit.SupplyCost);
                        battle.REnergyLost1 = ((battle.REnergyLost1) ? battle.REnergyLost1 : 0) + Number(unit.EnergyCost);
                        battle.RPopulationLost1 = ((battle.RPopulationLost1) ? battle.RPopulationLost1 : 0) + Number(unit.PopulationCost);
                    }
                });
                model.reinforcementsPlayer2[i].forEach(function (unit) {
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
        };

        // Removes a battle from the arrays, this allows the user to clean up undesired battles.
        model.removeBattle = function (battle) {
            var foundIndex = model.battles.indexOf(battle);
            model.battles.splice(foundIndex, 1);
            model.analizedArmiesPlayer1.splice(foundIndex, 1);
            model.analizedArmiesPlayer2.splice(foundIndex, 1);
            model.reinforcementsPlayer1.splice(foundIndex, 1);
            model.reinforcementsPlayer2.splice(foundIndex, 1);
            openToast("Battle was removed");
        };

        // Shows a brief toast message when a battle is removed.
        var openToast = function (message) {
            $mdToast.show($mdToast.simple()
                .textContent(message)
                .position("top right")
                .hideDelay(3000));
        };

        // Shows only the battles filtered.
        model.showBattle = function (index) {
            var size = model.battles[index].size;
            if ((model.battles[index].size === "Small") && (model.small)) {
                return true;
            }
            if ((model.battles[index].size === "Medium") && (model.medium)) {
                return true;
            }
            if ((model.battles[index].size === "Large") && (model.large)) {
                return true;
            }
            return false;
        };

        // An unit from the battle can be clicked to reveal detailed information for that specific unit.
        // This creates a Bottom Sheet component from Angular Material to display the information.
        model.selectUnit = function ($event, unit) {

            $mdBottomSheet.show({
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
        };
    }
}());