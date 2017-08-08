(function () {

    "use strict";

    var module = angular.module("haloCommander");

    module.service("unitTypeService", class UnitTypeService {

        constructor() {

        }

        const heroUnits: Array<string> = [
            "unsc_inf_omegateam_leon_01",
            "unsc_inf_omegateam_august_01",
            "unsc_inf_omegateam_robert_01",
            "unsc_inf_omegateam_jerome_01",
            "unsc_inf_johnson_hero_01",
            "unsc_inf_spartan_mpjerome_01",
            "unsc_inf_spartan_mpdoug_01",
            "cov_inf_atrioxchosen_01",
            "cov_inf_bruteHonour_01",
            "cov_inf_elitecommando_01",
            "cov_inf_impervioushunter_01",
            "cov_inf_arbiter_01",
            "unsc_veh_forgehog_01",
            "unsc_inf_flamecyclops_01",
            "unsc_inf_spartan_mpalice_01",
            "unsc_veh_serina_hero_01"
        ];

        const ultimateUnits: Array<string> = [
            "cov_inf_mpdecimus_01",
            "for_air_retriever_base"
        ];

        const superUnits: Array<string> = [
            "cov_veh_scarab_01",
            "unsc_air_destroyer_01"
        ];

        const unitCategories: Array<any> = [
            {
                id: 335010,
                name: "VEHICLE"
            },
            {
                id: 335158,
                name: "AIR"
            },
            {
                id: 334896,
                name: "INFANTRY"
            }
        ]

        // Returns the unit type, if it is a hero unit, ultimate unit or super unit.
        find(name) {
            if (this.heroUnits.includes(name)) {
                return "HERO";
            }
            if (this.ultimateUnits.includes(name)) {
                return "ULTIMATE";
            }
            if (this.superUnits.includes(name)) {
                return "SUPER";
            }
            return "UNIT";
        };

        // Returns the unit category, if it is a vehicle, air or infantry unit.
        category(id) {
            var unitCategory = this.unitCategories.find((category) => {
                return category.id === id;
            });
            return (unitCategory != null) ? unitCategory.name : "UNKNOWN";
        };
    });
}());