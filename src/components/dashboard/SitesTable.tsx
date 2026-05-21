import { useState, useMemo, useEffect, ReactNode } from "react";
import { Site } from "@/types/site";
import { useSites } from "@/hooks/useSites";
import { updateSite } from "@/lib/googleSheets";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Download, 
  Filter, 
  Cloud, 
  AlertTriangle, 
  SlidersHorizontal,
  LayoutGrid,
  List,
  MapPin,
  Mail,
  Phone,
  ExternalLink,
  Zap,
  Sun,
  Shield,
  Layers,
  ShieldAlert,
  Activity,
  Wifi,
  Sparkles
} from "lucide-react";
import SiteDetailModal from "./SiteDetailModal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 25;

type SortConfig = {
  key: keyof Site;
  direction: "asc" | "desc";
} | null;

/* ── CAPACITY BAR COMPONENT ────────────────────────────────────────── */
const CapacityBar = ({ value, max }: { value: string; max: string }) => {
  const numVal = parseFloat(value?.replace(/[^0-9.]/g, "") || "");
  const numMax = parseFloat(max?.replace(/[^0-9.]/g, "") || "");
  if (isNaN(numVal) || isNaN(numMax) || numMax === 0) {
    return <span className="text-slate-400 font-medium italic">{value || "-"}</span>;
  }
  const pct = Math.min(100, Math.max(0, (numVal / numMax) * 100));
  
  let barColor = "bg-indigo-500";
  if (pct > 90) barColor = "bg-rose-500";
  else if (pct > 75) barColor = "bg-amber-500";
  else barColor = "bg-emerald-500";

  return (
    <div className="flex flex-col gap-1 w-full max-w-[120px]">
      <div className="flex items-center justify-between text-[9px] font-black text-slate-500">
        <span>{value}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200/20">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", barColor)} 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
};

/* ── COORDINATE PIN COMPONENT ──────────────────────────────────────── */
const CoordinatePin = ({ lat, lng }: { lat: string; lng: string }) => {
  if (!lat || !lng || lat === "N/A" || lng === "N/A") {
    return <span className="text-slate-400 italic font-medium">-</span>;
  }
  return (
    <a 
      href={`https://www.google.com/maps?q=${lat},${lng}`} 
      target="_blank" 
      rel="noopener noreferrer" 
      onClick={e => e.stopPropagation()} 
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-indigo-50 hover:text-indigo-650 px-2 py-0.5 text-[10px] font-bold text-slate-650 transition-colors shadow-sm"
    >
      <MapPin size={10} className="text-slate-400" />
      <span>Pin</span>
      <ExternalLink size={8} className="opacity-50 ml-0.5" />
    </a>
  );
};

