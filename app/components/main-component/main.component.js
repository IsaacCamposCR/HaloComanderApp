(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("mainComponent", {
        templateUrl: "/components/main-component/main.component.html",
        controllerAs: "model",
        controller: ["$mdSidenav", "$mdDialog", "$mdMedia", "gameLeadersService", "gameObjectsService", "playerSeasonService", mainController],
        bindings: {
        }
    });

    module.config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("cyan")
            .accentPalette("orange")
            .warnPalette("lime");
        $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
    });

    function mainController($mdSidenav, $mdDialog, $mdMedia, gameLeadersService, gameObjectsService, playerSeasonService) {
        var model = this;

        model.$onInit = function () {
            model.tutorial = false;
            model.welcome = false;
            model.about = false;
            gameLeadersService.store();
            gameObjectsService.store();
            playerSeasonService.store();

        };

        model.tabIndex = 0;

        model.toggleSideNav = function () {
            $mdSidenav("left").toggle();
        };

        model.showInstructions = function (ev) {
            var useFullScreen = ($mdMedia("sm") || $mdMedia("xs"));

            $mdDialog.show({
                controller: DialogController,
                template: "<md-dialog><tutorial-component style='margin:3%'></tutorial-component></md-dialog>",
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: useFullScreen
            });
        };

        model.showAbout = function (ev) {
            var useFullScreen = ($mdMedia("sm") || $mdMedia("xs"));

            $mdDialog.show({
                controller: DialogController,
                template: "<md-dialog><welcome-component style='margin:3%;margin-bottom:1%'></welcome-component><about-component style='margin:3%;margin-top:1%'></about-component></md-dialog>",
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: useFullScreen
            });
        };

        model.showContact = function (ev) {
            /* I'll leave this here for the future, this is a simple prompt.
            var confirm = $mdDialog.confirm()
                .title("FOR ISSUES, BUGS, FEEDBACK")
                .textContent("Contact me at isaachaloelrey13@gmail.com")
                .targetEvent($event)
                .ok("DONE");

            $mdDialog.show(confirm).then(() => {
            });
            */
        };
    }
}());