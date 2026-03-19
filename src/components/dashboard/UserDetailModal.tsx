import { useState } from "react";
import { User as UserType } from "@/types/site";
import { X, User, Mail, Phone, Briefcase, MapPin, Shield, Edit3, Check, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface UserDetailModalProps {
  user: UserType;
  onClose: () => void;
  onSave?: (updatedUser: UserType) => void;
}

const UserDetailModal = ({ user, onClose, onSave }: UserDetailModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserType>(user);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
      <h4 className="text-xs font-extrabold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
        {title}
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">{children}</div>
    </div>
  );

  const Field = ({ label, value, fieldName }: { label: string; value: string; fieldName: keyof UserType }) => (
    <div className="space-y-1">
      <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider transition-colors">{label}</span>
      {isEditing ? (
        <Input
          value={formData[fieldName] || ""}
          onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
          className="h-8 text-xs bg-background/50 border-border focus:ring-1 focus:ring-primary/20 transition-all font-semibold"
        />
      ) : (
        <p className="text-sm text-foreground font-semibold leading-relaxed border-b border-transparent">
          {value || <span className="text-muted-foreground font-normal italic">N/A</span>}
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-[4px]" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl mx-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/10 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <User size={24} />
            </div>
            <div>
              <h3 className="font-display font-black text-foreground text-xl tracking-tight">{user.userName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider h-5">{user.accessLevel || "Unauthorized"}</Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold h-5 uppercase tracking-wider">{user.region || "Global"}</Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button 
                   onClick={() => { setFormData(user); setIsEditing(false); }}
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
          <Section title="Basic Information">
            <Field label="Staff ID / No" value={formData.no?.replace(".0", "")} fieldName="no" />
            <Field label="Full Name" value={formData.userName} fieldName="userName" />
            <Field label="Email Address" value={formData.email} fieldName="email" />
            <Field label="Phone Contact" value={formData.phone} fieldName="phone" />
          </Section>

          <Section title="Organization & Access">
            <Field label="Department / Group" value={formData.department} fieldName="department" />
            <Field label="Access Group" value={formData.accessGroup} fieldName="accessGroup" />
            <Field label="Access Level" value={formData.accessLevel} fieldName="accessLevel" />
            <Field label="Primary Region" value={formData.region} fieldName="region" />
          </Section>

          <Section title="Roles & Responsibility">
            <Field label="REON Onboarding Status" value={formData.reonOnboarding} fieldName="reonOnboarding" />
            <Field label="Total Sites Managed" value={formData.sites} fieldName="sites" />
            <div className="col-span-full mt-2">
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Detailed Scope & Role</span>
              {isEditing ? (
                 <textarea
                   value={formData.roles || ""}
                   onChange={(e) => setFormData({ ...formData, roles: e.target.value })}
                   className="w-full mt-2 p-3 text-xs bg-background/50 border border-border focus:ring-1 focus:ring-primary/20 rounded-xl transition-all font-semibold min-h-[80px]"
                   placeholder="Enter user roles and scope..."
                 />
              ) : (
                <p className="mt-2 p-4 rounded-xl bg-white border border-border/50 text-[13px] leading-relaxed text-foreground font-medium italic shadow-sm">
                  {formData.roles || "No detailed roles assigned."}
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
