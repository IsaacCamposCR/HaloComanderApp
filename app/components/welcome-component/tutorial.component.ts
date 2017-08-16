(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("tutorialComponent", {
        templateUrl: "/components/welcome-component/tutorial.component.html",
        controllerAs: "model",
        controller: class TutorialCtrl {

            poimap: any;
            constructor() {
                this.poimap = "https://image.ibb.co/myrDsF/battles.png";
                
                this.documentReady();
            }

            documentReady() {
                angular.element('.cd-single-point').children('a').mouseover(function () {
                    angular.element(this).parent('li').addClass('is-open');
                }).mouseout(function () {
                    angular.element(this).parent('li').removeClass('is-open').addClass('visited');
                });
            }
        }
    });
})();