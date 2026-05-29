import { useState } from "react";
import { EscalationEntry } from "@/types/site";
import { X, Edit3, Check, RotateCcw, AlertTriangle, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

import { useAuth } from "@/contexts/AuthContext";

interface EscalationDetailModalProps {
  entry: EscalationEntry;
  isNew?: boolean;
  onClose: () => void;
  onSave?: (updatedEntry: EscalationEntry) => void;
  onDelete?: (id: string) => void;
}

const EscalationDetailModal = ({ entry, isNew, onClose, onSave, onDelete }: EscalationDetailModalProps) => {
  const { canEdit } = useAuth();
  const [isEditing, setIsEditing] = useState(!!isNew);
  const [formData, setFormData] = useState<EscalationEntry>(entry);

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
  };

  const Field = ({ label, value, fieldName }: { label: string; value: string; fieldName: keyof EscalationEntry }) => (
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xl" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/75 shadow-2xl backdrop-blur-2xl dark:border-slate-800/80 dark:bg-slate-900/75"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />
        <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100/50 bg-white/40 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/50 dark:bg-slate-900/40">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-md ring-4 ring-white/60 dark:ring-slate-800">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="truncate text-xl font-black tracking-tight text-slate-800 dark:text-white">Escalation Flow</h3>
              <p className="text-xs font-semibold text-slate-400 mt-1">Matrix Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={() => { setFormData(entry); setIsEditing(false); }} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <RotateCcw size={13} /> Cancel
                </button>
                <button onClick={handleSave} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95">
                  <Check size={13} /> Save Sync
                </button>
              </>
            ) : (
              <>
                {onDelete && !isNew && canEdit && (
                  <button onClick={() => { if (window.confirm("Are you sure?")) onDelete(entry.no); }} className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 shadow-sm transition-all hover:bg-rose-100 active:scale-95">
                    <Trash2 size={13} /> Delete
                  </button>
                )}
                {canEdit && (
                  <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-indigo-500/5 hover:text-indigo-600 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <Edit3 size={13} /> Edit
                  </button>
                )}
              </>
            )}
            <div className="mx-1 h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto bg-gradient-to-b from-white/20 to-slate-50/20 p-6 dark:to-slate-950/20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="No" value={formData.no} fieldName="no" />
          <Field label="Event / Scenario" value={formData.event} fieldName="event" />
          <Field label="Alarm Code" value={formData.alarm} fieldName="alarm" />
          <Field label="Trigger Method" value={formData.method} fieldName="method" />
          <Field label="Issue Type" value={formData.issueType} fieldName="issueType" />
          <Field label="Level 1 Response" value={formData.level1} fieldName="level1" />
          <Field label="Level 2 Response" value={formData.level2} fieldName="level2" />
          <Field label="Level 3 Response" value={formData.level3} fieldName="level3" />
          <Field label="Notification Time SLA" value={formData.notificationTime} fieldName="notificationTime" />
          <Field label="Designator" value={formData.designator} fieldName="designator" />
          <Field label="Scope Designee" value={formData.scopeDesignee} fieldName="scopeDesignee" />
        </div>
      </motion.div>
    </div>
  );
};

export default EscalationDetailModal;
