namespace umbraco.services {
    /**
     * @ngdoc service
     * @name umbraco.services.appState
     * @function
     *
     * @description
     * Tracks the various application state variables when working in the back office, raises events when state changes.
     *
     * ##Samples
     *
     * ####Subscribe to global state changes:
     *
     * <pre>
     *    scope.showTree = appState.getGlobalState("showNavigation");
     *
     *    eventsService.on("appState.globalState.changed", function (e, args) {
     *               if (args.key === "showNavigation") {
     *                   scope.showTree = args.value;
     *               }
     *           });
     * </pre>
     *
     * ####Subscribe to section-state changes
     *
     * <pre>
     *    scope.currentSection = appState.getSectionState("currentSection");
     *
     *    eventsService.on("appState.sectionState.changed", function (e, args) {
     *               if (args.key === "currentSection") {
     *                   scope.currentSection = args.value;
     *               }
     *           });
     * </pre>
     */
    class AppState {
        private eventsService: any;

        constructor(eventsService) {
            this.eventsService = eventsService;
        }
        //Define all variables here - we are never returning this objects so they cannot be publicly mutable
        // changed, we only expose methods to interact with the values.

        private globalState: object = {
            showNavigation: null,
            touchDevice: null,
            showTray: null,
            stickyNavigation: null,
            navMode: null,
            isReady: null,
            isTablet: null
        };

        private sectionState: object = {
            //The currently active section
            currentSection: null,
            showSearchResults: null
        };

        private treeState: object = {
            //The currently selected node
            selectedNode: null,
            //The currently loaded root node reference - depending on the section loaded this could be a section root or a normal root.
            //We keep this reference so we can lookup nodes to interact with in the UI via the tree service
            currentRootNode: null
        };

        private menuState: object = {
            // The list of menu items to display
            menuActions: null,
            // The title to display in the context menu dialog
            dialogTitle: null,
            // The tree node that the ctx menu is launched for
            currentNode: null,
            // Whether the menu's dialog is being shown or not
            showMenuDialog: null,
            // Whether the menu's dialog can be hidden or not
            allowHideMenuDialog: true,
            // The dialogs template
            dialogTemplateUrl: null,
            //Whether the context menu is being shown or not
            showMenu: null
        };

        private searchState: object = {
            //Whether the search is being shown or not
            show: null
        };

        private drawerState: object = {
            //this view to show
            view: null,
            // bind custom values to the drawer
            model: null,
            //Whether the drawer is being shown or not
            showDrawer: null
        };

        /** function to validate and set the state on a state object */
        private setState(stateObj, key, value, stateObjName) {
            if (!_.has(stateObj, key)) {
                throw "The variable " +
                    key +
                    " does not exist in " +
                    stateObjName;
            }
            var changed = stateObj[key] !== value;
            stateObj[key] = value;
            if (changed) {
                this.eventsService.emit(
                    "appState." + stateObjName + ".changed",
                    {
                        key: key,
                        value: value
                    }
                );
            }
        }

        /** function to validate and set the state on a state object */
        private getState(stateObj, key, stateObjName) {
            if (!_.has(stateObj, key)) {
                throw "The variable " +
                    key +
                    " does not exist in " +
                    stateObjName;
            }
            return stateObj[key];
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#getGlobalState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Returns the current global state value by key - we do not return an object reference here - we do NOT want this
         * to be publicly mutable and allow setting arbitrary values
         *
         */
        public getGlobalState(key: string) {
            return this.getState(this.globalState, key, "globalState");
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#setGlobalState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Sets a global state value by key
         *
         */
        public setGlobalState(key: string, value) {
            this.setState(this.globalState, key, value, "globalState");
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#getSectionState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Returns the current section state value by key - we do not return an object here - we do NOT want this
         * to be publicly mutable and allow setting arbitrary values
         *
         */
        public getSectionState(key: string) {
            return this.getState(this.sectionState, key, "sectionState");
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#setSectionState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Sets a section state value by key
         *
         */
        public setSectionState(key: string, value) {
            this.setState(this.sectionState, key, value, "sectionState");
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#getTreeState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Returns the current tree state value by key - we do not return an object here - we do NOT want this
         * to be publicly mutable and allow setting arbitrary values
         *
         */
        public getTreeStat(key: string) {
            return this.getState(this.treeState, key, "treeState");
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#setTreeState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Sets a section state value by key
         *
         */
        public setTreeState(key: string, value) {
            this.setState(this.treeState, key, value, "treeState");
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#getMenuState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Returns the current menu state value by key - we do not return an object here - we do NOT want this
         * to be publicly mutable and allow setting arbitrary values
         *
         */
        public getMenuState(key: string) {
            return this.getState(this.menuState, key, "menuState");
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#setMenuState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Sets a section state value by key
         *
         */
        public setMenuState(key: string, value) {
            this.setState(this.menuState, key, value, "menuState");
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#getSearchState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Returns the current search state value by key - we do not return an object here - we do NOT want this
         * to be publicly mutable and allow setting arbitrary values
         *
         */
        public getSearchState(key: string) {
            return this.getState(this.searchState, key, "searchState");
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#setSearchState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Sets a section state value by key
         *
         */
        public setSearchState(key: string, value) {
            this.setState(this.searchState, key, value, "searchState");
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#getDrawerState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Returns the current drawer state value by key - we do not return an object here - we do NOT want this
         * to be publicly mutable and allow setting arbitrary values
         *
         */
        public getDrawerState(key:string) {
            return this.getState(this.drawerState, key, "drawerState");
        }

        /**
         * @ngdoc function
         * @name umbraco.services.angularHelper#setDrawerState
         * @methodOf umbraco.services.appState
         * @function
         *
         * @description
         * Sets a drawer state value by key
         *
         */
        public setDrawerState(key:string, value) {
            this.setState(this.drawerState, key, value, "drawerState");
        }
    }
}

angular
    .module("umbraco.services")
    .factory("appState", umbraco.services.AppState);
