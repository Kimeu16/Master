import type { ElementType } from "react";
import { motion } from "framer-motion";
import {
  Radio,
  Users,
  AlertTriangle,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  LogOut,
  Settings,
  HelpCircle,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  label: string;
  icon: ElementType;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
  { id: "sites", label: "Site Inventory", icon: Radio },
  { id: "users", label: "Users & Teams", icon: Users },
  { id: "escalation", label: "Escalation Matrix", icon: AlertTriangle },
  { id: "checklists", label: "Checklists & PM", icon: FileText },
  { id: "security", label: "Security & Locks", icon: Shield },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  className?: string;
}

const Sidebar = ({ activeView, onViewChange, collapsed, onCollapsedChange, className }: SidebarProps) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 90 : 280 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-200/50 dark:border-slate-800/60 bg-white/75 dark:bg-slate-950/70 shadow-[4px_0_30px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_30px_rgba(0,0,0,0.2)] backdrop-blur-2xl",
        className
      )}
    >
      {/* Brand logo block */}
      <div className="flex h-20 items-center border-b border-slate-100/80 dark:border-slate-800/60 px-5">
        <div className="flex min-w-0 items-center gap-3 overflow-hidden">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-sm font-black text-white shadow-lg shadow-primary/10">
            AD
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="min-w-0"
            >
              <span className="block truncate text-xs font-black uppercase tracking-[0.16em] text-foreground">
                AlanDick
              </span>
              <span className="mt-1 block text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Ops Console
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Main navigation list */}
      <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto px-3.5 py-6">
        <div>
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Workspace
            </p>
          )}
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "group relative flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-xs font-bold transition-all duration-200",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-primary/10 dark:bg-primary/15 text-primary shadow-sm"
                      : "text-muted-foreground/80 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 hover:text-foreground dark:hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeSideBarPill"
                      className="absolute left-0 h-5 w-1 rounded-r-full bg-primary"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <Icon
                    size={17}
                    className={cn(
                      "flex-shrink-0 transition-colors duration-200",
                      isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  {!collapsed && <span className="min-w-0 flex-1 truncate text-left">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Support items list */}
        <div>
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              Support
            </p>
          )}
          <div className="space-y-1.5">
            <button
              onClick={() => onViewChange("settings")}
              title={collapsed ? "Settings" : undefined}
              className={cn(
                "group relative flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-xs font-bold transition-all duration-200",
                collapsed && "justify-center px-0",
                activeView === "settings"
                  ? "bg-primary/10 dark:bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground/80 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 hover:text-foreground dark:hover:text-white"
              )}
            >
              {activeView === "settings" && (
                <motion.span
                  layoutId="activeSideBarPill"
                  className="absolute left-0 h-5 w-1 rounded-r-full bg-primary"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <Settings
                size={17}
                className={cn(
                  "flex-shrink-0 transition-colors duration-200",
                  activeView === "settings" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {!collapsed && <span>Settings</span>}
            </button>
            <button
              title={collapsed ? "Help Center" : undefined}
              className={cn(
                 "group flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-xs font-bold text-muted-foreground/80 transition-all duration-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 hover:text-foreground dark:hover:text-white",
                collapsed && "justify-center px-0"
              )}
            >
              <HelpCircle size={17} className="flex-shrink-0" />
              {!collapsed && <span>Help Center</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Footer block */}
      <div className="border-t border-slate-100/80 dark:border-slate-800/60 p-4">
        {!collapsed && (
          <div className="mb-4 rounded-xl border border-emerald-100 dark:border-emerald-950/30 bg-emerald-50/40 dark:bg-emerald-950/10 p-3 shadow-inner">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="pulse-glow absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600"></span>
              </span>
              Systems Operational
            </div>
            <p className="mt-1 text-[9px] font-bold leading-relaxed text-muted-foreground/80 dark:text-slate-400">
              Sync nodes and mobile checklist engines are online.
            </p>
          </div>
        )}
        {!collapsed && (
          <button className="mb-2.5 flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-xs font-black text-destructive transition-all duration-200 hover:bg-destructive/10">
            <LogOut size={17} className="flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        )}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl py-2 text-muted-foreground/60 transition-all duration-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 hover:text-foreground dark:hover:text-white active:scale-[0.95]"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
