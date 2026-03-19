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
      bg: "bg-primary/5",
      icon: "text-primary",
      glow: "shadow-primary/20",
      border: "hover:border-primary/30",
    },
    accent: {
      bg: "bg-accent/5",
      icon: "text-accent",
      glow: "shadow-accent/20",
      border: "hover:border-accent/30",
    },
    success: {
      bg: "bg-success/5",
      icon: "text-success",
      glow: "shadow-success/20",
      border: "hover:border-success/30",
    },
    warning: {
      bg: "bg-warning/5",
      icon: "text-warning",
      glow: "shadow-warning/20",
      border: "hover:border-warning/30",
    },
    info: {
      bg: "bg-info/5",
      icon: "text-info",
      glow: "shadow-info/20",
      border: "hover:border-info/30",
    },
  };

  const style = variants[variant];

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "premium-card flex flex-col p-6 overflow-hidden relative group",
        style.border,
        className
      )}
    >
      {/* Decorative background pulse */}
      <div className={cn(
        "absolute -right-8 -top-8 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-500",
        style.bg.replace("bg-", "bg-")
      )} />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-display font-extrabold text-foreground tracking-tight">{value}</h3>
          </div>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:rotate-6",
          style.bg,
          style.icon,
          style.glow
        )}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 relative z-10">
        {trendValue !== undefined && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold",
            trendValue >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          )}>
            {trendValue >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trendValue)}%
          </div>
        )}
        {trend && (
          <p className="text-xs font-medium text-muted-foreground/80">{trend}</p>
        )}
      </div>

      {/* Subtle indicator bar */}
      <div className={cn(
        "absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500",
        style.bg.replace("bg-", "bg-")
      )} />
    </motion.div>
  );
};

export default StatsCard;

