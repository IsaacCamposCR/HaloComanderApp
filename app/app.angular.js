(function () {
    "use strict";

    var module = angular.module("haloCommander", ["ngResource", "ngComponentRouter", "ngMaterial", "ngMdIcons"]);
    module.config(function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });

    module.value("$routerRootComponent", "haloApp");
}());