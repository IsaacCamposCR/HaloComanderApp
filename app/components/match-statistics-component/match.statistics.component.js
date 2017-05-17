(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("matchStatisticsComponent", {
        templateUrl: "/components/match-statistics-component/match.statistics.component.html",
        controllerAs: "model",
        controller: [matchStatisticsController],
        bindings: {
            selected: "="
        }
    });

    function matchStatisticsController() {
        var model = this;
    }
}());