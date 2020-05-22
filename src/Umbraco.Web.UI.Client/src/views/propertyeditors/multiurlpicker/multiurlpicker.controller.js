function multiUrlPickerController($scope, angularHelper, localizationService, entityResource, iconHelper, editorService, udiParser, editorState) {


    var vm = this;
    vm.creatorMenu = null;
    vm.labels = {
        general_recycleBin: "",
        grid_addElement: ""
    }

    if ($scope.preview) {
        return;
    }

    if (!Array.isArray($scope.model.value)) {
        $scope.model.value = [];
    }

    var currentForm = angularHelper.getCurrentForm($scope);

    vm.sortableOptions = {
        axis: "y",
        containment: "parent",
        distance: 10,
        opacity: 0.7,
        tolerance: "pointer",
        cursor: "grabbing",
        scroll: true,
        zIndex: 6000,
        update: function () {
            currentForm.$setDirty();
        }
    };


    function init() {
        
        localizationService.localizeMany(["general_recycleBin", "grid_addElement"]).then(function (data) {
            vm.labels.general_recycleBin = data[0];
            vm.labels.grid_addElement = data[1];
        });

        // if the property is mandatory, set the minCount config to 1 (unless of course it is set to something already),
        // that way the minCount/maxCount validation handles the mandatory as well
        if ($scope.model.validation && $scope.model.validation.mandatory && !$scope.model.config.minNumber) {
            $scope.model.config.minNumber = 1;
        }

        $scope.model.value.forEach(function (item) {

            if (item.udi) {
                // extract the entity type from the udi and set target.isMedia accordingly
                var udi = udiParser.parse(item.udi);

                if (udi && udi.entityType === "media") {
                    item.isMedia = true;
                } else {
                    delete item.isMedia;
                }

                // we must reload the "document" link URLs to match the current editor culture
                if (udi && udi.entityType === "document") {
                    item.url = null;
                    entityResource.getUrlByUdi(item.udi).then(function (data) {
                        item.url = data;
                    });
                }
            }

            item.icon = iconHelper.convertFromLegacyIcon(item.icon);
        });
    }


    $scope.$watch(
        function () {
            return $scope.model.value.length;
        },
        function () {
            //Validate!
            if ($scope.model.config && $scope.model.config.minNumber && parseInt($scope.model.config.minNumber) > $scope.model.value.length) {
                $scope.multiUrlPickerForm.minCount.$setValidity("minCount", false);
            }
            else {
                $scope.multiUrlPickerForm.minCount.$setValidity("minCount", true);
            }

            if ($scope.model.config && $scope.model.config.maxNumber && parseInt($scope.model.config.maxNumber) < $scope.model.value.length) {
                $scope.multiUrlPickerForm.maxCount.$setValidity("maxCount", false);
            }
            else {
                $scope.multiUrlPickerForm.maxCount.$setValidity("maxCount", true);
            }
            vm.sortableOptions.disabled = $scope.model.value.length === 1;
        }
    );

    vm.removeLink = function (link) {
        var index = $scope.model.value.indexOf(link);
        if(index !== -1) {
            $scope.model.value.splice(index, 1);
            currentForm.$setDirty();
        }
    };

    vm.openLinkCreator = function ($event) {

        if (vm.creatorMenu !== null) {
            return;
        }

        var availableLinkTypes = [
            {
                alias: "url",
                name: "URL",
                icon: "icon-link",
                method: vm.editUrlLink
            },
            {
                alias: "contentnode",
                name: "Content",
                icon: "icon-document",
                method: vm.editContentNodeLink
            },
            {
                alias: "medianode",
                name: "Media",
                icon: "icon-picture",
                method: vm.editMediaNodeLink
            }
        ];
        // TODO: think about extensability.

        // TODO: Add ability to paste.

        vm.creatorMenu = {
            show: true,
            style: {},
            orderBy: "$index",
            view: "itempicker",
            event: $event,
            title: "Add link",
            availableItems: availableLinkTypes,
            filter: false,
            submit: function (model) {
                if (model && model.selectedItem) {
                    model.selectedItem.method();
                }
                vm.creatorMenu.close();
            },
            close: function () {
                vm.creatorMenu.show = false;
                vm.creatorMenu = null;
            }
        };
    };


    vm.editUrlLink = function (linkModel) {

        var isNew = (linkModel === undefined);
        var title = isNew ? "Create link" : "Link settings";

        var urlPicker = {
            title: title,
            linkModel: linkModel,
            view: "views/common/infiniteeditors/urlpicker/urlpicker.html",
            size: "small",
            hideAnchor: $scope.model.config && $scope.model.config.hideAnchor ? true : false,
            submit: function (urlPickerModel) {
                if (urlPickerModel.linkModel.url || urlPickerModel.linkModel.queryString) {
                    
                    // if an anchor exists, check that it is appropriately prefixed
                    if (urlPickerModel.linkModel.queryString && urlPickerModel.linkModel.queryString[0] !== '?' && urlPickerModel.linkModel.queryString[0] !== '#') {
                        urlPickerModel.linkModel.queryString = (urlPickerModel.linkModel.queryString.indexOf('=') === -1 ? '#' : '?') + urlPickerModel.linkModel.queryString;
                    }

                    if(isNew === true) {
                        linkModel = {};
                    }

                    linkModel.name = urlPickerModel.linkModel.name || urlPickerModel.linkModel.url || urlPickerModel.linkModel.queryString;
                    linkModel.queryString = urlPickerModel.linkModel.queryString;
                    linkModel.target = urlPickerModel.linkModel.target;
                    linkModel.udi = urlPickerModel.linkModel.udi;
                    linkModel.url = urlPickerModel.linkModel.url;
                    linkModel.icon = "icon-link";
                    linkModel.published = true;

                    if(isNew === true) {
                        $scope.model.value.push(linkModel);
                    }

                    currentForm.$setDirty();
                }
                editorService.close();
            },
            close: function () {
                editorService.close();
            }
        };
        editorService.open(urlPicker);
    };

    vm.editContentNodeLink = function(linkModel) {

        var isNew = (linkModel === undefined);

        var contentPicker = {
            multiPicker: false,
            entityType: "Document",
            filterCssClass: "not-allowed not-published",
            startNodeId: null,
            currentNode: editorState ? editorState.current : null,
            treeAlias: "Document",
            section: "Document",
            idType: "udi"
        };

        var contentPicker = {
            submit: function (model) {
                var content = model.selection[0];

                entityResource.getById(content.udi, "Document").then(function (data) {
                    
                    if(isNew === true) {
                        linkModel = {};
                    }

                    linkModel.name = content.name;
                    linkModel.queryString = null;
                    linkModel.target = null;
                    linkModel.udi = content.udi;
                    linkModel.icon = iconHelper.convertFromLegacyIcon(data.icon);
                    linkModel.published =  (data.metaData && data.metaData.IsPublished === false) ? false : true;
                    linkModel.trashed = data.trashed;
                    if (linkModel.trashed) {
                        item.url = vm.labels.general_recycleBin;
                    }

                    entityResource.getUrlAndAnchors(content.id).then(function (resp) {
                        linkModel.url = resp.url;
                        if(isNew === true) {
                            vm.addLink(linkModel);
                        }
                    });

                    editorService.close();
                });
            },
            close: function () {
                editorService.close();
            }
        };

        editorService.contentPicker(contentPicker);
    }

    vm.editMediaNodeLink = function(linkModel) {

        var isNew = (linkModel === undefined);

        var mediaPickerOptions = {
            view: "mediapicker",
            multiPicker: false,
            disableFolderSelect: true,
            onlyImages: true,
            submit: function (model) {
                var media = model.selection[0];

                entityResource.getById(media.udi, "Media").then(function (data) {

                    if(isNew === true) {
                        linkModel = {};
                    }

                    linkModel.udi = media.udi;
                    linkModel.isMedia = true;
                    linkModel.name = media.name;
                    linkModel.url = media.image;
                    linkModel.icon = iconHelper.convertFromLegacyIcon(data.icon);
                    linkModel.published = true;
                    linkModel.trashed = data.trashed;
                    if (linkModel.trashed) {
                        item.url = vm.labels.general_recycleBin;
                    }

                    if (isNew === true) {
                        vm.addLink(linkModel);
                    }

                    editorService.close();
                });

            },
            close: function () {
                editorService.close();
            } 
        };
        editorService.mediaPicker(mediaPickerOptions);
    }
    
    vm.addLink = function (link) {
        $scope.model.value.push(link);
    }
    /*
    vm.updateLink = function (oldModel, link) {
        var index = $scope.model.value.indexOf(oldModel);
        if(index !== -1) {
            $scope.model.value[index] = urlPickerModel.linkModel;
        } else {
            $scope.model.value.push(link);
        }
    }
    */
    vm.editLink = function (link) {
        if (link.udi) {
            
            vm.openNodeLinkeditor(link);
            
        } else {
            vm.editUrlLink(link);
        }
    }

    vm.openNodeLinkeditor = function(linkModel) {

        var nodeChangeLabel = "Content";
        var nodeChangeMethod;
        
        if (linkModel.isMedia === true) {
            nodeChangeMethod = vm.editMediaNodeLink;
        } else {
            nodeChangeMethod = vm.editContentNodeLink;
        }
        
        
        var urlPicker = {
            title: "Link settings",
            linkModel: linkModel,
            nodeChangeLabel: nodeChangeLabel,
            nodeChangeMethod: nodeChangeMethod,
            view: "views/common/infiniteeditors/nodelinkeditor/nodelinkeditor.html",
            size: "small",
            hideAnchor: $scope.model.config && $scope.model.config.hideAnchor ? true : false,
            submit: function (nodeLinkEditorModel) {
                var link = nodeLinkEditorModel.linkModel;
                if (link.url || link.queryString) {
                    
                    // if an anchor exists, check that it is appropriately prefixed
                    if (link.queryString && link.queryString[0] !== '?' && link.queryString[0] !== '#') {
                        link.queryString = (link.queryString.indexOf('=') === -1 ? '#' : '?') + link.queryString;
                    }

                    currentForm.$setDirty();
                }

                linkModel.udi = link.udi;
                linkModel.isMedia = link.isMedia;
                linkModel.name = link.name;
                linkModel.url = link.url;
                linkModel.icon = link.icon;
                linkModel.published = link.published;
                linkModel.trashed = link.trashed;
                linkModel.queryString = link.queryString;
                linkModel.target = link.target;

                editorService.close();
            },
            close: function () {
                editorService.close();
            }
        };
        editorService.open(urlPicker);
    }
    /*
    vm.openLinkPicker = function (link, $index) {
        var target = link ? {
            name: link.name,
            anchor: link.queryString,
            udi: link.udi,
            url: link.url,
            target: link.target
        } : null;

        var linkPicker = {
            currentTarget: target,
            dataTypeKey: $scope.model.dataTypeKey,
            ignoreUserStartNodes : ($scope.model.config && $scope.model.config.ignoreUserStartNodes) ? $scope.model.config.ignoreUserStartNodes : "0",
            hideAnchor: $scope.model.config && $scope.model.config.hideAnchor ? true : false,
            submit: function (linkmodel) {
                if (linkmodel.target.url || linkmodel.target.anchor) {
                    // if an anchor exists, check that it is appropriately prefixed
                    if (linkmodel.target.anchor && linkmodel.target.anchor[0] !== '?' && linkmodel.target.anchor[0] !== '#') {
                        linkmodel.target.anchor = (linkmodel.target.anchor.indexOf('=') === -1 ? '#' : '?') + linkmodel.target.anchor;
                    }
                    if (link) {
                        link.udi = linkmodel.target.udi;
                        link.name = linkmodel.target.name || linkmodel.target.url || linkmodel.target.anchor;
                        link.queryString = linkmodel.target.anchor;
                        link.target = linkmodel.target.target;
                        link.url = linkmodel.target.url;
                    } else {
                        link = {
                            name: linkmodel.target.name || linkmodel.target.url || linkmodel.target.anchor,
                            queryString: linkmodel.target.anchor,
                            target: linkmodel.target.target,
                            udi: linkmodel.target.udi,
                            url: linkmodel.target.url
                        };
                        $scope.model.value.push(link);
                    }

                    if (link.udi) {
                        var entityType = linkmodel.target.isMedia ? "Media" : "Document";

                        entityResource.getById(link.udi, entityType).then(function (data) {
                            link.icon = iconHelper.convertFromLegacyIcon(data.icon);
                            link.published = (data.metaData && data.metaData.IsPublished === false && entityType === "Document") ? false : true;
                            link.trashed = data.trashed;
                            if (link.trashed) {
                                item.url = vm.labels.general_recycleBin;
                            }
                        });
                    } else {
                        link.icon = "icon-link";
                        link.published = true;
                    }

                    currentForm.$setDirty();
                }
                editorService.close();
            },
            close: function () {
                editorService.close();
            }
        };
        editorService.linkPicker(linkPicker);
    };
    */
    init();
}

angular.module("umbraco").controller("Umbraco.PropertyEditors.MultiUrlPickerController", multiUrlPickerController);

