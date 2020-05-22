//used for the multiurlpicker when editing a content or media link.
angular.module("umbraco").controller("Umbraco.Editors.NodeLinkEditorController",
    function ($scope, localizationService, entityResource, mediaHelper) {

        var vm = this;
        var dialogOptions = $scope.model;

        vm.submit = submit;
        vm.close = close;
        vm.toggleOpenInNewWindow = toggleOpenInNewWindow;
        function toggleOpenInNewWindow(model, value) {
            $scope.model.linkModel.target = model ? "_blank" : "";
        }
        vm.changeNode = function() {
            $scope.model.nodeChangeMethod($scope.model.linkModel);
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

            // need to translate the link target ("_blank" or "") into a boolean value for umb-checkbox
            vm.openInNewWindow = $scope.model.linkModel.target === "_blank";

            if ($scope.model.linkModel.isMedia === true) {
                entityResource.getById($scope.model.linkModel.udi, "Media").then(function (media) {
                    
                    if (!media.extension && media.id && media.metaData) {
                        media.extension = mediaHelper.getFileExtension(media.metaData.MediaPath);
                    }

                    // if there is no thumbnail, try getting one if the media is not a placeholder item
                    if (!media.thumbnail && media.id && media.metaData) {
                        media.thumbnail = mediaHelper.resolveFileFromEntity(media, true);
                    }

                    vm.media = media;
                });
            }
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
