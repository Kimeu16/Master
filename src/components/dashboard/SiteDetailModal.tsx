import { useState, useEffect } from "react";
import { Site } from "@/types/site";
import { X, Radio, Edit3, Check, RotateCcw, Shield, Zap, Sun, Users, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── POWER FLOW SCHEMATIC SVG COMPONENT ──────────────────────────────── */
const PowerFlowSchematic = ({ site, mode }: { site: Site; mode: "power" | "solar" }) => {
  const src = site.powerSource?.toLowerCase() || "";
  const comments = site.comments?.toLowerCase() || "";
  const priority = site.priority?.replace(".0", "");
  const isFaulty = comments.includes("not working") || comments.includes("faulty") || priority === "1";

  const hasGrid    = src.includes("grid");
  const hasSolar   = src.includes("solar") || src.includes("pv");
  const hasGenset  = src.includes("gen");
  const hasBattery = !!site.batteryCapacity && site.batteryCapacity !== "N/A";

  /* helpers */
  const flowClass = (active: boolean) =>
    active ? "flow-line-active" : undefined;
  const warnClass = isFaulty ? "flow-line-warning" : undefined;

  /* colours */
  const gridColor   = hasGrid   ? "#6366f1" : "#94a3b8";
  const solarColor  = hasSolar  ? "#f59e0b" : "#94a3b8";
  const genColor    = hasGenset ? "#10b981" : "#94a3b8";
  const rectColor   = "#3b82f6";
  const battColor   = hasBattery ? "#8b5cf6" : "#94a3b8";
  const faultColor  = "#ef4444";

  return (
    <div className="mb-6 rounded-2xl border border-slate-100/80 bg-gradient-to-br from-slate-50/80 to-white/40 p-4 shadow-sm dark:border-slate-800/60 dark:from-slate-900/60 dark:to-slate-950/40">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {mode === "power" ? "Power Infrastructure Flow" : "DC & Solar Energy Flow"}
        </span>
        {isFaulty && (
          <div className="flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[9px] font-black text-rose-600 dark:text-rose-400">
            <AlertTriangle size={10} />
            FAULT DETECTED
          </div>
        )}
      </div>

      <svg
        viewBox="0 0 520 200"
        className="w-full max-h-[180px]"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Power flow schematic diagram"
      >
        <defs>
          <filter id="glow-indigo">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-amber">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-emerald">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* ── GRID SOURCE NODE ── */}
        {hasGrid && (
          <g>
            <rect x="8" y="30" width="68" height="48" rx="8" fill={hasGrid ? "#eef2ff" : "#f8fafc"} stroke={gridColor} strokeWidth="1.5" />
            <text x="42" y="51" textAnchor="middle" fontSize="9" fontWeight="800" fill={gridColor} fontFamily="system-ui">GRID</text>
            <text x="42" y="66" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="system-ui">MAINS</text>
            {/* lightning bolt */}
            <path d="M37 56 l4-8 l2 5 l4-8" stroke={gridColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />

            {/* connector line → rectifier */}
            <line
              x1="76" y1="54" x2="196" y2="90"
              stroke={hasGrid ? (isFaulty ? faultColor : gridColor) : "#e2e8f0"}
              strokeWidth={hasGrid ? "2" : "1"}
              strokeOpacity={hasGrid ? 1 : 0.4}
              className={hasGrid ? (isFaulty ? warnClass : flowClass(true)) : undefined}
            />
          </g>
        )}

        {/* ── SOLAR SOURCE NODE ── */}
        {hasSolar && (
          <g>
            <rect x="8" y="100" width="68" height="48" rx="8" fill="#fffbeb" stroke={solarColor} strokeWidth="1.5" />
            <text x="42" y="120" textAnchor="middle" fontSize="9" fontWeight="800" fill={solarColor} fontFamily="system-ui">SOLAR</text>
            <text x="42" y="134" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="system-ui">{site.solarCapacity || "PV"}</text>
            {/* sun rays */}
            <circle cx="42" cy="127" r="4" stroke={solarColor} strokeWidth="1.2" fill="none" />
            <line x1="42" y1="119" x2="42" y2="117" stroke={solarColor} strokeWidth="1.2" />
            <line x1="42" y1="135" x2="42" y2="137" stroke={solarColor} strokeWidth="1.2" />
            <line x1="34" y1="127" x2="32" y2="127" stroke={solarColor} strokeWidth="1.2" />
            <line x1="50" y1="127" x2="52" y2="127" stroke={solarColor} strokeWidth="1.2" />

            {/* connector → rectifier */}
            <line
              x1="76" y1="124" x2="196" y2="105"
              stroke={hasSolar ? (isFaulty ? faultColor : solarColor) : "#e2e8f0"}
              strokeWidth={hasSolar ? "2" : "1"}
              strokeOpacity={hasSolar ? 1 : 0.4}
              className={hasSolar ? (isFaulty ? warnClass : flowClass(true)) : undefined}
            />
          </g>
        )}

        {/* ── GENSET SOURCE NODE ── */}
        {hasGenset && (
          <g transform={hasSolar && hasGrid ? "translate(0,152)" : hasSolar || hasGrid ? "translate(0,152)" : "translate(0,70)"}>
            <rect x="8" y="-22" width="68" height="48" rx="8" fill="#ecfdf5" stroke={genColor} strokeWidth="1.5" />
            <text x="42" y="-2" textAnchor="middle" fontSize="9" fontWeight="800" fill={genColor} fontFamily="system-ui">GENSET</text>
            <text x="42" y="12" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="system-ui">{site.generatorType?.slice(0,8) || "DG"}</text>
            {/* engine icon */}
            <rect x="32" y="3" width="20" height="10" rx="2" stroke={genColor} strokeWidth="1.2" fill="none" />
            <line x1="42" y1="3" x2="42" y2="-1" stroke={genColor} strokeWidth="1.2" />

            {/* connector → rectifier */}
            <line
              x1="76" y1="4"
              x2="188" y2={hasSolar && hasGrid ? "-43" : hasSolar || hasGrid ? "-43" : "-66"}
              stroke={hasGenset ? (isFaulty ? faultColor : genColor) : "#e2e8f0"}
              strokeWidth={hasGenset ? "2" : "1"}
              strokeOpacity={hasGenset ? 1 : 0.4}
              className={hasGenset ? (isFaulty ? warnClass : flowClass(true)) : undefined}
            />
          </g>
        )}

        {/* ── RECTIFIER / SHELTER HUB ── */}
        <g filter="url(#glow-indigo)">
          <rect x="196" y="72" width="92" height="56" rx="10" fill="#eff6ff" stroke={rectColor} strokeWidth="2"
            className={isFaulty ? undefined : ""}
          />
          <text x="242" y="97" textAnchor="middle" fontSize="9" fontWeight="900" fill={rectColor} fontFamily="system-ui">RECTIFIER</text>
          <text x="242" y="111" textAnchor="middle" fontSize="7" fill="#64748b" fontFamily="system-ui">{site.rectifierType?.slice(0,12) || "Hub"}</text>
          <text x="242" y="122" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="system-ui">{site.rectifierCapacity ? site.rectifierCapacity + " A" : ""}</text>
        </g>

        {/* ── RECTIFIER → LOAD arrow ── */}
        <line
          x1="288" y1="100" x2="340" y2="100"
          stroke={isFaulty ? faultColor : rectColor}
          strokeWidth="2.5"
          className={isFaulty ? warnClass : flowClass(true)}
        />

        {/* ── SITE LOAD CONSUMER ── */}
        <g>
          <rect x="340" y="72" width="80" height="56" rx="10" fill="#f0fdf4" stroke="#22c55e" strokeWidth="1.5" />
          <text x="380" y="97" textAnchor="middle" fontSize="9" fontWeight="800" fill="#16a34a" fontFamily="system-ui">SITE LOAD</text>
          <text x="380" y="111" textAnchor="middle" fontSize="7" fill="#64748b" fontFamily="system-ui">{site.sanctionedLoad || "Active"}</text>
          {/* wifi icon */}
          <path d="M374 118 q6-5 12 0" stroke="#16a34a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M371 115 q9-8 18 0" stroke="#16a34a" strokeWidth="1" fill="none" strokeOpacity="0.5" strokeLinecap="round" />
          <circle cx="380" cy="121" r="1.5" fill="#16a34a" />
        </g>

        {/* ── BATTERY BANK (bottom of rectifier) ── */}
        {hasBattery && (
          <g>
            <line
              x1="242" y1="128" x2="242" y2="155"
              stroke={isFaulty ? faultColor : battColor}
              strokeWidth="2"
              className={isFaulty ? warnClass : flowClass(true)}
            />
            <rect x="196" y="155" width="92" height="40" rx="8" fill="#f5f3ff" stroke={battColor} strokeWidth="1.5" />
            <text x="242" y="173" textAnchor="middle" fontSize="9" fontWeight="800" fill={battColor} fontFamily="system-ui">BATTERY</text>
            <text x="242" y="186" textAnchor="middle" fontSize="7" fill="#94a3b8" fontFamily="system-ui">{site.batteryType?.slice(0,12) || site.batteryCapacity || "Reserve"}</text>
          </g>
        )}

        {/* ── FAULTY OVERLAY X marks ── */}
        {isFaulty && (
          <g opacity="0.55">
            <line x1="244" y1="80" x2="284" y2="120" stroke={faultColor} strokeWidth="2.5" strokeLinecap="round" />
            <line x1="284" y1="80" x2="244" y2="120" stroke={faultColor} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* ── LEGEND ── */}
        <g transform="translate(420, 72)">
          {hasGrid && (
            <g>
              <line x1="0" y1="8" x2="18" y2="8" stroke={gridColor} strokeWidth="2" className="flow-line-active" />
              <text x="22" y="11" fontSize="7" fill="#64748b" fontFamily="system-ui">Grid</text>
            </g>
          )}
          {hasSolar && (
            <g transform="translate(0,16)">
              <line x1="0" y1="8" x2="18" y2="8" stroke={solarColor} strokeWidth="2" className="flow-line-active" />
              <text x="22" y="11" fontSize="7" fill="#64748b" fontFamily="system-ui">Solar</text>
            </g>
          )}
          {hasGenset && (
            <g transform="translate(0,32)">
              <line x1="0" y1="8" x2="18" y2="8" stroke={genColor} strokeWidth="2" className="flow-line-active" />
              <text x="22" y="11" fontSize="7" fill="#64748b" fontFamily="system-ui">Genset</text>
            </g>
          )}
          {isFaulty && (
            <g transform="translate(0,48)">
              <line x1="0" y1="8" x2="18" y2="8" stroke={faultColor} strokeWidth="2" className="flow-line-warning" />
              <text x="22" y="11" fontSize="7" fill={faultColor} fontFamily="system-ui" fontWeight="700">Fault</text>
            </g>
          )}
        </g>
      </svg>

      {/* Metric pills */}
      <div className="mt-3 flex flex-wrap gap-2">
        {site.rectifierCapacity && site.rectifierCapacity !== "N/A" && (
          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Load: {site.rectifierCapacity}
          </span>
        )}
        {site.rectifierMaxCapacity && site.rectifierMaxCapacity !== "N/A" && (
          <span className="rounded-full border border-blue-500/10 bg-slate-100 px-3 py-1 text-[9px] font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400 uppercase tracking-wider">
            Peak: {site.rectifierMaxCapacity}
          </span>
        )}
        {site.batteryCapacity && site.batteryCapacity !== "N/A" && (
          <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[9px] font-black text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            Battery: {site.batteryCapacity}
          </span>
        )}
        {site.solarCapacity && site.solarCapacity !== "N/A" && (
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            PV: {site.solarCapacity}
          </span>
        )}
        {isFaulty && (
          <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            ⚡ Fault Active
          </span>
        )}
      </div>
    </div>
  );
};

interface SiteDetailModalProps {
  site: Site;
  onClose: () => void;
  onSave?: (updatedSite: Site) => void;
}

const Field = ({ 
  label, 
  value, 
  fieldName, 
  isEditing, 
  formData, 
  onChange,
  readOnly = false 
}: { 
  label: string; 
  value: string; 
  fieldName: keyof Site;
  isEditing: boolean;
  formData: Site;
  onChange: (value: string) => void;
  readOnly?: boolean;
}) => (
  <div className="rounded-xl border border-slate-100/80 bg-white/60 p-3.5 shadow-sm transition-all hover:bg-white hover:shadow-md hover:border-slate-200/60 duration-300">
    <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider mb-1.5">{label}</span>
    {isEditing ? (
      <Input
        value={formData[fieldName] || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        className={cn(
          "h-9 rounded-lg border-slate-200 bg-white/95 text-xs font-bold transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10",
          readOnly && "opacity-50 cursor-not-allowed bg-slate-100"
        )}
      />
    ) : (
      <p className="text-xs text-slate-700 font-extrabold leading-relaxed">
        {value || <span className="text-slate-400 font-medium italic">N/A</span>}
      </p>
    )}
  </div>
);

const SiteDetailModal = ({ site, onClose, onSave }: SiteDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { canEdit } = useAuth();
  const [formData, setFormData] = useState<Site>(site);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (!isEditing) {
      setFormData(site);
    }
  }, [site, isEditing]);

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
  };

  const updateField = (fieldName: keyof Site, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const tabs = [
    { id: "general", label: "General & Specs", icon: Radio },
    { id: "logistics", label: "Logistics & Sec", icon: Shield },
    { id: "power", label: "Power Grid", icon: Zap },
    { id: "solar", label: "Solar & DC", icon: Sun },
    { id: "operations", label: "Personnel & Ops", icon: Users },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-[0_24px_64px_-16px_rgba(15,23,42,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100/60 bg-white/40 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-indigo-650 shadow-[inset_0_1px_3px_rgba(99,102,241,0.1)] border border-indigo-500/10">
              <Radio size={22} className="animate-pulse text-indigo-600" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black tracking-tight text-slate-800 uppercase tracking-wide">{site.siteName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-500 h-5 px-2.5 rounded-full">{site.siteType || "Standard Node"}</Badge>
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-650 text-white border-none text-[9px] font-black h-5 px-2.5 uppercase tracking-widest rounded-full">{site.region}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button 
                   onClick={() => { setFormData(site); setIsEditing(false); }}
                   className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-black uppercase tracking-wider text-slate-400 transition-colors hover:bg-slate-100 active:scale-95"
                >
                  <RotateCcw size={13} /> Cancel
                </button>
                <button 
                   onClick={handleSave}
                   className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-indigo-500/10 transition-all hover:brightness-105 active:scale-95"
                >
                  <Check size={13} /> Save Changes
                </button>
              </>
            ) : (
              canEdit && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:border-indigo-500/30 hover:bg-indigo-50/20 active:scale-95"
                >
                  <Edit3 size={13} className="text-indigo-600" /> Edit Asset
                </button>
              )
            )}
            <div className="w-px h-6 bg-slate-200 mx-1.5" />
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors active:scale-90">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic Fluent Tab Selector */}
        <div className="flex border-b border-slate-100/60 overflow-x-auto custom-scrollbar bg-slate-50/40 px-5 shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 py-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <Icon size={13} className={isActive ? "text-indigo-600" : "text-slate-450"} />
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-full bg-gradient-to-r from-blue-600 to-indigo-650 shadow-[0_1px_4px_rgba(79,70,229,0.4)]"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Panels */}
        <div className="custom-scrollbar flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-slate-50/30 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100/60 pb-3">
                    <Radio size={16} className="text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">General specifications</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Field label="UID / No" value={formData.no?.replace(".0", "")} fieldName="no" isEditing={isEditing} formData={formData} onChange={(v) => updateField("no", v)} readOnly />
                    <Field label="Network IP Address" value={formData.ipAddress} fieldName="ipAddress" isEditing={isEditing} formData={formData} onChange={(v) => updateField("ipAddress", v)} />
                    <Field label="System Activation Date" value={formData.onAirDate} fieldName="onAirDate" isEditing={isEditing} formData={formData} onChange={(v) => updateField("onAirDate", v)} />
                    <Field label="Router Status" value={formData.routerStatus} fieldName="routerStatus" isEditing={isEditing} formData={formData} onChange={(v) => updateField("routerStatus", v)} />
                    <Field label="Electronic Security Lock" value={formData.electronicLockId} fieldName="electronicLockId" isEditing={isEditing} formData={formData} onChange={(v) => updateField("electronicLockId", v)} />
                    <Field label="SLA Level" value={formData.sla} fieldName="sla" isEditing={isEditing} formData={formData} onChange={(v) => updateField("sla", v)} />
                    <Field label="Data Integrity Status" value={formData.dataIntegrity} fieldName="dataIntegrity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("dataIntegrity", v)} />
                    <Field label="System Cleanliness" value={formData.softwareCleanup} fieldName="softwareCleanup" isEditing={isEditing} formData={formData} onChange={(v) => updateField("softwareCleanup", v)} />
                  </div>
                </div>
              )}

              {activeTab === "logistics" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100/60 pb-3">
                    <Shield size={16} className="text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Logistics & Security footprint</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Field label="Geographic Latitude" value={formData.latitude} fieldName="latitude" isEditing={isEditing} formData={formData} onChange={(v) => updateField("latitude", v)} />
                    <Field label="Geographic Longitude" value={formData.longitude} fieldName="longitude" isEditing={isEditing} formData={formData} onChange={(v) => updateField("longitude", v)} />
                    <Field label="Administrative Region" value={formData.region} fieldName="region" isEditing={isEditing} formData={formData} onChange={(v) => updateField("region", v)} />
                    <Field label="Authorized Security Agency" value={formData.securityCompany} fieldName="securityCompany" isEditing={isEditing} formData={formData} onChange={(v) => updateField("securityCompany", v)} />
                    <Field label="Facility Category" value={formData.siteType} fieldName="siteType" isEditing={isEditing} formData={formData} onChange={(v) => updateField("siteType", v)} />
                  </div>
                </div>
              )}

              {activeTab === "power" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100/60 pb-3">
                    <Zap size={16} className="text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Power & Electrical Infrastructure</h4>
                  </div>
                  <PowerFlowSchematic site={formData} mode="power" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Field label="Primary Source" value={formData.powerSource} fieldName="powerSource" isEditing={isEditing} formData={formData} onChange={(v) => updateField("powerSource", v)} />
                    <Field label="Rectifier Model" value={formData.rectifierType} fieldName="rectifierType" isEditing={isEditing} formData={formData} onChange={(v) => updateField("rectifierType", v)} />
                    <Field label="Operational Load" value={formData.rectifierCapacity} fieldName="rectifierCapacity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("rectifierCapacity", v)} />
                    <Field label="Peak Capacity" value={formData.rectifierMaxCapacity} fieldName="rectifierMaxCapacity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("rectifierMaxCapacity", v)} />
                    <Field label="Board Config (APS/AMF)" value={formData.apsAmfBoard} fieldName="apsAmfBoard" isEditing={isEditing} formData={formData} onChange={(v) => updateField("apsAmfBoard", v)} />
                    <Field label="Generator Class" value={formData.generatorType} fieldName="generatorType" isEditing={isEditing} formData={formData} onChange={(v) => updateField("generatorType", v)} />
                    <Field label="Fuel Reservoir Size" value={formData.generatorTankCapacity} fieldName="generatorTankCapacity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("generatorTankCapacity", v)} />
                    <Field label="Active Fuel Monitoring" value={formData.externalFuelProbe} fieldName="externalFuelProbe" isEditing={isEditing} formData={formData} onChange={(v) => updateField("externalFuelProbe", v)} />
                    <Field label="Sanctioned Site Load" value={formData.sanctionedLoad} fieldName="sanctionedLoad" isEditing={isEditing} formData={formData} onChange={(v) => updateField("sanctionedLoad", v)} />
                  </div>
                </div>
              )}

              {activeTab === "solar" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100/60 pb-3">
                    <Sun size={16} className="text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">DC Metering & Solar Analytics</h4>
                  </div>
                  <PowerFlowSchematic site={formData} mode="solar" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Field label="Smart DC Meter ID" value={formData.dcMeter} fieldName="dcMeter" isEditing={isEditing} formData={formData} onChange={(v) => updateField("dcMeter", v)} />
                    <Field label="Meter Setup Date" value={formData.dcMeterInstallationDate} fieldName="dcMeterInstallationDate" isEditing={isEditing} formData={formData} onChange={(v) => updateField("dcMeterInstallationDate", v)} />
                    <Field label="PV Array Units" value={formData.solarPanels} fieldName="solarPanels" isEditing={isEditing} formData={formData} onChange={(v) => updateField("solarPanels", v)} />
                    <Field label="Generated PV Load" value={formData.solarCapacity} fieldName="solarCapacity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("solarCapacity", v)} />
                    <Field label="PV Manufacturer" value={formData.solarPanelBrand} fieldName="solarPanelBrand" isEditing={isEditing} formData={formData} onChange={(v) => updateField("solarPanelBrand", v)} />
                    <Field label="Tracer Controller Status" value={formData.solarChargeControllerTracer} fieldName="solarChargeControllerTracer" isEditing={isEditing} formData={formData} onChange={(v) => updateField("solarChargeControllerTracer", v)} />
                    <Field label="PV Inverter Model" value={formData.solarChargeControllerFlatpack} fieldName="solarChargeControllerFlatpack" isEditing={isEditing} formData={formData} onChange={(v) => updateField("solarChargeControllerFlatpack", v)} />
                    <Field label="Megmeet MPPT" value={formData.megmeetMppt} fieldName="megmeetMppt" isEditing={isEditing} formData={formData} onChange={(v) => updateField("megmeetMppt", v)} />
                    <Field label="Chemical Battery Class" value={formData.batteryType} fieldName="batteryType" isEditing={isEditing} formData={formData} onChange={(v) => updateField("batteryType", v)} />
                    <Field label="Charge Capacity" value={formData.batteryCapacity} fieldName="batteryCapacity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("batteryCapacity", v)} />
                  </div>
                </div>
              )}

              {activeTab === "operations" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-100/60 pb-3">
                    <Users size={16} className="text-indigo-600" />
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-widest">Field Personnel & Operation states</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Field label="Primary Field Engineer" value={formData.fieldEngineer} fieldName="fieldEngineer" isEditing={isEditing} formData={formData} onChange={(v) => updateField("fieldEngineer", v)} />
                    <Field label="Personnel Contact Email" value={formData.fieldEngineerEmail} fieldName="fieldEngineerEmail" isEditing={isEditing} formData={formData} onChange={(v) => updateField("fieldEngineerEmail", v)} />
                    <Field label="Personnel Contact Phone" value={formData.fieldEngineerPhone} fieldName="fieldEngineerPhone" isEditing={isEditing} formData={formData} onChange={(v) => updateField("fieldEngineerPhone", v)} />
                    <Field label="Supporting Engineer" value={formData.secondFieldEngineer} fieldName="secondFieldEngineer" isEditing={isEditing} formData={formData} onChange={(v) => updateField("secondFieldEngineer", v)} />
                    <Field label="Support Email" value={formData.secondFieldEngineerEmail} fieldName="secondFieldEngineerEmail" isEditing={isEditing} formData={formData} onChange={(v) => updateField("secondFieldEngineerEmail", v)} />
                    <Field label="Support Phone" value={formData.secondFieldEngineerPhone} fieldName="secondFieldEngineerPhone" isEditing={isEditing} formData={formData} onChange={(v) => updateField("secondFieldEngineerPhone", v)} />
                    <Field label="Integration Framework" value={formData.reonIntegration} fieldName="reonIntegration" isEditing={isEditing} formData={formData} onChange={(v) => updateField("reonIntegration", v)} />
                    <Field label="Active Network Tenants" value={formData.tenants} fieldName="tenants" isEditing={isEditing} formData={formData} onChange={(v) => updateField("tenants", v)} />
                    <Field label="Tier Priority" value={formData.priority?.replace(".0", "")} fieldName="priority" isEditing={isEditing} formData={formData} onChange={(v) => updateField("priority", v)} />
                  </div>
                  
                  <div className="mt-4">
                    <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider mb-2">Operational Notes & Remarks</span>
                    {isEditing ? (
                       <textarea
                         value={formData.comments || ""}
                         onChange={(e) => updateField("comments", e.target.value)}
                         className="min-h-[100px] w-full rounded-xl border border-slate-250 bg-white p-4 text-xs font-bold transition-all focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 shadow-inner"
                         placeholder="Enter detailed observations or ongoing maintenance snags..."
                       />
                    ) : (
                      <p className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs font-bold italic leading-relaxed text-slate-600 shadow-inner">
                        {formData.comments || "No active operational remarks have been logged for this node asset."}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default SiteDetailModal;

