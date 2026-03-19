import { useState, useEffect } from "react";
import { Site } from "@/types/site";
import { X, MapPin, Zap, User, Radio, Battery, Sun, Edit3, Check, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SiteDetailModalProps {
  site: Site;
  onClose: () => void;
  onSave?: (updatedSite: Site) => void;
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
      {title}
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">{children}</div>
  </div>
);

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
  <div className="space-y-1">
    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider transition-colors">{label}</span>
    {isEditing ? (
      <Input
        value={formData[fieldName] || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        className={cn(
          "h-8 text-xs bg-background/50 border-border focus:ring-1 focus:ring-primary/20 transition-all font-semibold",
          readOnly && "opacity-50 cursor-not-allowed bg-secondary/20"
        )}
      />
    ) : (
      <p className="text-sm text-foreground font-semibold leading-relaxed border-b border-transparent">
        {value || <span className="text-muted-foreground font-normal italic">N/A</span>}
      </p>
    )}
  </div>
);

const SiteDetailModal = ({ site, onClose, onSave }: SiteDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Site>(site);

  // Sync formData when site prop changes (e.g. after a save)
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[4px]" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <Radio size={24} />
            </div>
            <div>
              <h3 className="font-display font-black text-foreground text-xl tracking-tight">{site.siteName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider h-5">{site.siteType || "Unknown Type"}</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold h-5 uppercase tracking-wider">{site.region}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button 
                   onClick={() => { setFormData(site); setIsEditing(false); }}
                   className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary rounded-lg transition-all"
                >
                  <RotateCcw size={14} /> Cancel
                </button>
                <button 
                   onClick={handleSave}
                   className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-primary text-white rounded-lg shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  <Check size={14} /> Save Changes
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white border border-border shadow-sm hover:shadow-md hover:border-primary/30 text-foreground rounded-lg transition-all"
              >
                <Edit3 size={14} /> Edit Detail
              </button>
            )}
            <div className="w-px h-6 bg-border mx-2" />
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-transparent to-secondary/5">
          <Section title="Asset Identification & Specs">
            <Field label="UID / No" value={formData.no?.replace(".0", "")} fieldName="no" isEditing={isEditing} formData={formData} onChange={(v) => updateField("no", v)} readOnly />
            <Field label="Network IP Address" value={formData.ipAddress} fieldName="ipAddress" isEditing={isEditing} formData={formData} onChange={(v) => updateField("ipAddress", v)} />
            <Field label="System Activation Date" value={formData.onAirDate} fieldName="onAirDate" isEditing={isEditing} formData={formData} onChange={(v) => updateField("onAirDate", v)} />
            <Field label="Router Status" value={formData.routerStatus} fieldName="routerStatus" isEditing={isEditing} formData={formData} onChange={(v) => updateField("routerStatus", v)} />
            <Field label="Electronic Security Lock" value={formData.electronicLockId} fieldName="electronicLockId" isEditing={isEditing} formData={formData} onChange={(v) => updateField("electronicLockId", v)} />
            <Field label="SLA Level" value={formData.sla} fieldName="sla" isEditing={isEditing} formData={formData} onChange={(v) => updateField("sla", v)} />
            <Field label="Data Integrity Status" value={formData.dataIntegrity} fieldName="dataIntegrity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("dataIntegrity", v)} />
            <Field label="System Cleanliness" value={formData.softwareCleanup} fieldName="softwareCleanup" isEditing={isEditing} formData={formData} onChange={(v) => updateField("softwareCleanup", v)} />
          </Section>

          <Section title="Coordinates & Logistics">
            <Field label="Geographic Latitude" value={formData.latitude} fieldName="latitude" isEditing={isEditing} formData={formData} onChange={(v) => updateField("latitude", v)} />
            <Field label="Geographic Longitude" value={formData.longitude} fieldName="longitude" isEditing={isEditing} formData={formData} onChange={(v) => updateField("longitude", v)} />
            <Field label="Administrative Region" value={formData.region} fieldName="region" isEditing={isEditing} formData={formData} onChange={(v) => updateField("region", v)} />
            <Field label="Authorized Security Agency" value={formData.securityCompany} fieldName="securityCompany" isEditing={isEditing} formData={formData} onChange={(v) => updateField("securityCompany", v)} />
            <Field label="Facility Category" value={formData.siteType} fieldName="siteType" isEditing={isEditing} formData={formData} onChange={(v) => updateField("siteType", v)} />
          </Section>

          <Section title="Power Infrastructure">
            <Field label="Primary Source" value={formData.powerSource} fieldName="powerSource" isEditing={isEditing} formData={formData} onChange={(v) => updateField("powerSource", v)} />
            <Field label="Rectifier Model" value={formData.rectifierType} fieldName="rectifierType" isEditing={isEditing} formData={formData} onChange={(v) => updateField("rectifierType", v)} />
            <Field label="Operational Load" value={formData.rectifierCapacity} fieldName="rectifierCapacity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("rectifierCapacity", v)} />
            <Field label="Peak Capacity" value={formData.rectifierMaxCapacity} fieldName="rectifierMaxCapacity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("rectifierMaxCapacity", v)} />
            <Field label="Board Config (APS/AMF)" value={formData.apsAmfBoard} fieldName="apsAmfBoard" isEditing={isEditing} formData={formData} onChange={(v) => updateField("apsAmfBoard", v)} />
            <Field label="Generator Class" value={formData.generatorType} fieldName="generatorType" isEditing={isEditing} formData={formData} onChange={(v) => updateField("generatorType", v)} />
            <Field label="Fuel Reservoir Size" value={formData.generatorTankCapacity} fieldName="generatorTankCapacity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("generatorTankCapacity", v)} />
            <Field label="Active Fuel Monitoring" value={formData.externalFuelProbe} fieldName="externalFuelProbe" isEditing={isEditing} formData={formData} onChange={(v) => updateField("externalFuelProbe", v)} />
            <Field label="Sanctioned Site Load" value={formData.sanctionedLoad} fieldName="sanctionedLoad" isEditing={isEditing} formData={formData} onChange={(v) => updateField("sanctionedLoad", v)} />
          </Section>

          <Section title="DC & Solar Analytics">
            <Field label="Smart DC Meter ID" value={formData.dcMeter} fieldName="dcMeter" isEditing={isEditing} formData={formData} onChange={(v) => updateField("dcMeter", v)} />
            <Field label="Meter Setup Date" value={formData.dcMeterInstallationDate} fieldName="dcMeterInstallationDate" isEditing={isEditing} formData={formData} onChange={(v) => updateField("dcMeterInstallationDate", v)} />
            <Field label="PV Array Units" value={formData.solarPanels} fieldName="solarPanels" isEditing={isEditing} formData={formData} onChange={(v) => updateField("solarPanels", v)} />
            <Field label="Generated PV Load" value={formData.solarCapacity} fieldName="solarCapacity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("solarCapacity", v)} />
            <Field label="PV Manufacturer" value={formData.solarPanelBrand} fieldName="solarPanelBrand" isEditing={isEditing} formData={formData} onChange={(v) => updateField("solarPanelBrand", v)} />
            <Field label="Tracer Controller Status" value={formData.solarChargeControllerTracer} fieldName="solarChargeControllerTracer" isEditing={isEditing} formData={formData} onChange={(v) => updateField("solarChargeControllerTracer", v)} />
            <Field label="PV Inverter Model" value={formData.solarChargeControllerFlatpack} fieldName="solarChargeControllerFlatpack" isEditing={isEditing} formData={formData} onChange={(v) => updateField("solarChargeControllerFlatpack", v)} />
          </Section>

          <Section title="Energy Storage">
            <Field label="Chemical Battery Class" value={formData.batteryType} fieldName="batteryType" isEditing={isEditing} formData={formData} onChange={(v) => updateField("batteryType", v)} />
            <Field label="Charge Capacity" value={formData.batteryCapacity} fieldName="batteryCapacity" isEditing={isEditing} formData={formData} onChange={(v) => updateField("batteryCapacity", v)} />
          </Section>

          <Section title="Assigned Field Personnel">
            <Field label="Primary Field Engineer" value={formData.fieldEngineer} fieldName="fieldEngineer" isEditing={isEditing} formData={formData} onChange={(v) => updateField("fieldEngineer", v)} />
            <Field label="Personnel Contact Email" value={formData.fieldEngineerEmail} fieldName="fieldEngineerEmail" isEditing={isEditing} formData={formData} onChange={(v) => updateField("fieldEngineerEmail", v)} />
            <Field label="Personnel Contact Phone" value={formData.fieldEngineerPhone} fieldName="fieldEngineerPhone" isEditing={isEditing} formData={formData} onChange={(v) => updateField("fieldEngineerPhone", v)} />
            <Field label="Supporting Engineer" value={formData.secondFieldEngineer} fieldName="secondFieldEngineer" isEditing={isEditing} formData={formData} onChange={(v) => updateField("secondFieldEngineer", v)} />
            <Field label="Support Email" value={formData.secondFieldEngineerEmail} fieldName="secondFieldEngineerEmail" isEditing={isEditing} formData={formData} onChange={(v) => updateField("secondFieldEngineerEmail", v)} />
            <Field label="Support Phone" value={formData.secondFieldEngineerPhone} fieldName="secondFieldEngineerPhone" isEditing={isEditing} formData={formData} onChange={(v) => updateField("secondFieldEngineerPhone", v)} />
          </Section>

          <Section title="Operations & Support">
            <Field label="Integration Framework" value={formData.reonIntegration} fieldName="reonIntegration" isEditing={isEditing} formData={formData} onChange={(v) => updateField("reonIntegration", v)} />
            <Field label="Active Network Tenants" value={formData.tenants} fieldName="tenants" isEditing={isEditing} formData={formData} onChange={(v) => updateField("tenants", v)} />
            <Field label="Tier Priority" value={formData.priority?.replace(".0", "")} fieldName="priority" isEditing={isEditing} formData={formData} onChange={(v) => updateField("priority", v)} />
            <div className="col-span-full mt-4">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Operational Notes & Remarks</span>
              {isEditing ? (
                 <textarea
                   value={formData.comments || ""}
                   onChange={(e) => updateField("comments", e.target.value)}
                   className="w-full mt-2 p-3 text-xs bg-background/50 border border-border focus:ring-1 focus:ring-primary/20 rounded-xl transition-all font-semibold min-h-[100px]"
                   placeholder="Enter detailed site observations..."
                 />
              ) : (
                <p className="mt-2 p-4 rounded-xl bg-white border border-border/50 text-[13px] leading-relaxed text-foreground font-medium italic shadow-sm">
                  {formData.comments || "No operational comments logged for this asset."}
                </p>
              )}
            </div>
          </Section>
        </div>
      </motion.div>
    </div>
  );
};


export default SiteDetailModal;
