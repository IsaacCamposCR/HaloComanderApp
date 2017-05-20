(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("matchBattlesComponent", {
        templateUrl: "/components/match-battles-component/match.battles.component.html",
        controllerAs: "model",
        controller: ["$resource", "$mdToast", "$mdBottomSheet", matchBattlesController],
        bindings: {
            match: "<"
        }
    });

    function matchBattlesController($resource, $mdToast, $mdBottomSheet) {
        var model = this;

        var resourceGameObjects = $resource("https://www.haloapi.com/metadata/hw2/game-objects",
            {
                startAt: "@startAt"
            },
            {
                query: {
                    method: "GET",
                    headers: { "Accept-Language": "en", "Ocp-Apim-Subscription-Key": "ee5d843652484f409f5b60356142838c" },
                    isArray: false
                }
            });

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
                getGameObjects();
            }
        };

        model.$onChanges = function (changes) {
            if (changes.match && model.match) {
                armiesPlayer1 = [];
                reinforcementsPlayer1 = [];
                armiesPlayer2 = [];
                reinforcementsPlayer2 = [];
                newArmyPlayer1 = [];
                newArmyPlayer2 = [];
                newReinforcementsPlayer1 = [];
                newReinforcementsPlayer2 = [];
                model.battles = [];
                model.analizedArmiesPlayer1 = [];
                model.analizedArmiesPlayer2 = [];
                model.reinforcementsPlayer1 = [];
                model.reinforcementsPlayer2 = [];
                battleCount = -1;
                getGameObjects();
            }
        };

        model.getNumber = function (num) {
            return new Array(num);
        };

        //---------------GAME OBJECTS----------------------//
        var getGameObjects = function () {
            model.gameObjects = [];

            if (!localStorage.getItem("gameObjects")) {
                console.log("No stored objects found. Requesting...");
                sleep(5000);
                resourceGameObjects.query({ startAt: "0" })
                    .$promise.then(function (objects) {
                        createGameObjects(objects);
                        sleep(5000);
                        resourceGameObjects.query({ startAt: "100" })
                            .$promise.then(function (objects) {
                                createGameObjects(objects);
                                sleep(15000);
                                resourceGameObjects.query({ startAt: "200" })
                                    .$promise.then(function (objects) {
                                        createGameObjects(objects);
                                        if (typeof (Storage) !== "undefined") {
                                            // Code for localStorage/sessionStorage.
                                            localStorage.setItem("gameObjects", JSON.stringify(model.gameObjects));
                                            console.log("stored");
                                        } else {
                                            console.log("No storage found...");
                                        }

                                        getMatchEvents();
                                    });
                            });
                    });
            }
            else {
                model.gameObjects = JSON.parse(localStorage.getItem("gameObjects"));
                console.log("Stored objects found");
                getMatchEvents();
            }
        };

        function sleep(delay) {
            var start = new Date().getTime();
            while (new Date().getTime() < start + delay);
        }

        // Takes the application relevant data from the Game Objects API.
        var createGameObjects = function (objects) {
            var contentItems = objects["ContentItems"];

            contentItems.forEach(function (gameObject) {

                var view = gameObject["View"];
                var name = view["Title"];
                var hw2Object = view["HW2Object"];
                var id = hw2Object["ObjectTypeId"];
                var image = hw2Object["Image"];
                var viewImage = image["View"];
                var media = viewImage ? viewImage["Media"] : null;
                var mediaUrl = media ? media["MediaUrl"] : null;

                console.log(hw2Object["StandardSupplyCost"], hw2Object["StandardEnergyCost"], hw2Object["StandardPopulationCost"]);

                model.gameObjects.push({
                    name: name,
                    id: id,
                    mediaUrl: mediaUrl,
                    supplyCost: hw2Object["StandardSupplyCost"],
                    energyCost: hw2Object["StandardEnergyCost"],
                    populationCost: hw2Object["StandardPopulationCost"]
                });
            });
        };

        // Searches the game object array for a specific unit to get the unit's metadata.
        function searchGameObject(id) {

            if (id.includes("cov_bldg_heavy")) {
                id = id.replace("heavy", "light");
            }
            if (id.includes("suicideGrunt")) {
                id = "cov_inf_generic_suicidegrunt";
            }
            if (id.includes("for_air_sentinel_01")) {
                id = "neutralfor_sentineltier2_generic";
            }

            for (var i = 0; i < model.gameObjects.length; i++) {
                if (model.gameObjects[i].id.toLowerCase() === id.toLowerCase()) {
                    return model.gameObjects[i];
                }
            }
            return null;
        };

        //---------------MATCH EVENTS----------------------//
        var getMatchEvents = function () {
            model.trainEvents = [];
            model.deathEvents = [];

            var matchEvents = resourceMatchEvents.query({ match: model.match })
                .$promise.then(function (events) {
                    events = events["GameEvents"];
                    events.forEach(function (event) {
                        createPlayerEvents(event);
                    });

                    processBattles();
                    processArmies();
                    battleAnalytics();
                });

            // Takes the application relevant data from the Events API.
            var createPlayerEvents = function (item) {
                if (item["EventName"] === "UnitTrained") {
                    model.trainEvents.push(item);
                }

                if (item["EventName"] === "Death") {
                    model.deathEvents.push(item);
                }
            };
        };

        //---------------PROCESS BATTLES----------------------//
        // Process which units died at each battle and classifies battles by size 
        // When units die in quick succession they are linked inside a single battle. 
        // When the killing stops, the battle is classified and logged in the "battles" array.
        var processBattles = function () {
            var firstEvent = model.deathEvents[0];
            var nextEvent = firstEvent["TimeSinceStartMilliseconds"];
            var deathCount = 0;

            var deathsByBattle = [];
            model.deathEvents.forEach(function (death) {

                if (deathsByBattle.length === 0) {
                    nextEvent = death["TimeSinceStartMilliseconds"];
                    firstEvent = death;
                }

                if ((death["TimeSinceStartMilliseconds"] - nextEvent) <= 20000) {
                    var gameObject = searchGameObject(death.VictimObjectTypeId);
                    if (gameObject) {
                        death.mediaUrl = gameObject.mediaUrl;
                        death.name = gameObject.name;
                        deathsByBattle.push(death);
                        nextEvent = death["TimeSinceStartMilliseconds"];
                    }
                }
                else {
                    classifyBattle(deathsByBattle, firstEvent["TimeSinceStartMilliseconds"], nextEvent);
                    deathsByBattle = [];
                }
            });
            classifyBattle(deathsByBattle, firstEvent["TimeSinceStartMilliseconds"], nextEvent);
        };

        model.battles = [];

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
        var armiesPlayer1 = [];
        var reinforcementsPlayer1 = [];
        var armiesPlayer2 = [];
        var reinforcementsPlayer2 = [];
        var newArmyPlayer1 = [];
        var newArmyPlayer2 = [];
        var newReinforcementsPlayer1 = [];
        var newReinforcementsPlayer2 = [];

        var processArmies = function () {
            // Requests the first Battle that happened irregardless of size.
            var battle = nextBattle();

            model.trainEvents.forEach(function (unitTrained) {

                // Determines if an unit existed before the battle started.
                if (unitTrained["TimeSinceStartMilliseconds"] <= battle["start"]) {
                    //newArmy.push(unitTrained);
                    classifyArmy(unitTrained);
                }
                else {
                    // Determines if an unit was trained before the battle finished.
                    if (unitTrained["TimeSinceStartMilliseconds"] <= battle["finish"]) {
                        //newReinforcements.push(unitTrained);
                        classifyReinforcement(unitTrained);
                    }
                    // When an unit was trained after a battle, it will participate in the next.
                    // The battle is logged and the armies and reinforcements classified by player.
                    else {
                        var newBattle = nextBattle();
                        if (newBattle) {
                            battle = newBattle;
                            armiesPlayer1.push(newArmyPlayer1);
                            armiesPlayer2.push(newArmyPlayer2);
                            reinforcementsPlayer1.push(newReinforcementsPlayer1);
                            reinforcementsPlayer2.push(newReinforcementsPlayer2);
                            newArmyPlayer1 = [];
                            newArmyPlayer2 = [];
                            // An unit that fits nowhere is carried to the next battle.
                            classifyArmy(unitTrained);
                            newReinforcementsPlayer1 = [];
                            newReinforcementsPlayer2 = [];
                        }
                    }
                }
            });

            // If all units are processed before the next battle (last battle)
            // They are pushed to the armies and reinforcements arrays as the last battle that took place.
            armiesPlayer1.push(newArmyPlayer1);
            armiesPlayer2.push(newArmyPlayer2);
            reinforcementsPlayer1.push(newReinforcementsPlayer1);
            reinforcementsPlayer2.push(newReinforcementsPlayer2);
        };

        // Adds the game object data to the unit and splits the armies into players.
        var classifyArmy = function (unit) {
            var gameObject = searchGameObject(unit.SquadId);
            unit.mediaUrl = (gameObject) ? gameObject.mediaUrl : "";
            unit.name = (gameObject) ? gameObject.name : "unknown";
            if (unit["PlayerIndex"] === 1) {
                newArmyPlayer1.push(unit);
            }
            if (unit["PlayerIndex"] === 2) {
                newArmyPlayer2.push(unit);
            }
        }

        // Adds the game object data to the unit and splits the reinforcements into players.
        var classifyReinforcement = function (unit) {
            var gameObject = searchGameObject(unit.SquadId);
            unit.mediaUrl = (gameObject) ? gameObject.mediaUrl : "";
            unit.name = (gameObject) ? gameObject.name : "unknown";
            if (unit["PlayerIndex"] === 1) {
                newReinforcementsPlayer1.push(unit);
            }
            if (unit["PlayerIndex"] === 2) {
                newReinforcementsPlayer2.push(unit);
            }
        }

        // This method serves battle by battle so that units can be correctly matched in armies or reinforcements.
        var battleCount = -1;
        var nextBattle = function () {
            battleCount++;
            if (battleCount <= model.battles.length) {
                return model.battles[battleCount];
            }
            else {
                return null;
            }
        };

        //---------------BATTLE ANALYTICS----------------------//
        // (Army + Reinforcement) - Deaths = Remainder.
        // Remainder is then added to the next army.
        // The end result of the 3 arrays is what will be displayed in the UI.
        var battleAnalytics = function () {
            model.player1TemporaryArmy = [];
            model.player2TemporaryArmy = [];

            for (var i = 0; i < armiesPlayer1.length; i++) {
                armiesPlayer1[i] = (armiesPlayer1[i]).concat(model.player1TemporaryArmy);
                armiesPlayer2[i] = (armiesPlayer2[i]).concat(model.player2TemporaryArmy);
                model.player1TemporaryArmy = (armiesPlayer1[i]).concat(reinforcementsPlayer1[i]);
                model.player2TemporaryArmy = (armiesPlayer2[i]).concat(reinforcementsPlayer2[i]);

                killUnits(i);
            }

            model.analizedArmiesPlayer1 = JSON.parse(JSON.stringify(armiesPlayer1));
            model.analizedArmiesPlayer2 = JSON.parse(JSON.stringify(armiesPlayer2));
            model.reinforcementsPlayer1 = JSON.parse(JSON.stringify(reinforcementsPlayer1));
            model.reinforcementsPlayer2 = JSON.parse(JSON.stringify(reinforcementsPlayer2));

            tagUnitsKilled();
            getTotalArmyCost();
        };

        // Tags the units from the armies as killed but does not remove them from the arrays.
        // The UI will then show these tagged units as killed in a different color for easy reference.
        var tagUnitsKilled = function () {
            for (var i = 0; i < model.battles.length; i++) {
                var battleIndex = i;
                (model.battles[battleIndex])["deaths"].forEach(function (kill) {
                    for (var i = 0; i < model.analizedArmiesPlayer1[battleIndex].length; i++) {
                        var unit = (model.analizedArmiesPlayer1[battleIndex])[i];
                        if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                            tagUnit(unit, kill);
                            i = model.analizedArmiesPlayer1[battleIndex].length + 1;
                        }
                    }

                    for (var i = 0; i < model.reinforcementsPlayer1[battleIndex].length; i++) {
                        var unit = (model.reinforcementsPlayer1[battleIndex])[i];
                        if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                            tagUnit(unit, kill);
                            i = model.reinforcementsPlayer1[battleIndex].length + 1;
                        }
                    }

                    for (var i = 0; i < model.analizedArmiesPlayer2[battleIndex].length; i++) {
                        var unit = (model.analizedArmiesPlayer2[battleIndex])[i];
                        if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                            tagUnit(unit, kill);
                            i = model.analizedArmiesPlayer2[battleIndex].length + 1;
                        }
                    }

                    for (var i = 0; i < model.reinforcementsPlayer2[battleIndex].length; i++) {
                        var unit = (model.reinforcementsPlayer2[battleIndex])[i];
                        if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                            tagUnit(unit, kill);
                            i = model.reinforcementsPlayer2[battleIndex].length + 1;
                        }
                    }
                });
            }
        };

        var tagUnit = function (unit, kill) {
            unit.killed = true;
            unit.Killers = [];
            kill.Killers = [];
            var Participants = kill["Participants"];

            Object.keys(Participants).map((e) => {
                var participant = (Participants[e])["ObjectParticipants"];
                Object.keys(participant).map((a) => {
                    var gameObject = searchGameObject(a);
                    unit.Killers.push({
                        mediaUrl: (gameObject) ? gameObject.mediaUrl : "",
                        name: (gameObject) ? gameObject.name : "unknown"
                    });
                    kill.Killers.push({
                        mediaUrl: (gameObject) ? gameObject.mediaUrl : "",
                        name: (gameObject) ? gameObject.name : "unknown"
                    });
                });
            });
        };

        // Takes a specific battle to remove units from the temporary armies before adding them to each player.
        var killUnits = function (battleIndex) {

            (model.battles[battleIndex])["deaths"].forEach(function (kill) {
                var gameObject = searchGameObject(kill["VictimObjectTypeId"]);
                kill.SupplyCost = gameObject.supplyCost;
                kill.EnergyCost = gameObject.energyCost;
                kill.PopulationCost = gameObject.populationCost;

                for (var i = 0; i < model.player1TemporaryArmy.length; i++) {
                    var unit = model.player1TemporaryArmy[i];
                    if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                        model.player1TemporaryArmy.splice(i, 1);
                        i = model.player1TemporaryArmy.length + 1;
                    }
                }

                for (var i = 0; i < model.player2TemporaryArmy.length; i++) {
                    var unit = model.player2TemporaryArmy[i];
                    if (unit["InstanceId"] === kill["VictimInstanceId"]) {
                        model.player2TemporaryArmy.splice(i, 1);
                        i = model.player2TemporaryArmy.length + 1;
                    }
                }
            });
        };

        var getTotalArmyCost = function () {
            for (var i = 0; i < model.battles.length; i++) {
                var battle = model.battles[i];
                battle.SupplyLost1 = 0;
                battle.RSupplyLost1 = 0;
                battle.EnergyLost1 = 0;
                battle.REnergyLost1 = 0;

                battle.PopulationCost1 = 0;
                battle.RPopulationCost1 = 0;
                battle.PopulationLost1 = 0;
                battle.RPopulationLost1 = 0;

                battle.SupplyLost2 = 0;
                battle.RSupplyLost2 = 0;
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
                clickedItem && console.log(clickedItem.SquadId + "clicked!");
            })
        };
    }
}());