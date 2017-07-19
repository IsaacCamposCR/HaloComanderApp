(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("tutorialComponent", {
        templateUrl: "/components/welcome-component/tutorial.component.html",
        controllerAs: "model",
        controller: class TutorialCtrl {

            poimap: any;
            constructor() {
                this.poimap = "https://lh3.googleusercontent.com/3bwfiKoTaMLYwCsazN5GD7if_xskuhazX-45NnhAgCbh-SqdYwLehoHBxxGYA7LjnuMqJGqCojV2lFlJfsV_uMDh26oaF04Cuvmc64V-o-IPaE-Lc11yiz3jAbM6zd9alq5mVVa4vrLqpldVmaSM076H6KogwqhC6aMMgjqi42Dvr4HLt4TPj4Xp4H9hmJTgE5kuYtEq1F6g4Yy0zyXKcq-FIwmZRbR2r4tNmIMI6MDOFXlyyRE72YmvEoRRkmEafMuR1MI_T0KrzH38Ja6rB2vzCRv61axdxV7Vv2O5KG_ppX3lyeYHF3ADdGizTSKZ7I6ipO4DthQKwa0RgkzcCUtMwCDwYERWv7q8mibVIltRt3xCUi_PWQds3qya-a-nJ0dO4mGDOGe73Abe16IHhwpen92W-seRB0C5gCPjMogXFTFc3T8v45NkV7nXCIhnVq3RJk0pcDdLAsLXc4Y4QbmR9A_wDiWw8KfWD_k_EbjkFX14cagc8ApbPkd8vK0Z0dmHyHy526GF3RvQfFD6ay456UCnJqCiasXrF729LAvWTAbhrC9R81wugZ05NIUOMVNcKn9JuVej-19AIePtV3mvCdgk7Z7NA0Plm0QExHu8Jms7G3B8Hw=w2576-h1590-no";
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