import { useMemo } from "react";
import { useSites, useRevisionSummary } from "@/hooks/useSites";
import StatsCard from "./StatsCard";
import {
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
import { motion } from "framer-motion";

const DashboardView = () => {
  const { data: remoteSitesData, isLoading: sitesLoading } = useSites();
  const { data: revisions, isLoading: revisionsLoading } = useRevisionSummary();

  const sitesData = useMemo(() => remoteSitesData || [], [remoteSitesData]);

  const stats = useMemo(() => {
    const working = sitesData.filter((s) => {
      const c = (s.comments || "").toLowerCase();
      return c.includes("working") && !c.includes("not working");
    }).length;
    const issues = sitesData.filter((s) => {
      const c = (s.comments || "").toLowerCase();
      return c.includes("not working") || c.includes("faulty");
    }).length;
    const regions = new Set(sitesData.map((s) => s.region).filter(Boolean)).size;
    const integrated = sitesData.filter((s) => s.reonIntegration === "Integrated").length;

    const regionCounts: Record<string, number> = {};
    sitesData.forEach((s) => {
      if (s.region) regionCounts[s.region] = (regionCounts[s.region] || 0) + 1;
    });
    const topRegions = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const powerCounts: Record<string, number> = {};
    sitesData.forEach((s) => {
      if (s.powerSource) powerCounts[s.powerSource] = (powerCounts[s.powerSource] || 0) + 1;
    });
    const topPower = Object.entries(powerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const atRiskSites = sitesData
      .filter((s) => {
        const c = (s.comments || "").toLowerCase();
        return c.includes("not working") || c.includes("faulty") || s.priority?.replace(".0", "") === "1";
      })
      .slice(0, 6);

    return { working, issues, regions, integrated, topRegions, topPower, atRiskSites };
  }, [sitesData]);

  const maxRegionCount = stats.topRegions[0]?.[1] || 1;
  const maxPowerCount = stats.topPower[0]?.[1] || 1;
  const availability = ((stats.working / (sitesData.length || 1)) * 100).toFixed(1);

  return (
    <div className="space-y-6 pb-10">
      {/* Immersive Executive mesh-gradient banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white shadow-xl shadow-indigo-950/10">
        {/* Subtle glowing ambient spots */}
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
                <p className="max-w-xl text-xs font-semibold text-slate-300 leading-relaxed">
                  Supervise {sitesData.length} active cellular nodes, evaluate structural connectivity risks, and synchronize operations across {stats.regions} regions in East Africa.
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
          value={sitesData.length}
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

      {/* Core Insights grid with timeline and progress tracks */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Regional Density */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="premium-card p-6 flex flex-col justify-between">
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
            <div className="space-y-4">
              {stats.topRegions.length > 0 ? (
                stats.topRegions.slice(0, 6).map(([region, count], idx) => (
                  <div key={region}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                      <span className="truncate font-semibold text-foreground">{region}</span>
                      <span className="font-bold text-muted-foreground">{count} nodes</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxRegionCount) * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-accent to-teal-500"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center text-xs font-semibold text-muted-foreground">
                  Region distribution will appear once site data is available.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Load Distribution */}
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
            <div className="space-y-4">
              {stats.topPower.length > 0 ? (
                stats.topPower.map(([source, count], idx) => (
                  <div key={source}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                      <span className="truncate font-semibold text-foreground">{source}</span>
                      <span className="font-bold text-muted-foreground">{count} nodes</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / maxPowerCount) * 100}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: idx * 0.05 }}
                        className="h-full rounded-full bg-gradient-to-r from-warning to-amber-500"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center text-xs font-semibold text-muted-foreground">
                  Power distribution will appear once records sync.
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Revision Log Stream */}
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
            <div className="relative pl-4 space-y-5 border-l border-slate-200/80 max-h-[380px] overflow-y-auto custom-scrollbar flex-1 pr-1">
              {revisions?.slice(0, 5).map((rev, idx) => (
                <div key={rev.no || idx} className="relative group/item">
                  {/* Timeline bullet node */}
                  <span className="absolute -left-[20px] top-1.5 h-2 w-2 rounded-full border border-white bg-primary shadow-sm shadow-primary/30 transition-transform group-hover/item:scale-125" />
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-primary">
                      {rev.scope}
                    </span>
                    <span className="text-[9px] font-black text-muted-foreground/60">{rev.revisionDate}</span>
                  </div>
                  <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-foreground transition-colors group-hover/item:text-primary">
                    {rev.description}
                  </p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wide text-muted-foreground/70">
                    <FileText size={10} />
                    {rev.revisionCategory}
                  </div>
                </div>
              ))}
              {revisions?.length === 0 && !revisionsLoading && (
                <p className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-center text-xs font-semibold text-muted-foreground">
                  No recent updates logged.
                </p>
              )}
            </div>

            <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs font-black text-primary transition-all duration-200 hover:bg-primary/10 active:scale-[0.98]">
              View Full Revision Log
              <ArrowUpRight size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardView;
