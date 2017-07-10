(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("battleChartComponent", {
        templateUrl: "/components/battle-chart-component/battle.chart.component.html",
        controllerAs: "model",
        controller: ["unitTypeService", battleChartController],
        bindings: {
            army: "<",
            type: "<"
        }
    });

    function battleChartController(unitTypeService) {
        var model = this;

        model.affinities = {
            air: 0,
            vehicle: 0,
            infantry: 0,
            support: 0
        };

        model.categories = {
            air: 0,
            vehicle: 0,
            infantry: 0
        };

        model.colors = ['#45b7cd', '#ff6384', '#ff8e72'];

        model.override = {
            hoverBackgroundColor: ['#45b7cd', '#ff6384', '#ff8e72'],
            hoverBorderColor: ['#45b7cd', '#ff6384', '#ff8e72']
        };

        model.labels = ["AIR", "INF", "VEH"];
        model.affinityLabels = ["AIR", "INF", "VEH", "SUP"];

        model.affinityOptions = {
            responsive: false,
            animation: false,
            scale: {
                ticks: {
                    display: false,
                    beginAtZero: true,
                    max: 100
                }
            },
            elements: {
                point: {
                    radius: 0
                }
            }
        };

        model.categoryOptions = {
            animation: false,
            responsive: false,
            showTooltips: false,
        }

        model.affinityData = [
            [model.affinities.air, model.affinities.infantry, model.affinities.vehicle, model.affinities.support]
        ];

        model.categoryData = [
            model.categories.air, model.categories.infantry, model.categories.vehicle
        ];

        model.$onInit = function () {

        };

        model.$onChanges = function (changes) {
            if (changes.army && model.army != null) {
                if (model.type) {
                    dissectArmyAffinity();
                }
                else {
                    dissectArmyCategory();
                }

                model.affinityData = [
                    model.affinities.air, model.affinities.infantry, model.affinities.vehicle, model.affinities.support
                ];

                model.categoryData = [
                    model.categories.air, model.categories.infantry, model.categories.vehicle
                ];
            }
        };

        var dissectArmyAffinity = function () {
            var antiAir = 0;
            var antiVehicle = 0;
            var antiInfantry = 0;
            var support = 0;
            var isSupport = true;
            var totalAffinity = 0;

            model.army.forEach(function (unit) {
                isSupport = true;
                var population = 0;
                if (unit.PopulationCost === 0 && unit.type != "HERO") {
                    // This will happen only for the Mantis, for the moment.
                    population = 4;
                }
                else {
                    population = (unit.type === "HERO") ? 12 : unit.PopulationCost;
                }

                switch (unit.affinities.air) {
                    case "NotApplicable":
                        antiAir++;
                        break;
                    case "Poor":
                        antiAir += (2 * population);
                        isSupport = false;
                        break;
                    case "Neutral":
                        antiAir += (4 * population);
                        isSupport = false;
                        break;
                    case "Good":
                        antiAir += (8 * population);
                        isSupport = false;
                        break;
                }

                switch (unit.affinities.vehicle) {
                    case "NotApplicable":
                        antiVehicle++;
                        break;
                    case "Poor":
                        antiVehicle += (2 * population);
                        isSupport = false;
                        break;
                    case "Neutral":
                        antiVehicle += (4 * population);
                        isSupport = false;
                        break;
                    case "Good":
                        antiVehicle += (8 * population);
                        isSupport = false;
                        break;
                }

                switch (unit.affinities.infantry) {
                    case "NotApplicable":
                        antiInfantry++;
                        break;
                    case "Poor":
                        antiInfantry += (2 * population);
                        isSupport = false;
                        break;
                    case "Neutral":
                        antiInfantry += (4 * population);
                        isSupport = false;
                        break;
                    case "Good":
                        antiInfantry += (8 * population);
                        isSupport = false;
                        break;
                }

                // Since there is no indication of a support unit. This will have to do, so long as support units keep having no weapons.
                if (isSupport === true) {
                    support += (8 * population);
                }
                else {
                    support++;
                }

                // Currently the Jack Rabbit has incorrect affinity options. This will have to do for the moment.
                if (unit.SquadId === "unsc_veh_mongoose_01") {
                    antiInfantry += 7;
                    antiAir += 3;
                    antiVehicle += 7;
                    support -= 15;
                }

                totalAffinity += 8 * population;
            });

            var percentAffinity = (100 / totalAffinity);
            model.affinities.air = antiAir * percentAffinity;
            model.affinities.vehicle = antiVehicle * percentAffinity;
            model.affinities.infantry = antiInfantry * percentAffinity;
            model.affinities.support = support * percentAffinity;
        };

        var dissectArmyCategory = function () {
            var air = 0;
            var vehicle = 0;
            var infantry = 0;

            model.army.forEach(function (unit) {
                if (unit.type === "HERO") {
                    infantry = infantry + 12;
                }

                switch (unitTypeService.category(unit.category)) {
                    case "AIR":
                        air = air + unit.PopulationCost;
                        break;
                    case "VEHICLE":
                        vehicle = vehicle + unit.PopulationCost;
                        break;
                    case "INFANTRY":
                        infantry = infantry + unit.PopulationCost;
                        break;
                }
            });

            var percentArmy = (100 / (air + vehicle + infantry));
            model.categories.air = Math.trunc(air * percentArmy);
            model.categories.vehicle = Math.trunc(vehicle * percentArmy);
            model.categories.infantry = Math.trunc(infantry * percentArmy);
        };
    };


})();