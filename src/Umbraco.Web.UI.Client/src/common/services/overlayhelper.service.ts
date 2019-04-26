namespace umbraco.services {
    export class OverlayHelper {
        private numberOfOverlays: number = 0;

        public registerOverlay() {
            this.numberOfOverlays++;
            return this.numberOfOverlays;
        }

        public unregisterOverlay() {
            this.numberOfOverlays--;
            return this.numberOfOverlays;
        }

        public getNumberOfOverlays() {
            return this.numberOfOverlays;
        }
    }
}

angular
    .module("umbraco.services")
    .factory("overlayHelper", umbraco.services.OverlayHelper);
