import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useSites } from "@/hooks/useSites";
import {
  AlertTriangle,
  Building2,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Fingerprint,
  Radio,
  Eye,
  Bell,
  Sparkles,
  LockOpen,
} from "lucide-react";
import { motion } from "framer-motion";

/* ── vendor colour map ──────────────────────────────────────────────── */
const VENDOR_GRADIENTS = [
  "from-indigo-500 via-purple-500 to-pink-500",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-amber-400 via-orange-500 to-rose-500",
  "from-rose-500 via-pink-500 to-purple-600",
  "from-sky-400 via-blue-500 to-indigo-600",
];

function getVendorGradient(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return VENDOR_GRADIENTS[Math.abs(h) % VENDOR_GRADIENTS.length];
}

function getVendorInitial(name: string) {
  return name.replace(/[^a-zA-Z]/g, "")[0]?.toUpperCase() ?? "S";
}

/* ── SecurityVendorCard ─────────────────────────────────────────────── */
function SecurityVendorCard({
  company,
  maxSites,
}: {
  company: { name: string; sites: number; coverage: string };
  maxSites: number;
}) {
  const gradient = getVendorGradient(company.name);
  const initial = getVendorInitial(company.name);
  const pct = Math.min(100, Math.max(8, (company.sites / Math.max(1, maxSites)) * 100));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/20 hover:shadow-[0_20px_40px_rgba(79,70,229,0.06)] dark:border-slate-800/60 dark:bg-slate-900/60"
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
      
      <div className="mb-4 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-base font-black text-white shadow-md ring-2 ring-white/60 dark:ring-slate-850`}
        >
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-extrabold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
            {company.name}
          </h4>
          <p className="mt-0.5 truncate text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {company.coverage}
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-slate-200 bg-white/90 px-2.5 py-0.5 text-[10px] font-black text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-350">
          {company.sites} sites
        </span>
      </div>

      {/* Elegant Density gauge track */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Coverage Footprint</span>
          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400">{Math.round(pct)}% Share</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-900">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ── ProtocolStep ───────────────────────────────────────────────────── */
function ProtocolStep({ step, label, color }: { step: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100/10 p-2.5 transition-all hover:bg-indigo-50/20 dark:hover:bg-slate-800/20">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${color} text-[10px] font-black text-white shadow-md`}
      >
        {step}
      </div>
      <span className="text-[12px] font-bold text-slate-600 dark:text-slate-305">{label}</span>
    </div>
  );
}

/* ── main component ─────────────────────────────────────────────────── */
const SecurityView = () => {
  const { data: sitesData } = useSites();

  const securityCompanies = useMemo(() => {
    const counts: Record<string, { sites: number; regions: Set<string> }> = {};
    (sitesData || []).forEach((site) => {
      const name = site.securityCompany || "Unassigned";
      if (!counts[name]) counts[name] = { sites: 0, regions: new Set<string>() };
      counts[name].sites += 1;
      if (site.region) counts[name].regions.add(site.region);
    });

    const fromData = Object.entries(counts)
      .map(([name, value]) => ({
        name,
        sites: value.sites,
        coverage: Array.from(value.regions).slice(0, 3).join(", ") || "Various",
      }))
      .sort((a, b) => b.sites - a.sites)
      .slice(0, 6);

    return fromData.length > 0
      ? fromData
      : [
          { name: "Hatari Security", sites: 0, coverage: "Western & Rift Valley" },
          { name: "Serico Ltd", sites: 0, coverage: "Central & Western" },
          { name: "Unassigned Sites", sites: 0, coverage: "Various Coverage" },
        ];
  }, [sitesData]);

  const electronicLocks = (sitesData || []).filter((s) => s.electronicLockId).length;
  const assignedSecurity = (sitesData || []).filter((s) => s.securityCompany && s.securityCompany !== "N/A").length;
  const maxSites = Math.max(...securityCompanies.map((c) => c.sites), 1);

  const statItems = [
    { label: "Secured Nodes", value: assignedSecurity, icon: ShieldCheck, gradient: "from-emerald-400 via-teal-500 to-cyan-600", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    { label: "Active Digital Locks", value: electronicLocks, icon: LockKeyhole, gradient: "from-indigo-500 via-purple-500 to-pink-500", bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
    { label: "Active Guard Agencies", value: securityCompanies.length, icon: Building2, gradient: "from-blue-500 via-cyan-500 to-teal-500", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  ];

  const alertTypes = [
    { label: "High Voltage Perimeter Fence Breach", icon: Radio, color: "text-rose-600 dark:text-rose-400", bg: "border-rose-500/20 bg-rose-500/5", dot: "bg-rose-500 animate-ping" },
    { label: "Site Access Control Main Gate Alert", icon: Bell, color: "text-red-600 dark:text-red-400", bg: "border-red-500/20 bg-red-500/5", dot: "bg-red-400 animate-pulse" },
    { label: "Unauthorized Shelter Access Warning", icon: Fingerprint, color: "text-amber-600 dark:text-amber-400", bg: "border-amber-500/20 bg-amber-500/5", dot: "bg-amber-500 animate-bounce" },
    { label: "NOC Routine Guard Patrol Check-in", icon: Eye, color: "text-indigo-600 dark:text-indigo-400", bg: "border-indigo-500/20 bg-indigo-500/5", dot: "bg-indigo-500" },
  ];

  const protocolSteps = [
    { label: "Request authorization sequence via regional NOC operator", color: "bg-gradient-to-br from-emerald-400 to-teal-600" },
    { label: "Confirm field technician credentials, work order number & location", color: "bg-gradient-to-br from-blue-500 to-indigo-600" },
    { label: "Generate and dispatch one-time keyless encryption lock code", color: "bg-gradient-to-br from-violet-500 to-purple-700" },
    { label: "Log access initiation, timestamp, and locks closure statistics", color: "bg-gradient-to-br from-amber-400 to-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Security & Surveillance</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Physical site security, electronic door access governance, and intrusion monitoring.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 border-emerald-500/20 bg-emerald-500/5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-450">
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
          Active Monitor
        </Badge>
      </div>

      {/* Stat block grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      {/* Security Vendors Coverage section */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/40 bg-white/40 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/40"
      >
        <div className="flex flex-col gap-3 border-b border-slate-100/50 bg-gradient-to-r from-slate-50/50 to-white/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/50 dark:from-slate-900/30 dark:to-slate-900/10">
          <div>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-800 dark:text-slate-200">
              <Building2 size={16} className="text-indigo-500" />
              Security Provider Performance Matrix
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">Assigned vendor boundaries and density statistics per site network.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
            <Sparkles size={11} className="animate-pulse" />
            {securityCompanies.length} contractors
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
          {securityCompanies.map((company) => (
            <SecurityVendorCard key={company.name} company={company} maxSites={maxSites} />
          ))}
        </div>
      </motion.section>

      {/* Security lock governance details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Access controls protocols list */}
        <motion.section
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/40 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/40"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-500/10 p-2.5">
              <KeyRound size={18} className="text-indigo-500" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight dark:text-slate-200">Electronic Keyless Protocols</h3>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cryptographic double check validation.</p>
            </div>
          </div>
          <div className="space-y-2 pl-1">
            {protocolSteps.map((step, i) => (
              <ProtocolStep key={step.label} step={i + 1} label={step.label} color={step.color} />
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3.5">
            <LockOpen size={16} className="shrink-0 text-indigo-500 animate-pulse" />
            <p className="text-xs font-semibold leading-relaxed text-indigo-800 dark:text-indigo-300">
              {electronicLocks} active nodes are currently secured with keyless smart-lock verification registers.
            </p>
          </div>
        </motion.section>

        {/* Security breach alarms warnings */}
        <motion.section
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl border border-white/40 bg-white/40 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/40"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-rose-500/10 p-2.5">
              <ShieldCheck size={18} className="text-rose-500 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight dark:text-slate-200">Intrusion Alert Classes</h3>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Categorized critical security threat levels.</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {alertTypes.map((alert) => {
              const Icon = alert.icon;
              return (
                <div
                  key={alert.label}
                  className={`flex items-center gap-3.5 rounded-2xl border ${alert.bg} px-4 py-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] transition-transform hover:-translate-x-0.5`}
                >
                  <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${alert.dot}`} />
                  <Icon size={14} className={`shrink-0 ${alert.color}`} />
                  <span className={`text-[12px] font-extrabold tracking-tight ${alert.color}`}>{alert.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <p className="text-[11px] font-semibold leading-relaxed text-amber-800 dark:text-amber-305">
              Warning: Any alarm event that is not acknowledged inside 3 minutes automatically raises an escalation level in accordance with the SLA matrix.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default SecurityView;
