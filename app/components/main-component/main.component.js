(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("mainComponent", {
        templateUrl: "/components/main-component/main.component.html",
        controllerAs: "model",
        controller: ["$resource", "$mdSidenav", mainController],
        bindings: {
        }
    });

    module.config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("cyan")
            .accentPalette("orange");
    });

    function mainController($resource, $mdSidenav) {
        var model = this;

        model.tabIndex = 0;

        model.toggleSideNav = function () {
            $mdSidenav("left").toggle();
        }
    }
}());