/* ── ENGINEER AVATAR COMPONENT ─────────────────────────────────────── */
const getGradient = (name: string) => {
  const AVATAR_GRADIENTS = [
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-blue-500 via-cyan-500 to-teal-500",
    "from-emerald-400 via-teal-500 to-cyan-600",
    "from-amber-400 via-orange-500 to-rose-500",
    "from-rose-500 via-pink-500 to-purple-600",
    "from-violet-500 via-purple-600 to-indigo-700",
    "from-fuchsia-500 via-pink-500 to-rose-500",
    "from-sky-400 via-blue-500 to-indigo-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
};

const EngineerAvatar = ({ name, email, phone }: { name: string; email: string; phone: string }) => {
  if (!name || name === "N/A") return <span className="text-slate-400 font-medium italic">N/A</span>;
  const gradient = getGradient(name);
  const initials = getInitials(name);

  return (
    <div className="inline-flex items-center gap-2 group/avatar">
      <div className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-[10px] font-black text-white shadow-sm ring-1 ring-white/60",
        gradient
      )}>
        {initials}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover/avatar:text-indigo-600 transition-colors">
          {name}
        </span>
        <div className="flex items-center gap-1.5 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200 h-3">
          {email && email !== "N/A" && (
            <a 
              href={`mailto:${email}`} 
              onClick={e => e.stopPropagation()} 
              className="text-[9px] text-indigo-500 hover:text-indigo-650 font-bold hover:underline flex items-center gap-0.5"
            >
              <Mail size={8} /> Email
            </a>
          )}
          {phone && phone !== "N/A" && (
            <a 
              href={`tel:${phone}`} 
              onClick={e => e.stopPropagation()} 
              className="text-[9px] text-emerald-505 hover:text-emerald-650 font-bold hover:underline flex items-center gap-0.5"
            >
              <Phone size={8} /> Call
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── KPI CARD SPOTLIGHT COMPONENT ───────────────────────────────────── */
const KPICard = ({ 
  title, 
  value, 
  active, 
  onClick, 
  icon, 
  color,
}: { 
  title: string; 
  value: number; 
  active: boolean; 
  onClick: () => void; 
  icon: ReactNode; 
  color: string;
}) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "relative cursor-pointer overflow-hidden rounded-2xl border p-4.5 transition-all duration-350 flex items-center justify-between",
      active 
        ? "border-indigo-500/30 bg-white/95 shadow-md ring-2 ring-indigo-500/10" 
        : "border-white/50 bg-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:border-slate-300/40 hover:bg-white"
    )}
  >
    {active && (
      <div className="absolute inset-0 bg-indigo-50/10 pointer-events-none" />
    )}
    <div className="min-w-0">
      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</span>
      <span className="text-2xl font-black text-slate-800 tracking-tight">{value}</span>
    </div>
    <div className={cn(
      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-all",
      active ? color : "from-slate-100 to-slate-200 text-slate-500"
    )}>
      {icon}
    </div>
  </motion.div>
);

