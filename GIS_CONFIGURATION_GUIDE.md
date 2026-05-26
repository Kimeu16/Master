# GIS Map Configuration Guide

This guide explains how to configure and extend the Kenya GIS mapping system.

## Current Setup

The GIS system uses **Leaflet + react-leaflet v4.2.1** with CartoDB tiles for mapping.

### Quick Start

```bash
# Install dependencies (already done)
npm install leaflet react-leaflet@4.2.1 @types/leaflet

# Run development server
npm run dev

# Build for production
npm run build
```

The map will be available at the **GIS Map** view in the dashboard.

## Environment Variables

### Optional: Google Maps Integration

Create a `.env.local` file in the project root:

```env
# Optional: Add this if you want to enable Google Maps integration in the future
VITE_GOOGLE_MAPS_API_KEY=your_google_api_key_here
```

**Note**: Google Maps is currently optional and not required. The system works perfectly with Leaflet.

To enable it in the future:
1. Add the API key to `.env.local`
2. Uncomment Google Maps code in `src/components/dashboard/GISMapView.tsx`
3. Run `npm install @react-google-maps/api` if needed

## Configuration

### Mapping Service Config

Edit `src/lib/mappingConfig.ts` to customize:

- **Tile layers**: Add/change CartoDB, OpenStreetMap, or other providers
- **Bounds**: Adjust Kenya boundaries for your use case
- **Zoom levels**: Modify min/max zoom constraints
- **Kenya center**: Change the default map center

Example:

```typescript
export const MAPPING_CONFIG = {
  leaflet: {
    tileLayers: {
      // Add custom tile layer
      satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri",
        maxZoom: 18,
      },
    },
  },
};
```

### Map Utilities

Use `src/lib/mapUtils.ts` for common operations:

```typescript
import { CoordinateUtils, BoundsUtils, IconUtils } from "@/lib/mapUtils";

// Parse coordinates
const lat = CoordinateUtils.parse("0.3");
const lng = CoordinateUtils.parse("37.9");

// Check if in Kenya
if (CoordinateUtils.isInKenya(lat, lng)) {
  // ...
}

// Calculate distance
const km = CoordinateUtils.distance(lat1, lng1, lat2, lng2);

// Create custom icon
const icon = IconUtils.createStatusIcon("critical", colors);

// Calculate bounds
const bounds = BoundsUtils.fromSites(sites);
BoundsUtils.fitToBounds(map, bounds, { maxZoom: 14 });
```

## Customization

### Adding Custom Markers

In `src/components/dashboard/GISMapView.tsx`:

```typescript
// Modify the createMarkerIcon function
const createMarkerIcon = (status: PlottedSite["status"]) => {
  const color = statusColors[status].main;
  
  return L.divIcon({
    html: `<svg>... your custom SVG ...</svg>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};
```

### Changing Tile Layers

In `LeafletMapContent`:

```typescript
<TileLayer
  url="https://your-custom-tiles-{s}.example.com/{z}/{x}/{y}.png"
  attribution="Your attribution"
  maxZoom={18}
/>
```

### Custom Popups

Modify the `<Popup>` content in the `<Marker>`:

```typescript
<Popup>
  <div className="custom-popup">
    {/* Your custom content */}
  </div>
</Popup>
```

### Dark Mode

The map automatically switches between light and dark CartoDB tiles based on the app's theme setting.

To customize colors:

Edit `src/index.css`:

```css
.dark .leaflet-container {
  @apply bg-slate-900;
}

/* Your custom dark mode styles */
```

## Features

### Current Features

- Interactive map with zoom/pan
- Status-based marker colors (Operational/Monitoring/At Risk)
- Custom popup with site details
- Sidebar with search, region filter, and status filter
- Auto-fit map to filtered sites
- Light and dark theme support
- Mobile responsive
- CartoDB free tiles
- Site detail modal integration

### Performance

- Markers rendered efficiently with memoization
- Filtered sites update without re-rendering all markers
- Lazy-loaded tile layers
- Cached browser tiles

## Troubleshooting

### Map doesn't show

1. Check browser console for errors
2. Verify sites have valid latitude/longitude
3. Ensure coordinates are within Kenya bounds:
   - Latitude: -4.85 to 4.95
   - Longitude: 33.65 to 42.05

### Tiles not loading

1. Check internet connection
2. Verify CartoDB is accessible in your region
3. Try alternative tile layer from `mappingConfig.ts`

### Performance issues with many markers

- Enable marker clustering: `npm install @leaflet/markercluster`
- Use sidebar virtual scrolling
- Lazy-load tiles at different zoom levels

## Future Enhancements

Prepared infrastructure for:

1. **Marker Clustering**: For handling 1000+ sites
2. **Google Maps**: Toggle between providers
3. **Real-time Updates**: WebSocket integration
4. **Route Overlays**: For maintenance paths
5. **Heatmaps**: For signal strength visualization
6. **Historical Data**: Time-based animations

See `GIS_IMPLEMENTATION_ANALYSIS.md` for detailed roadmap.

## Support

For questions or issues:

1. Check browser console for errors
2. Review `GIS_IMPLEMENTATION_ANALYSIS.md` for architecture details
3. Examine test cases in `src/components/dashboard/GISMapView.tsx`
4. Review utility functions in `src/lib/mapUtils.ts`

## References

- [Leaflet Documentation](https://leafletjs.com/)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [CartoDB Tiles](https://carto.com/help/building-maps/basemap-list/)
- [Leaflet Plugins](https://leafletjs.com/plugins.html)
