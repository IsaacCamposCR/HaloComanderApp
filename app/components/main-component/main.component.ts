(function () {
    "use strict";

    var module = angular.module("haloCommander");

    module.component("mainComponent", {
        templateUrl: "/components/main-component/main.component.html",
        bindings: {
        },
        controllerAs: "model",
        controller: ["$mdSidenav", "$mdDialog", "$mdMedia", "playerSeasonService",
            //mainController],
            //controller: 
            class mainCtrl {

                $mdSidenav: any;
                $mdDialog: any;
                $mdMedia: any;

                playerSeasonService: any;

                tabIndex: number = 0;
                tutorial: boolean = false;
                welcome: boolean = false;
                about: boolean = false;
                example: any = [
                    {
                        PopulationCost: 5,
                        type: 'UNIT',
                        category: 334896,
                        SquadId: '',
                        affinities: {
                            air: 'Poor',
                            vehicle: 'Good',
                            infantry: 'Neutral'
                        }
                    },
                    {
                        PopulationCost: 4,
                        type: 'UNIT',
                        category: 335158,
                        SquadId: '',
                        affinities: {
                            air: 'NotApplicable',
                            vehicle: 'NotApplicable',
                            infantry: 'NotApplicable'
                        }
                    },
                    {
                        PopulationCost: 5,
                        type: 'UNIT',
                        SquadId: '',
                        category: 335010,
                        affinities: {
                            air: 'NotApplicable',
                            vehicle: 'Good',
                            infantry: 'Neutral'
                        }
                    }
                ];

                constructor($mdSidenav, $mdDialog, $mdMedia, playerSeasonService) {
                    this.$mdSidenav = $mdSidenav;
                    this.$mdDialog = $mdDialog;
                    this.$mdMedia = $mdMedia;
                    this.playerSeasonService = playerSeasonService;
                }

                init() {
                    this.playerSeasonService.isNewSeason();
                }

                $routerOnActivate = function (next) {
                    if (next.params) {
                        console.log(next.params);
                        if (next.params.id) {
                            this.selected = { matchId: next.params.id };
                        }
                    }
                }

                toggleSideNav() {
                    this.$mdSidenav("left").toggle();
                }

                showShare(ev) {
                    var useFullScreen = (this.$mdMedia("sm") || this.$mdMedia("xs"));

                    this.$mdDialog.show({
                        controller: ["$scope", "$mdDialog", DialogController],
                        template: `
                        <md-dialog style='background: #E0E0E0;'>
                            <md-toolbar>
                                <div class='md-toolbar-tools'>
                                    <h2>Share Links</h2>
                                    <span flex></span>
                                    <md-button class='md-icon-button' ng-click='cancel()' aria-label='Close'>
                                        <ng-md-icon icon='close'></ng-md-icon>
                                    </md-button>
                                </div>
                            </md-toolbar>
                            <md-dialog-content>
                                <div class='md-dialog-content'>
                                    <h3><a href="${this.shareMatch.waypoint}">Click here to open Match on Halo Waypoint</a></h3>
                                    ${this.shareMatch.waypoint}
                                    <br>
                                    <h3><a href="${this.shareMatch.tracker}">Click here to open Match on Battle Tracker</a></h3>
                                    ${this.shareMatch.tracker}                                    
                                </div>
                            </md-dialog-content>
                        </md-dialog>
                        `,
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        escapeToClose: true,
                        fullscreen: useFullScreen
                    });
                }

                showInstructions(ev) {
                    var useFullScreen = (this.$mdMedia("sm") || this.$mdMedia("xs"));

                    this.$mdDialog.show({
                        controller: ["$scope", "$mdDialog", DialogController],
                        template: `
                        <md-dialog style='background: #E0E0E0;'>
                            <md-toolbar>
                                <div class='md-toolbar-tools'>
                                    <h2>Instructions unclear...</h2>
                                    <span flex></span>
                                    <md-button class='md-icon-button' ng-click='cancel()' aria-label='Close'>
                                        <ng-md-icon icon='close'></ng-md-icon>
                                    </md-button>
                                </div>
                            </md-toolbar>
                            <md-dialog-content>
                                <div class='md-dialog-content'>
                                    <tutorial-component></tutorial-component>
                                </div>
                            </md-dialog-content>
                        </md-dialog>
                        `,
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        fullscreen: useFullScreen
                    });
                }

                showAbout(ev) {
                    var useFullScreen = (this.$mdMedia("sm") || this.$mdMedia("xs"));

                    this.$mdDialog.show({
                        controller: ["$scope", "$mdDialog", DialogController],
                        template: `
                        <md-dialog style='background: #E0E0E0;'>
                            <md-toolbar>
                                <div class='md-toolbar-tools'>
                                    <h2>Welcome!</h2>
                                    <span flex></span>
                                    <md-button class='md-icon-button' ng-click='cancel()' aria-label='Close'>
                                        <ng-md-icon icon='close'></ng-md-icon>
                                    </md-button>
                                </div>
                            </md-toolbar>
                            <md-dialog-content>
                                <div class='md-dialog-content'>
                                    <welcome-component style='margin:3%;margin-bottom:1%'></welcome-component>
                                    <about-component style='margin:3%;margin-top:1%'></about-component>
                                </div>
                            </md-dialog-content>
                        </md-dialog>
                        `,
                        parent: angular.element(document.body),
                        targetEvent: ev,
                        clickOutsideToClose: true,
                        escapeToClose: true,
                        fullscreen: useFullScreen
                    });
                }

                showContact(ev) {
                }
            }]
    });

    module.config(["$mdThemingProvider",
        function ($mdThemingProvider) {
            $mdThemingProvider.definePalette('amazingPaletteName', {
                '50': 'e5e5e5',
                '100': 'bebebe',
                '200': '939393',
                '300': '686868',
                '400': '474747',
                '500': '272727',
                '600': '232323',
                '700': '1d1d1d',
                '800': '171717',
                '900': '0e0e0e',
                'A100': 'eb6969',
                'A200': 'e53c3c',
                'A400': 'ee0000',
                'A700': 'd40000',
                'contrastDefaultColor': 'light',
                'contrastDarkColors': [
                    '50',
                    '100',
                    '200',
                    'A100'
                ],
                'contrastLightColors': [
                    '300',
                    '400',
                    '500',
                    '600',
                    '700',
                    '800',
                    '900',
                    'A200',
                    'A400',
                    'A700'
                ]
            });

            $mdThemingProvider.theme('default')
                .primaryPalette('amazingPaletteName')
                .accentPalette("amazingPaletteName")
                .warnPalette("amazingPaletteName");
        }]);
}());