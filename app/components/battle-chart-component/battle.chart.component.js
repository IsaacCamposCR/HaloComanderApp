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
            infantry: 0
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
        model.affinityLabels = ["AIR", "INF", "VEH"];

        model.affinityOptions = {
            responsive: false,
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
            responsive: false,
            showTooltips: false,
        }

        model.affinityData = [
            [model.affinities.air, model.affinities.infantry, model.affinities.vehicle]
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
                    model.affinities.air, model.affinities.infantry, model.affinities.vehicle
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
            var totalAffinity = 0;

            model.army.forEach(function (unit) {

                switch (unit.affinities.air) {
                    case "NotApplicable":
                        antiAir += (unit.PopulationCost);
                        break;
                    case "Poor":
                        antiAir += (2 * unit.PopulationCost);
                        break;
                    case "Neutral":
                        antiAir += (4 * unit.PopulationCost);
                        break;
                    case "Good":
                        antiAir += (8 * unit.PopulationCost);
                        break;
                }

                switch (unit.affinities.vehicle) {
                    case "NotApplicable":
                        antiVehicle += (unit.PopulationCost);
                        break;
                    case "Poor":
                        antiVehicle += (2 * unit.PopulationCost);
                        break;
                    case "Neutral":
                        antiVehicle += (4 * unit.PopulationCost);
                        break;
                    case "Good":
                        antiVehicle += (8 * unit.PopulationCost);
                        break;
                }

                switch (unit.affinities.infantry) {
                    case "NotApplicable":
                        antiInfantry += (unit.PopulationCost);
                        break;
                    case "Poor":
                        antiInfantry += (2 * unit.PopulationCost);
                        break;
                    case "Neutral":
                        antiInfantry += (4 * unit.PopulationCost);
                        break;
                    case "Good":
                        antiInfantry += (8 * unit.PopulationCost);
                        break;
                }

                totalAffinity += 8 * unit.PopulationCost;
            });

            var percentAffinity = (100 / totalAffinity);
            model.affinities.air = antiAir * percentAffinity;
            model.affinities.vehicle = antiVehicle * percentAffinity;
            model.affinities.infantry = antiInfantry * percentAffinity;
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