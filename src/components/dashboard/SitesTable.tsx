import { useState, useMemo } from "react";
import { Site } from "@/types/site";
import { useSites } from "@/hooks/useSites";
import { updateSite } from "@/lib/googleSheets";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Eye, MoreHorizontal, Download, Filter, Cloud } from "lucide-react";
import SiteDetailModal from "./SiteDetailModal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ITEMS_PER_PAGE = 25;

type SortConfig = {
  key: keyof Site;
  direction: "asc" | "desc";
} | null;

const SitesTable = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [regionFilter, setRegionFilter] = useState("");
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: remoteSitesData, isLoading, isError } = useSites();
  const queryClient = useQueryClient();
  
  const normalizeId = (id: string) => id?.replace(".0", "").trim() || "";

  // Local storage persistence for edits
  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<Site>>>(() => {
    const saved = localStorage.getItem("site_overrides");
    if (!saved) return {};
    try {
      const parsed = JSON.parse(saved);
      // Re-normalize keys on load
      const normalized: Record<string, Partial<Site>> = {};
      Object.entries(parsed).forEach(([key, value]) => {
        normalized[normalizeId(key)] = value as Partial<Site>;
      });
      return normalized;
    } catch (e) {
      return {};
    }
  });

  const handleSaveSite = async (updatedSite: Site) => {
    const siteId = normalizeId(updatedSite.no);
    // 1. Instant local update
    const newOverrides = {
      ...localOverrides,
      [siteId]: updatedSite
    };
    setLocalOverrides(newOverrides);
    localStorage.setItem("site_overrides", JSON.stringify(newOverrides));

    // 2. Background cloud sync
    setIsSyncing(true);
    try {
      await updateSite(updatedSite.no, updatedSite);
      // Invalidate query to pull fresh data once available
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    } catch (err) {
      console.error("Cloud sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Use live data source with local overrides
  const sitesData = useMemo(() => {
    const baseData = remoteSitesData || [];
    return baseData.map(site => {
      const siteId = normalizeId(site.no);
      const override = localOverrides[siteId];
      return override ? { ...site, ...override } : site;
    });
  }, [remoteSitesData, localOverrides]);

  const regions = useMemo(() => {
    const r = new Set(sitesData.map((s) => s.region).filter(Boolean));
    return Array.from(r).sort();
  }, [sitesData]);

  const filteredData = useMemo(() => {
    let data = sitesData;
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (site) =>
          site.siteName.toLowerCase().includes(s) ||
          site.region.toLowerCase().includes(s) ||
          site.fieldEngineer.toLowerCase().includes(s) ||
          site.ipAddress.toLowerCase().includes(s) ||
          site.siteType.toLowerCase().includes(s) ||
          site.comments?.toLowerCase().includes(s)
      );
    }
    if (regionFilter) {
      data = data.filter((s) => s.region === regionFilter);
    }
    if (sortConfig) {
      data = [...data].sort((a, b) => {
        const aVal = String(a[sortConfig.key] || "");
        const bVal = String(b[sortConfig.key] || "");
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }
    return data;
  }, [search, sortConfig, regionFilter, sitesData]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const pageData = filteredData.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  const handleSort = (key: keyof Site) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const SortIcon = ({ column }: { column: keyof Site }) => {
    if (sortConfig?.key !== column) return <ChevronUp size={12} className="text-muted-foreground/30" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={12} className="text-primary" />
    ) : (
      <ChevronDown size={12} className="text-primary" />
    );
  };

  const getPriorityBadge = (priority: string) => {
    const p = priority?.replace(".0", "");
    switch (p) {
      case "1":
        return <Badge className="bg-destructive/10 text-destructive border-transparent font-bold text-[10px] px-2 py-0">P1</Badge>;
      case "2":
        return <Badge className="bg-warning/10 text-warning border-transparent font-bold text-[10px] px-2 py-0">P2</Badge>;
      case "3":
        return <Badge className="bg-success/10 text-success border-transparent font-bold text-[10px] px-2 py-0">P3</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] opacity-40 px-2 py-0">N/A</Badge>;
    }
  };

  const getStatusBadge = (comments: string) => {
    if (!comments) return <Badge variant="outline" className="text-[10px] opacity-50">Unknown</Badge>;
    const c = comments.toLowerCase();
    if (c.includes("working") && !c.includes("not working")) {
      return (
        <div className="flex items-center gap-1.5 text-success font-bold text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          Working
        </div>
      );
    }
    if (c.includes("not working") || c.includes("faulty")) {
      return (
        <div className="flex items-center gap-1.5 text-destructive font-bold text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
          At Risk
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-warning font-bold text-[11px]">
        <span className="w-1.5 h-1.5 rounded-full bg-warning" />
        Monitoring
      </div>
    );
  };

  const columns: { key: keyof Site; label: string; width?: string }[] = [
    { key: "no", label: "#", width: "w-20" },
    { key: "siteName", label: "Location / Site", width: "min-w-[280px]" }, 
    { key: "region", label: "Region", width: "w-32" },
    { key: "ipAddress", label: "IP Address", width: "w-36" },
    { key: "priority", label: "Tier", width: "w-24" },
    { key: "comments", label: "Connectivity", width: "w-32" },
    { key: "powerSource", label: "Power Source", width: "w-40" },
    { key: "routerStatus", label: "Router Status", width: "w-40" },
    { key: "latitude", label: "Latitude", width: "w-32" },
    { key: "longitude", label: "Longitude", width: "w-32" },
    { key: "onAirDate", label: "On Air Date", width: "w-32" },
    { key: "rectifierType", label: "Rectifier", width: "w-32" },
    { key: "tenants", label: "Tenants", width: "w-48" },
    { key: "reonIntegration", label: "REON", width: "w-24" },
    { key: "rectifierCapacity", label: "Rectifier Cap", width: "w-32" },
    { key: "rectifierMaxCapacity", label: "Rectifier Max", width: "w-32" },
    { key: "securityCompany", label: "Security", width: "w-40" },
    { key: "siteType", label: "Site Type", width: "w-32" },
    { key: "electronicLockId", label: "E-Lock ID", width: "w-32" },
    { key: "fieldEngineer", label: "Field Engineer", width: "w-48" },
    { key: "fieldEngineerEmail", label: "Engineer Email", width: "w-48" },
    { key: "fieldEngineerPhone", label: "Engineer Phone", width: "w-40" },
    { key: "secondFieldEngineer", label: "2nd Engineer", width: "w-48" },
    { key: "secondFieldEngineerEmail", label: "2nd Email", width: "w-48" },
    { key: "secondFieldEngineerPhone", label: "2nd Phone", width: "w-40" },
    { key: "apsAmfBoard", label: "APS / AMF", width: "w-32" },
    { key: "generatorType", label: "Gen Type", width: "w-32" },
    { key: "generatorTankCapacity", label: "Gen Tank", width: "w-32" },
    { key: "externalFuelProbe", label: "Fuel Probe", width: "w-32" },
    { key: "dcMeterInstallationDate", label: "DC Meter Date", width: "w-40" },
    { key: "dcMeter", label: "DC Meter", width: "w-32" },
    { key: "batteryType", label: "Battery Type", width: "w-32" },
    { key: "batteryCapacity", label: "Battery Cap", width: "w-32" },
    { key: "solarPanels", label: "Sun Panels", width: "w-32" },
    { key: "solarCapacity", label: "Sun Cap", width: "w-32" },
    { key: "solarPanelBrand", label: "Sun Brand", width: "w-32" },
    { key: "solarChargeControllerTracer", label: "Tracer Controller", width: "w-40" },
    { key: "solarChargeControllerFlatpack", label: "Solar Charger", width: "w-40" },
    { key: "sanctionedLoad", label: "Sanc. Load", width: "w-32" },
    { key: "sla", label: "SLA", width: "w-32" },
    { key: "dataIntegrity", label: "Data Int.", width: "w-32" },
    { key: "softwareCleanup", label: "Soft. Cleanup", width: "w-32" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search & Filters */}
      <div className="p-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-secondary/30">
        <div className="relative group w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search all 40+ fields..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-10 h-10 text-sm bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/10 rounded-xl transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {isSyncing && (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 mr-2 animate-pulse gap-1.5 px-3">
              <Cloud size={12} className="animate-bounce" /> Cloud Saving...
            </Badge>
          )}
          {Object.keys(localOverrides).length > 0 && (
             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 mr-2 font-bold px-3">
               {Object.keys(localOverrides).length} Local Edits Applied
             </Badge>
          )}
          <div className="flex items-center bg-background/50 border border-border/50 rounded-xl px-3 py-1.5 shadow-sm group hover:border-border transition-colors">
            <Filter size={14} className="text-muted-foreground mr-2" />
            <select
              value={regionFilter}
              onChange={(e) => { setRegionFilter(e.target.value); setPage(0); }}
              className="bg-transparent text-[13px] font-bold focus:ring-0 border-none p-0 pr-8 text-foreground"
            >
              <option value="">All Regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <button className="p-2.5 rounded-xl border border-border/50 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background transition-all shadow-sm">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="flex-1 overflow-auto relative custom-scrollbar bg-background">
        <div className="w-full">
          <table className="w-full text-[13px] border-separate border-spacing-0">
            <thead className="sticky top-0 z-30">
              <tr className="bg-secondary/95 backdrop-blur-md">
                {columns.map((col, idx) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={cn(
                      "text-left px-6 py-4 font-bold text-muted-foreground text-[10px] uppercase tracking-[0.15em] cursor-pointer hover:bg-primary/5 hover:text-primary transition-all group border-b border-border/50 whitespace-nowrap",
                      col.width || "w-40",
                      col.key === "no" && "sticky left-0 z-40 bg-secondary/95",
                      col.key === "siteName" && "sticky left-[80px] z-40 bg-secondary/95 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {col.label}
                      <SortIcon column={col.key} />
                    </div>
                  </th>
                ))}
                <th className="w-20 px-6 py-4 border-b border-border/50 bg-secondary/95 sticky right-0 z-30 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {pageData.map((site, i) => (
                <tr
                  key={`${site.no}-${i}`}
                  onClick={() => setSelectedSite(site)}
                  className="group cursor-pointer hover:bg-primary/[0.02] transition-colors"
                >
                  {columns.map((col, idx) => (
                    <td key={`${site.no}-${col.key}`} className={cn(
                      "px-6 py-4 align-middle transition-all whitespace-nowrap overflow-hidden text-ellipsis bg-white",
                      col.key === "no" && "sticky left-0 z-20 text-muted-foreground/40 font-mono tracking-tighter border-r border-border/10",
                      col.key === "siteName" && "sticky left-[80px] z-20 font-bold text-foreground shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)] group-hover:bg-primary/[0.03] border-r border-border/10",
                      col.key !== "no" && col.key !== "siteName" && "text-muted-foreground font-medium",
                    )}>
                      {col.key === "priority"
                        ? getPriorityBadge(site.priority)
                        : col.key === "comments"
                        ? getStatusBadge(site.comments)
                        : col.key === "reonIntegration"
                        ? (
                          <Badge 
                            variant={site.reonIntegration === "Integrated" ? "default" : "outline"} 
                            className={cn(
                              "text-[10px] font-extrabold rounded-md border-none",
                              site.reonIntegration === "Integrated" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground opacity-50"
                            )}
                          >
                            {site.reonIntegration === "Integrated" ? "INT" : "NON"}
                          </Badge>
                        )
                        : col.key === "no"
                        ? <span className="text-muted-foreground/40 font-mono tracking-tighter">{site.no?.replace(".0", "").padStart(4, '0')}</span>
                        : (site[col.key] || <span className="opacity-20">—</span>)}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right sticky right-0 z-20 bg-white shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)] group-hover:bg-primary/[0.03]">
                    <button className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-primary/10 text-primary transition-all">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-background/40 backdrop-blur-[2px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-background shadow-2xl border border-border/50">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-foreground">Syncing with Google Sheets...</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="absolute inset-x-0 top-0 bottom-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="max-w-md text-center p-8 rounded-2xl bg-destructive/5 border border-destructive/20 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <Search className="text-destructive rotate-45" size={24} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Connection Error</h3>
              <p className="text-sm text-muted-foreground mb-6">
                We couldn't reach your Google Sheets. Please ensure the URL is correct and "Published to Web" as CSV.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-destructive text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-destructive/20"
              >
                Retry Sync
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      <div className="p-6 bg-secondary/20 border-t border-border/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <p className="text-[12px] font-bold text-muted-foreground/60">
            Showing <span className="text-foreground">{page * ITEMS_PER_PAGE + 1}-{Math.min((page + 1) * ITEMS_PER_PAGE, filteredData.length)}</span> of <span className="text-foreground">{filteredData.length}</span> assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setPage(Math.max(0, page - 1)); }}
            disabled={page === 0}
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-border/50 bg-background/50 hover:bg-background disabled:opacity-30 disabled:hover:bg-background/50 transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="hidden sm:flex items-center gap-1 px-2">
            {[...Array(Math.min(5, totalPages))].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  "w-10 h-10 rounded-xl text-xs font-bold transition-all",
                  page === i ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/10 text-muted-foreground"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setPage(Math.min(totalPages - 1, page + 1)); }}
            disabled={page >= totalPages - 1}
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-border/50 bg-background/50 hover:bg-background disabled:opacity-30 disabled:hover:bg-background/50 transition-all shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {selectedSite && (
        <SiteDetailModal 
          site={sitesData.find(s => s.no === selectedSite.no) || selectedSite} 
          onClose={() => setSelectedSite(null)} 
          onSave={handleSaveSite}
        />
      )}
    </div>
  );
};

export default SitesTable;
;
