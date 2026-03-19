import { useState } from "react";
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
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Command Center", icon: LayoutDashboard },
  { id: "sites", label: "Site Inventory", icon: Radio },
  { id: "users", label: "Users & Teams", icon: Users },
  { id: "escalation", label: "Escalation Matrix", icon: AlertTriangle },
  { id: "checklists", label: "Operations Checklists", icon: FileText },
  { id: "security", label: "Security & Access", icon: Shield },
];

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  className?: string;
}

const Sidebar = ({ activeView, onViewChange, className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 100 : 280 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar z-50 flex flex-col border-r border-sidebar-border shadow-2xl",
        className
      )}
    >
      {/* Brand Logo */}
      <div className="flex items-center h-20 px-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-display font-extrabold text-lg">AD</span>
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-white font-display font-bold text-base tracking-tight leading-none uppercase">
                AlanDick
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-[0.2em] mt-1.5 uppercase">
                Enterprise
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-8 px-4 space-y-8 overflow-y-auto no-scrollbar">
        <div className="space-y-1.5">
          {!collapsed && (
            <p className="px-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-4">
              Main Menu
            </p>
          )}
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-semibold",
                  isActive
                    ? "bg-white/10 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                  />
                )}
                <Icon size={20} className={cn(
                  "transition-all duration-300",
                  isActive ? "text-primary scale-110" : "group-hover:scale-110 group-hover:text-white"
                )} />
                {!collapsed && (
                  <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-1.5">
          {!collapsed && (
            <p className="px-4 text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-4">
              Support
            </p>
          )}
          <button 
            onClick={() => onViewChange("settings")}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold group",
              activeView === "settings" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
          >
            <Settings size={20} className={cn("transition-transform duration-500", activeView === "settings" ? "text-primary rotate-45" : "group-hover:rotate-45")} />
            {!collapsed && <span>Settings</span>}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all text-sm font-semibold group">
            <HelpCircle size={20} />
            {!collapsed && <span>Help Center</span>}
          </button>
        </div>
      </div>

      {/* Footer / Toggle */}
      <div className="p-4 bg-sidebar-accent/30 border-t border-sidebar-border/50">
        {!collapsed && (
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all text-sm font-bold group mb-2">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2.5 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 transition-all"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

