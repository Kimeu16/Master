/**
 * Mapping Service Configuration
 * Supports Leaflet (primary), Google Maps (optional), and future integrations
 */

export const MAPPING_CONFIG = {
  // Primary mapping engine
  engine: "leaflet" as const,

  // Leaflet configuration
  leaflet: {
    tileLayers: {
      cartoLight: {
        url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 18,
        minZoom: 5,
      },
      cartoDark: {
        url: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 18,
        minZoom: 5,
      },
      osm: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 0,
      },
    },
    bounds: {
      minLat: -4.85,
      maxLat: 4.95,
      minLng: 33.65,
      maxLng: 42.05,
    },
  },

  // Google Maps configuration (optional)
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined,
    enabled: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    bounds: {
      south: -4.85,
      west: 33.65,
      north: 4.95,
      east: 42.05,
    },
    zoom: {
      default: 6,
      min: 5,
      max: 16,
    },
  },

  // Kenya geography
  kenya: {
    center: { lat: 0.3, lng: 37.9 },
    name: "Kenya",
    code: "KE",
    timezone: "EAT",
  },
} as const;

export type MappingEngine = typeof MAPPING_CONFIG.engine;
export type TileLayerName = keyof typeof MAPPING_CONFIG.leaflet.tileLayers;

export default MAPPING_CONFIG;
