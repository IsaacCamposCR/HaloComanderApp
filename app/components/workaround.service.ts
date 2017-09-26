(function () {

    "use strict";

    var module = angular.module("haloCommander");

    module.service("workaroundService", class WorkaroundService {

        constructor() {

        }

        // Workaround for Pavium and Voridus
        // The Id and Name tags inside HW2Leader is missing.
        // https://www.halowaypoint.com/en-us/forums/01b3ca58f06c4bd4ad074d8794d2cf86/topics/voridus-and-pavium-leader-api-missing-data/e4a68742-7c1d-400a-8d4f-4f234f08edca/posts
        isIdMissing(view) {
            //console.log("View", view);
            var id = (view["HW2Leader"])["Id"];
            var name = (view["HW2Leader"])["Name"];

            // Usually this error shows an empty array in the missing tags.
            //console.log("ID", id, id.constructor);
            // Checks if the ID is an array, if it is then it is very likely it is empty, but check anyways
            if (id.constructor === Array && id.length === 0) {
                //console.log("View Title", view["Title"]);
                switch (view["Title"]) {
                    case "EP2_LEADER_BNSH_UNBREAKABLE":
                        return {
                            "id": 15,
                            "name": "Pavium"
                        };
                    case "EP2_LEADER_BNSH_CORRUPTED":
                        return {
                            "id": 16,
                            "name": "Voridus"
                        };
                    default:
                        return {
                            "id": 0,
                            "name": "UNAVAILABLE"
                        };
                }
            }
            // Everything's ok.
            else {
                return {
                    "id": id,
                    "name": name
                };
            }
        }
    });
}());