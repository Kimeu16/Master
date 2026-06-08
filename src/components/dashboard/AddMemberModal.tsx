import { useState } from "react";
import { User as UserType } from "@/types/site";
import { X, User, Check, Shield, Briefcase, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface AddMemberModalProps {
  onClose: () => void;
  onSave: (newUser: UserType) => void;
}

const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="mb-6 rounded-2xl border border-white/20 bg-white/40 p-5 shadow-sm dark:border-slate-800/40 dark:bg-slate-900/40">
    <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
      <Icon size={14} className="text-indigo-500" />
      {title}
    </h4>
    <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">{children}</div>
  </div>
);

export function AddMemberModal({ onClose, onSave }: AddMemberModalProps) {
  const [formData, setFormData] = useState<Partial<UserType>>({
    userName: "",
    email: "",
    phone: "",
    department: "Maintenance",
    accessLevel: "Level 3 (Read-Only)",
    region: "",
    reonOnboarding: "Pending",
    roles: "",
    accessGroup: "Standard",
    sites: "0",
  });
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [errors, setErrors] = useState({ email: "", phone: "" });

  const handleEmailChange = (val: string) => {
    setFormData((prev) => ({ ...prev, email: val }));
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (val && !emailRegex.test(val)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handlePhoneChange = (val: string) => {
    setFormData((prev) => ({ ...prev, phone: val }));
    const phoneRegex = /^(?:254|\+254|0)?(7\d{8}|1\d{8})$/;
    const cleanPhone = val.replace(/\s+/g, "");
    if (val && !phoneRegex.test(cleanPhone)) {
      setErrors((prev) => ({ ...prev, phone: "Phone must be a valid 10-digit Kenyan number (e.g., 0712345678)." }));
    } else {
      setErrors((prev) => ({ ...prev, phone: "" }));
    }
  };

  const handleSave = () => {
    onSave(formData as UserType);
  };

  const isFormValid = formData.userName && formData.email && formData.phone && formData.region && formData.roles && !errors.email && !errors.phone;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xl" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/75 shadow-2xl backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-900/75"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Glow */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Modal Header */}
        <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100/50 bg-white/40 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/50 dark:bg-slate-900/40">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 text-white shadow-md ring-4 ring-white/60 dark:ring-slate-800">
              <UserPlus size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-black tracking-tight text-slate-800 dark:text-white">Add New Member</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Contents */}
        <div className="custom-scrollbar flex-1 overflow-y-auto bg-gradient-to-b from-white/20 to-slate-50/20 p-6 dark:to-slate-950/20">
          
          {isConfirming ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 dark:border-indigo-900/30 dark:bg-indigo-900/10"
            >
              <h4 className="mb-2 flex items-center gap-2 text-lg font-black text-slate-800 dark:text-white">
                <Check size={20} className="text-indigo-500" />
                Confirm Registration
              </h4>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                Are you sure you want to add this user? Please verify the details below before submitting.
              </p>
              
              <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-semibold text-slate-500">Name:</span> <span className="font-bold dark:text-white">{formData.userName}</span></div>
                <div><span className="font-semibold text-slate-500">Email:</span> <span className="font-bold dark:text-white">{formData.email}</span></div>
                <div><span className="font-semibold text-slate-500">Phone:</span> <span className="font-bold dark:text-white">{formData.phone}</span></div>
                <div><span className="font-semibold text-slate-500">Department:</span> <span className="font-bold dark:text-white">{formData.department}</span></div>
                <div><span className="font-semibold text-slate-500">Clearance:</span> <span className="font-bold dark:text-white">{formData.accessLevel}</span></div>
                <div><span className="font-semibold text-slate-500">Region:</span> <span className="font-bold dark:text-white">{formData.region}</span></div>
                <div><span className="font-semibold text-slate-500">REON:</span> <span className="font-bold dark:text-white">{formData.reonOnboarding}</span></div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Back to Edit
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-95"
                >
                  Confirm & Add Member
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Section title="Basic Profile Metrics" icon={User}>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Member Name *</span>
                  <Input
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="h-9 w-full rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Full Signature Name"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Primary Email Route *</span>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className={`h-9 w-full rounded-xl border bg-white px-3 text-xs font-semibold shadow-sm focus:ring-2 dark:bg-slate-950 dark:text-white ${
                      errors.email
                        ? "border-red-500 focus:border-red-600 focus:ring-red-500/10 dark:border-red-500/50"
                        : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/10 dark:border-slate-800"
                    }`}
                    placeholder="user@example.com"
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-medium mt-1">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Mobile Phone Matrix *</span>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className={`h-9 w-full rounded-xl border bg-white px-3 text-xs font-semibold shadow-sm focus:ring-2 dark:bg-slate-950 dark:text-white ${
                      errors.phone
                        ? "border-red-500 focus:border-red-600 focus:ring-red-500/10 dark:border-red-500/50"
                        : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-500/10 dark:border-slate-800"
                    }`}
                    placeholder="+254 7XX XXX XXX"
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-medium mt-1">{errors.phone}</p>}
                </div>
              </Section>

              <Section title="Corporate Access Node" icon={Shield}>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Management Department</span>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Health and Safety">Health and Safety</option>
                    <option value="Projects">Projects</option>
                    <option value="NOC">NOC</option>
                    <option value="IOT">IOT</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Access Clearance</span>
                  <select
                    value={formData.accessLevel}
                    onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Level 1 (Admin)">Level 1 (Admin)</option>
                    <option value="Level 2 (CRUD)">Level 2 (CRUD)</option>
                    <option value="Level 3 (Read-Only)">Level 3 (Read-Only)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assigned Region *</span>
                  <Input
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="h-9 w-full rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="e.g. Nairobi"
                  />
                </div>
              </Section>

              <Section title="Operational Scopes" icon={Briefcase}>
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">REON Integration Status</span>
                  <select
                    value={formData.reonOnboarding}
                    onChange={(e) => setFormData({ ...formData, reonOnboarding: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Done">Done</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                
                <div className="col-span-full mt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Roles Scope *
                  </span>
                  <textarea
                    value={formData.roles}
                    onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                    className="mt-2 min-h-[90px] w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs font-semibold shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    placeholder="Enter detailed scope of responsibilities..."
                  />
                </div>
              </Section>
            </motion.div>
          )}
        </div>

        {/* Modal Footer */}
        {!isConfirming && (
          <div className="border-t border-slate-100/50 bg-white/40 p-6 dark:border-slate-800/50 dark:bg-slate-900/40">
            <button
              disabled={!isFormValid}
              onClick={() => setIsConfirming(true)}
              className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold tracking-wide text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
            >
              Continue to Confirmation
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
