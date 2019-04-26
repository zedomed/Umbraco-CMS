/**
 @ngdoc service
 * @name umbraco.services.overlayService
 *
 * @description
 * <b>Added in Umbraco 8.0</b>. Application-wide service for handling overlays.
 */
namespace umbraco.services {
    // TODO: Move this to the appstate.service.js
    export enum AppState {
        Overlay = "appState.overlay"
    }

    export namespace models {
        export interface Overlay {
            // TODO: These optional fields are a bit dirty, for instance for booleans I suspect its using the lack of them being on an object as them being false (more like falsey), ideally should have to set them so we can make them no optional and TypeScript will let us know about it
            position?: string;
            view: string;
            disableBackdropClick?: boolean;
            show?: boolean;
            error?: any;
            close(): void;
        }

        export interface BackDropOptions {
            disableEventsOnClick: boolean;
        }
    }

    export class OverlayService {
        private backdropService: any;
        private eventsService: any;
        private currentOverlay: models.Overlay;

        public constructor(eventsService, backdropService) {
            this.eventsService = eventsService;
            this.backdropService = backdropService;
            this.currentOverlay = null;
        }

        public open(newOverlay) {
            // prevent two open overlays at the same time
            if (this.currentOverlay) {
                close();
            }

            var backdropOptions: models.BackDropOptions = {
                disableEventsOnClick: false
            };

            var overlay: models.Overlay = newOverlay;

            // set the default overlay position to center
            if (!overlay.position) {
                overlay.position = "center";
            }

            // use a default empty view if nothing is set
            if (!overlay.view) {
                overlay.view = "views/common/overlays/default/default.html";
            }

            // option to disable backdrop clicks
            if (overlay.disableBackdropClick) {
                backdropOptions.disableEventsOnClick = true;
            }

            overlay.show = true;
            this.backdropService.open(backdropOptions);
            this.currentOverlay = overlay;
            this.eventsService.emit(AppState.Overlay, overlay);
        }

        public close() {
            this.backdropService.close();
            this.currentOverlay = null;
            this.eventsService.emit(AppState.Overlay, null);
        }

        public ysod(error: any) {
            var overlay: models.Overlay = {
                view: "views/common/overlays/ysod/ysod.html",
                error: error,
                close: function() {
                    close();
                }
            };
            this.open(overlay);
        }
    }
}

angular
    .module("umbraco.services")
    .factory("overlayService", umbraco.services.OverlayService);