/* ── SITE CARD GRID VIEW COMPONENT ──────────────────────────────────── */
const SiteCard = ({ site, onClick }: { site: Site; onClick: () => void }) => {
  const isP1 = site.priority?.replace(".0", "") === "1";
  const isP2 = site.priority?.replace(".0", "") === "2";
  const gradient = isP1 
    ? "from-rose-500 via-pink-500 to-rose-600" 
    : isP2 
    ? "from-amber-400 via-orange-500 to-amber-500" 
    : "from-emerald-400 via-teal-500 to-cyan-500";

  const getCardStatus = (comments: string) => {
    if (!comments) return { label: "Unknown", color: "bg-slate-400", bg: "bg-slate-50 border-slate-200/60 text-slate-500" };
    const c = comments.toLowerCase();
    if (c.includes("working") && !c.includes("not working")) {
      return { label: "Working", color: "bg-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700" };
    }
    if (c.includes("not working") || c.includes("faulty")) {
      return { label: "At Risk", color: "bg-rose-500", bg: "bg-rose-500/10 border-rose-500/20 text-rose-600" };
    }
    return { label: "Monitoring", color: "bg-amber-500", bg: "bg-amber-500/10 border-amber-500/20 text-amber-700" };
  };

  const status = getCardStatus(site.comments);

  return (
    <motion.div
      layout
      whileHover={{ y: -4, scale: 1.01 }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/20 hover:shadow-[0_20px_40px_rgba(79,70,229,0.06)] dark:border-slate-800/60 dark:bg-slate-900/60"
    >
      <div className={cn("absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r", gradient)} />
      
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-black text-slate-850 dark:text-slate-200 truncate group-hover:text-indigo-650 transition-colors uppercase tracking-wide">
            {site.siteName}
          </h4>
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-0.5">
            {site.siteType || "Greenfield"}
          </p>
        </div>
        <div className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-sm", status.bg)}>
          <span className="relative flex h-1.5 w-1.5">
            <span className={cn("pulse-glow absolute inline-flex h-full w-full rounded-full opacity-75", status.color)}></span>
            <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", status.color)}></span>
          </span>
          {status.label}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="font-mono text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-lg px-2 py-0.5 border border-slate-200/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
          {site.ipAddress || "0.0.0.0"}
        </span>
        <span className="text-[9px] font-black bg-indigo-500/10 dark:bg-indigo-500/5 text-indigo-600 rounded-lg px-2 py-0.5 border border-indigo-500/10 uppercase tracking-wider">
          {site.region}
        </span>
        {site.reonIntegration === "Integrated" && (
          <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 rounded-lg px-2 py-0.5 border border-emerald-500/10 uppercase tracking-wider">
            REON
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5 border-t border-slate-100/50 pt-4 dark:border-slate-800/50 text-[11px] font-semibold text-slate-500">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-extrabold text-slate-405 uppercase tracking-wider">Power Source</span>
          <span className="font-bold text-slate-700 truncate flex items-center gap-1">
            <Zap size={11} className="text-amber-500 shrink-0" />
            {site.powerSource || "-"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-extrabold text-slate-405 uppercase tracking-wider">Solar Capacity</span>
          <span className="font-bold text-slate-700 truncate flex items-center gap-1">
            <Sun size={11} className="text-emerald-505 shrink-0" />
            {site.solarCapacity || "N/A"}
          </span>
        </div>
        <div className="col-span-2">
          <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-405 uppercase tracking-wider mb-1">
            <span>Rectifier Cap</span>
            <span className="text-slate-600 font-bold">{site.rectifierCapacity} / {site.rectifierMaxCapacity}</span>
          </div>
          <div className="w-full">
            {(() => {
              const numVal = parseFloat(site.rectifierCapacity?.replace(/[^0-9.]/g, "") || "");
              const numMax = parseFloat(site.rectifierMaxCapacity?.replace(/[^0-9.]/g, "") || "");
              const pct = isNaN(numVal) || isNaN(numMax) || numMax === 0 ? 0 : Math.min(100, Math.max(0, (numVal / numMax) * 100));
              let color = "bg-emerald-500";
              if (pct > 90) color = "bg-rose-500";
              else if (pct > 75) color = "bg-amber-500";
              return (
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/10">
                  <div className={cn("h-full rounded-full transition-all duration-350", color)} style={{ width: `${pct}%` }} />
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100/50 pt-4 dark:border-slate-800/50">
        <div className="min-w-0 flex-1">
          <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Field Engineer</span>
          <EngineerAvatar 
            name={site.fieldEngineer} 
            email={site.fieldEngineerEmail} 
            phone={site.fieldEngineerPhone} 
          />
        </div>
        <button className="h-8 w-8 rounded-lg bg-indigo-50/50 hover:bg-indigo-500/10 text-indigo-650 flex items-center justify-center shadow-sm active:scale-95 transition-all group-hover:bg-indigo-600 group-hover:text-white" aria-label="Open site details">
          <Eye size={13} />
        </button>
      </div>
    </motion.div>
  );
};

/* ── MAIN SITES TABLE MODULE ────────────────────────────────────────── */
const SitesTable = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [regionFilter, setRegionFilter] = useState("");
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasScriptUrl, setHasScriptUrl] = useState(() => !!localStorage.getItem("google_apps_script_url"));
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [kpiFilter, setKpiFilter] = useState<"all" | "critical" | "at-risk" | "integrated">("all");

  const { data: remoteSitesData, isLoading, isError } = useSites();
  const queryClient = useQueryClient();
  const normalizeId = (id: string) => id?.replace(".0", "").trim() || "";

  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<Site>>>(() => {
    const saved = localStorage.getItem("site_overrides");
    if (!saved) return {};
    try {
      const parsed = JSON.parse(saved);
      const normalized: Record<string, Partial<Site>> = {};
      Object.entries(parsed).forEach(([key, value]) => {
        normalized[normalizeId(key)] = value as Partial<Site>;
      });
      return normalized;
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    setHasScriptUrl(!!localStorage.getItem("google_apps_script_url"));
  }, [localOverrides]);

  const handleSaveSite = async (updatedSite: Site) => {
    const siteId = normalizeId(updatedSite.no);
    const newOverrides = {
      ...localOverrides,
      [siteId]: updatedSite
    };
    setLocalOverrides(newOverrides);
    localStorage.setItem("site_overrides", JSON.stringify(newOverrides));

    setIsSyncing(true);
    try {
      await updateSite(updatedSite.no, updatedSite);
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    } catch (err) {
      console.error("Cloud sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const sitesData = useMemo(() => {
    const baseData = remoteSitesData || [];
    return baseData.map(site => {
      const siteId = normalizeId(site.no);
      const override = localOverrides[siteId];
      return override ? { ...site, ...override } : site;
    });
  }, [remoteSitesData, localOverrides]);

  const kpiStats = useMemo(() => {
    const data = sitesData || [];
    const total = data.length;
    const critical = data.filter(s => s.priority?.replace(".0", "") === "1").length;
    const atRisk = data.filter(s => {
      const c = s.comments?.toLowerCase() || "";
      return c.includes("not working") || c.includes("faulty");
    }).length;
    const integrated = data.filter(s => s.reonIntegration === "Integrated").length;
    return { total, critical, atRisk, integrated };
  }, [sitesData]);

  const regions = useMemo(() => {
    const r = new Set(sitesData.map((s) => s.region).filter(Boolean));
    return Array.from(r).sort();
  }, [sitesData]);

  const filteredData = useMemo(() => {
    let data = sitesData;

    // Apply KPI filter first
    if (kpiFilter === "critical") {
      data = data.filter(s => s.priority?.replace(".0", "") === "1");
    } else if (kpiFilter === "at-risk") {
      data = data.filter(s => {
        const c = s.comments?.toLowerCase() || "";
        return c.includes("not working") || c.includes("faulty");
      });
    } else if (kpiFilter === "integrated") {
      data = data.filter(s => s.reonIntegration === "Integrated");
    }

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (site) =>
          site.siteName.toLowerCase().includes(s) ||
          site.region.toLowerCase().includes(s) ||
          site.fieldEngineer.toLowerCase().includes(s) ||
          site.ipAddress.toLowerCase().includes(s) ||
          site.siteType.toLowerCase().includes(s) ||
          site.comments?.toLowerCase().includes(s) ||
          site.megmeetMppt?.toLowerCase().includes(s)
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
  }, [search, sortConfig, regionFilter, sitesData, kpiFilter]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const safeTotalPages = Math.max(1, totalPages);
  const pageData = filteredData.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const rangeStart = filteredData.length === 0 ? 0 : page * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min((page + 1) * ITEMS_PER_PAGE, filteredData.length);

  useEffect(() => {
    const lastPage = Math.max(0, totalPages - 1);
    if (page > lastPage) setPage(lastPage);
  }, [page, totalPages]);

  const handleSort = (key: keyof Site) => {
    setSortConfig((prev) =>
      prev?.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const SortIcon = ({ column }: { column: keyof Site }) => {
    if (sortConfig?.key !== column) return <ChevronUp size={12} className="text-slate-400/50 transition-colors group-hover:text-slate-400" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={12} className="text-primary font-bold animate-bounce" />
    ) : (
      <ChevronDown size={12} className="text-primary font-bold animate-bounce" />
    );
  };

  const getPriorityBadge = (priority: string) => {
    const p = priority?.replace(".0", "");
    switch (p) {
      case "1":
        return (
          <Badge className="bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 border border-rose-500/20 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">
            CRITICAL P1
          </Badge>
        );
      case "2":
        return (
          <Badge className="bg-amber-500/10 hover:bg-amber-500/15 text-amber-700 border border-amber-500/20 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">
            HIGH P2
          </Badge>
        );
      case "3":
        return (
          <Badge className="bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full tracking-wider shadow-sm">
            NORMAL P3
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-[9px] border-slate-200 text-slate-400 font-semibold px-2.5 py-0.5 rounded-full">N/A</Badge>;
    }
  };

  const getStatusBadge = (comments: string) => {
    if (!comments) return <Badge variant="outline" className="text-[9px] border-slate-200 text-slate-400 font-semibold px-2 py-0.5 rounded-full">Unknown</Badge>;
    const c = comments.toLowerCase();
    if (c.includes("working") && !c.includes("not working")) {
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-black text-emerald-700 shadow-sm dark:bg-emerald-500/5 dark:text-emerald-450">
          <span className="relative flex h-1.5 w-1.5">
            <span className="pulse-glow absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
          </span>
          Working
        </div>
      );
    }
    if (c.includes("not working") || c.includes("faulty")) {
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[10px] font-black text-rose-600 shadow-sm dark:bg-rose-500/5 dark:text-rose-450">
          <span className="relative flex h-1.5 w-1.5">
            <span className="pulse-glow absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-600"></span>
          </span>
          At Risk
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] font-black text-amber-700 shadow-sm dark:bg-amber-500/5 dark:text-amber-400">
        <span className="relative flex h-1.5 w-1.5">
          <span className="pulse-glow absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-600"></span>
        </span>
        Monitoring
      </div>
    );
  };

  const renderCellContent = (site: Site, colKey: keyof Site) => {
    switch (colKey) {
      case "priority":
        return getPriorityBadge(site.priority);
      case "comments":
        return getStatusBadge(site.comments);
      case "reonIntegration":
        return (
          <Badge 
            className={cn(
              "text-[9px] font-black rounded-full border px-2 py-0.5 tracking-wider shadow-sm",
              site.reonIntegration === "Integrated" 
                ? "bg-indigo-500/10 text-indigo-650 border-indigo-500/20" 
                : "bg-slate-100 text-slate-400 border-slate-205/50 opacity-60"
            )}
          >
            {site.reonIntegration === "Integrated" ? "INTEGRATED" : "LEGACY"}
          </Badge>
        );
      case "no":
        return <span className="text-slate-400 font-mono tracking-tighter">{site.no?.replace(".0", "").padStart(4, '0')}</span>;
      case "latitude":
        return <CoordinatePin lat={site.latitude} lng={site.longitude} />;
      case "longitude":
        return <span className="font-mono text-slate-450">{site.longitude || <span className="opacity-25">-</span>}</span>;
      case "rectifierCapacity":
        return <CapacityBar value={site.rectifierCapacity} max={site.rectifierMaxCapacity} />;
      case "generatorTankCapacity":
        return <CapacityBar value={site.generatorTankCapacity} max="2000" />;
      case "solarCapacity":
        return site.solarCapacity && site.solarCapacity !== "N/A" && site.solarCapacity !== "Not Connected" ? (
          <span className="inline-flex items-center gap-1 font-bold text-slate-700">
            <Sun size={11} className="text-amber-500" />
            {site.solarCapacity}
          </span>
        ) : <span className="opacity-25">-</span>;
      case "fieldEngineer":
        return <EngineerAvatar name={site.fieldEngineer} email={site.fieldEngineerEmail} phone={site.fieldEngineerPhone} />;
      case "secondFieldEngineer":
        return <EngineerAvatar name={site.secondFieldEngineer} email={site.secondFieldEngineerEmail} phone={site.secondFieldEngineerPhone} />;
      case "fieldEngineerEmail":
      case "secondFieldEngineerEmail":
        return site[colKey] && site[colKey] !== "N/A" ? (
          <a href={`mailto:${site[colKey]}`} className="font-semibold text-indigo-550 hover:underline">{site[colKey]}</a>
        ) : <span className="opacity-25">-</span>;
      case "fieldEngineerPhone":
      case "secondFieldEngineerPhone":
        return site[colKey] && site[colKey] !== "N/A" ? (
          <a href={`tel:${site[colKey]}`} className="font-semibold text-slate-600 hover:underline">{site[colKey]}</a>
        ) : <span className="opacity-25">-</span>;
      case "ipAddress":
        return site.ipAddress ? (
          <span className="font-mono text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 rounded px-1.5 py-0.5 border border-slate-200/50 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            {site.ipAddress}
          </span>
        ) : <span className="opacity-25">-</span>;
      default:
        return site[colKey] || <span className="opacity-25">-</span>;
    }
  };

  const columns: { key: keyof Site; label: string; width?: string }[] = [
    { key: "no", label: "#", width: "w-20" },
    { key: "siteName", label: "Location / Site", width: "min-w-[280px]" }, 
    { key: "region", label: "Region", width: "w-32" },
    { key: "ipAddress", label: "IP Address", width: "w-36" },
    { key: "priority", label: "Tier", width: "w-28" },
    { key: "comments", label: "Connectivity", width: "w-32" },
    { key: "powerSource", label: "Power Source", width: "w-40" },
    { key: "routerStatus", label: "Router Status", width: "w-40" },
    { key: "latitude", label: "Latitude", width: "w-32" },
    { key: "longitude", label: "Longitude", width: "w-32" },
    { key: "onAirDate", label: "On Air Date", width: "w-32" },
    { key: "rectifierType", label: "Rectifier", width: "w-32" },
    { key: "tenants", label: "Tenants", width: "w-48" },
    { key: "reonIntegration", label: "REON", width: "w-28" },
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
    <div className="flex h-full flex-col overflow-hidden relative">
      {/* Background spotlights */}
      <div className="absolute top-[-100px] left-[25%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-100px] w-[250px] h-[250px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      {/* ── REAL-TIME TELEMETRY KPI HEADERS ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-4 shrink-0">
        <KPICard 
          title="Total Assets" 
          value={kpiStats.total} 
          active={kpiFilter === "all"} 
          onClick={() => { setKpiFilter("all"); setPage(0); }} 
          icon={<Layers size={18} />}
          color="from-blue-500 via-indigo-500 to-blue-600"
        />
        <KPICard 
          title="Critical Tier P1" 
          value={kpiStats.critical} 
          active={kpiFilter === "critical"} 
          onClick={() => { setKpiFilter("critical"); setPage(0); }} 
          icon={<ShieldAlert size={18} />}
          color="from-rose-500 via-pink-500 to-rose-600"
        />
        <KPICard 
          title="At Risk Connectivity" 
          value={kpiStats.atRisk} 
          active={kpiFilter === "at-risk"} 
          onClick={() => { setKpiFilter("at-risk"); setPage(0); }} 
          icon={<Activity size={18} />}
          color="from-amber-450 via-orange-500 to-amber-500"
        />
        <KPICard 
          title="REON Integrated" 
          value={kpiStats.integrated} 
          active={kpiFilter === "integrated"} 
          onClick={() => { setKpiFilter("integrated"); setPage(0); }} 
          icon={<Wifi size={18} />}
          color="from-emerald-400 via-teal-500 to-cyan-500"
        />
      </div>

      {/* ── FILTER & DECK ACTION BAR ────────────────────────────────────── */}
      <div className="backdrop-blur-xl bg-white/70 rounded-2xl mb-4 p-4 shadow-[0_8px_32px_rgba(15,23,42,0.02),0_1px_2px_rgba(15,23,42,0.01)] border border-white/80 shrink-0">
        <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:justify-between">
          
          {/* Dynamic Search */}
          <div className="relative flex-1 max-w-xl w-full group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Search across 40+ site parameters (e.g. location, IP, region, engineer...)"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="h-10 rounded-xl border-slate-200 bg-white/95 pl-10 pr-4 text-xs font-semibold shadow-sm transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {/* View Mode layout Switcher */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100/80 p-1 border border-slate-200/40">
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                  viewMode === "table" 
                    ? "bg-white text-indigo-650 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
                aria-label="Table View"
              >
                <List size={13} />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                  viewMode === "grid" 
                    ? "bg-white text-indigo-650 shadow-sm" 
                    : "text-slate-500 hover:text-slate-700"
                )}
                aria-label="Grid View"
              >
                <LayoutGrid size={13} />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>

            {/* Sync Notifications badges */}
            {isSyncing && (
              <Badge variant="outline" className="animate-pulse gap-1.5 border-indigo-200 bg-indigo-50/50 px-3 py-1.5 text-[10px] text-indigo-600 font-extrabold rounded-xl shadow-sm">
                <Cloud size={12} className="animate-bounce" /> Syncing...
              </Badge>
            )}
            {!hasScriptUrl && (
              <Badge variant="outline" className="flex items-center gap-1.5 border-rose-200 bg-rose-50/50 px-3 py-1.5 text-[10px] font-extrabold text-rose-600 rounded-xl shadow-sm">
                <AlertTriangle size={12} /> Local Offline
              </Badge>
            )}
            {Object.keys(localOverrides).length > 0 && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50/50 px-3 py-1.5 text-[10px] font-extrabold text-amber-700 rounded-xl shadow-sm">
                {Object.keys(localOverrides).length} Unsaved
              </Badge>
            )}

            {/* Dropdown Filters */}
            <div className="relative flex items-center rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-sm transition-all hover:border-slate-350 hover:shadow-md">
              <Filter size={13} className="text-slate-400 mr-2" />
              <select
                value={regionFilter}
                onChange={(e) => { setRegionFilter(e.target.value); setPage(0); }}
                className="border-none bg-transparent p-0 pr-6 text-[11px] font-extrabold text-slate-700 focus:ring-0 cursor-pointer outline-none"
              >
                <option value="">All Regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            
            <button className="control-button h-9 px-3 rounded-xl border border-slate-200 bg-white text-[11px] font-extrabold text-slate-700 shadow-sm transition-all hover:border-slate-300 active:scale-95 flex items-center" aria-label="Configure headers">
              <SlidersHorizontal size={13} className="mr-1.5 text-slate-405" /> Configure
            </button>
            <button className="control-button h-9 px-3 rounded-xl border border-slate-205 bg-white text-[11px] font-extrabold text-slate-700 shadow-sm transition-all hover:border-slate-300 active:scale-95 flex items-center" aria-label="Export sites list">
              <Download size={13} className="mr-1.5 text-slate-405" /> Export
            </button>
          </div>
        </div>
      </div>

      {/* ── DYNAMIC VIEW AREA ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto custom-scrollbar relative min-h-0">
        <AnimatePresence mode="wait">
          {viewMode === "grid" ? (
            <motion.div 
              key="grid"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-0.5"
            >
              {pageData.map((site, idx) => (
                <SiteCard key={`${site.no}-${idx}`} site={site} onClick={() => setSelectedSite(site)} />
              ))}
              
              {pageData.length === 0 && !isLoading && (
                <div className="col-span-full py-16 text-center">
                  <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white/70 p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] backdrop-blur-xl">
                    <p className="text-sm font-bold text-slate-800">No matching assets found</p>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">Adjust your filters, KPIs, or search keywords to view other records.</p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="table"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="premium-card bg-white/80 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_8px_32px_rgba(15,23,42,0.02)] overflow-hidden"
            >
              <div className="w-full overflow-auto custom-scrollbar">
                <table className="w-full text-xs border-separate border-spacing-0">
                  <thead className="sticky top-0 z-30">
                    <tr className="bg-slate-50/90 backdrop-blur-md">
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => handleSort(col.key)}
                          className={cn(
                            "group cursor-pointer whitespace-nowrap border-b border-slate-200/60 px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 transition-colors hover:bg-slate-100/80 hover:text-primary",
                            col.width || "w-40",
                            col.key === "no" && "sticky left-0 z-40 bg-slate-50/90 backdrop-blur-md border-r border-slate-200/60 shadow-[4px_0_14px_-8px_rgba(15,23,42,0.1)]",
                            col.key === "siteName" && "sticky left-[80px] z-40 bg-slate-50/90 backdrop-blur-md shadow-[4px_0_24px_-10px_rgba(15,23,42,0.18)] border-r border-slate-200/50",
                          )}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            {col.label}
                            <SortIcon column={col.key} />
                          </div>
                        </th>
                      ))}
                      <th className="sticky right-0 z-30 w-20 border-b border-slate-200/60 bg-slate-50/90 backdrop-blur-md shadow-[-4px_0_24px_-10px_rgba(15,23,42,0.18)]"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageData.map((site, i) => (
                      <tr
                        key={`${site.no}-${i}`}
                        onClick={() => setSelectedSite(site)}
                        className="group cursor-pointer transition-colors hover:bg-primary/[0.015]"
                      >
                        {columns.map((col) => (
                          <td key={`${site.no}-${col.key}`} className={cn(
                            "overflow-hidden text-ellipsis whitespace-nowrap bg-white px-5 py-3.5 align-middle text-xs font-semibold border-b border-slate-100 transition-colors",
                            col.key === "no" && "sticky left-0 z-20 text-slate-400 font-mono tracking-tighter border-r border-slate-100/60 bg-white/95 backdrop-blur-sm group-hover:bg-slate-50/90",
                            col.key === "siteName" && "sticky left-[80px] z-20 font-extrabold text-slate-805 shadow-[4px_0_24px_-10px_rgba(15,23,42,0.15)] bg-white/95 backdrop-blur-sm group-hover:bg-slate-50/90 border-r border-slate-100/60 uppercase tracking-wide",
                            col.key !== "no" && col.key !== "siteName" && "text-slate-650 group-hover:bg-slate-50/10",
                          )}>
                            {renderCellContent(site, col.key)}
                          </td>
                        ))}
                        <td className="sticky right-0 z-20 bg-white px-5 py-3.5 text-right shadow-[-4px_0_24px_-10px_rgba(15,23,42,0.15)] bg-white/95 backdrop-blur-sm group-hover:bg-slate-50 border-b border-slate-100">
                          <button className="rounded-lg p-1.5 text-primary opacity-0 transition-all hover:bg-primary/10 group-hover:opacity-100 active:scale-90" aria-label="View details">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    {pageData.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={columns.length + 1} className="px-6 py-16 text-center">
                          <div className="mx-auto max-w-sm rounded-xl border border-slate-205 bg-slate-50/50 p-8 shadow-inner">
                            <p className="text-sm font-bold text-slate-800">No matching assets found</p>
                            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">Adjust your search keyword or region selection to broaden the result set.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading overlay panel */}
        {isLoading && (
          <div className="absolute inset-0 z-50 bg-background/55 backdrop-blur-[1.5px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/60 bg-white p-7 shadow-2xl">
              <div className="w-8 h-8 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Synchronizing Sheet Data...</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-sm flex items-center justify-center p-8">
            <div className="max-w-md rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                <Search className="text-rose-650 rotate-45 animate-pulse" size={22} />
              </div>
              <h3 className="text-base font-black text-slate-800 mb-2">Sync Connection Failure</h3>
              <p className="text-xs leading-relaxed text-slate-500 mb-6">
                We encountered an error connecting to the spreadsheet endpoints. Verify that the file is published and accessible as CSV.
              </p>
              <button 
                onClick={() => window.location.reload()}
                className="rounded-xl bg-rose-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-rose-500 transition-colors"
              >
                Re-attempt Sync
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── SPRING-LOADED PAGINATION FOOTER ───────────────────────────────── */}
      <div className="mt-4 flex shrink-0 flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white p-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.01)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400">
            Showing assets <span className="text-slate-800 font-extrabold">{rangeStart}-{rangeEnd}</span> of <span className="text-slate-800 font-extrabold">{filteredData.length}</span> records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setPage(Math.max(0, page - 1)); }}
            disabled={page === 0}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-55 disabled:opacity-35 hover:border-slate-300 active:scale-90"
            aria-label="Previous Page"
          >
            <ChevronLeft size={15} />
          </button>
          
          <div className="hidden sm:flex items-center gap-1.5 px-2">
            {[...Array(Math.min(5, safeTotalPages))].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={cn(
                  "h-9 w-9 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-90",
                  page === i 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/10" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); setPage(Math.min(safeTotalPages - 1, page + 1)); }}
            disabled={page >= safeTotalPages - 1}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-55 disabled:opacity-35 hover:border-slate-300 active:scale-90"
            aria-label="Next Page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {selectedSite && (
          <SiteDetailModal 
            site={sitesData.find(s => s.no === selectedSite.no) || selectedSite} 
            onClose={() => setSelectedSite(null)} 
            onSave={handleSaveSite}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SitesTable;
