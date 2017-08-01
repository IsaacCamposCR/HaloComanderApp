(function () {
    "use strict";

    var module = angular.module("haloCommander", ["ngResource", "ngComponentRouter", "ngMaterial", "ngMdIcons", "chart.js"]);
    module.config(["$locationProvider",
        function ($locationProvider) {
            $locationProvider.html5Mode({
                enabled: true,
                requireBase: false
            });
        }]);

    module.value("$routerRootComponent", "haloApp");
}());