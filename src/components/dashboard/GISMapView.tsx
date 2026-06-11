import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { CircleDot, Loader2, LocateFixed, MapPin, Radio, Search, ShieldAlert, Wifi } from "lucide-react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl, Polygon, ZoomControl, GeoJSON } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSites } from "@/hooks/useSites";
import { cn } from "@/lib/utils";
import { IconUtils, GeomUtils, ThemeUtils } from "@/lib/mapUtils";
import { api } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import kenyaMask from "@/data/kenyaMask.json";
import kenyaGeoJSON from "@/data/kenya.json";
import type { Site } from "@/types/site";
import SiteDetailModal from "./SiteDetailModal";

type PlottedSite = Site & {
  lat: number;
  lng: number;
  status: "operational" | "warning" | "critical";
};

const KENYA_CENTER = { lat: 0.3, lng: 37.9 };
const KENYA_BOUNDS = {
  minLat: -4.85,
  maxLat: 4.95,
  minLng: 33.65,
  maxLng: 42.05,
};

const parseCoordinate = (value: string) => {
  if (!value) return Number.NaN;
  const str = value.toString().trim().toUpperCase();
  
  // Determine sign based on S or W suffix before removing them
  let sign = 1;
  if (str.includes("S") || str.includes("W")) {
    sign = -1;
  }
  
  // Keep only digits, dot, and minus
  const normalized = str.replace(",", ".").replace(/[^\d.-]/g, "");
  
  const coordinate = Number.parseFloat(normalized);
  return Number.isFinite(coordinate) ? coordinate * sign : Number.NaN;
};

const getSiteStatus = (site: Site): PlottedSite["status"] => {
  const comments = (site.comments || "").toLowerCase();
  const routerStatus = (site.routerStatus || "").toLowerCase();
  const priority = site.priority?.replace(".0", "");

  if (comments.includes("not working") || comments.includes("faulty") || priority === "1") {
    return "critical";
  }

  if (comments.includes("alarm") || comments.includes("issue") || routerStatus.includes("down") || priority === "2") {
    return "warning";
  }

  return "operational";
};

const statusColors: Record<PlottedSite["status"], { main: string; light: string }> = {
  operational: { main: "#10b981", light: "#d1fae5" },
  warning: { main: "#f59e0b", light: "#fef3c7" },
  critical: { main: "#f43f5e", light: "#ffe4e6" },
};

const statusStyles: Record<PlottedSite["status"], { label: string; badge: string }> = {
  operational: {
    label: "Operational",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  },
  warning: {
    label: "Monitoring",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-700",
  },
  critical: {
    label: "At Risk",
    badge: "border-rose-500/20 bg-rose-500/10 text-rose-600",
  },
};

const useIsDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    return typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    if (typeof document !== "undefined") {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    }

    return () => observer.disconnect();
  }, []);

  return isDark;
};

// Create custom marker icons using the utility
const createMarkerIcon = (status: PlottedSite["status"]) => {
  return IconUtils.createStatusIcon(status, statusColors);
};

// Cluster icon creator with status awareness
const createClusterCustomIcon = (cluster: any) => {
  const children = cluster.getAllChildMarkers();
  let hasCritical = false;
  let hasWarning = false;
  let hasOperational = false;

  children.forEach((marker: any) => {
    const status = marker.options.status;
    if (status === "critical") hasCritical = true;
    else if (status === "warning") hasWarning = true;
    else if (status === "operational") hasOperational = true;
  });

  const colors = [];
  if (hasCritical) colors.push(statusColors.critical.main);
  if (hasWarning) colors.push(statusColors.warning.main);
  if (hasOperational) colors.push(statusColors.operational.main);

  let clusterBackground = colors[0] || statusColors.operational.main;

  if (colors.length === 2) {
    clusterBackground = `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`;
  } else if (colors.length === 3) {
    clusterBackground = `conic-gradient(${colors[0]} 0 33%, ${colors[1]} 33% 66%, ${colors[2]} 66% 100%)`;
  }

  return IconUtils.createClusterIcon(cluster.getChildCount(), clusterBackground);
};

const KenyaMapBadge = () => (
  <div className="pointer-events-none absolute left-4 top-4 z-[500] rounded-lg border border-secondary/20 bg-card/80 px-3.5 py-2.5 shadow-sm backdrop-blur">
    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">Kenya Map</p>
    <p className="mt-0.5 text-xs font-black text-foreground">Leaflet / Live GIS</p>
  </div>
);

