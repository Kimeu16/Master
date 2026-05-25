import { useMemo, useState } from "react";
import { usePMChecklist, useCreatePMChecklist, useUpdatePMChecklist, useDeletePMChecklist } from "@/hooks/useSites";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ListChecks,
  Search,
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Sparkles,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import ChecklistDetailModal from "./ChecklistDetailModal";
import { ChecklistTask } from "@/types/site";

/* ── section colour palette ─────────────────────────────────────────── */
const SECTION_PALETTES = [
  { gradient: "from-indigo-500 via-purple-500 to-pink-500", light: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20", check: "text-indigo-500" },
  { gradient: "from-blue-500 via-cyan-500 to-teal-500",     light: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400",   border: "border-blue-500/20",   check: "text-blue-500"   },
  { gradient: "from-emerald-400 via-teal-500 to-cyan-600",  light: "bg-emerald-500/10",text: "text-emerald-600 dark:text-emerald-400",border: "border-emerald-500/20",check: "text-emerald-500" },
  { gradient: "from-amber-400 via-orange-500 to-rose-500",  light: "bg-amber-500/10",  text: "text-amber-600 dark:text-amber-400",  border: "border-amber-500/20",  check: "text-amber-500"  },
  { gradient: "from-rose-500 via-pink-500 to-purple-600",     light: "bg-rose-500/10",   text: "text-rose-600 dark:text-rose-400",   border: "border-rose-500/20",   check: "text-rose-500"   },
  { gradient: "from-sky-400 via-blue-500 to-indigo-600",      light: "bg-sky-500/10",    text: "text-sky-600 dark:text-sky-400",    border: "border-sky-500/20",    check: "text-sky-500"    },
];

function getPalette(index: number) {
  return SECTION_PALETTES[index % SECTION_PALETTES.length];
}

/* ── ChecklistCard ──────────────────────────────────────────────────── */
function ChecklistCard({
  section,
  tasks,
  index,
  searchQuery,
  onTaskClick,
}: {
  section: string;
  tasks: ChecklistTask[];
  index: number;
  searchQuery: string;
  onTaskClick: (task: ChecklistTask) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const palette = getPalette(index);

  const filteredTasks = searchQuery
    ? tasks.filter((t) => t.field.toLowerCase().includes(searchQuery.toLowerCase()))
    : tasks;

  const photoCount = tasks.filter((t) => t.pictureRequired?.toLowerCase() === "yes").length;

  if (filteredTasks.length === 0) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-3xl border border-white/40 bg-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_15px_30px_rgba(0,0,0,0.04)] dark:border-slate-800/60 dark:bg-slate-900/60"
    >
      {/* Top Gradient Highlight Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${palette.gradient}`} />

      {/* Accordion Toggle Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4.5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${palette.gradient} shadow-md`}>
            <ListChecks size={15} className="text-white" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 tracking-tight dark:text-slate-200 group-hover:text-indigo-600 transition-colors">
              {section}
            </h4>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
              {tasks.length} tasks{photoCount > 0 ? ` · ${photoCount} snapshots` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {photoCount > 0 && (
            <span className={`flex items-center gap-1 rounded-full border ${palette.border} ${palette.light} px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${palette.text}`}>
              <Camera size={10} className="animate-pulse" />
              {photoCount}
            </span>
          )}
          <span className="rounded-full border border-slate-200 bg-white/80 px-2 py-0.5 text-[10px] font-black text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
            {filteredTasks.length}
          </span>
          <div className="rounded-lg bg-slate-100 p-1 text-slate-400 transition-colors hover:text-slate-600 dark:bg-slate-800">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {/* Accordion Task Contents */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="border-t border-slate-100/50 dark:border-slate-800/50"
          >
            <div className="px-5 pb-5 pt-3">
              <ul className="space-y-1.5">
                {filteredTasks.map((task) => {
                  const needsPhoto = task.pictureRequired?.toLowerCase() === "yes";
                  return (
                    <li
                      key={task.no}
                      onClick={() => onTaskClick(task)}
                      className="group flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-indigo-50/20 dark:hover:bg-slate-800/20 cursor-pointer"
                    >
                      <CheckCircle2 size={15} className={`mt-0.5 shrink-0 transition-transform group-hover:scale-110 ${palette.check}`} />
                      <span className="flex-1 text-[12px] font-medium leading-relaxed text-slate-600 dark:text-slate-350">
                        {task.field}
                      </span>
                      {needsPhoto && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                          <ImageIcon size={10} className="text-amber-500" />
                          Photo
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── main component ─────────────────────────────────────────────────── */
const ChecklistsView = () => {
  const { data: pmTasks, isLoading } = usePMChecklist();
  const createChecklistMutation = useCreatePMChecklist();
  const updateChecklistMutation = useUpdatePMChecklist();
  const deleteChecklistMutation = useDeletePMChecklist();
  
  const [search, setSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState<ChecklistTask | null>(null);

  const handleSave = async (updatedTask: ChecklistTask, isNew?: boolean) => {
    if (isNew) {
      await createChecklistMutation.mutateAsync(updatedTask);
    } else {
      await updateChecklistMutation.mutateAsync({ id: updatedTask.no, data: updatedTask });
    }
    setSelectedTask(null);
  };

  const handleDelete = async (id: string) => {
    await deleteChecklistMutation.mutateAsync(id);
    setSelectedTask(null);
  };

  const handleAdd = () => {
    setSelectedTask({
      no: `PM${Date.now()}`,
      section: "New Section",
      field: "New Checklist Item",
      pictureRequired: "No",
    } as ChecklistTask);
  };

  const pmChecklistSections = useMemo(() => {
    if (!pmTasks) return [];
    const grouped = pmTasks.reduce((acc, task) => {
      if (!acc[task.section]) acc[task.section] = [];
      acc[task.section].push(task);
      return acc;
    }, {} as Record<string, ChecklistTask[]>);
    return Object.entries(grouped).map(([name, tasks]) => ({ name, tasks }));
  }, [pmTasks]);

  const photoFieldSet = useMemo(() => {
    const set = new Set<string>();
    (pmTasks || []).forEach((task) => {
      if (task.pictureRequired?.toLowerCase() === "yes") set.add(task.field);
    });
    return set;
  }, [pmTasks]);

  const pictureRequired = photoFieldSet.size;
  const totalTasks = pmTasks?.length || 0;
  const totalSections = pmChecklistSections.length;

  const completionRate = totalTasks > 0 ? Math.round(((totalTasks - pictureRequired) / totalTasks) * 100) : 0;

  const statItems = [
    { label: "Checklist Sections", value: totalSections, icon: ListChecks, gradient: "from-indigo-500 via-purple-500 to-pink-500", bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
    { label: "Active PM Tasks", value: totalTasks, icon: ClipboardCheck, gradient: "from-blue-500 via-cyan-500 to-teal-500", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
    { label: "Required Evidence", value: pictureRequired, icon: Camera, gradient: "from-amber-400 via-orange-500 to-rose-500", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  ];

  const filteredSections = search
    ? pmChecklistSections.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.tasks.some((t) => t.field.toLowerCase().includes(search.toLowerCase()))
      )
    : pmChecklistSections;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Operations Checklists</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Field preventive maintenance (PM) checklists, procedures, and photographic requirements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <Badge variant="outline" className="gap-1.5 border-indigo-200 bg-indigo-50/80 text-indigo-600 dark:border-indigo-800/30 dark:bg-indigo-900/30 dark:text-indigo-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500" />
              Active Sync
            </Badge>
          )}
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:brightness-105 active:scale-95"
          >
            <Plus size={14} /> Add Checklist Item
          </button>
        </div>
      </div>

      {/* Stat summary counters */}
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

      {/* Frosted Progress Tracker */}
      {totalTasks > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/60"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">On-Site Evidence KPI</span>
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{completionRate}% without photos</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-1000"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-500 leading-relaxed dark:text-slate-400">
            {pictureRequired} tasks ({Math.round((pictureRequired / totalTasks) * 100)}%) require upload proof. Field teams must attach photo files in real-time.
          </p>
        </motion.div>
      )}

      {/* Main checklist table view card */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/40 bg-white/40 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/40"
      >
        <div className="flex flex-col gap-3 border-b border-slate-100/50 bg-gradient-to-r from-slate-50/50 to-white/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/50 dark:from-slate-900/30 dark:to-slate-900/10">
          <div>
            <h3 className="flex items-center gap-2 text-base font-extrabold text-slate-800 dark:text-slate-200">
              <ClipboardCheck size={16} className="text-indigo-500" />
              PM Category Checklist Index
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">Preventive maintenance routines mapped from configuration tables.</p>
          </div>
          
          {/* Frosted search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-52 rounded-xl border-slate-200 bg-white/60 pl-9 text-xs font-semibold shadow-sm placeholder:text-slate-400 backdrop-blur-md focus:border-indigo-400 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900/60"
            />
          </div>
        </div>

        {/* Categories checklist grids */}
        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSections.map((section, i) => (
            <ChecklistCard
              key={section.name}
              section={section.name}
              tasks={section.tasks}
              index={i}
              searchQuery={search}
              onTaskClick={setSelectedTask}
            />
          ))}
          {filteredSections.length === 0 && !isLoading && (
            <div className="col-span-full py-16 text-center text-sm font-semibold text-slate-400">
              {search ? "No preventive tasks match your filter." : "No preventive checklist tasks logged."}
            </div>
          )}
          {isLoading && (
            <div className="col-span-full flex items-center gap-3 py-16 justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Parsing check criteria...</span>
            </div>
          )}
        </div>
      </motion.section>

      <AnimatePresence>
        {selectedTask && (
          <ChecklistDetailModal
            task={selectedTask}
            isNew={!pmTasks?.find(t => t.no === selectedTask.no)}
            onClose={() => setSelectedTask(null)}
            onSave={(t) => handleSave(t, !pmTasks?.find(s => s.no === selectedTask.no))}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChecklistsView;
