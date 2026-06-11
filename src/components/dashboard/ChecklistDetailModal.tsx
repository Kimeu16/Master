import { useState } from "react";
import { ChecklistTask } from "@/types/site";
import { X, Edit3, Check, RotateCcw, ClipboardCheck, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

interface ChecklistDetailModalProps {
  task: ChecklistTask;
  isNew?: boolean;
  onClose: () => void;
  onSave?: (updatedTask: ChecklistTask) => void;
  onDelete?: (id: string) => void;
}

const ChecklistDetailModal = ({ task, isNew, onClose, onSave, onDelete }: ChecklistDetailModalProps) => {
  const { canEdit } = useAuth();
  const [isEditing, setIsEditing] = useState(!!isNew);
  const [formData, setFormData] = useState<ChecklistTask>(task);

  const handleSave = () => {
    if (onSave) {
      onSave(formData);
    }
    setIsEditing(false);
  };

  const Field = ({ label, value, fieldName }: { label: string; value: string; fieldName: keyof ChecklistTask }) => (
    <div className="space-y-1.5">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</span>
      {isEditing ? (
        <Input
          value={formData[fieldName] || ""}
          onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
          className="glass-input h-9 w-full rounded-xl"
        />
      ) : (
        <p className="min-h-[20px] text-xs font-bold text-foreground">
          {value || <span className="font-medium italic text-muted-foreground">Not Assigned</span>}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/25 p-4 backdrop-blur-xl" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-secondary/20 bg-card/75 shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        <div className="flex shrink-0 flex-col gap-4 border-b border-secondary/15 bg-card/30 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md ring-4 ring-card">
              <ClipboardCheck size={24} />
            </div>
            <div>
              <h3 className="truncate text-xl font-black tracking-tight text-foreground">PM Checklist</h3>
              <p className="text-xs font-semibold text-muted-foreground mt-1">Task Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button onClick={() => { setFormData(task); setIsEditing(false); }} className="control-button rounded-xl px-3.5 py-2 text-xs font-bold shadow-sm transition-all active:scale-95">
                  <RotateCcw size={13} /> Cancel
                </button>
                <button onClick={handleSave} className="primary-button rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-all active:scale-95">
                  <Check size={13} /> Save Sync
                </button>
              </>
            ) : (
              <>
                {onDelete && !isNew && canEdit && (
                  <button onClick={() => { if (window.confirm("Are you sure?")) onDelete(task.no); }} className="flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-2 text-xs font-bold text-destructive shadow-sm transition-all hover:bg-destructive/20 active:scale-95">
                    <Trash2 size={13} /> Delete
                  </button>
                )}
                {canEdit && (
                  <button onClick={() => setIsEditing(true)} className="control-button rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all active:scale-95">
                    <Edit3 size={13} /> Edit
                  </button>
                )}
              </>
            )}
            <div className="mx-1 h-6 w-px bg-secondary/15" />
            <button onClick={onClose} className="control-button rounded-xl p-2">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto bg-card/10 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Task ID" value={formData.no} fieldName="no" />
          <Field label="Section" value={formData.section} fieldName="section" />
          <Field label="Field Name" value={formData.field} fieldName="field" />
          <Field label="Picture Required" value={formData.pictureRequired} fieldName="pictureRequired" />
        </div>
      </motion.div>
    </div>
  );
};

export default ChecklistDetailModal;
