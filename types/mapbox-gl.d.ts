declare module "mapbox-gl" {
  type LngLatLike = [number, number] | { lng: number; lat: number };

  interface MapboxEventHandler {
    (...args: unknown[]): void;
  }

  interface MapHandler {
    disable?: () => void;
  }

  interface TouchZoomRotateHandler extends MapHandler {
    disableRotation?: () => void;
  }

  interface MapOptions {
    container: string | HTMLElement;
    style: string;
    center?: LngLatLike;
    zoom?: number;
    pitch?: number;
    bearing?: number;
    interactive?: boolean;
    attributionControl?: boolean;
    cooperativeGestures?: boolean;
  }

  class Map {
    constructor(options: MapOptions);
    remove(): void;
    resize(): void;
    setCenter(lngLat: LngLatLike): void;
    once(type: string, listener: MapboxEventHandler): this;
    isStyleLoaded(): boolean;
    addControl(control: unknown): this;

    scrollZoom?: MapHandler;
    boxZoom?: MapHandler;
    dragPan?: MapHandler;
    dragRotate?: MapHandler;
    doubleClickZoom?: MapHandler;
    touchZoomRotate?: TouchZoomRotateHandler;
    touchPitch?: MapHandler;
    keyboard?: MapHandler;
  }

  interface MarkerOptions {
    element?: HTMLElement;
    anchor?: string;
  }

  class Marker {
    constructor(options?: MarkerOptions);
    setLngLat(lngLat: LngLatLike): this;
    addTo(map: Map): this;
    remove(): void;
  }

  interface AttributionControlOptions {
    compact?: boolean;
    customAttribution?: string | string[];
  }

  class AttributionControl {
    constructor(options?: AttributionControlOptions);
  }

  const mapboxgl: {
    Map: typeof Map;
    Marker: typeof Marker;
    AttributionControl: typeof AttributionControl;
    accessToken?: string;
  };

  export default mapboxgl;
  export { Map, Marker, AttributionControl };
}
