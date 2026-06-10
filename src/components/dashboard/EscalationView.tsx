import { useEscalations } from "@/hooks/useSites";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  BellRing,
  Clock,
  GitBranch,
  ShieldCheck,
  Workflow,
  Zap,
  ChevronRight,
  Radio,
  Timer,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

/* â”€â”€ level colour config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const LEVEL_CONFIG = [
  {
    key: "level1",
    label: "L1 Support",
    sublabel: "First Triage",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/10",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
    icon: Radio,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
  },
  {
    key: "level2",
    label: "L2 Support",
    sublabel: "NOC Escalation",
    dot: "bg-blue-500",
    ring: "ring-blue-500/10",
    badge: "border-blue-500/20 bg-blue-500/10 text-blue-700",
    icon: ShieldCheck,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-500/10",
  },
  {
    key: "level3",
    label: "L3 Authority",
    sublabel: "Director",
    dot: "bg-violet-500",
    ring: "ring-violet-500/10",
    badge: "border-violet-500/20 bg-violet-500/10 text-violet-700",
    icon: Zap,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
];

/* â”€â”€ EscalationFlowCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function EscalationFlowCard({ entry }: { entry: any }) {
  const isAlarm = entry.alarm !== "N/A";
  const isAuto = entry.method === "Auto";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
    >
      {/* Top Accent Strip */}
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
          isAlarm ? "from-red-500 via-rose-500 to-pink-500" : "from-blue-500 via-cyan-500 to-teal-500"
        }`}
      />

      {/* Header Info */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                isAlarm
                  ? "border-red-500/20 bg-red-500/10 text-red-650"
                  : "border-primary/20 bg-primary/10 text-primary"
              }`}
            >
              {isAlarm ? <BellRing size={10} className="animate-bounce" /> : <Radio size={10} />}
              {isAlarm ? "Alarm State" : "Standard Event"}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                isAuto
                  ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-750"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-750"
              }`}
            >
              {isAuto ? <Zap size={10} className="animate-pulse" /> : <Clock size={10} />}
              {entry.method || "Manual"}
            </span>
          </div>
          <h4 className="text-sm font-extrabold text-foreground leading-snug tracking-tight">
            {isAlarm ? entry.alarm : entry.event}
          </h4>
          {entry.issueType && (
            <p className="mt-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              {entry.issueType}
            </p>
          )}
        </div>
        <span className="shrink-0 font-mono text-[9px] font-bold text-muted-foreground">#{entry.no}</span>
      </div>

      {/* Escalation Flowchart Routing */}
      <div className="mb-5 rounded-2xl border border-secondary/15 bg-card/30 p-3.5">
        <div className="flex items-center justify-between gap-1">
          {LEVEL_CONFIG.map((lv, idx) => {
            const val = entry[lv.key];
            const Icon = lv.icon;
            return (
              <div key={lv.key} className="flex flex-1 items-center">
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${lv.iconBg} ring-4 ring-card transition-transform group-hover:scale-105`}
                  >
                    <Icon size={14} className={lv.iconColor} />
                  </div>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${lv.badge}`}>
                    {lv.label}
                  </span>
                  <span className="max-w-[72px] truncate text-center text-[10px] font-extrabold text-foreground">
                    {val || "â€”"}
                  </span>
                </div>
                {idx < LEVEL_CONFIG.length - 1 && (
                  <div className="flex flex-col items-center justify-center px-1">
                    <ArrowRight size={12} className="text-muted-foreground animate-pulse-slow" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-secondary/15 pt-3">
        {entry.notificationTime && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
            <Timer size={12} className="text-primary" />
            Notify: {entry.notificationTime}
          </span>
        )}
        {entry.designator && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
            <ShieldCheck size={12} className="text-emerald-500" />
            {entry.designator}
          </span>
        )}
        {entry.scopeDesignee && (
          <span className="ml-auto text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
            {entry.scopeDesignee}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* â”€â”€ WorkflowStep â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function WorkflowStep({
  step,
  label,
  sub,
  isLast,
  color,
}: {
  step: number;
  label: string;
  sub: string;
  isLast: boolean;
  color: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-2xl ${color} text-sm font-black text-white shadow-md`}
        >
          {step}
        </div>
        {!isLast && (
          <div className="my-1.5 h-12 w-0.5 bg-gradient-to-b from-primary/20 to-transparent" />
        )}
      </div>
      <div className="pb-4 pt-0.5">
        <p className="text-sm font-extrabold text-foreground tracking-tight">{label}</p>
        <p className="mt-0.5 text-xs font-semibold leading-relaxed text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

