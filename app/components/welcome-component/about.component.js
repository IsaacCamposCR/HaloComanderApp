(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("aboutComponent", {
        templateUrl: "/components/welcome-component/about.component.html",
        controllerAs: "model",
        controller: [aboutController]
    });

    function aboutController() {
        var model = this;

        model.$onInit = function () {
        };
    };
})();