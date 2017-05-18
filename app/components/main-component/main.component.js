(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("mainComponent", {
        templateUrl: "/components/main-component/main.component.html",
        controllerAs: "model",
        controller: ["$mdSidenav", "$mdDialog", mainController],
        bindings: {
        }
    });

    module.config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("cyan")
            .accentPalette("orange")
            .warnPalette("lime");
    });

    function mainController($mdSidenav, $mdDialog) {
        var model = this;

        model.tabIndex = 0;

        model.toggleSideNav = function () {
            $mdSidenav("left").toggle();
        };

        model.clearNotes = function ($event) {
            var confirm = $mdDialog.confirm()
                .title("Are you sure you want to delete all notes?")
                .textContent("All notes will be deleted, you can't undo this action.")
                .targetEvent($event)
                .ok("Yes")
                .cancel("No");

            $mdDialog.show(confirm).then(() => {
                console.log("Cleared Notes");
            });
        }
    }
}());