/* â”€â”€ main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const EscalationView = () => {
  const { data: remoteEscalationData, isLoading, isError } = useEscalations();

  const escalationData = remoteEscalationData || [];
  const alarmCount = escalationData.filter((e) => e.alarm !== "N/A").length;
  const autoCount = escalationData.filter((e) => e.method === "Auto").length;
  const manualCount = escalationData.length - autoCount;

  const statItems = [
    {
      label: "Escalation Routes",
      value: escalationData.length,
      icon: Workflow,
      gradient: "from-indigo-500 via-purple-500 to-pink-500",
      bg: "bg-primary/10",
      text: "text-primary",
    },
    {
      label: "Critical Alarms",
      value: alarmCount,
      icon: BellRing,
      gradient: "from-red-500 via-rose-500 to-pink-500",
      bg: "bg-rose-500/10",
      text: "text-rose-600",
    },
    {
      label: "Auto Triggers",
      value: autoCount,
      icon: Zap,
      gradient: "from-cyan-400 via-blue-500 to-indigo-600",
      bg: "bg-cyan-500/10",
      text: "text-cyan-600",
    },
    {
      label: "Manual Controls",
      value: manualCount,
      icon: Clock,
      gradient: "from-amber-400 via-orange-500 to-rose-500",
      bg: "bg-amber-500/10",
      text: "text-amber-600",
    },
  ];

  const approvalChain = [
    { label: "NOC Operations Control Center", sub: "Stage 1: Live diagnostic ticket logging, alarm prioritization, & tech lookup." },
    { label: "Asset Security Coordinator", sub: "Stage 2: Regional support deployment, security provider alerts, & supervisor review." },
    { label: "Executive Site Operations Team", sub: "Stage 3: High-priority clearance approvals, critical resource spending, & NOC override." },
  ];

  const stepColors = [
    "bg-gradient-to-br from-emerald-400 to-teal-600",
    "bg-gradient-to-br from-indigo-500 to-purple-600",
    "bg-gradient-to-br from-rose-500 to-pink-600",
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Escalation Routing</h2>
          <p className="mt-1 text-sm font-semibold text-muted-foreground">
            Trouble-ticket escalation workflows, notification priority chains, and response SLA templates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isLoading && (
            <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/10 text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Active Sync
            </Badge>
          )}
          {isError && (
            <Badge variant="outline" className="border-destructive/20 bg-destructive/10 text-destructive">
              Local Mode
            </Badge>
          )}
        </div>
      </div>

      {/* Overview Counts */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card group relative overflow-hidden p-5 transition-all duration-300 hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)]"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.gradient}`} />
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
                <div className={`rounded-xl ${item.bg} p-2 ${item.text}`}>
                  <Icon size={16} className="transition-transform group-hover:scale-110" />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight text-foreground">{item.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Alarm Routing Matrix Flowchart Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-section"
      >
        <div className="flex flex-col gap-3 border-b border-secondary/15 bg-card/30 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-foreground">
              <BellRing size={16} className="text-primary" />
              Event Response & Routing Logic
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-muted-foreground">Step-by-step notification flowcharts mapping triggers to personnel.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles size={11} className="animate-pulse" />
            {escalationData.length} paths active
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 p-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-xs font-bold text-primary">Analyzing routing logic pathways...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
            {escalationData.map((entry, i) => (
              <EscalationFlowCard key={`${entry.no}-${i}`} entry={entry} />
            ))}
            {escalationData.length === 0 && (
              <div className="col-span-full py-16 text-center text-sm font-semibold text-muted-foreground">
                No active routing templates logged.
              </div>
            )}
          </div>
        )}
      </motion.section>

      {/* Side-by-side Flow layouts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Approval Chain Workflow */}
        <motion.section
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-section p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2.5">
              <GitBranch size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground tracking-tight">Work Order Approval Flow</h3>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Sequential tier authority clearances.</p>
            </div>
          </div>
          <div className="pl-2">
            {approvalChain.map((step, i) => (
              <WorkflowStep
                key={step.label}
                step={i + 1}
                label={step.label}
                sub={step.sub}
                isLast={i === approvalChain.length - 1}
                color={stepColors[i]}
              />
            ))}
          </div>
        </motion.section>

        {/* SLA Timings Progress */}
        <motion.section
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-section p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-2.5">
              <Timer size={18} className="text-cyan-500" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground tracking-tight">Notification Timing SLA</h3>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Critical alarm window limits.</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Automatic Priority Alarm Trigger", time: "â‰¤ 5 mins", bar: 95, color: "bg-gradient-to-r from-emerald-450 to-teal-500", badge: "bg-emerald-500/10 text-emerald-700 border-emerald-500/10" },
              { label: "Manual Event Triage & Log", time: "â‰¤ 2 hrs", bar: 65, color: "bg-gradient-to-r from-blue-400 to-primary", badge: "bg-primary/10 text-primary border-primary/10" },
              { label: "Level 2 Coordinator Dispatch", time: "2 â€“ 4 hrs", bar: 45, color: "bg-gradient-to-r from-amber-400 to-orange-500", badge: "bg-amber-500/10 text-amber-700 border-amber-500/10" },
              { label: "Level 3 NOC Director Override", time: "4 â€“ 8 hrs", bar: 25, color: "bg-gradient-to-r from-rose-400 to-red-500", badge: "bg-rose-500/10 text-rose-700 border-rose-500/10" },
            ].map((row) => (
              <div key={row.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{row.label}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${row.badge}`}>{row.time}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary/10">
                  <div
                    className={`h-full rounded-full ${row.color} transition-all duration-700`}
                    style={{ width: `${row.bar}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-[11px] font-semibold leading-relaxed text-amber-800">
              SLA breaches triggers an auto-escalation alert immediately pushing to Level 3 NOC override and logs operational warning tickets.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default EscalationView;
