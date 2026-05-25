import { useEffect, useMemo, useState } from "react";
import { CircleDot, Loader2, MapPin, Radio, Search, ShieldAlert, Wifi } from "lucide-react";
import { divIcon, type LatLngExpression } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSites } from "@/hooks/useSites";
import { cn } from "@/lib/utils";
import type { Site } from "@/types/site";
import SiteDetailModal from "./SiteDetailModal";

type PlottedSite = Site & {
  lat: number;
  lng: number;
  status: "operational" | "warning" | "critical";
};

const KENYA_CENTER: LatLngExpression = [0.0236, 37.9062];
const KENYA_BOUNDS = {
  minLat: -5,
  maxLat: 6,
  minLng: 33,
  maxLng: 42.5,
};

const parseCoordinate = (value: string) => {
  const normalized = value?.trim().replace(",", ".");
  const coordinate = Number.parseFloat(normalized);
  return Number.isFinite(coordinate) ? coordinate : Number.NaN;
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

const statusStyles: Record<PlottedSite["status"], { label: string; pin: string; badge: string }> = {
  operational: {
    label: "Operational",
    pin: "bg-emerald-500 ring-emerald-500/25 shadow-emerald-500/30",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    label: "Monitoring",
    pin: "bg-amber-500 ring-amber-500/25 shadow-amber-500/30",
    badge: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  critical: {
    label: "At Risk",
    pin: "bg-rose-500 ring-rose-500/25 shadow-rose-500/30",
    badge: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
};

const createSiteIcon = (site: PlottedSite) =>
  divIcon({
    className: "ad-leaflet-marker",
    html: `
      <span class="relative flex h-7 w-7 items-center justify-center">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-35 ${statusStyles[site.status].pin}"></span>
        <span class="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${statusStyles[site.status].pin} shadow-lg ring-8">
          <span class="h-1.5 w-1.5 rounded-full bg-white"></span>
        </span>
      </span>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

const ThemeAwareTileLayer = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const attribution = '&copy; OpenStreetMap contributors &copy; CARTO';
  const tileUrl = isDark
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return <TileLayer attribution={attribution} url={tileUrl} />;
};

const FitSitesBounds = ({ sites }: { sites: PlottedSite[] }) => {
  const map = useMap();

  useEffect(() => {
    if (sites.length === 0) return;

    const bounds = sites.map((site) => [site.lat, site.lng] as [number, number]);
    map.fitBounds(bounds, { padding: [34, 34], maxZoom: 10 });
  }, [map, sites]);

  return null;
};

const GISMapView = () => {
  const { data: sites = [], isLoading, isError } = useSites();
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState<"all" | PlottedSite["status"]>("all");
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const plottedSites = useMemo<PlottedSite[]>(() => {
    return sites
      .map((site) => {
        const lat = parseCoordinate(site.latitude);
        const lng = parseCoordinate(site.longitude);

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
      <section className="premium-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200/70 bg-white/80 p-5 dark:border-slate-800/70 dark:bg-slate-950/30 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary hover:bg-primary/10">
                Live GIS
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-wider">
                CartoDB tiles
              </Badge>
            </div>
            <h2 className="text-xl font-black tracking-tight text-foreground md:text-2xl">Kenya Network Nodes</h2>
            <p className="mt-1 max-w-2xl text-xs font-semibold leading-relaxed text-muted-foreground">
              Interactive Leaflet map using live site latitude and longitude records.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Mapped", value: stats.plotted, icon: MapPin, color: "text-primary" },
              { label: "Online", value: stats.operational, icon: Wifi, color: "text-emerald-500" },
              { label: "At Risk", value: stats.critical, icon: ShieldAlert, color: "text-rose-500" },
              { label: "No Coords", value: stats.hidden, icon: Radio, color: "text-slate-400" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-lg border border-slate-200/70 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/45">
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
          <aside className="border-b border-slate-200/70 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/20 xl:border-b-0 xl:border-r">
            <div className="space-y-3">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search nodes..."
                  className="h-10 rounded-lg pl-9 text-xs font-semibold"
                />
              </label>

              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-foreground shadow-sm outline-none transition-colors focus:border-primary/40 dark:border-slate-800 dark:bg-slate-950"
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
                        : "border-slate-200 bg-white text-muted-foreground hover:text-foreground dark:border-slate-800 dark:bg-slate-950/60"
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
                  className="group w-full rounded-lg border border-slate-200/70 bg-white/80 p-3 text-left shadow-sm transition-all hover:border-primary/25 hover:bg-primary/5 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black uppercase tracking-wide text-foreground group-hover:text-primary">{site.siteName}</p>
                      <p className="mt-1 text-[10px] font-bold text-muted-foreground">{site.region || "Unassigned"} / {site.ipAddress || "No IP"}</p>
                    </div>
                    <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase tracking-wider", statusStyles[site.status].badge)}>
                      {statusStyles[site.status].label}
                    </span>
                  </div>
                </button>
              ))}

              {filteredSites.length === 0 && !isLoading && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center text-xs font-semibold text-muted-foreground dark:border-slate-800 dark:bg-slate-950/40">
                  No mapped nodes match the current filters.
                </div>
              )}
            </div>
          </aside>

          <div className="relative h-[640px] min-h-[520px] bg-slate-100 dark:bg-slate-950">
            <MapContainer
              center={KENYA_CENTER}
              zoom={6}
              minZoom={5}
              maxZoom={17}
              zoomControl={false}
              className="h-full w-full"
              scrollWheelZoom
            >
              <ThemeAwareTileLayer />
              <ZoomControl position="bottomright" />
              <FitSitesBounds sites={filteredSites} />

              {filteredSites.map((site) => (
                <Marker key={`${site.no}-${site.siteName}`} position={[site.lat, site.lng]} icon={createSiteIcon(site)}>
                  <Popup minWidth={260}>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-black uppercase tracking-wide text-slate-900">{site.siteName}</p>
                        <p className="mt-1 text-[11px] font-bold text-slate-500">{site.region || "Unassigned region"} / {site.ipAddress || "No IP"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="rounded-md bg-slate-100 p-2">
                          <p className="font-black uppercase tracking-wider text-slate-400">Power</p>
                          <p className="mt-1 font-bold text-slate-800">{site.powerSource || "N/A"}</p>
                        </div>
                        <div className="rounded-md bg-slate-100 p-2">
                          <p className="font-black uppercase tracking-wider text-slate-400">Priority</p>
                          <p className="mt-1 font-bold text-slate-800">P{site.priority?.replace(".0", "") || "N/A"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedSite(site)}
                        className="w-full rounded-md bg-slate-900 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-white transition-colors hover:bg-primary"
                      >
                        Open Site Record
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {isLoading && (
              <div className="absolute inset-0 z-[500] flex items-center justify-center bg-white/45 backdrop-blur-sm dark:bg-slate-950/45">
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-wider shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Loading mapped nodes
                </div>
              </div>
            )}

            {isError && (
              <div className="absolute left-4 top-4 z-[500] rounded-lg border border-rose-500/20 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 shadow-xl dark:bg-rose-950/80 dark:text-rose-300">
                Site sync failed. Map is waiting for data.
              </div>
            )}

            <div className="pointer-events-none absolute bottom-4 left-4 z-[500] flex flex-wrap gap-2">
              {(["operational", "warning", "critical"] as const).map((item) => (
                <span key={item} className="inline-flex items-center gap-2 rounded-lg border border-white/60 bg-white/90 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-300">
                  <CircleDot size={12} className={item === "operational" ? "text-emerald-500" : item === "warning" ? "text-amber-500" : "text-rose-500"} />
                  {statusStyles[item].label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .leaflet-container {
          font-family: inherit;
          background: hsl(var(--background));
        }

        .leaflet-control-zoom a {
          color: hsl(var(--foreground));
          background: hsl(var(--card));
          border-color: hsl(var(--border));
        }

        .leaflet-popup-content-wrapper,
        .leaflet-popup-tip {
          border-radius: 10px;
        }
      `}</style>

      {selectedSite && (
        <SiteDetailModal
          site={sites.find((site) => site.no === selectedSite.no) || selectedSite}
          onClose={() => setSelectedSite(null)}
        />
      )}
    </div>
  );
};

export default GISMapView;
