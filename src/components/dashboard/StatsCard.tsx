import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendValue?: number;
  variant?: "default" | "accent" | "success" | "warning" | "info";
  className?: string;
}

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, variant = "default", className }: StatsCardProps) => {
  const variants = {
    default: {
      bg: "bg-primary/8 border-primary/20",
      icon: "text-primary",
      border: "hover:border-primary/25",
      bar: "from-primary to-indigo-500",
      glow: "rgba(37,99,235,0.04)",
    },
    accent: {
      bg: "bg-accent/8 border-accent/20",
      icon: "text-accent",
      border: "hover:border-accent/25",
      bar: "from-accent to-teal-600",
      glow: "rgba(13,148,136,0.04)",
    },
    success: {
      bg: "bg-success/8 border-success/20",
      icon: "text-success",
      border: "hover:border-success/25",
      bar: "from-success to-emerald-600",
      glow: "rgba(16,185,129,0.04)",
    },
    warning: {
      bg: "bg-warning/8 border-warning/20",
      icon: "text-warning",
      border: "hover:border-warning/25",
      bar: "from-warning to-amber-500",
      glow: "rgba(245,158,11,0.04)",
    },
    info: {
      bg: "bg-info/8 border-info/20",
      icon: "text-info",
      border: "hover:border-info/25",
      bar: "from-info to-sky-500",
      glow: "rgba(14,165,233,0.04)",
    },
  };

  const style = variants[variant];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.06)" }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      style={{
        background: `radial-gradient(circle at 80% 20%, ${style.glow} 0%, #ffffff 80%)`
      } as React.CSSProperties}
      className={cn(
        "premium-card group relative flex min-h-[160px] flex-col overflow-hidden p-5 border border-slate-100",
        style.border,
        className
      )}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1.5">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground/70">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black tracking-tight text-foreground font-display leading-none">{value}</h3>
          </div>
        </div>
        <div className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105 border",
          style.bg,
          style.icon
        )}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2.5 relative z-10 pt-4">
        {trendValue !== undefined && (
          <div className={cn(
            "flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-black",
            trendValue >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {trendValue >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trendValue)}%
          </div>
        )}
        {trend && (
          <p className="text-[11px] font-semibold text-muted-foreground/80">{trend}</p>
        )}
      </div>

      {/* Modern Fluent expanding gradient indicator bar */}
      <div className={cn(
        "absolute bottom-0 left-0 h-1 w-12 transition-all duration-300 ease-out group-hover:w-full bg-gradient-to-r",
        style.bar
      )} />
    </motion.div>
  );
};

export default StatsCard;
