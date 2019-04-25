/// <reference path="notifications.service.ts" />
/// <reference path="angularhelper.service.ts" />
/**
 * @ngdoc service
 * @name umbraco.services.formHelper
 * @function
 *
 * @description
 * A utility class used to streamline how forms are developed, to ensure that validation is check and displayed consistently and to ensure that the correct events
 * fire when they need to.
 */
namespace umbraco.services {
    export enum FormHelperEvents {
        FormSubmitting = "formSubmitting",
        FormSubmitted = "formSubmitted"
    }

    export class FormHelper {
        private angularHelper: umbraco.services.angularHelper;
        private serverValidationManager: any; // TODO: add the type to this once we've actually converted it
        private notificationsService: umbraco.services.NotificationsService;
        private overlayService: any; // TODO: add the type to this once we've actually converted it

        public constructor(
            angularHelper: umbraco.services.angularHelper,
            serverValidationManager: any,
            notificationsService: umbraco.services.NotificationsService,
            overlayService: any
        ) {
            this.angularHelper = angularHelper;
            this.serverValidationManager = serverValidationManager;
            this.notificationsService = notificationsService;
            this.overlayService = overlayService;
        }

        /**
         * @ngdoc function
         * @name umbraco.services.formHelper#submitForm
         * @methodOf umbraco.services.formHelper
         * @function
         *
         * @description
         * Called by controllers when submitting a form - this ensures that all client validation is checked,
         * server validation is cleared, that the correct events execute and status messages are displayed.
         * This returns true if the form is valid, otherwise false if form submission cannot continue.
         *
         * @param {object} args An object containing arguments for form submission
         */
        public submitForm(args: models.iFormSubmissionData) {
            var currentForm;

            if (!args) {
                throw "args cannot be null";
            }
            if (!args.scope) {
                throw "args.scope cannot be null";
            }
            if (!args.formCtrl) {
                //try to get the closest form controller
                currentForm = this.angularHelper.getRequiredCurrentForm(
                    args.scope
                );
            } else {
                currentForm = args.formCtrl;
            }

            //the first thing any form must do is broadcast the formSubmitting event
            args.scope.$broadcast(FormHelperEvents.FormSubmitting, {
                scope: args.scope,
                action: args.action
            });

            //then check if the form is valid
            if (!args.skipValidation) {
                if (currentForm.$invalid) {
                    return false;
                }
            }

            //reset the server validations
            this.serverValidationManager.reset();

            return true;
        }

        /**
         * @ngdoc function
         * @name umbraco.services.formHelper#submitForm
         * @methodOf umbraco.services.formHelper
         * @function
         *
         * @description
         * Called by controllers when a form has been successfully submitted, this ensures the correct events are raised.
         *
         * @param {object} args An object containing arguments for form submission
         */
        public resetForm(args: models.iHasScope) {
            if (!args) {
                throw "args cannot be null";
            }
            if (!args.scope) {
                throw "args.scope cannot be null";
            }

            args.scope.$broadcast(FormHelperEvents.FormSubmitted, {
                scope: args.scope
            });
        }

        public showNotifications(args: models.iShowNotificationsArgs) {
            if (!args || !args.notifications) {
                return false;
            }
            if (angular.isArray(args.notifications)) {
                for (var i = 0; i < args.notifications.length; i++) {
                    this.notificationsService.showNotification(
                        args.notifications[i]
                    );
                }
                return true;
            }
            return false;
        }

        /**
         * @ngdoc function
         * @name umbraco.services.formHelper#handleError
         * @methodOf umbraco.services.formHelper
         * @function
         *
         * @description
         * Needs to be called when a form submission fails, this will wire up all server validation errors in ModelState and
         * add the correct messages to the notifications. If a server error has occurred this will show a ysod.
         *
         * @param {object} err The error object returned from the http promise
         */
        public handleError(err: object) {
            // TODO: Do we bother mapping out this error type into a TypeScript type?
            //When the status is a 400 status with a custom header: X-Status-Reason: Validation failed, we have validation errors.
            //Otherwise the error is probably due to invalid data (i.e. someone mucking around with the ids or something).
            //Or, some strange server error
            if (err.status === 400) {
                //now we need to look through all the validation errors
                if (err.data && err.data.ModelState) {
                    //wire up the server validation errs
                    this.handleServerValidation(err.data.ModelState);

                    //execute all server validation events and subscribers
                    this.serverValidationManager.notifyAndClearAllSubscriptions();
                }
            } else {
                // TODO: All YSOD handling should be done with an interceptor
                this.overlayService.ysod(err);
            }
        }

        /**
         * @ngdoc function
         * @name umbraco.services.formHelper#handleServerValidation
         * @methodOf umbraco.services.formHelper
         * @function
         *
         * @description
         * This wires up all of the server validation model state so that valServer and valServerField directives work
         *
         * @param {object} err The error object returned from the http promise
         */
        public handleServerValidation(modelState: object) {
            for (var e in modelState) {
                //This is where things get interesting....
                // We need to support validation for all editor types such as both the content and content type editors.
                // The Content editor ModelState is quite specific with the way that Properties are validated especially considering
                // that each property is a User Developer property editor.
                // The way that Content Type Editor ModelState is created is simply based on the ASP.Net validation data-annotations
                // system.
                // So, to do this there's some special ModelState syntax we need to know about.
                // For Content Properties, which are user defined, we know that they will exist with a prefixed
                // ModelState of "_Properties.", so if we detect this, then we know it's for a content Property.

                //the alias in model state can be in dot notation which indicates
                // * the first part is the content property alias
                // * the second part is the field to which the valiation msg is associated with
                //There will always be at least 3 parts for content properties since all model errors for properties are prefixed with "_Properties"
                //If it is not prefixed with "_Properties" that means the error is for a field of the object directly.

                var parts = e.split(".");

                //Check if this is for content properties - specific to content/media/member editors because those are special
                // user defined properties with custom controls.
                if (parts.length > 1 && parts[0] === "_Properties") {
                    var propertyAlias = parts[1];

                    var culture = null;
                    if (parts.length > 2) {
                        culture = parts[2];
                        //special check in case the string is formatted this way
                        if (culture === "null") {
                            culture = null;
                        }
                    }

                    //if it contains 3 '.' then we will wire it up to a property's html field
                    if (parts.length > 3) {
                        //add an error with a reference to the field for which the validation belongs too
                        this.serverValidationManager.addPropertyError(
                            propertyAlias,
                            culture,
                            parts[3],
                            modelState[e][0]
                        );
                    } else {
                        //add a generic error for the property, no reference to a specific html field
                        this.serverValidationManager.addPropertyError(
                            propertyAlias,
                            culture,
                            "",
                            modelState[e][0]
                        );
                    }
                } else {
                    //Everthing else is just a 'Field'... the field name could contain any level of 'parts' though, for example:
                    // Groups[0].Properties[2].Alias
                    this.serverValidationManager.addFieldError(
                        e,
                        modelState[e][0]
                    );
                }
            }
        }
    }

    // Alias the new uppercased version of the class to the old version for backwards compat to
    // anything out there in the wild that might still be referencing it
    export type formsHelper = FormHelper;

    export namespace models {
        export interface iFormSubmissionData {
            scope: any;
            formCtrl?: any;
            skipValidation?: boolean;
            action: any;
        }

        export interface iShowNotificationsArgs {
            notifications: Array<umbraco.services.models.iGenericNotification>;
        }
    }
}

angular
    .module("umbraco.services")
    .factory("formHelper", umbraco.services.FormHelper);
