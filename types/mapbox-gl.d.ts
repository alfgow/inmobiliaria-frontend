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
    easeTo(options: { center?: LngLatLike; zoom?: number; padding?: number | { top?: number; bottom?: number; left?: number; right?: number }; maxZoom?: number }): void;
    fitBounds(bounds: LngLatBounds, options?: { padding?: number | { top?: number; bottom?: number; left?: number; right?: number }; maxZoom?: number }): void;
    addControl(control: unknown, position?: string): this;

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
    setPopup(popup: Popup): this;
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

  interface NavigationControlOptions {
    showZoom?: boolean;
    showCompass?: boolean;
    visualizePitch?: boolean;
  }

  class NavigationControl {
    constructor(options?: NavigationControlOptions);
  }

  interface PopupOptions {
    offset?: number | { [anchor: string]: [number, number] } | [number, number];
    maxWidth?: string;
  }

  class Popup {
    constructor(options?: PopupOptions);
    setDOMContent(node: HTMLElement): this;
    setLngLat(lngLat: LngLatLike): this;
    addTo(map: Map): this;
    remove(): void;
  }

  class LngLatBounds {
    constructor(sw?: LngLatLike, ne?: LngLatLike);
    extend(lngLat: LngLatLike): this;
    isEmpty(): boolean;
  }

  const mapboxgl: {
    Map: typeof Map;
    Marker: typeof Marker;
    Popup: typeof Popup;
    NavigationControl: typeof NavigationControl;
    AttributionControl: typeof AttributionControl;
    LngLatBounds: typeof LngLatBounds;
    accessToken?: string;
  };

  export default mapboxgl;
  export { Map, Marker, Popup, NavigationControl, AttributionControl, LngLatBounds };
}
