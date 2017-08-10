(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("haloApp", {
        templateUrl: "/components/halo-app.component.html",
        // Creates all the component routes.
        $routeConfig: [
            { path: "/main", component: "mainComponent", name: "Main" },
            { path: "/match/:id", component: "mainComponent", name: "Match" },
            { path: "/**", redirectTo: ["Main"] }
        ]
    });
}());