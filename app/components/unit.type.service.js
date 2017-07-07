(function () {

    "use strict";

    var module = angular.module("haloCommander");

    module.factory("unitTypeService", function () {

        const heroUnits = [
            "unsc_inf_omegateam_leon_01",
            "unsc_inf_omegateam_august_01",
            "unsc_inf_omegateam_robert_01",
            "unsc_inf_omegateam_jerome_01",
            "unsc_inf_johnsonhero_01",
            "unsc_inf_spartan_mpjerome_01",
            "unsc_inf_spartan_mpdoug_01",
            "cov_inf_atrioxchosen_01",
            "cov_inf_bruteHonour_01",
            "cov_inf_elitecommando_01",
            "cov_inf_impervioushunter_01",
            "cov_inf_arbiter_01",
            "unsc_veh_forgehog_01",
            "unsc_inf_flamecyclops_01",
            "unsc_inf_spartan_mpalice_01"
        ];

        const ultimateUnits = [
            "cov_inf_mpdecimus_01",
            "for_air_retriever_base"
        ];

        const superUnits = [
            "cov_veh_scarab_01",
            "unsc_air_destroyer_01"
        ];

        const unitCategories = [
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
        function searchUnitType(name) {
            if (heroUnits.includes(name)) {
                return "HERO";
            }
            if (ultimateUnits.includes(name)) {
                return "ULTIMATE";
            }
            if (superUnits.includes(name)) {
                return "SUPER";
            }
            return "UNIT";
        };

        // Returns the unit category, if it is a vehicle, air or infantry unit.
        function searchUnitCategory(id) {
            console.log(id);
            var unitCategory = unitCategories.find(function (category) {
                return category.id === id;
            });
            console.log(unitCategory);
            return (unitCategory != null) ? unitCategory.name : "UNKNOWN";
        };

        return {
            find: searchUnitType,
            category: searchUnitCategory
        }
    });

}());