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

        model.labels = ["AIR", "INFANTRY", "VEHICLE"];

        model.colors = ['#72C02C', '#3498DB', '#F1C40F'];

        model.affinityData = [
            [model.affinities.air, model.affinities.infantry, model.affinities.vehicle]
        ];

        model.categoryData = [
            [model.categories.air, model.categories.infantry, model.categories.vehicle]
        ];

        model.$onInit = function () {

        };

        model.$onChanges = function (changes) {
            if (changes.army && model.army != null) {
                dissectArmy();

                console.log(model.categories);

                model.affinityData = [
                    [model.affinities.air, model.affinities.infantry, model.affinities.vehicle]
                ];

                model.categoryData = [
                    [model.categories.air, model.categories.infantry, model.categories.vehicle]
                ];
            }
        };

        var dissectArmy = function () {
            var air = 0;
            var vehicle = 0;
            var infantry = 0;

            model.army.forEach(function (unit) {
                if (unit.type === "HERO") {
                    infantry = infantry + 10;
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

            var percent = (100 / (air + vehicle + infantry));
            console.log(percent, air, vehicle, infantry);

            model.categories.air = air * percent;
            model.categories.vehicle = vehicle * percent;
            model.categories.infantry = infantry * percent;
        };

    };


})();