import { useState } from "react";
import { User as UserType } from "@/types/site";
import { X, User, Edit3, Check, RotateCcw, Shield, MapPin, Briefcase, Mail, Phone, Calendar, Bookmark, HelpCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface UserDetailModalProps {
  user: UserType;
  isNew?: boolean;
  onClose: () => void;
  onSave?: (updatedUser: UserType) => void;
  onDelete?: (id: string) => void;
}

const AVATAR_GRADIENTS = [
  "from-indigo-500 via-purple-500 to-pink-500",
  "from-blue-500 via-cyan-500 to-teal-500",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-amber-400 via-orange-500 to-rose-500",
  "from-rose-500 via-pink-500 to-purple-600",
  "from-violet-500 via-purple-600 to-indigo-700",
  "from-fuchsia-500 via-pink-500 to-rose-500",
  "from-sky-400 via-blue-500 to-indigo-600",
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const UserDetailModal = ({ user, isNew, onClose, onSave, onDelete }: UserDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(!!isNew);
  const [formData, setFormData] = useState<UserType>(user);
  const gradient = getGradient(user.userName || "U");
  const initials = getInitials(user.userName || "U");

  const Section = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
    <div className="mb-6 rounded-2xl border border-white/20 bg-white/40 p-5 shadow-sm dark:border-slate-800/40 dark:bg-slate-900/40">
      <h4 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
        <Icon size={14} className="text-indigo-500" />
        {title}
      </h4>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">{children}</div>
    </div>
  );

  const Field = ({ label, value, fieldName }: { label: string; value: string; fieldName: keyof UserType }) => (
    <div className="space-y-1.5">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
      {isEditing ? (
        <Input
          value={formData[fieldName] || ""}
          onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
          className="h-9 w-full rounded-xl border-slate-200 bg-white px-3 text-xs font-semibold shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
        />
      ) : (
        <p className="min-h-[20px] text-xs font-bold text-slate-800 dark:text-slate-200">
          {value || <span className="font-medium italic text-slate-400 dark:text-slate-600">Not Assigned</span>}
        </p>
      )}
    </div>
  );

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xl" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/75 shadow-2xl backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-900/75"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fluent Top Gradient Glow */}
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${gradient}`} />

        {/* Modal Header */}
        <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100/50 bg-white/40 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/50 dark:bg-slate-900/40">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-lg font-black text-white shadow-md ring-4 ring-white/60 dark:ring-slate-800`}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-black tracking-tight text-slate-800 dark:text-white">{user.userName}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="outline"
                  className="h-5 border-indigo-500/20 bg-indigo-500/5 text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400"
                >
                  {user.accessLevel || "Staff Node"}
                </Badge>
                <Badge
                  variant="outline"
                  className="h-5 border-sky-500/20 bg-sky-500/5 text-[9px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400"
                >
                  {user.region || "Global Coverage"}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Modal Header Action Panel */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setFormData(user);
                    setIsEditing(false);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <RotateCcw size={13} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 hover:shadow-indigo-500/20 active:scale-95"
                >
                  <Check size={13} /> Save Sync
                </button>
              </>
            ) : (
              <>
                {onDelete && !isNew && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this user?")) {
                        onDelete(user.no);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 shadow-sm transition-all hover:bg-rose-100 active:scale-95 dark:border-rose-900/30 dark:bg-rose-900/10 dark:text-rose-400"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              </>
            )}
            <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-800" />
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
          
          <Section title="Basic Profile Metrics" icon={User}>
            <Field label="Staff Member ID" value={formData.no?.replace(".0", "")} fieldName="no" />
            <Field label="Full Signature Name" value={formData.userName} fieldName="userName" />
            <Field label="Primary Email Route" value={formData.email} fieldName="email" />
            <Field label="Mobile Phone Matrix" value={formData.phone} fieldName="phone" />
          </Section>

          <Section title="Corporate Access Node" icon={Shield}>
            <Field label="Operational Group" value={formData.department} fieldName="department" />
            <Field label="Active Access Group" value={formData.accessGroup} fieldName="accessGroup" />
            <Field label="Clearance Tier" value={formData.accessLevel} fieldName="accessLevel" />
            <Field label="Assigned Region" value={formData.region} fieldName="region" />
          </Section>

          <Section title="Operational Scopes" icon={Briefcase}>
            <Field label="REON Status" value={formData.reonOnboarding} fieldName="reonOnboarding" />
            <Field label="Total Assigned Sites" value={formData.sites} fieldName="sites" />
            
            {/* Roles textarea block */}
            <div className="col-span-full mt-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Detailed Scope of Responsibilities
              </span>
              {isEditing ? (
                <textarea
                  value={formData.roles || ""}
                  onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                  className="mt-2 min-h-[90px] w-full rounded-xl border border-slate-200 bg-white p-3.5 text-xs font-semibold shadow-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                  placeholder="Enter detailed scopes..."
                />
              ) : (
                <p className="mt-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 text-xs font-semibold leading-relaxed text-slate-600 dark:border-slate-800/60 dark:bg-slate-950/40 dark:text-slate-400">
                  {formData.roles || "No scope assignments entered for this node."}
                </p>
              )}
            </div>
          </Section>
        </div>
      </motion.div>
    </div>
  );
};

export default UserDetailModal;
