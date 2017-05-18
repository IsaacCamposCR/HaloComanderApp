function DialogController($scope, $mdDialog) {
    console.log("sup");
    
    $scope.user;

    $scope.avatars = [
        "Avatar 1",
        "Avatar 2",
        "Avatar 3"
    ];

    $scope.hide = function () {
        $mdDialog.hide();
    };

    $scope.cancel = function () {
        console.log("cancel");
        $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
        console.log(answer);
        $mdDialog.hide(answer);
    };
}