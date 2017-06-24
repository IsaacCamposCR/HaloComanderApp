(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("welcomeComponent", {
        templateUrl: "/components/welcome-component/welcome.component.html",
        controllerAs: "model",
        controller: [welcomeController]
    });

    function welcomeController() {
        var model = this;

        model.$onInit = function () {
        };
    };


})();