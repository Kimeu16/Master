import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardView from "@/components/dashboard/DashboardView";
import SitesTable from "@/components/dashboard/SitesTable";
import UsersView from "@/components/dashboard/UsersView";
import EscalationView from "@/components/dashboard/EscalationView";
import ChecklistsView from "@/components/dashboard/ChecklistsView";
import SecurityView from "@/components/dashboard/SecurityView";
import SettingsView from "@/components/dashboard/SettingsView";
import GISMapView from "@/components/dashboard/GISMapView";
import { Activity, Bell, Menu, Search, ShieldCheck, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isNavCollapsed, setNavCollapsed] = useState(false);

  // Core Theme State & Logic
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) return stored;
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add("theme-transition");
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    const timer = setTimeout(() => {
      root.classList.remove("theme-transition");
    }, 450);

    localStorage.setItem("theme", theme);
    return () => clearTimeout(timer);
  }, [theme]);

  const viewMeta: Record<string, { title: string; description: string }> = {
    dashboard: {
      title: "Command Center",
      description: "A live, AI-assisted operating picture for network assets, site tasks, and risks.",
    },
    sites: {
      title: "Site Inventory",
      description: "Explore, audit, and coordinate over 40 technical fields per network node.",
    },
    gis: {
      title: "GIS Map",
      description: "Plot live Kenya network nodes using free Leaflet and CartoDB basemaps.",
    },
    users: {
      title: "Users & Teams",
      description: "Manage system access groups, regional ownership, and operational readiness.",
    },
    escalation: {
      title: "Escalation Matrix",
      description: "Automated routing procedures for critical faults, alarms, and work approvals.",
    },
    checklists: {
      title: "Preventive Checklists",
      description: "Field procedures, snags categories, and mandatory photographic evidence audits.",
    },
    security: {
      title: "Security Operations",
      description: "Lock governance, gate alarms, and guard patrol compliance monitoring.",
    },
    settings: {
      title: "System Integrations",
      description: "Deploy Apps Script web proxy and orchestrate direct Google Sheets sync.",
    },
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  const renderView = () => {
    return (
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.985 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {(() => {
          switch (activeView) {
            case "dashboard":
              return <DashboardView />;
            case "sites":
              return <SitesTable />;
            case "gis":
              return <GISMapView />;
            case "users":
              return <UsersView />;
            case "escalation":
              return <EscalationView />;
            case "checklists":
              return <ChecklistsView />;
            case "security":
              return <SecurityView />;
            case "settings":
              return <SettingsView />;
            default:
              return <DashboardView />;
          }
        })()}
      </motion.div>
    );
  };

  const currentView = viewMeta[activeView] || viewMeta.dashboard;

  return (
    <div className="relative min-h-screen overflow-x-hidden text-foreground selection:bg-primary/15">
      {/* Background radial spotlights */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-[5%] top-[10%] h-[600px] w-[600px] rounded-full bg-accent/3.5 blur-[130px]" />
      </div>

      {isSidebarOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-md lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        collapsed={isNavCollapsed}
        onCollapsedChange={setNavCollapsed}
        className={cn(
          "transition-transform duration-300 ease-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      />

      <div
        className={cn(
          "relative z-10 min-h-screen transition-[margin] duration-300 ease-out",
          isNavCollapsed ? "lg:ml-[100px]" : "lg:ml-[280px]"
        )}
      >
        <header className="sticky top-0 z-30 border-b border-slate-200/60 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-start gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="icon-button lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>
              <div className="min-w-0">
                <div className="mb-1.5 flex flex-wrap items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-success">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
                    </span>
                    Live Sync
                  </span>
                  <span>East Africa Operations</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-primary font-extrabold">North Star Command</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl font-display">
                  {currentView.title}
                </h1>
                <p className="mt-1 max-w-2xl text-xs font-semibold text-muted-foreground">{currentView.description}</p>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
              {/* Dynamic Interactive search input */}
              <div className="hidden min-w-[280px] items-center rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/40 px-3.5 py-2 shadow-sm transition-all duration-300 focus-within:border-primary/50 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-4 focus-within:ring-primary/10 lg:flex">
                <Search size={16} className="text-muted-foreground dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search console..."
                  className="ml-3 w-full border-none bg-transparent text-xs font-semibold text-foreground outline-none placeholder:text-muted-foreground/60 focus:ring-0"
                />
              </div>

              {/* Status banner with dynamic gradient track */}
              <div className="hidden items-center gap-2 rounded-lg border border-emerald-100 dark:border-emerald-950/30 bg-emerald-50/50 dark:bg-emerald-950/10 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-400 shadow-sm md:flex">
                <span className="relative flex h-2 w-2">
                  <span className="pulse-glow absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                99.1% Network SLA
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="icon-button relative overflow-hidden"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={theme}
                    initial={{ y: -20, rotate: 90, opacity: 0 }}
                    animate={{ y: 0, rotate: 0, opacity: 1 }}
                    exit={{ y: 20, rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="flex items-center justify-center"
                  >
                    {theme === "dark" ? (
                      <Sun size={17} className="text-amber-450" />
                    ) : (
                      <Moon size={17} className="text-slate-700" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </button>

              {/* Notification bubble */}
              <button className="icon-button relative hover:border-primary/20 hover:text-primary dark:hover:text-primary-foreground" aria-label="Notifications">
                <Bell size={17} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              </button>

              {/* User Manager tag */}
              <button className="flex items-center gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-1.5 pr-3.5 shadow-sm transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-primary to-indigo-600 text-xs font-black text-white shadow-md shadow-primary/10">
                  AD
                </div>
                <div className="hidden text-left xl:block">
                  <p className="text-[11px] font-black leading-none text-foreground">Administrator</p>
                  <p className="mt-1.5 flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    <ShieldCheck size={11} className="text-success" />
                    Ops Manager
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Index;
