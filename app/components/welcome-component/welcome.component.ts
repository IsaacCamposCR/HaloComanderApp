(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("welcomeComponent", {
        templateUrl: "/components/welcome-component/welcome.component.html",
        controllerAs: "model",
        controller: class WelcomeCtrl {
            example: Array<any> = [
                {
                    PopulationCost: 5,
                    type: 'UNIT',
                    category: 334896,
                    SquadId: '',
                    affinities: {
                        air: 'Poor',
                        vehicle: 'Good',
                        infantry: 'Neutral'
                    }
                },
                {
                    PopulationCost: 4,
                    type: 'UNIT',
                    category: 335158,
                    SquadId: '',
                    affinities: {
                        air: 'NotApplicable',
                        vehicle: 'NotApplicable',
                        infantry: 'NotApplicable'
                    }
                },
                {
                    PopulationCost: 5,
                    type: 'UNIT',
                    SquadId: '',
                    category: 335010,
                    affinities: {
                        air: 'NotApplicable',
                        vehicle: 'Good',
                        infantry: 'Neutral'
                    }
                }
            ];

            constructor() {
            }
        }
    });
})();