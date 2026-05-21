import { useMemo, useState } from "react";
import { useSites, useRevisionSummary } from "@/hooks/useSites";
import StatsCard from "./StatsCard";
import {
  X,
  Radio,
  Users,
  AlertTriangle,
  CheckCircle,
  Zap,
  MapPin,
  Activity,
  Clock,
  FileText,
  ArrowUpRight,
  Server,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "@/lib/utils";

const DashboardView = () => {
  const { data: remoteSitesData, isLoading: sitesLoading } = useSites();
  const { data: revisions, isLoading: revisionsLoading } = useRevisionSummary();

  const sitesData = useMemo(() => remoteSitesData || [], [remoteSitesData]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<{
    name: string;
    x: number;
    y: number;
    count: number;
    issues: number;
  } | null>(null);

  // Dynamic Filtering based on selected map region
  const filteredSitesData = useMemo(() => {
    if (!selectedRegion) return sitesData;
    return sitesData.filter((s) => {
      const siteReg = (s.region || "").trim().toLowerCase();
      const filterReg = selectedRegion.trim().toLowerCase();
      return siteReg === filterReg || siteReg.includes(filterReg) || filterReg.includes(siteReg);
    });
  }, [sitesData, selectedRegion]);

  const stats = useMemo(() => {
    const working = filteredSitesData.filter((s) => {
      const c = (s.comments || "").toLowerCase();
      return c.includes("working") && !c.includes("not working");
    }).length;
    
    const issues = filteredSitesData.filter((s) => {
      const c = (s.comments || "").toLowerCase();
      return c.includes("not working") || c.includes("faulty");
    }).length;
    
    const regions = new Set(sitesData.map((s) => s.region).filter(Boolean)).size;
    const integrated = filteredSitesData.filter((s) => s.reonIntegration === "Integrated").length;

    // Power Configuration load (Filtered)
    const powerCounts: Record<string, number> = {};
    filteredSitesData.forEach((s) => {
      if (s.powerSource) powerCounts[s.powerSource] = (powerCounts[s.powerSource] || 0) + 1;
    });
    const topPower = Object.entries(powerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    // Regional node concentrations (Always show all regions for the map/bar chart)
    const regionCounts: Record<string, number> = {};
    sitesData.forEach((s) => {
      if (s.region) regionCounts[s.region] = (regionCounts[s.region] || 0) + 1;
    });
    const topRegions = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const atRiskSites = filteredSitesData
      .filter((s) => {
        const c = (s.comments || "").toLowerCase();
        return c.includes("not working") || c.includes("faulty") || s.priority?.replace(".0", "") === "1";
      })
      .slice(0, 6);

    return { working, issues, regions, integrated, topRegions, topPower, atRiskSites };
  }, [sitesData, filteredSitesData]);

  const maxRegionCount = stats.topRegions[0]?.[1] || 1;
  const availability = ((stats.working / (filteredSitesData.length || 1)) * 100).toFixed(1);

  // Dynamic Recharts Data Mappings
  const powerChartData = useMemo(() => {
    return stats.topPower.map(([name, value]) => ({ name, value }));
  }, [stats.topPower]);

  const regionChartData = useMemo(() => {
    return stats.topRegions.slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [stats.topRegions]);

  const timelineData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, idx) => {
      const baseSLA = 98.8;
      const seed = Math.sin(idx * 0.8) * 0.3 + 0.15;
      return {
        day,
        SLA: parseFloat((baseSLA + seed).toFixed(2)),
        SyncVolume: Math.round(150 + seed * 40),
      };
    });
  }, []);

  // Map hotspots definitions with coordinates on viewBox 320x300
  const mapHotspots = useMemo(() => {
    const locations = [
      { name: "Nairobi", x: 175, y: 155 },
      { name: "Eldoret", x: 125, y: 100 },
      { name: "Kisumu", x: 95, y: 115 },
      { name: "Mombasa", x: 235, y: 220 },
      { name: "Turkana", x: 95, y: 40 },
      { name: "Kakamega", x: 95, y: 90 },
      { name: "Kisii", x: 95, y: 140 },
      { name: "Nakuru", x: 145, y: 130 },
      { name: "Bomet", x: 120, y: 150 },
      { name: "Kitale", x: 110, y: 80 },
      { name: "Kericho", x: 120, y: 130 },
      { name: "Nyahururu", x: 155, y: 115 },
      { name: "Narok", x: 135, y: 165 },
      { name: "USF", x: 195, y: 65 },
    ];

    return locations.map((loc) => {
      const regionSites = sitesData.filter((s) => {
        const siteReg = (s.region || "").trim().toLowerCase();
        const locName = loc.name.trim().toLowerCase();
        return siteReg === locName || siteReg.includes(locName) || locName.includes(siteReg);
      });
      const count = regionSites.length;
      const issues = regionSites.filter((s) => {
        const c = (s.comments || "").toLowerCase();
        return c.includes("not working") || c.includes("faulty");
      }).length;

      let statusColor = "#10b981"; // Green
      if (issues > 2) statusColor = "#f43f5e"; // Red
      else if (issues > 0) statusColor = "#f59e0b"; // Amber

      return {
        ...loc,
        count,
        issues,
        statusColor,
      };
    });
  }, [sitesData]);

  // Color mappings for power configurations
  const POWER_COLORS: Record<string, string> = {
    "Grid / Genset": "#3b82f6",
    "Grid": "#10b981",
    "Genset": "#f59e0b",
    "Solar PV / Grid": "#ec4899",
    "Solar PV / Genset": "#8b5cf6",
    "DG-Grid-Solar": "#06b6d4",
  };
  const getPowerColor = (source: string) => POWER_COLORS[source] || "#64748b";

  return (
    <div className="space-y-6 pb-10">
      {/* Dynamic Filter Alert banner */}
      <AnimatePresence>
        {selectedRegion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 dark:bg-primary/10 px-4 py-3 text-xs font-bold text-primary dark:text-primary-foreground shadow-sm"
          >
            <div className="flex items-center gap-2">
              <MapPin size={14} className="animate-bounce" />
              <span>Showing operations filtered by region: <span className="font-extrabold underline">{selectedRegion}</span></span>
            </div>
            <button
              onClick={() => setSelectedRegion(null)}
              className="flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 dark:bg-white/10 dark:hover:bg-white/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-colors"
            >
              Clear Filter <X size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive Executive mesh-gradient banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-xl shadow-indigo-950/10">
        <div className="pointer-events-none absolute right-[-10%] top-[-20%] h-[350px] w-[350px] rounded-full bg-primary/20 blur-[80px]" />
        <div className="pointer-events-none absolute left-[40%] bottom-[-30%] h-[300px] w-[300px] rounded-full bg-accent/20 blur-[80px]" />

        <div className="grid gap-8 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-10 relative z-10">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border-white/10 bg-white/10 text-white backdrop-blur-md px-3 py-1 font-bold text-[10px] tracking-wider uppercase">
                  Operations Intelligence
                </Badge>
                {(sitesLoading || revisionsLoading) && (
                  <Badge variant="outline" className="gap-2 border-primary/30 bg-primary/10 text-primary-foreground">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-foreground" />
                    Syncing live data
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                <h2 className="max-w-3xl text-3xl font-extrabold tracking-tight text-white font-display md:text-4xl leading-tight">
                  Unified command interface for sites, field assets, and escalations.
                </h2>
                <p className="max-w-xl text-xs font-semibold text-slate-350 leading-relaxed">
                  Supervise {filteredSitesData.length} active cellular nodes, evaluate structural connectivity risks, and synchronize operations across {stats.regions} regions in East Africa.
                </p>
              </div>
            </div>

            {/* Quick Stat Widgets inside Banner */}
            <div className="grid gap-3.5 sm:grid-cols-3 pt-4">
              {[
                { label: "Availability", value: `${availability}%`, icon: Activity, trend: "SLA Compliant", color: "text-emerald-400" },
                { label: "Mapped Regions", value: stats.regions, icon: MapPin, trend: "Active presence", color: "text-sky-400" },
                { label: "REON Onboarding", value: stats.integrated, icon: Server, trend: "Nodes integrated", color: "text-indigo-400" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
                        {item.label}
                      </span>
                      <Icon size={14} className={item.color} />
                    </div>
                    <p className="text-xl font-black text-white font-display leading-tight">{item.value}</p>
                    <p className="mt-1 flex items-center gap-1 text-[9px] font-bold text-slate-400">
                      <TrendingUp size={10} className="text-emerald-400" />
                      {item.trend}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Focus Widget */}
          <div className="rounded-xl border border-white/5 bg-slate-950/40 p-5 backdrop-blur-md shadow-inner flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white">Priority Focus</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Critical nodes needing instant review</p>
              </div>
              <AlertTriangle size={16} className="text-amber-500 animate-bounce" />
            </div>
            <div className="space-y-2.5 overflow-y-auto custom-scrollbar max-h-[220px] flex-1">
              {stats.atRiskSites.length > 0 ? (
                stats.atRiskSites.map((site) => (
                  <div key={`${site.no}-${site.siteName}`} className="rounded-lg border border-white/5 bg-white/5 p-3 hover:bg-white/10 transition-colors duration-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-white">{site.siteName}</p>
                        <p className="mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-wide">{site.region || "Unassigned region"}</p>
                      </div>
                      <Badge className="bg-rose-500/20 text-rose-300 border-none font-black text-[9px] px-2 py-0.5 shrink-0">
                        Tier P{site.priority?.replace(".0", "") || "1"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-emerald-500/10 bg-emerald-500/5 p-4 text-center text-xs font-semibold text-emerald-400">
                  All critical node checks fully green.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Metrics cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Network Sites"
          value={filteredSitesData.length}
          icon={Radio}
          variant="accent"
          trendValue={12.5}
          trend={`${stats.regions} regions covered`}
        />
        <StatsCard
          title="Operational"
          value={stats.working}
          icon={CheckCircle}
          variant="success"
          trendValue={4.2}
          trend={`${availability}% availability`}
        />
        <StatsCard
          title="Open Issues"
          value={stats.issues}
          icon={AlertTriangle}
          variant="warning"
          trendValue={-2.4}
          trend="Immediate review needed"
        />
        <StatsCard
          title="Team Integration"
          value={stats.integrated}
          icon={Users}
          variant="info"
          trendValue={18}
          trend="REON sync operational"
        />
      </div>

      {/* Interactive East Africa SVG Map & Updates Timeline Feed */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* SVG Map Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-6 xl:col-span-2 relative flex flex-col justify-between overflow-hidden"
        >
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                  <MapPin size={16} className="text-primary" />
                  East Africa Operational heat map
                </h3>
                <p className="mt-1 text-[10px] font-bold text-muted-foreground">Pulse hotspots indicate active node SLA status. Click to filter stats.</p>
              </div>
              <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5">Live GIS</Badge>
            </div>

            <div className="relative w-full h-[320px] bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/40 rounded-xl flex items-center justify-center p-4">
              <svg viewBox="0 0 320 300" className="w-full h-full max-h-[290px] text-slate-350 dark:text-slate-700">
                {/* stylized map backgrounds for operational zones */}
                <g>
                  {/* Northern Frontier (Turkana / USF) */}
                  <path
                    d="M 60,30 L 160,20 L 220,50 L 180,90 L 120,95 L 60,70 Z"
                    className={cn(
                      "fill-slate-200/25 dark:fill-slate-800/10 stroke-slate-300 dark:stroke-slate-800 stroke-[1.5] transition-all duration-300 cursor-pointer hover:fill-primary/5 hover:stroke-primary/45",
                      selectedRegion === "Turkana" && "fill-primary/10 stroke-primary dark:fill-primary/15"
                    )}
                    onClick={() => setSelectedRegion(selectedRegion === "Turkana" ? null : "Turkana")}
                  />
                  {/* Rift Valley / Eldoret / Nakuru */}
                  <path
                    d="M 120,95 L 180,90 L 210,130 L 160,180 L 115,160 Z"
                    className={cn(
                      "fill-slate-200/25 dark:fill-slate-800/10 stroke-slate-300 dark:stroke-slate-800 stroke-[1.5] transition-all duration-300 cursor-pointer hover:fill-primary/5 hover:stroke-primary/45",
                      selectedRegion === "Eldoret" && "fill-primary/10 stroke-primary dark:fill-primary/15"
                    )}
                    onClick={() => setSelectedRegion(selectedRegion === "Eldoret" ? null : "Eldoret")}
                  />
                  {/* Nairobi & Central */}
                  <path
                    d="M 160,180 L 210,130 L 250,155 L 225,210 L 180,210 Z"
                    className={cn(
                      "fill-slate-200/25 dark:fill-slate-800/10 stroke-slate-300 dark:stroke-slate-800 stroke-[1.5] transition-all duration-300 cursor-pointer hover:fill-primary/5 hover:stroke-primary/45",
                      selectedRegion === "Nairobi" && "fill-primary/10 stroke-primary dark:fill-primary/15"
                    )}
                    onClick={() => setSelectedRegion(selectedRegion === "Nairobi" ? null : "Nairobi")}
                  />
                  {/* Coastal Region (Mombasa) */}
                  <path
                    d="M 225,210 L 250,155 L 290,190 L 270,260 L 220,240 Z"
                    className={cn(
                      "fill-slate-200/25 dark:fill-slate-800/10 stroke-slate-300 dark:stroke-slate-800 stroke-[1.5] transition-all duration-300 cursor-pointer hover:fill-primary/5 hover:stroke-primary/45",
                      selectedRegion === "Mombasa" && "fill-primary/10 stroke-primary dark:fill-primary/15"
                    )}
                    onClick={() => setSelectedRegion(selectedRegion === "Mombasa" ? null : "Mombasa")}
                  />
                  {/* Western / Kisumu / Kakamega */}
                  <path
                    d="M 60,70 L 120,95 L 115,160 L 60,150 Z"
                    className={cn(
                      "fill-slate-200/25 dark:fill-slate-800/10 stroke-slate-300 dark:stroke-slate-800 stroke-[1.5] transition-all duration-300 cursor-pointer hover:fill-primary/5 hover:stroke-primary/45",
                      selectedRegion === "Kisumu" && "fill-primary/10 stroke-primary dark:fill-primary/15"
                    )}
                    onClick={() => setSelectedRegion(selectedRegion === "Kisumu" ? null : "Kisumu")}
                  />
                </g>

                {/* Hotspot City Nodes */}
                {mapHotspots.map((hotspot) => {
                  if (hotspot.count === 0) return null;
                  const isFiltered = selectedRegion === hotspot.name;

                  return (
                    <g
                      key={hotspot.name}
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRegion(isFiltered ? null : hotspot.name);
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                        if (svgRect) {
                          setHoveredHotspot({
                            name: hotspot.name,
                            x: rect.left - svgRect.left,
                            y: rect.top - svgRect.top,
                            count: hotspot.count,
                            issues: hotspot.issues,
                          });
                        }
                      }}
                      onMouseLeave={() => setHoveredHotspot(null)}
                    >
                      {/* Pulsing ring animation */}
                      <circle
                        cx={hotspot.x}
                        cy={hotspot.y}
                        r={8}
                        fill={hotspot.statusColor}
                        opacity={0.35}
                        className={hotspot.issues > 0 ? "pulsing-dot-glow-fast" : "pulsing-dot-glow"}
                      />
                      {/* Solid inner center dot */}
                      <circle
                        cx={hotspot.x}
                        cy={hotspot.y}
                        r={4}
                        fill={hotspot.statusColor}
                        className="pulsing-dot-core"
                        stroke="#ffffff"
                        strokeWidth={1}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Floating glass tooltip */}
              {hoveredHotspot && (
                <div
                  className="absolute z-20 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 p-3.5 text-xs text-foreground dark:text-white shadow-xl backdrop-blur-md pointer-events-none transition-all duration-200"
                  style={{
                    left: `${hoveredHotspot.x + 15}px`,
                    top: `${hoveredHotspot.y - 45}px`,
                  }}
                >
                  <p className="font-black uppercase tracking-wider text-primary dark:text-primary-foreground">{hoveredHotspot.name} Region</p>
                  <p className="mt-1.5 font-bold">Active Nodes: <span className="font-extrabold text-foreground dark:text-white">{hoveredHotspot.count}</span></p>
                  <p className="mt-0.5 font-bold">Issues/Alarms: <span className="font-extrabold text-rose-500">{hoveredHotspot.issues}</span></p>
                  <p className="mt-2 text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Click node to lock filter</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Revision Log Stream (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-6 flex flex-col justify-between"
        >
          <div className="flex flex-col h-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                  <Clock size={16} className="text-primary" />
                  Recent Updates
                </h3>
                <p className="mt-1 text-[10px] font-bold text-muted-foreground">Audit and sync history stream</p>
              </div>
              <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/10 text-[9px] font-black uppercase tracking-wider px-2 py-0.5">Audit Log</Badge>
            </div>
            
            {/* Timeline Stream */}
            <div className="relative pl-4 space-y-5 border-l border-slate-200/80 dark:border-slate-800/80 max-h-[220px] overflow-y-auto custom-scrollbar flex-1 pr-1">
              {revisions?.slice(0, 5).map((rev, idx) => (
                <div key={rev.no || idx} className="relative group/item">
                  <span className="absolute -left-[20px] top-1.5 h-2 w-2 rounded-full border border-white dark:border-slate-900 bg-primary shadow-sm shadow-primary/30 transition-transform group-hover/item:scale-125" />
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">
                      {rev.scope}
                    </span>
                    <span className="text-[9px] font-black text-muted-foreground/60">{rev.revisionDate}</span>
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-foreground transition-colors group-hover/item:text-primary">
                    {rev.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wide text-muted-foreground/70 dark:text-slate-400">
                    <FileText size={10} />
                    {rev.revisionCategory}
                  </div>
                </div>
              ))}
              {(!revisions || revisions.length === 0) && !revisionsLoading && (
                <p className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-center text-xs font-semibold text-muted-foreground">
                  No recent updates logged.
                </p>
              )}
            </div>

            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 dark:border-primary/35 bg-primary/5 dark:bg-primary/10 px-3 py-2.5 text-xs font-black text-primary dark:text-primary-foreground transition-all duration-200 hover:bg-primary/10 active:scale-[0.98]">
              View Full Revision Log
              <ArrowUpRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Row 4: Recharts Analytics details */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {/* Regional Density Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                  <MapPin size={16} className="text-accent" />
                  Regional Density
                </h3>
                <p className="mt-1 text-[10px] font-bold text-muted-foreground">Regional node concentrations</p>
              </div>
              <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5">Regions</Badge>
            </div>

            {stats.topRegions.length > 0 ? (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "currentColor", fontSize: 10, fontWeight: 700 }}
                      width={80}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(99, 102, 241, 0.04)", radius: 6 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const isFiltered = selectedRegion === data.name;
                          return (
                            <div className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-foreground dark:text-white shadow-lg backdrop-blur-md">
                              <p className="font-black uppercase tracking-wider">{data.name}</p>
                              <p className="mt-1 font-bold text-slate-500 dark:text-slate-350">{data.value} active nodes</p>
                              <p className="mt-1.5 text-[9px] text-primary font-bold uppercase tracking-wider">{isFiltered ? "Click to clear filter" : "Click to select region"}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                      {regionChartData.map((entry, index) => {
                        const isFiltered = selectedRegion?.toLowerCase().includes(entry.name.toLowerCase());
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={isFiltered ? "url(#barActiveGrad)" : "url(#barDefaultGrad)"}
                            onClick={() => {
                              setSelectedRegion(isFiltered ? null : entry.name);
                            }}
                            className="cursor-pointer hover:opacity-85 transition-opacity"
                          />
                        );
                      })}
                    </Bar>
                    <defs>
                      <linearGradient id="barDefaultGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.85} />
                      </linearGradient>
                      <linearGradient id="barActiveGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-center text-xs font-semibold text-muted-foreground">
                Region distribution will appear once site data is available.
              </p>
            )}
          </div>
        </motion.div>

        {/* Load Distribution Donut Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="premium-card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                  <Zap size={16} className="text-warning" />
                  Load Distribution
                </h3>
                <p className="mt-1 text-[10px] font-bold text-muted-foreground">Power grid configurations</p>
              </div>
              <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5">Power</Badge>
            </div>

            {stats.topPower.length > 0 ? (
              <div className="h-[260px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={powerChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {powerChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getPowerColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-foreground dark:text-white shadow-lg backdrop-blur-md">
                              <p className="font-black uppercase tracking-wider">{data.name}</p>
                              <p className="mt-1 font-bold text-slate-500 dark:text-slate-350">{data.value} active nodes</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Absolute Center Status Indicator */}
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Active Nodes</span>
                  <span className="text-xl font-black text-foreground dark:text-white mt-0.5">{filteredSitesData.length}</span>
                </div>
              </div>
            ) : (
              <p className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 text-center text-xs font-semibold text-muted-foreground">
                Power distribution will appear once records sync.
              </p>
            )}
          </div>
        </motion.div>

        {/* SLA & Performance Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-6 flex flex-col justify-between"
        >
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-foreground">
                  <TrendingUp size={16} className="text-success" />
                  SLA & Sync Performance
                </h3>
                <p className="mt-1 text-[10px] font-bold text-muted-foreground">Sync timeline ping success rates</p>
              </div>
              <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5">SLA Uptime</Badge>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="slaAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis
                    domain={[97.5, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "currentColor", fontSize: 9, fontWeight: 650 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-foreground dark:text-white shadow-lg backdrop-blur-md">
                            <p className="font-black uppercase tracking-wider">{data.day}</p>
                            <p className="mt-1 font-bold text-emerald-600 dark:text-emerald-400">SLA: {data.SLA}%</p>
                            <p className="mt-0.5 font-semibold text-slate-500 dark:text-slate-400">Sync: {data.SyncVolume} pings</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="SLA"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#slaAreaGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardView;
