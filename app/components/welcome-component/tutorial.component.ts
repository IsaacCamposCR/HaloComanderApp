(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("tutorialComponent", {
        templateUrl: "/components/welcome-component/tutorial.component.html",
        controllerAs: "model",
        controller: class TutorialCtrl {

            poimap: any;
            constructor() {
                this.poimap = "https://lh3.googleusercontent.com/SP709IzbDbgZVOd-lNfWh2FnGT-3i-tl8DNERmwxsDCgtoX-y2pY90RD4ajWeWPJvfoOlSf_YpRL9_MeBvKafzfTUN6HLY3bq3WownEss0Xjp3XVPTjrbe6ZxPVdUhfcxhfnBIcOqSFGQAOLUgNAVT0f_eo6sOygF3_TohH18kI2EbNvnil6Ksr4VxQqfnPRm3e2I9tigytdDb9WBRsZXmHiF_TqP1HXHMGlDAobGIBWteWZD1XNwkJsRCNQKw5uhJTmW2kt9FSrD9vzL76EOAGoaBjAv1tS45D-b9gR4ihqDjTTha-GhSHTnVjMVLm-LUyohLaTVhszaoXCH4U8I1VMMF6pIO-4oo7vgWZIjq3rpGtpYDekTLE95Lbwa5H76yPSe8mr9VOexEkm_9EVMNfljr43tbnkzeZpVTZpYtEXq5ySu1GWvMEB-1Bjlp6Ydbtp06c5SlXgu7unufMOUHHhtYAA6tC8y3RjwBeJ1VE4ic5xFqLo2jECBBfO2g9vQ05j3pplcTKaq_j-kG7imlgwdDMoZ4IXaQReILy6fVjXsNgew-6TksJ3v_r03NV4oUSojiqDrAC1mfAcTc9D5ApoWItCmtw7eoOZyeESeKmNloYT36T5zQ=w2484-h1519-no";
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