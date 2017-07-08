(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("battleChartComponent", {
        templateUrl: "/components/battle-chart-component/battle.chart.component.html",
        controllerAs: "model",
        controller: ["unitTypeService", battleChartController],
        bindings: {
            army: "<"
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

        'use strict';

        model.colors = ['#45b7cd', '#ff6384', '#ff8e72'];

        model.override = {
            hoverBackgroundColor: ['#45b7cd', '#ff6384', '#ff8e72'],
            hoverBorderColor: ['#45b7cd', '#ff6384', '#ff8e72']
        };

        model.labels = ["AIR", "INFANTRY", "VEHICLE"];

        model.affinityOptions = {
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
                dissectArmy();

                console.log(model.categories);

                model.affinityData = [
                    model.affinities.air, model.affinities.infantry, model.affinities.vehicle
                ];

                model.categoryData = [
                    model.categories.air, model.categories.infantry, model.categories.vehicle
                ];
            }
        };

        var dissectArmy = function () {
            var air = 0;
            var vehicle = 0;
            var infantry = 0;

            var antiAir = 0;
            var antiVehicle = 0;
            var antiInfantry = 0;
            var totalAffinity = 0;

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

                switch (unit.affinities.air) {
                    case "Poor":
                        antiAir++;
                        break;
                    case "Neutral":
                        antiAir += 2;
                        break;
                    case "Good":
                        antiAir += 3;
                        break;
                }

                switch (unit.affinities.vehicle) {
                    case "Poor":
                        antiVehicle++;
                        break;
                    case "Neutral":
                        antiVehicle += 2;
                        break;
                    case "Good":
                        antiVehicle += 3;
                        break;
                }

                switch (unit.affinities.infantry) {
                    case "Poor":
                        antiInfantry++;
                        break;
                    case "Neutral":
                        antiInfantry += 2;
                        break;
                    case "Good":
                        antiInfantry += 3;
                        break;
                }

                totalAffinity += 3;
            });

            var percentArmy = (100 / (air + vehicle + infantry));
            console.log(percentArmy, air, vehicle, infantry);
            model.categories.air = air * percentArmy;
            model.categories.vehicle = vehicle * percentArmy;
            model.categories.infantry = infantry * percentArmy;

            var percentAffinity = (100 / totalAffinity);
            console.log(percentAffinity, antiAir, antiVehicle, antiInfantry);
            model.affinities.air = antiAir * percentAffinity;
            model.affinities.vehicle = antiVehicle * percentAffinity;
            model.affinities.infantry = antiInfantry * percentAffinity;
        };

    };


})();