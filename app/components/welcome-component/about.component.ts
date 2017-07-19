(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("aboutComponent", {
        templateUrl: "/components/welcome-component/about.component.html",
        controllerAs: "model",
        controller: class AboutCtrl {
            constructor() {

            }
        }
    });
})();