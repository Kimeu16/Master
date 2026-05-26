/**
 * Mapping Utilities and Helper Functions
 * Common functions for coordinate handling, bounds calculation, etc.
 */

import L from "leaflet";
import type { Site } from "@/types/site";

export const CoordinateUtils = {
  /**
   * Parse a coordinate string to a number
   * Handles both comma and dot as decimal separator
   */
  parse: (value: string): number => {
    const normalized = value?.trim().replace(",", ".");
    const coordinate = Number.parseFloat(normalized);
    return Number.isFinite(coordinate) ? coordinate : Number.NaN;
  },

  /**
   * Check if a coordinate is within Kenya bounds
   */
  isInKenya: (lat: number, lng: number): boolean => {
    return lat >= -4.85 && lat <= 4.95 && lng >= 33.65 && lng <= 42.05;
  },

  /**
   * Calculate distance between two points in kilometers (Haversine formula)
   */
  distance: (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};

export const BoundsUtils = {
  /**
   * Create Leaflet bounds from an array of coordinates
   */
  fromCoordinates: (coordinates: Array<[number, number]>): L.LatLngBounds => {
    return L.latLngBounds(coordinates);
  },

  /**
   * Create bounds from sites with valid coordinates
   */
  fromSites: (
    sites: Array<{ lat: number; lng: number }>
  ): L.LatLngBounds | null => {
    const validSites = sites.filter(
      (s) => !Number.isNaN(s.lat) && !Number.isNaN(s.lng)
    );
    if (validSites.length === 0) return null;
    return L.latLngBounds(validSites.map((s) => [s.lat, s.lng]));
  },

  /**
   * Fit map to bounds with padding and zoom constraints
   */
  fitToBounds: (
    map: L.Map,
    bounds: L.LatLngBounds,
    options?: { padding?: number; maxZoom?: number }
  ): void => {
    map.fitBounds(bounds, {
      padding: [options?.padding ?? 50, options?.padding ?? 50],
      maxZoom: options?.maxZoom ?? 14,
    });
  },
};

export const IconUtils = {
  /**
   * Create a custom div icon for a marker with status-based color
   */
  createStatusIcon: (
    status: "operational" | "warning" | "critical",
    colors: Record<string, { main: string }>
  ): L.DivIcon => {
    const color = colors[status].main;

    return L.divIcon({
      className: "custom-marker",
      html: `
        <div class="relative">
          <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 0C8.17 0 2 6.17 2 14c0 7.5 14 26 14 26s14-18.5 14-26c0-7.83-6.17-14-14-14z" fill="${color}" stroke="white" stroke-width="1"/>
            <circle cx="16" cy="13" r="6" fill="white" opacity="0.9"/>
          </svg>
        </div>
      `,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    });
  },

  /**
   * Create a cluster icon
   */
  createClusterIcon: (count: number, color: string): L.DivIcon => {
    const size = count > 100 ? 40 : count > 50 ? 36 : count > 10 ? 32 : 28;

    return L.divIcon({
      className: "marker-cluster",
      html: `
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          border: 2px solid white;
        ">
          ${count}
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  },
};

export const GeomUtils = {
  /**
   * Kenya outline coordinates
   */
  kenyaOutline: [
    [4.62, 35.92],
    [4.25, 36.58],
    [3.52, 38.12],
    [3.22, 40.15],
    [2.08, 41.0],
    [0.86, 41.82],
    [-1.55, 41.56],
    [-2.52, 40.98],
    [-3.98, 39.78],
    [-4.66, 39.2],
    [-4.35, 37.72],
    [-3.82, 37.15],
    [-2.88, 36.06],
    [-1.55, 34.82],
    [-0.6, 34.28],
    [0.45, 34.0],
    [1.18, 34.88],
    [2.06, 34.98],
    [3.08, 34.98],
    [4.62, 35.92],
  ] as [number, number][],

  /**
   * Major regions in Kenya (for reference/future region filtering)
   */
  regions: [
    { name: "Nairobi", lat: -1.2866, lng: 36.8172 },
    { name: "Mombasa", lat: -4.043, lng: 39.6682 },
    { name: "Kisumu", lat: -0.101, lng: 34.7617 },
    { name: "Nakuru", lat: -0.2833, lng: 36.0667 },
    { name: "Eldoret", lat: 0.5143, lng: 35.2799 },
    { name: "Kericho", lat: -0.3667, lng: 35.2833 },
    { name: "Kakamega", lat: 0.2833, lng: 34.75 },
    { name: "Kitale", lat: 0.9833, lng: 35.0167 },
  ],
};

export const ThemeUtils = {
  /**
   * Get map tile layer for current theme
   */
  getTileLayer: (isDark: boolean): string => {
    return isDark
      ? "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
      : "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png";
  },

  /**
   * Get Kenya outline color for current theme
   */
  getOutlineColor: (isDark: boolean): string => {
    return isDark ? "#06b6d4" : "#1d4ed8";
  },

  /**
   * Get popup styles for current theme
   */
  getPopupStyles: (isDark: boolean) => ({
    background: isDark ? "#1e293b" : "#ffffff",
    color: isDark ? "#f1f5f9" : "#0f172a",
    border: isDark ? "#475569" : "#e2e8f0",
  }),
};

export default {
  CoordinateUtils,
  BoundsUtils,
  IconUtils,
  GeomUtils,
  ThemeUtils,
};
