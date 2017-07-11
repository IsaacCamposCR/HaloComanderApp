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
            .primaryPalette("deep-purple")
            .accentPalette("orange")
            .warnPalette("deep-orange");
        $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
    });

    function mainController($mdSidenav, $mdDialog, $mdMedia, gameLeadersService, gameObjectsService, playerSeasonService) {
        var model = this;

        model.$onInit = function () {
            model.tutorial = false;
            model.welcome = false;
            model.about = false;
            if (needsCacheRefreshing() === true) {
                gameLeadersService.store();
                gameObjectsService.store();
                playerSeasonService.store();
            }
        };

        model.init = function () {
            if (needsCacheRefreshing() === true) {
                gameLeadersService.store();
                gameObjectsService.store();
                playerSeasonService.store();
            }
        };

        var needsCacheRefreshing = function () {
            if (!localStorage.getItem("lastRefresh")) {
                if (typeof (Storage) !== "undefined") {
                    localStorage.setItem("lastRefresh", LZString.compressToUTF16(JSON.stringify(Date.now())));
                }
                return true;
            }
            else {
                var difference = Date.now() - JSON.parse(LZString.decompressFromUTF16(localStorage.getItem("lastRefresh")));
                if (difference > 604800000) {
                    localStorage.setItem("lastRefresh", LZString.compressToUTF16(JSON.stringify(Date.now())));
                    localStorage.removeItem("season");
                    localStorage.removeItem("gameLeaders");
                    localStorage.removeItem("gameObjects");
                    localStorage.removeItem("gameMaps");
                    localStorage.removeItem("designations");
                    return true;
                }
                else {
                    return false;
                }
            }
        };

        model.tabIndex = 0;

        model.toggleSideNav = function () {
            $mdSidenav("left").toggle();
        };

        model.showInstructions = function (ev) {
            var useFullScreen = ($mdMedia("sm") || $mdMedia("xs"));

            $mdDialog.show({
                controller: DialogController,
                template: "<md-dialog style='background: #E0E0E0;'><md-toolbar><div class='md-toolbar-tools'><h2>Instructions unclear...</h2><span flex></span><md-button class='md-icon-button' ng-click='cancel()' aria-label='Close'><ng-md-icon icon='close'></ng-md-icon></md-button></div></md-toolbar><md-dialog-content><div class='md-dialog-content'><tutorial-component></tutorial-component></div></md-dialog-content></md-dialog>",
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
                template: "<md-dialog style='background: #E0E0E0;'><md-toolbar><div class='md-toolbar-tools'><h2>Welcome!</h2><span flex></span><md-button class='md-icon-button' ng-click='cancel()' aria-label='Close'><ng-md-icon icon='close'></ng-md-icon></md-button></div></md-toolbar><md-dialog-content><div class='md-dialog-content'><welcome-component style='margin:3%;margin-bottom:1%'></welcome-component><about-component style='margin:3%;margin-top:1%'></about-component></div></md-dialog-content></md-dialog>",
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                escapeToClose: true,
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