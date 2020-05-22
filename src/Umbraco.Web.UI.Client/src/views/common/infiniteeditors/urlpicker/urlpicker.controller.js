//used for the multiurlpicker when editing or creating a url link.
angular.module("umbraco").controller("Umbraco.Editors.UrlPickerController",
    function ($scope, localizationService) {

        var vm = this;

        vm.submit = submit;
        vm.close = close;

        vm.toggleOpenInNewWindow = toggleOpenInNewWindow;
        function toggleOpenInNewWindow(model, value) {
            $scope.model.linkModel.target = model ? "_blank" : "";
        }


        vm.labels = {};
        localizationService.localizeMany(["defaultdialogs_openInNewWindow"]).then(function (data) {
            vm.labels.openInNewWindow = data[0];
        });

        if (!$scope.model.title) {
            localizationService.localize("defaultdialogs_selectLink")
                .then(function (value) {
                    $scope.model.title = value;
                });
        }


        vm.showTarget = $scope.model.hideTarget !== true;
        vm.showAnchor = $scope.model.hideAnchor !== true;

        if ($scope.model.linkModel) {

            // clone the current target so we don't accidentally update the caller's model while manipulating $scope.model.linkModel
            $scope.model.linkModel = Utilities.copy($scope.model.linkModel);
            
            if ($scope.model.linkModel.url && $scope.model.linkModel.url.length) {
                // a url but no id/udi indicates an external link - trim the url to remove the anchor/qs
                // only do the substring if there's a # or a ?
                var indexOfAnchor = $scope.model.linkModel.url.search(/(#|\?)/);
                if (indexOfAnchor > -1) {
                    // populate the anchor
                    $scope.model.linkModel.queryString = $scope.model.linkModel.url.substring(indexOfAnchor);
                    // then rewrite the model and populate the link
                    $scope.model.linkModel.url = $scope.model.linkModel.url.substring(0, indexOfAnchor);
                }
            }

            // need to translate the link target ("_blank" or "") into a boolean value for umb-checkbox
            vm.openInNewWindow = $scope.model.linkModel.target === "_blank";
        } else {
            $scope.model.linkModel = {};
        }
        if ($scope.model.anchors) {
            $scope.anchorValues = $scope.model.anchors;
        }

        function close() {
            if ($scope.model && $scope.model.close) {
                $scope.model.close();
            }
        }

        function submit() {
            if ($scope.model && $scope.model.submit) {
                $scope.model.submit($scope.model);
            }
        }

    });
