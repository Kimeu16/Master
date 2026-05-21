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

/* ── level colour config ─────────────────────────────────────────────── */
const LEVEL_CONFIG = [
  {
    key: "level1",
    label: "L1 Support",
    sublabel: "First Triage",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/10",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
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
    badge: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
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
    badge: "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    icon: Zap,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
  },
];

/* ── EscalationFlowCard ─────────────────────────────────────────────── */
function EscalationFlowCard({ entry }: { entry: any }) {
  const isAlarm = entry.alarm !== "N/A";
  const isAuto = entry.method === "Auto";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/20 hover:shadow-[0_20px_40px_rgba(79,70,229,0.06)] dark:border-slate-800/60 dark:bg-slate-900/60"
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
                  ? "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
                  : "border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              }`}
            >
              {isAlarm ? <BellRing size={10} className="animate-bounce" /> : <Radio size={10} />}
              {isAlarm ? "Alarm State" : "Standard Event"}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                isAuto
                  ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              }`}
            >
              {isAuto ? <Zap size={10} className="animate-pulse" /> : <Clock size={10} />}
              {entry.method || "Manual"}
            </span>
          </div>
          <h4 className="text-sm font-extrabold text-slate-800 leading-snug tracking-tight dark:text-slate-200">
            {isAlarm ? entry.alarm : entry.event}
          </h4>
          {entry.issueType && (
            <p className="mt-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
              {entry.issueType}
            </p>
          )}
        </div>
        <span className="shrink-0 font-mono text-[9px] font-bold text-slate-300 dark:text-slate-700">#{entry.no}</span>
      </div>

      {/* Escalation Flowchart Routing */}
      <div className="mb-5 rounded-2xl border border-slate-100/50 bg-slate-50/30 p-3.5 dark:border-slate-800/40 dark:bg-slate-950/20">
        <div className="flex items-center justify-between gap-1">
          {LEVEL_CONFIG.map((lv, idx) => {
            const val = entry[lv.key];
            const Icon = lv.icon;
            return (
              <div key={lv.key} className="flex flex-1 items-center">
                <div className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl ${lv.iconBg} ring-4 ring-white/60 transition-transform group-hover:scale-105 dark:ring-slate-900`}
                  >
                    <Icon size={14} className={lv.iconColor} />
                  </div>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${lv.badge}`}>
                    {lv.label}
                  </span>
                  <span className="max-w-[72px] truncate text-center text-[10px] font-extrabold text-slate-700 dark:text-slate-300">
                    {val || "—"}
                  </span>
                </div>
                {idx < LEVEL_CONFIG.length - 1 && (
                  <div className="flex flex-col items-center justify-center px-1">
                    <ArrowRight size={12} className="text-slate-300 dark:text-slate-700 animate-pulse-slow" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-slate-100/50 pt-3 dark:border-slate-800/50">
        {entry.notificationTime && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <Timer size={12} className="text-indigo-500" />
            Notify: {entry.notificationTime}
          </span>
        )}
        {entry.designator && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <ShieldCheck size={12} className="text-emerald-500" />
            {entry.designator}
          </span>
        )}
        {entry.scopeDesignee && (
          <span className="ml-auto text-[10px] font-extrabold text-slate-400 dark:text-slate-600 uppercase tracking-wider">
            {entry.scopeDesignee}
          </span>
        )}
      </div>
    </motion.div>
  );
}

/* ── WorkflowStep ────────────────────────────────────────────────────── */
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
          <div className="my-1.5 h-12 w-0.5 bg-gradient-to-b from-indigo-500/20 to-transparent dark:from-slate-800" />
        )}
      </div>
      <div className="pb-4 pt-0.5">
        <p className="text-sm font-extrabold text-slate-800 tracking-tight dark:text-slate-200">{label}</p>
        <p className="mt-0.5 text-xs font-semibold leading-relaxed text-slate-400 dark:text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

/* ── main component ─────────────────────────────────────────────────── */
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
      bg: "bg-indigo-500/10",
      text: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Critical Alarms",
      value: alarmCount,
      icon: BellRing,
      gradient: "from-red-500 via-rose-500 to-pink-500",
      bg: "bg-red-500/10",
      text: "text-red-600 dark:text-red-400",
    },
    {
      label: "Auto Triggers",
      value: autoCount,
      icon: Zap,
      gradient: "from-cyan-400 via-blue-500 to-indigo-600",
      bg: "bg-cyan-500/10",
      text: "text-cyan-600 dark:text-cyan-400",
    },
    {
      label: "Manual Controls",
      value: manualCount,
      icon: Clock,
      gradient: "from-amber-400 via-orange-500 to-rose-500",
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
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
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Escalation Routing</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Trouble-ticket escalation workflows, notification priority chains, and response SLA templates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isLoading && (
            <Badge variant="outline" className="gap-1.5 border-indigo-200 bg-indigo-50/80 text-indigo-600 dark:border-indigo-800/30 dark:bg-indigo-900/30 dark:text-indigo-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              Active Sync
            </Badge>
          )}
          {isError && (
            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/30 dark:bg-rose-900/30 dark:text-rose-400">
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
              className="group relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] dark:border-slate-800/60 dark:bg-slate-900/60"
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.gradient}`} />
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
                <div className={`rounded-xl ${item.bg} p-2 ${item.text}`}>
                  <Icon size={16} className="transition-transform group-hover:scale-110" />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">{item.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Alarm Routing Matrix Flowchart Section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/40 bg-white/40 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/40"
      >
        <div className="flex flex-col gap-3 border-b border-slate-100/50 bg-gradient-to-r from-slate-50/50 to-white/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/50 dark:from-slate-900/30 dark:to-slate-900/10">
          <div>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-800 dark:text-slate-200">
              <BellRing size={16} className="text-indigo-500" />
              Event Response & Routing Logic
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">Step-by-step notification flowcharts mapping triggers to personnel.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <Sparkles size={11} className="animate-pulse" />
            {escalationData.length} paths active
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 p-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Analyzing routing logic pathways...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
            {escalationData.map((entry, i) => (
              <EscalationFlowCard key={`${entry.no}-${i}`} entry={entry} />
            ))}
            {escalationData.length === 0 && (
              <div className="col-span-full py-16 text-center text-sm font-semibold text-slate-400">
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
          className="rounded-3xl border border-white/40 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/40"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-500/10 p-2.5">
              <GitBranch size={18} className="text-indigo-500" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight dark:text-slate-200">Work Order Approval Flow</h3>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sequential tier authority clearances.</p>
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
          className="rounded-3xl border border-white/40 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/40"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-500/10 p-2.5">
              <Timer size={18} className="text-cyan-500" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight dark:text-slate-200">Notification Timing SLA</h3>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Critical alarm window limits.</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Automatic Priority Alarm Trigger", time: "≤ 5 mins", bar: 95, color: "bg-gradient-to-r from-emerald-400 to-teal-500", badge: "bg-emerald-500/10 text-emerald-700 border-emerald-500/10 dark:text-emerald-300" },
              { label: "Manual Event Triage & Log", time: "≤ 2 hrs", bar: 65, color: "bg-gradient-to-r from-blue-400 to-indigo-500", badge: "bg-blue-500/10 text-blue-700 border-blue-500/10 dark:text-blue-300" },
              { label: "Level 2 Coordinator Dispatch", time: "2 – 4 hrs", bar: 45, color: "bg-gradient-to-r from-amber-400 to-orange-500", badge: "bg-amber-500/10 text-amber-700 border-amber-500/10 dark:text-amber-300" },
              { label: "Level 3 NOC Director Override", time: "4 – 8 hrs", bar: 25, color: "bg-gradient-to-r from-rose-400 to-red-500", badge: "bg-rose-500/10 text-rose-700 border-rose-500/10 dark:text-rose-300" },
            ].map((row) => (
              <div key={row.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{row.label}</span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${row.badge}`}>{row.time}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
                  <div
                    className={`h-full rounded-full ${row.color} transition-all duration-700`}
                    style={{ width: `${row.bar}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-[11px] font-semibold leading-relaxed text-amber-800 dark:text-amber-300">
              SLA breaches triggers an auto-escalation alert immediately pushing to Level 3 NOC override and logs operational warning tickets.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default EscalationView;