// Map fit bounds controller
const MapFitBounds = ({ sites, status }: { sites: PlottedSite[], status: string }) => {
  const map = useMap();
  const prevFilterRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const kenyaBounds = L.latLngBounds([
      [5.5, 33.5],
      [-4.7, 42.0],
    ]);

    if (prevFilterRef.current === undefined) {
      // Initial mount
      prevFilterRef.current = status;
      map.fitBounds(kenyaBounds, { padding: [20, 20] });
      return;
    }

    if (prevFilterRef.current !== status) {
      prevFilterRef.current = status;
      
      if (status !== "all" && sites.length > 0) {
        const bounds = L.latLngBounds(sites.map((site) => [site.lat, site.lng]));
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
      } else {
        // Reset to Kenya if filter cleared or no sites found for filter
        map.fitBounds(kenyaBounds, { padding: [20, 20] });
      }
    }
  }, [map, status, sites]);

  return null;
};

const LeafletMapContent = ({
  sites,
  onSelectSite,
  isDark,
  status,
}: {
  sites: PlottedSite[];
  onSelectSite: (site: Site) => void;
  isDark: boolean;
  status: string;
}) => {
  const [activeSite, setActiveSite] = useState<PlottedSite | null>(null);
  const mapRef = useRef<any>(null);

  const handleResetMap = useCallback(() => {
    if (mapRef.current) {
      mapRef.current.setView(KENYA_CENTER, 6);
    }
  }, []);

  return (
    <>
      <LayersControl position="topright" key={isDark ? "dark" : "light"}>
        <LayersControl.BaseLayer checked={!isDark} name="Light Map">
          <TileLayer
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={18}
            minZoom={6}
            bounds={[
              [KENYA_BOUNDS.minLat, KENYA_BOUNDS.minLng],
              [KENYA_BOUNDS.maxLat, KENYA_BOUNDS.maxLng],
            ]}
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer checked={isDark} name="Dark Map">
          <TileLayer
            url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            maxZoom={18}
            minZoom={6}
            bounds={[
              [KENYA_BOUNDS.minLat, KENYA_BOUNDS.minLng],
              [KENYA_BOUNDS.maxLat, KENYA_BOUNDS.maxLng],
            ]}
            className="sepia hue-rotate-180 brightness-95 contrast-110"
          />
        </LayersControl.BaseLayer>
        <LayersControl.BaseLayer name="Satellite Map">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            maxZoom={18}
            minZoom={6}
            bounds={[
              [KENYA_BOUNDS.minLat, KENYA_BOUNDS.minLng],
              [KENYA_BOUNDS.maxLat, KENYA_BOUNDS.maxLng],
            ]}
          />
        </LayersControl.BaseLayer>
      </LayersControl>

      <Polygon
        positions={kenyaMask as any}
        pathOptions={{
          stroke: false,
          fillColor: isDark ? "hsl(var(--background))" : "hsl(var(--muted))",
          fillOpacity: 1,
        }}
        interactive={false}
      />

      <GeoJSON
        data={kenyaGeoJSON as any}
        pathOptions={{
          color: isDark ? "hsl(var(--muted-foreground) / 0.4)" : "hsl(var(--muted-foreground) / 0.6)",
          weight: 1,
          fillColor: isDark ? "hsl(var(--card))" : "hsl(var(--card))",
          fillOpacity: isDark ? 0.4 : 0.2,
          dashArray: "",
        }}
        interactive={false}
      />

      {/* Site markers clustered */}
      <MarkerClusterGroup 
        chunkedLoading 
        iconCreateFunction={createClusterCustomIcon}
        maxClusterRadius={80}
        disableClusteringAtZoom={14}
        spiderfyOnMaxZoom={true}
      >
        {sites.map((site) => (
          <Marker
            key={`${site.no}-${site.siteName}`}
            position={[site.lat, site.lng]}
            icon={createMarkerIcon(site.status)}
            {...{ status: site.status }}
            eventHandlers={{
              click: () => setActiveSite(site),
            }}
          >
            {activeSite?.no === site.no && (
              <Popup
                eventHandlers={{ remove: () => setActiveSite(null) }}
                autoClose={false}
                closeButton
                closeOnClick={false}
                className="site-popup"
                autoPanPadding={[50, 50]}
              >
                <div className="min-w-[240px] space-y-3 py-1">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-foreground">
                      {site.siteName}
                    </p>
                    <p className="mt-1 text-[11px] font-bold text-muted-foreground">
                      {site.region || "Unassigned region"} /{" "}
                      {site.ipAddress ? (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`http://${site.ipAddress}`, "_blank");
                          }}
                          className="cursor-pointer hover:underline text-primary"
                        >
                          {site.ipAddress}
                        </span>
                      ) : (
                        "No IP"
                      )}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-md bg-secondary/10 p-2">
                      <p className="font-black uppercase tracking-wider text-muted-foreground">Power</p>
                      <p className="mt-1 font-bold text-foreground">{site.powerSource || "N/A"}</p>
                    </div>
                    <div className="rounded-md bg-secondary/10 p-2">
                      <p className="font-black uppercase tracking-wider text-muted-foreground">Priority</p>
                      <p className="mt-1 font-bold text-foreground">
                        P{site.priority?.replace(".0", "") || "N/A"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSelectSite(site);
                      setActiveSite(null);
                    }}
                    className="w-full rounded-md bg-primary px-3 py-2 text-[11px] font-black uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/95"
                  >
                    Open Site Record
                  </button>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MarkerClusterGroup>

      <MapFitBounds sites={sites} status={status} />

      {/* Reset map button */}
      <button
        type="button"
        onClick={handleResetMap}
        className="absolute right-4 top-4 z-[500] flex h-10 w-10 items-center justify-center rounded-lg border border-secondary/20 bg-card/85 text-muted-foreground shadow-sm backdrop-blur transition-colors hover:text-foreground"
        aria-label="Reset map to Kenya"
        title="Reset to Kenya"
      >
        <LocateFixed size={16} />
      </button>
    </>
  );
};


const GISMapView = () => {
  const { data: sites = [], isLoading, isError } = useSites();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState<"all" | PlottedSite["status"]>("all");
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();
  const isDark = useIsDarkMode();

  const handleSaveSite = async (updatedSite: Site) => {
    setIsSyncing(true);
    try {
      const normalizeId = (id: string) => id?.replace(".0", "").trim() || "";
      await api.put(`/sites/${normalizeId(updatedSite.no)}`, updatedSite);
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site updated successfully. The map has been refreshed.");
    } catch (err: any) {
      console.error("Cloud sync failed:", err);
      toast.error("Failed to update site.");
    } finally {
      setIsSyncing(false);
    }
  };

  const plottedSites = useMemo<PlottedSite[]>(() => {
    return sites
      .map((site) => {
        let lat = parseCoordinate(site.latitude);
        let lng = parseCoordinate(site.longitude);

        // Auto-correct swapped coordinates (Kenya lat is ~0, lng is ~37)
        if (Math.abs(lat) > 20 && Math.abs(lng) < 10) {
          const temp = lat;
          lat = lng;
          lng = temp;
        }

        return {
          ...site,
          lat,
          lng,
          status: getSiteStatus(site),
        };
      })
      .filter((site) => {
        return (
          !Number.isNaN(site.lat) &&
          !Number.isNaN(site.lng) &&
          site.lat >= KENYA_BOUNDS.minLat &&
          site.lat <= KENYA_BOUNDS.maxLat &&
          site.lng >= KENYA_BOUNDS.minLng &&
          site.lng <= KENYA_BOUNDS.maxLng
        );
      });
  }, [sites]);

  const regions = useMemo(() => {
    return Array.from(new Set(plottedSites.map((site) => site.region).filter(Boolean))).sort();
  }, [plottedSites]);

  const filteredSites = useMemo(() => {
    const query = search.trim().toLowerCase();

    return plottedSites.filter((site) => {
      const matchesSearch =
        !query ||
        site.siteName?.toLowerCase().includes(query) ||
        site.ipAddress?.toLowerCase().includes(query) ||
        site.fieldEngineer?.toLowerCase().includes(query);
      const matchesRegion = region === "all" || site.region === region;
      const matchesStatus = status === "all" || site.status === status;

      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [plottedSites, region, search, status]);

  const stats = useMemo(() => {
    return {
      plotted: plottedSites.length,
      hidden: Math.max(0, sites.length - plottedSites.length),
      operational: plottedSites.filter((site) => site.status === "operational").length,
      critical: plottedSites.filter((site) => site.status === "critical").length,
    };
  }, [plottedSites, sites.length]);

  return (
    <div className="space-y-5 pb-10">
      <section className="premium-card overflow-hidden relative">
        <div className="relative z-[800] flex flex-col gap-4 border-b border-secondary/15 bg-card/30 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/10">
                Live GIS
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                Leaflet Maps
              </Badge>
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground md:text-2xl">Kenya Network Nodes</h2>
            <p className="mt-1 max-w-2xl text-xs font-semibold leading-relaxed text-muted-foreground">
              Interactive map using live site latitude and longitude records.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Mapped", value: stats.plotted, icon: MapPin, color: "text-primary" },
              { label: "Online", value: stats.operational, icon: Wifi, color: "text-emerald-500" },
              { label: "At Risk", value: stats.critical, icon: ShieldAlert, color: "text-rose-500" },
              { label: "No Coords", value: stats.hidden, icon: Radio, color: "text-muted-foreground" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-lg border border-secondary/10 bg-secondary/5 px-3 py-2">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">{item.label}</span>
                    <Icon size={13} className={item.color} />
                  </div>
                  <p className="text-lg font-black leading-none text-foreground">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="relative z-[800] border-b border-secondary/15 bg-card/20 p-4 xl:border-b-0 xl:border-r">
            <div className="space-y-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search nodes..."
                  className="glass-input h-10 rounded-lg pl-9 text-xs font-semibold"
                />
              </label>

              <select
                aria-label="Filter regions"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="glass-input h-10 w-full rounded-lg px-3 text-xs font-bold text-foreground"
              >
                <option value="all">All regions</option>
                {regions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                {(["all", "operational", "warning", "critical"] as const).map((item) => (
                  <button
                    key={item}
                    onClick={() => setStatus(item)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all",
                      status === item
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-secondary/20 bg-card/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item === "all" ? "All" : statusStyles[item].label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 max-h-[420px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
              {filteredSites.slice(0, 80).map((site) => (
                <button
                  key={`${site.no}-${site.siteName}`}
                  onClick={() => setSelectedSite(site)}
                  className="group w-full rounded-lg border border-secondary/10 bg-card/30 p-3 text-left shadow-sm transition-all hover:border-primary/25 hover:bg-primary/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black uppercase tracking-wide text-foreground group-hover:text-primary">{site.siteName}</p>
                      <p className="mt-1 text-[10px] font-bold text-muted-foreground">
                        {site.region || "Unassigned"} /{" "}
                        {site.ipAddress ? (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`http://${site.ipAddress}`, "_blank");
                            }}
                            className="cursor-pointer hover:underline text-primary"
                          >
                            {site.ipAddress}
                          </span>
                        ) : (
                          "No IP"
                        )}
                      </p>
                    </div>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider", statusStyles[site.status].badge)}>
                      {statusStyles[site.status].label}
                    </span>
                  </div>
                </button>
              ))}

              {filteredSites.length === 0 && !isLoading && (
                <div className="rounded-lg border border-secondary/15 bg-card/25 p-5 text-center text-xs font-semibold text-muted-foreground">
                  No mapped nodes match the current filters.
                </div>
              )}
            </div>
          </aside>

          <div className="relative z-0 flex-1 w-full h-full min-h-[calc(100vh-100px)] bg-card/5">
            <MapContainer
              center={[KENYA_CENTER.lat, KENYA_CENTER.lng]}
              zoom={6}
              minZoom={6}
              maxZoom={18}
              zoomControl={false}
              style={{ height: "100%", width: "100%" }}
              maxBounds={[
                [KENYA_BOUNDS.minLat, KENYA_BOUNDS.minLng],
                [KENYA_BOUNDS.maxLat, KENYA_BOUNDS.maxLng],
              ]}
              maxBoundsViscosity={1.0}
            >
              <ZoomControl position="bottomright" />
              <LeafletMapContent sites={filteredSites} onSelectSite={setSelectedSite} isDark={isDark} status={status} />
            </MapContainer>

            {/* Seamless Edge Blend (Vignette) */}
            <div className="pointer-events-none absolute inset-0 z-[400] shadow-[inset_0_0_100px_rgba(0,0,0,0.08)]" />

            <KenyaMapBadge />

            {/* Empty State Overlay */}
            {filteredSites.length === 0 && !isLoading && (
              <div className="absolute inset-0 z-[450] flex items-center justify-center bg-card/50 backdrop-blur-[2px]">
                <div className="rounded-lg border border-secondary/20 bg-card px-5 py-4 text-sm font-semibold shadow-xl text-muted-foreground">
                  No sites currently match this status.
                </div>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 z-[500] flex items-center justify-center bg-card/45 backdrop-blur-sm">
                <div className="flex items-center gap-3 rounded-lg border border-secondary/20 bg-card px-4 py-3 text-xs font-black uppercase tracking-wider shadow-xl">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Loading mapped nodes
                </div>
              </div>
            )}

            {isError && (
              <div className="absolute left-4 top-4 z-[500] rounded-lg border border-rose-500/20 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 shadow-xl">
                Site sync failed. Map is waiting for data.
              </div>
            )}

            <div className="absolute bottom-4 left-4 z-[500] flex flex-wrap gap-2">
              {(["operational", "warning", "critical"] as const).map((item) => {
                const isActive = status === item;
                return (
                  <button
                    key={item}
                    onClick={() => setStatus(isActive ? "all" : item)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur transition-all cursor-pointer",
                      isActive
                        ? item === "operational"
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                          : item === "warning"
                          ? "border-amber-500 bg-amber-500/10 text-amber-700"
                          : "border-rose-500 bg-rose-500/10 text-rose-700"
                        : "border-secondary/20 bg-card/90 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <CircleDot size={12} className={item === "operational" ? "text-emerald-500" : item === "warning" ? "text-amber-500" : "text-rose-500"} />
                    {statusStyles[item].label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {selectedSite && (
        <SiteDetailModal
          site={sites.find((site) => site.no === selectedSite.no) || selectedSite}
          onClose={() => setSelectedSite(null)}
          onSave={handleSaveSite}
        />
      )}
    </div>
  );
};

export default GISMapView;
