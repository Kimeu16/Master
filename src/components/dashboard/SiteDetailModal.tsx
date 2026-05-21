import { useState, useEffect } from "react";
import { Site } from "@/types/site";
import { X, Radio, Edit3, Check, RotateCcw, Shield, Zap, Sun, Users, ClipboardList, Info, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-700 shadow-sm transition-all hover:border-indigo-500/30 hover:bg-indigo-50/20 active:scale-95"
              >
                <Edit3 size={13} className="text-indigo-600" /> Edit Asset
              </button>
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
                  isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-650"
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
                      <p className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs font-bold italic leading-relaxed text-slate-650 shadow-inner">
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

