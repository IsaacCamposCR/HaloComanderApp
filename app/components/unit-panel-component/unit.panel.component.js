function UnitPanelController($scope, $mdBottomSheet, Item) {
    $scope.Item = Item;

    $scope.submitContact = function (unit) {
        $mdBottomSheet.hide(Item.unit);
    }
}