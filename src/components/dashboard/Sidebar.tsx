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
  Map,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

type NavItem = {
  id: string;
  label: string;
  icon: ElementType;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
  { id: "sites", label: "Site Inventory", icon: Radio },
  { id: "gis", label: "GIS Map", icon: Map },
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
  const { role, setRole, signOut } = useAuth();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 90 : 280 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "sidebar-panel fixed left-0 top-0 z-50 flex h-screen flex-col text-white",
        className
      )}
    >
      {/* Brand logo block */}
      <div className="flex h-20 items-center border-b border-white/10 px-5">
        <div className="flex min-w-0 items-center gap-3 overflow-hidden">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 text-sm font-black text-white shadow-lg backdrop-blur-md border border-white/20">
            AD
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="min-w-0"
            >
              <span className="block truncate text-xs font-black uppercase tracking-[0.16em] text-white">
                AlanDick
              </span>
              <span className="mt-1 block text-[10px] font-bold text-white/50 uppercase tracking-wider">
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
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
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
                      ? "border border-white/15 bg-white/12 text-white shadow-sm"
                      : "text-white/60 hover:bg-white/8 hover:text-white"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeSideBarPill"
                      className="absolute left-0 h-5 w-1 rounded-r-full bg-blue-400"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  <Icon
                    size={17}
                    className={cn(
                      "flex-shrink-0 transition-colors duration-200",
                      isActive ? "text-blue-400" : "text-white/50 group-hover:text-white"
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
            <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
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
                  ? "border border-white/15 bg-white/12 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/8 hover:text-white"
              )}
            >
              {activeView === "settings" && (
                <motion.span
                  layoutId="activeSideBarPill"
                  className="absolute left-0 h-5 w-1 rounded-r-full bg-blue-400"
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              )}
              <Settings
                size={17}
                className={cn(
                  "flex-shrink-0 transition-colors duration-200",
                  activeView === "settings" ? "text-blue-400" : "text-white/50 group-hover:text-white"
                )}
              />
              {!collapsed && <span>Settings</span>}
            </button>
            <button
              title={collapsed ? "Help Center" : undefined}
              className={cn(
                "group flex w-full items-center gap-3.5 rounded-xl px-3 py-3 text-xs font-bold text-white/60 transition-all duration-200 hover:bg-white/8 hover:text-white",
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
      <div className="border-t border-white/10 p-4">

        {!collapsed && (
          <button onClick={signOut} className="mb-2.5 flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-xs font-black text-white/60 transition-all duration-200 hover:bg-white/8 hover:text-white">
            <LogOut size={17} className="flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        )}
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl py-2 text-white/50 transition-all duration-200 hover:bg-white/8 hover:text-white active:scale-[0.95]"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
