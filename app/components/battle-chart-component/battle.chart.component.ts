(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("battleChartComponent", {
        templateUrl: "/components/battle-chart-component/battle.chart.component.html",
        controllerAs: "model",
        bindings: {
            army: "<",
            type: "<"
        },
        controller: class BattleChartCtrl {

            unitTypeService: any;

            constructor(unitTypeService) {
                this.unitTypeService = unitTypeService;
            }

            affinities: any = {
                air: 0,
                vehicle: 0,
                infantry: 0,
                support: 0
            };

            categories: any = {
                air: 0,
                vehicle: 0,
                infantry: 0
            };

            const colors: Array<string> = ['#45b7cd', '#ff6384', '#ff8e72'];

            const override: any = {
                hoverBackgroundColor: ['#45b7cd', '#ff6384', '#ff8e72'],
                hoverBorderColor: ['#45b7cd', '#ff6384', '#ff8e72']
            };

            labels: Array<string> = ["AIR", "INF", "VEH"];
            const affinityLabels: Array<string> = ["AIR", "INF", "VEH", "SUP"];

            affinityOptions: any = {
                maintainAspectRatio: true,
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

            categoryOptions: any = {
                maintainAspectRatio: true,
                animation: false,
                responsive: false,
                showTooltips: false,
            }

            affinityData: Array<Array<any>> = [
                [this.affinities.air, this.affinities.infantry, this.affinities.vehicle, this.affinities.support]
            ];

            categoryData: Array<any> = [
                this.categories.air, this.categories.infantry, this.categories.vehicle
            ];

            $onChanges(changes) {
                if (changes.army && this.army != null) {
                    if (this.type) {
                        this.dissectArmyAffinity();
                    }
                    else {
                        this.dissectArmyCategory();
                    }

                    this.affinityData = [
                        this.affinities.air, this.affinities.infantry, this.affinities.vehicle, this.affinities.support
                    ];

                    this.categoryData = [
                        this.categories.air, this.categories.infantry, this.categories.vehicle
                    ];
                }
            };

            dissectArmyAffinity() {
                let antiAir: number = 0;
                let antiVehicle: number = 0;
                let antiInfantry: number = 0;
                let support: number = 0;
                let totalAffinity: number = 0;
                let isSupport: boolean = true;

                this.army.forEach((unit) => {
                    isSupport = true;
                    let population: number = 0;
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

                let percentAffinity: number = (100 / totalAffinity);
                this.affinities.air = antiAir * percentAffinity;
                this.affinities.vehicle = antiVehicle * percentAffinity;
                this.affinities.infantry = antiInfantry * percentAffinity;
                this.affinities.support = support * percentAffinity;
            };

            dissectArmyCategory() {
                let air: number = 0;
                let vehicle: number = 0;
                let infantry: number = 0;

                this.army.forEach((unit) => {
                    if (unit.type === "HERO") {
                        infantry = infantry + 12;
                    }

                    switch (this.unitTypeService.category(unit.category)) {
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

                let percentArmy: number = (100 / (air + vehicle + infantry));
                this.categories.air = Math.trunc(air * percentArmy);
                this.categories.vehicle = Math.trunc(vehicle * percentArmy);
                this.categories.infantry = Math.trunc(infantry * percentArmy);
            };
        }
    });
})();