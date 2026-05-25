import { useMemo, useState } from "react";
import { useUsers } from "@/hooks/useSites";
import { updateUser } from "@/lib/googleSheets";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Mail,
  Phone,
  Cloud,
  Eye,
  Users,
  Briefcase,
  Network,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  UserCheck,
  UserPlus,
  Sparkles,
} from "lucide-react";
import UserDetailModal from "./UserDetailModal";
import { User } from "@/types/site";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

/* ── avatar gradient palette ───────────────────────────────────────── */
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

/* ── access level colour map ────────────────────────────────────────── */
function accessStyle(level: string) {
  const l = (level || "").toLowerCase();
  if (l.includes("admin") || l.includes("level 1")) {
    return "bg-violet-500/10 text-violet-700 border-violet-500/20 dark:text-violet-300";
  }
  if (l.includes("level 2")) {
    return "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-300";
  }
  if (l.includes("level 3")) {
    return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300";
  }
  return "bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300";
}

/* ── onboarding badge ────────────────────────────────────────────────── */
function OnboardBadge({ status }: { status: string }) {
  const done = status === "Done";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        done
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      }`}
    >
      {done ? <CheckCircle2 size={10} className="animate-pulse" /> : <Clock size={10} className="animate-spin-slow" />}
      {status || "Pending"}
    </span>
  );
}

/* ── UserCard ─────────────────────────────────────────────────────────── */
function UserCard({ user, onClick }: { user: User; onClick: () => void }) {
  const gradient = getGradient(user.userName || "U");
  const initials = getInitials(user.userName || "U");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/40 bg-white/60 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_20px_40px_rgba(79,70,229,0.08)] dark:border-slate-800/60 dark:bg-slate-900/60"
    >
      {/* Fluent border overlay glow */}
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
      
      {/* Card Body */}
      <div className="flex items-start gap-4 mb-4">
        {/* Profile Avatar */}
        <div className="relative shrink-0">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-sm font-black text-white shadow-md ring-2 ring-white/80 dark:ring-slate-800`}
          >
            {initials}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900">
            <span className="absolute h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
          </span>
        </div>

        {/* User Identifiers */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold text-slate-800 tracking-tight dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {user.userName || "Unnamed"}
          </p>
          <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {user.department || "No department"}
          </p>
        </div>

        <ChevronRight
          size={16}
          className="mt-1 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-indigo-500"
        />
      </div>

      {/* Access Details / Roles snippet */}
      <div className="mb-4">
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 h-8 font-medium">
          {user.roles || "No detailed roles assigned."}
        </p>
      </div>

      {/* Communication Quick Actions */}
      <div className="mb-4 flex flex-col gap-1.5 border-t border-slate-100/50 pt-3 dark:border-slate-800/50">
        {user.email && (
          <a
            href={`mailto:${user.email}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 rounded-lg bg-indigo-50/30 px-2.5 py-2 text-[11px] font-bold text-slate-600 transition-all hover:bg-indigo-500/10 hover:text-indigo-600 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <Mail size={13} className="text-indigo-500" />
            <span className="truncate">{user.email}</span>
          </a>
        )}
        {user.phone && (
          <a
            href={`tel:${user.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 rounded-lg bg-emerald-50/30 px-2.5 py-2 text-[11px] font-bold text-slate-600 transition-all hover:bg-emerald-500/10 hover:text-emerald-600 dark:bg-slate-800/30 dark:text-slate-400 dark:hover:text-emerald-400"
          >
            <Phone size={13} className="text-emerald-500" />
            <span className="truncate">{user.phone}</span>
          </a>
        )}
      </div>

      {/* Footer Badges */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100/50 pt-3 dark:border-slate-800/50">
        {user.accessLevel && (
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${accessStyle(user.accessLevel)}`}>
            {user.accessLevel}
          </span>
        )}
        {user.region && (
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            {user.region}
          </span>
        )}
        <div className="ml-auto">
          <OnboardBadge status={user.reonOnboarding || "Pending"} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── UserTableRow ─────────────────────────────────────────────────────── */
function UserTableRow({
  user,
  index,
  type,
  onClick,
}: {
  user: User;
  index: number;
  type: "management" | "field";
  onClick: () => void;
}) {
  const gradient = getGradient(user.userName || "U");
  const initials = getInitials(user.userName || "U");

  return (
    <tr
      onClick={onClick}
      className="group cursor-pointer border-b border-slate-100/50 transition-colors hover:bg-indigo-50/20 dark:border-slate-800/50 dark:hover:bg-slate-800/25"
    >
      <td className="px-6 py-4 font-mono text-[11px] font-bold text-slate-400">{String(index + 1).padStart(2, "0")}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-xs font-black text-white shadow-sm`}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-extrabold text-slate-800 tracking-tight dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {user.userName || "Unnamed"}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">{user.department || "—"}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col gap-1">
          {user.email && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <Mail size={12} className="text-indigo-500" /> {user.email}
            </span>
          )}
          {user.phone && (
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
              <Phone size={12} className="text-emerald-500" /> {user.phone}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        {type === "management" ? (
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{user.department || "—"}</span>
        ) : (
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            {user.region || "Unassigned"}
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        {type === "management" ? (
          <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${accessStyle(user.accessLevel || "")}`}>
            {user.accessLevel || "N/A"}
          </span>
        ) : (
          <span className="text-sm font-black text-slate-800 dark:text-slate-200">{user.sites || "0"}</span>
        )}
      </td>
      <td className="px-6 py-4">
        <OnboardBadge status={user.reonOnboarding || "Pending"} />
      </td>
      {type === "management" && (
        <td className="max-w-[240px] truncate px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">{user.roles || "—"}</td>
      )}
      <td className="px-6 py-4 text-right">
        <button className="rounded-lg bg-slate-100 p-1.5 text-slate-400 opacity-0 transition-all hover:bg-indigo-50 hover:text-indigo-600 group-hover:opacity-100 dark:bg-slate-800 dark:hover:bg-slate-700">
          <Eye size={14} />
        </button>
      </td>
    </tr>
  );
}

/* ── main component ────────────────────────────────────────────────────── */
const UsersView = () => {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"cards" | "table">("cards");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const { data: remoteUsersData, isLoading, isError } = useUsers();

  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<User>>>(() => {
    const saved = localStorage.getItem("user_overrides");
    if (!saved) return {};
    try { return JSON.parse(saved); } catch { return {}; }
  });

  const usersData = useMemo(() => {
    const baseData = remoteUsersData || [];
    return baseData.map((user) => {
      const override = localOverrides[user.no];
      return override ? { ...user, ...override } : user;
    });
  }, [remoteUsersData, localOverrides]);

  const handleSaveUser = async (updatedUser: User) => {
    const newOverrides = { ...localOverrides, [updatedUser.no]: updatedUser };
    setLocalOverrides(newOverrides);
    localStorage.setItem("user_overrides", JSON.stringify(newOverrides));
    setIsSyncing(true);
    try {
      await updateUser(updatedUser.no, updatedUser);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      console.error("Cloud sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const management = useMemo(
    () => usersData.filter((u) => !u.department?.includes("TEAMs") && !u.department?.includes("Maintenance and Operations TEAMs")),
    [usersData]
  );
  const fieldTeams = useMemo(
    () => usersData.filter((u) => u.department?.includes("TEAMs") || u.department?.includes("Maintenance and Operations TEAMs")),
    [usersData]
  );

  const filtered = useMemo(() => {
    if (!search) return { management, fieldTeams };
    const s = search.toLowerCase();
    return {
      management: management.filter(
        (u) =>
          (u.userName || "").toLowerCase().includes(s) ||
          (u.email || "").toLowerCase().includes(s) ||
          (u.roles || "").toLowerCase().includes(s) ||
          (u.department || "").toLowerCase().includes(s)
      ),
      fieldTeams: fieldTeams.filter(
        (u) =>
          (u.userName || "").toLowerCase().includes(s) ||
          (u.email || "").toLowerCase().includes(s) ||
          (u.region || "").toLowerCase().includes(s) ||
          (u.department || "").toLowerCase().includes(s)
      ),
    };
  }, [search, management, fieldTeams]);

  const statItems = [
    { label: "Total Active Users", value: usersData.length, icon: Users, gradient: "from-indigo-500 via-purple-500 to-pink-500", bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400" },
    { label: "Management Staff", value: management.length, icon: Briefcase, gradient: "from-blue-500 via-cyan-500 to-teal-500", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
    { label: "Field Operators", value: fieldTeams.length, icon: Network, gradient: "from-emerald-400 via-teal-500 to-cyan-600", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
    { label: "REON Verification", value: usersData.filter((u) => u.reonOnboarding === "Done").length, icon: ShieldCheck, gradient: "from-amber-400 via-orange-500 to-rose-500", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  ];

  const renderSection = (title: string, desc: string, users: User[], type: "management" | "field") => (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-2xl border border-white/40 bg-white/40 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/40"
    >
      {/* section header */}
      <div className="flex flex-col gap-3 border-b border-slate-100/50 bg-gradient-to-r from-slate-50/50 to-white/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/50 dark:from-slate-900/30 dark:to-slate-900/10">
        <div>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight dark:text-slate-200">{title}</h3>
          <p className="mt-0.5 text-xs font-semibold text-slate-400">{desc}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/5 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
          <Sparkles size={11} className="animate-pulse" />
          {users.length} members
        </span>
      </div>

      {/* cards view */}
      {view === "cards" ? (
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {users.map((user, i) => (
              <UserCard key={`${user.no}-${i}`} user={user} onClick={() => setSelectedUser(user)} />
            ))}
          </AnimatePresence>
          {users.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm font-semibold text-slate-400">No users match the current search.</div>
          )}
        </div>
      ) : (
        /* table view */
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100/50 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-900/30">
                {["#", "Member Name", "Contact Matrix", type === "management" ? "Management Department" : "Primary Region", type === "management" ? "Access Clear" : "Assigned Sites", "REON", ...(type === "management" ? ["Roles Scope"] : []), ""].map((h) => (
                  <th key={h} className="whitespace-nowrap px-6 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <UserTableRow key={`${user.no}-${i}`} user={user} index={i} type={type} onClick={() => setSelectedUser(user)} />
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={type === "management" ? 8 : 7} className="py-16 text-center text-sm font-semibold text-slate-400">
                    No users match the current search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );

  return (
    <div className="space-y-6">
      {/* page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Team Directory</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">{usersData.length} field engineers & managers active within AlanDick OCC.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isSyncing && (
            <Badge variant="outline" className="gap-1.5 border-indigo-200 bg-indigo-50/80 text-indigo-600 dark:border-indigo-800/30 dark:bg-indigo-900/30 dark:text-indigo-400">
              <Cloud size={12} className="animate-bounce text-indigo-500" /> Active Sync
            </Badge>
          )}
          {isError && (
            <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800/30 dark:bg-rose-900/30 dark:text-rose-400">
              Local Mode Enabled
            </Badge>
          )}
          
          {/* Frosted View toggle controls */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100/60 p-1 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/60">
            {(["cards", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-all ${
                  view === v
                    ? "bg-white text-slate-800 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Elegant Frosted Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search team member…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-60 rounded-xl border-slate-200 bg-white/60 pl-9 text-xs font-semibold shadow-sm placeholder:text-slate-400 backdrop-blur-md focus:border-indigo-400 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900/60 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Stats blocks layout */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      {/* loading indicator */}
      {isLoading && (
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-5 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/40">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Retrieving operational team nodes...</span>
        </div>
      )}

      {/* directory sections */}
      <div className="space-y-6">
        {renderSection("Management & Operations Control", "Administrative owners, operations leaders, and regional coordinators.", filtered.management, "management")}
        {renderSection("Field Operations & Maintenance", "Regional field engineers, technicians, and specialized site coverage teams.", filtered.fieldTeams, "field")}
      </div>

      {/* User details modal overlay */}
      <AnimatePresence>
        {selectedUser && (
          <UserDetailModal
            user={usersData.find((u) => u.no === selectedUser.no) || selectedUser}
            onClose={() => setSelectedUser(null)}
            onSave={handleSaveUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersView;
