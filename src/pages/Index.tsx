import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardView from "@/components/dashboard/DashboardView";
import SitesTable from "@/components/dashboard/SitesTable";
import UsersView from "@/components/dashboard/UsersView";
import EscalationView from "@/components/dashboard/EscalationView";
import ChecklistsView from "@/components/dashboard/ChecklistsView";
import SecurityView from "@/components/dashboard/SecurityView";
import SettingsView from "@/components/dashboard/SettingsView";
import { Bell, Search, Menu } from "lucide-react";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const viewTitles: Record<string, string> = {
    dashboard: "Command Center",
    sites: "Site Inventory",
    users: "Users & Teams",
    escalation: "Escalation Matrix",
    checklists: "Checklists",
    security: "Security",
    settings: "System Settings",
  };

  const renderView = () => {
    return (
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {(() => {
          switch (activeView) {
            case "dashboard": return <DashboardView />;
            case "sites": return <SitesTable />;
            case "users": return <UsersView />;
            case "escalation": return <EscalationView />;
            case "checklists": return <ChecklistsView />;
            case "security": return <SecurityView />;
            case "settings": return <SettingsView />;
            default: return <DashboardView />;
          }
        })()}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        className={!isSidebarOpen ? "-translate-x-full" : "translate-x-0"}
      />

      {/* Main Content */}
      <div className={`transition-all duration-500 ease-[0.16,1,0.3,1] ${isSidebarOpen ? "ml-[280px]" : "ml-0"}`}>
        {/* Top Bar */}
        <header className="h-20 glass sticky top-0 z-40 px-8 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-200 border border-transparent hover:border-border"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground leading-tight tracking-tight">
                {viewTitles[activeView]}
              </h1>
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground/80 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                AlanDick East Africa Operations
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-secondary/50 border border-border/50 rounded-xl px-4 py-2 hover:bg-secondary/80 transition-all group focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40">
              <Search size={16} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search command center..." 
                className="bg-transparent border-none focus:ring-0 text-sm ml-3 w-48 placeholder:text-muted-foreground/60"
              />
            </div>
            
            <div className="flex items-center gap-2 border-l border-border/50 pl-4">
              <button className="p-2.5 rounded-xl hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all relative group border border-transparent hover:border-border">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-destructive ring-4 ring-background" />
              </button>
              
              <button className="flex items-center gap-3 p-1.5 pr-4 rounded-xl hover:bg-secondary/80 transition-all border border-transparent hover:border-border">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                  <span className="text-white font-display font-bold text-xs">AD</span>
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold leading-none">Administrator</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Ops Manager</p>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            {renderView()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Index;

