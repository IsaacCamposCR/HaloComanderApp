(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("tutorialComponent", {
        templateUrl: "/components/welcome-component/tutorial.component.html",
        controllerAs: "model",
        controller: [tutorialController]
    });

    function tutorialController() {
        var model = this;

        model.$onInit = function () {
            documentReady();
        };

        var documentReady = function () {
            angular.element('.cd-single-point').children('a').mouseover(function () {
                angular.element(this).parent('li').addClass('is-open');
            }).mouseout(function () {
                angular.element(this).parent('li').removeClass('is-open').addClass('visited');
            });
        };
    };
})();