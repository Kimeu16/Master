import { useMemo } from "react";
import { useSites, useRevisionSummary } from "@/hooks/useSites";
import StatsCard from "./StatsCard";
import SitesTable from "./SitesTable";
import { Radio, Users, AlertTriangle, CheckCircle, Zap, MapPin, Activity, Clock, FileText } from "lucide-react";
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
 
    // Region distribution
    const regionCounts: Record<string, number> = {};
    sitesData.forEach((s) => {
      if (s.region) regionCounts[s.region] = (regionCounts[s.region] || 0) + 1;
    });
    const topRegions = Object.entries(regionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
 
    // Power source distribution
    const powerCounts: Record<string, number> = {};
    sitesData.forEach((s) => {
      if (s.powerSource) powerCounts[s.powerSource] = (powerCounts[s.powerSource] || 0) + 1;
    });
    const topPower = Object.entries(powerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
 
    return { working, issues, regions, integrated, topRegions, topPower };
  }, [sitesData]);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-extrabold tracking-tight text-foreground">
            System Overview
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Real-time status monitoring for <span className="text-primary font-bold">{sitesData.length}</span> active sites across East Africa.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(sitesLoading || revisionsLoading) && (
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full animate-pulse">
              <div className="w-2.5 h-2.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-[10px] font-bold">Syncing Sheets...</span>
            </div>
          )}
          <div className="flex -space-x-3 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex h-10 w-10 rounded-xl ring-4 ring-background bg-secondary items-center justify-center overflow-hidden border border-border">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="avatar" />
              </div>
            ))}
            <div className="flex h-10 w-10 rounded-xl ring-4 ring-background bg-primary items-center justify-center text-[10px] font-bold text-white border border-primary">
              +12
            </div>
          </div>
          <Badge variant="outline" className="bg-success/5 text-success border-success/20 px-3 py-1 font-bold">
            <Activity size={12} className="mr-1.5" /> Live
          </Badge>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          trend={`${((stats.working / (sitesData.length || 1)) * 100).toFixed(1)}% availability`}
        />
        <StatsCard
          title="Open Issues"
          value={stats.issues}
          icon={AlertTriangle}
          variant="warning"
          trendValue={-2.4}
          trend="Immediate action required"
        />
        <StatsCard
          title="Team Integration"
          value={stats.integrated}
          icon={Users}
          variant="info"
          trendValue={18}
          trend="REON sync active"
        />
      </div>

      {/* System Update Log & Info Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Regions */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="premium-card p-6"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <MapPin size={20} />
              </div>
              Regional Density
            </h3>
            <Badge variant="secondary" className="font-bold">By Site Count</Badge>
          </div>
          <div className="space-y-5">
            {stats.topRegions.slice(0, 6).map(([region, count], idx) => (
              <div key={region} className="group cursor-default">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-foreground/80 group-hover:text-primary transition-colors">{region}</span>
                  <span className="text-xs font-extrabold text-muted-foreground">{count} sites</span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.topRegions[0][1]) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary/80 to-accent rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Infrastructure Log */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="premium-card p-6"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Zap size={20} />
              </div>
              Load Distribution
            </h3>
            <Badge variant="secondary" className="font-bold">Power Matrix</Badge>
          </div>
          <div className="space-y-5">
            {stats.topPower.map(([source, count], idx) => (
              <div key={source} className="group cursor-default">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-foreground/80 group-hover:text-warning transition-colors">{source}</span>
                  <span className="text-xs font-extrabold text-muted-foreground">{count} nodes</span>
                </div>
                <div className="w-full bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / stats.topPower[0][1]) * 100}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-warning to-orange-500 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Updates Log (from Summary sheet) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="premium-card p-6 bg-secondary/5 border-primary/20"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Clock size={20} />
              </div>
              Recent System Updates
            </h3>
            <Badge className="bg-primary/10 text-primary border-primary/20 pointer-events-none font-extrabold text-[10px]">REVISION HISTORY</Badge>
          </div>
          <div className="space-y-4">
            {revisions?.slice(0, 5).map((rev, idx) => (
              <motion.div 
                key={rev.no || idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + (idx * 0.05) }}
                className="p-3 rounded-lg bg-white border border-border/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">{rev.scope}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">{rev.revisionDate}</span>
                </div>
                <p className="text-xs font-semibold text-foreground leading-snug group-hover:text-primary transition-colors">{rev.description}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <FileText size={10} className="text-muted-foreground" />
                  <span className="text-[9px] font-bold text-muted-foreground italic">{rev.revisionCategory}</span>
                </div>
              </motion.div>
            ))}
            {revisions?.length === 0 && !revisionsLoading && (
              <div className="py-12 text-center">
                <p className="text-sm text-muted-foreground italic font-medium">No recent updates logged.</p>
              </div>
            )}
          </div>
          <button className="w-full mt-4 py-2 text-[11px] font-extrabold text-primary hover:bg-primary/5 rounded-md transition-colors border border-primary/10 border-dashed">
            VIEW ALL REVISIONS
          </button>
        </motion.div>
      </div>

      {/* Sites Table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="premium-card p-0 overflow-hidden shadow-xl"
      >
        <div className="p-6 border-b border-border/50 bg-secondary/10 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg">Site Inventory</h3>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Detailed asset tracking and status</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs font-bold px-4 py-2 rounded-lg bg-white border border-border shadow-sm hover:shadow-md transition-all">Export Report</button>
            <button className="text-xs font-bold px-4 py-2 rounded-lg bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all">Add New Site</button>
          </div>
        </div>
        <SitesTable />
      </motion.div>
    </div>
  );
};

export default DashboardView;


