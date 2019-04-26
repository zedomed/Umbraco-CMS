/// <reference path="../definitions/global.d.ts" />
/// <reference path="angularhelper.service.ts" />
/// <reference path="../definitions/string.ts" />

namespace umbraco.services {
    export enum NotificationType {
        Info = "info",
        Error = "error",
        Success = "success",
        Warning = "warning",
        Form = "form"
    }

    export enum GenericNotificationType {
        Save = 0,
        Info = 1,
        Error = 2,
        Success = 3,
        Warning = 4
    }

    /**
     * @ngdoc service
     * @name umbraco.services.notificationsService
     *
     * @requires $rootScope
     * @requires $timeout
     * @requires angularHelper
     *
     * @description
     * Application-wide service for handling notifications, the umbraco application
     * maintains a single collection of notications, which the UI watches for changes.
     * By default when a notication is added, it is automaticly removed 7 seconds after
     * This can be changed on add()
     *
     * ##usage
     * To use, simply inject the notificationsService into any controller that needs it, and make
     * sure the umbraco.services module is accesible - which it should be by default.
     *
     * <pre>
     *		notificationsService.success("Document Published", "hooraaaay for you!");
     *      notificationsService.error("Document Failed", "booooh");
     * </pre>
     */
    export class NotificationsService {
        private nArray: Array<any> = new Array<any>();

        public current: Array<any> = this.nArray;

        private $rootScope: any;
        private $timeout: any;
        private angularHelper: umbraco.services.angularHelper;

        public constructor(
            $rootScope,
            $timeout,
            angularHelper: umbraco.services.angularHelper
        ) {
            this.$rootScope = $rootScope;
            this.$timeout = $timeout;
            this.angularHelper = angularHelper;
        }

        public add(item: models.iNotification) {
            this.angularHelper.safeApply(this.$rootScope, function() {
                if (item.view) {
                    item.view = this.setViewPath(item.view);
                    item.sticky = true;
                    item.type = NotificationType.Form;
                    item.headline = null;
                }

                //add a colon after the headline if there is a message as well
                if (item.message) {
                    item.headline += ": ";
                    if (item.message.length > 200) {
                        item.sticky = true;
                    }
                }

                //we need to ID the item, going by index isn't good enough because people can remove at different indexes
                // whenever they want. Plus once we remove one, then the next index will be different. The only way to
                // effectively remove an item is by an Id.
                item.id = String.CreateGuid();

                this.nArray.push(item);

                if (!item.sticky) {
                    this.$timeout(function() {
                        var found = _.find(this.nArray, function(i) {
                            return i.id === item.id;
                        });
                        if (found) {
                            var index = this.nArray.indexOf(found);
                            this.nArray.splice(index, 1);
                        }
                    }, 10000);
                }

                return item;
            });
        }

        public hasView(view) {
            if (!view) {
                return _.find(this.nArray, function(notification) {
                    return notification.view;
                });
            } else {
                view = this.setViewPath(view).toLowerCase();
                return _.find(this.nArray, function(notification) {
                    return notification.view.toLowerCase() === view;
                });
            }
        }

        public addView(view: string, args: Array<any>) {
            var item = {
                args: args,
                view: view
            };

            this.add(item);
        }

        public showNotification(
            notification: umbraco.services.models.iGenericNotification
        ) {
            if (!notification) {
                throw "notification cannot be null";
            }
            if (notification.type === undefined || notification.type === null) {
                throw "notification.type cannot be null";
            }
            if (!notification.header) {
                throw "notification.header cannot be null";
            }

            switch (notification.type) {
                case GenericNotificationType.Save:
                    this.success(notification.header, notification.message);
                    break;
                case GenericNotificationType.Info:
                    this.success(notification.header, notification.message);
                    break;
                case GenericNotificationType.Error:
                    this.error(notification.header, notification.message);
                    break;
                case GenericNotificationType.Success:
                    this.success(notification.header, notification.message);
                    break;
                case GenericNotificationType.Warning:
                    this.warning(notification.header, notification.message);
                    break;
            }
        }

        public success(headline: string, message: string) {
            return this.add({
                headline: headline,
                message: message,
                type: NotificationType.Success,
                time: new Date()
            });
        }

        public error(headline: string, message: string) {
            return this.add({
                headline: headline,
                message: message,
                type: NotificationType.Error,
                time: new Date()
            });
        }

        public warning(headline: string, message: string) {
            return this.add({
                headline: headline,
                message: message,
                type: NotificationType.Warning,
                time: new Date()
            });
        }

        public info(headline: string, message: string) {
            return this.add({
                headline: headline,
                message: message,
                type: NotificationType.Info,
                time: new Date()
            });
        }

        public remove(index) {
            if (angular.isObject(index)) {
                var i = this.nArray.indexOf(index);
                this.angularHelper.safeApply(this.$rootScope, function() {
                    this.nArray.splice(i, 1);
                });
            } else {
                this.angularHelper.safeApply(this.$rootScope, function() {
                    this.nArray.splice(index, 1);
                });
            }
        }

        public removeAll() {
            this.angularHelper.safeApply(this.$rootScope, function() {
                this.nArray = [];
            });
        }

        public getCurrent() {
            return this.nArray;
        }

        private setViewPath(view: string): string {
            if (view.indexOf("/") < 0) {
                view = "views/common/notifications/" + view;
            }

            if (view.indexOf(".html") < 0) {
                view = view + ".html";
            }
            return view;
        }
    }

    // Alias the new uppercased version of the class to the old version for backwards compat to
    // anything out there in the wild that might still be referencing it
    export type notificationService = NotificationsService;

    /*
		Models for Notification Service
	*/
    export namespace models {
        export interface iNotification {
            id?: string;
            headline?: string;
            message?: string;
            type?: NotificationType;
            url?: string;
            view?: string;
            actions?: Array<any>;
            sticky?: boolean;
            time?: Date;
            args?: Array<any>;
        }

        // TODO: These are only mildly differnt from the above, ideally they could be merged?
        export interface iGenericNotification {
            header?: string;
            message?: string;
            type?: GenericNotificationType;
            url?: string;
            view?: string;
            actions?: Array<any>;
            sticky?: boolean;
            time?: Date;
        }
    }
}

angular
    .module("umbraco.services")
    .service("notificationsService", [
        "$rootScope",
        "$timeout",
        "angularHelper",
        umbraco.services.NotificationsService
    ]);
