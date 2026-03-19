import { useEscalations } from "@/hooks/useSites";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

const EscalationView = () => {
  const { data: remoteEscalationData, isLoading, isError } = useEscalations();

  const escalationData = remoteEscalationData || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">Escalation Matrix</h2>
          <p className="text-sm text-muted-foreground">
            Trouble ticket escalation procedures for alarms and events
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold">Syncing...</span>
          </div>
        )}
      </div>

      <div className="bg-card rounded-md border border-border overflow-x-auto relative">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">#</th>
              <th className="text-left px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-wider min-w-[180px]">Alarm / Event</th>
              <th className="text-left px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Issue Type</th>
              <th className="text-left px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Level 1</th>
              <th className="text-left px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Level 2</th>
              <th className="text-left px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Level 3</th>
              <th className="text-left px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Method</th>
              <th className="text-left px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Notify</th>
              <th className="text-left px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Designator</th>
              <th className="text-left px-3 py-2.5 text-xs text-muted-foreground uppercase tracking-wider">Designee</th>
            </tr>
          </thead>
          <tbody className={isLoading ? "opacity-50" : ""}>
            {escalationData.map((entry, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                <td className="px-3 py-3 text-muted-foreground font-mono text-xs">{entry.no}</td>
                <td className="px-3 py-3 font-medium text-foreground">
                  {entry.alarm !== "N/A" ? entry.alarm : entry.event}
                  {entry.alarm !== "N/A" && (
                    <Badge className="ml-2 bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Alarm</Badge>
                  )}
                  {entry.event && entry.alarm === "N/A" && (
                    <Badge className="ml-2 bg-accent/10 text-accent border-accent/20 text-[10px]">Event</Badge>
                  )}
                </td>
                <td className="px-3 py-3">
                  <Badge variant="outline" className="text-xs">{entry.issueType}</Badge>
                </td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{entry.level1}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{entry.level2}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{entry.level3}</td>
                <td className="px-3 py-3">
                  <Badge className={entry.method === "Auto" ? "bg-accent/10 text-accent border-accent/20 text-xs" : "bg-warning/10 text-warning border-warning/20 text-xs"}>
                    {entry.method}
                  </Badge>
                </td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{entry.notificationTime}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{entry.designator}</td>
                <td className="px-3 py-3 text-muted-foreground text-xs">{entry.scopeDesignee}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {isError && (
          <div className="p-8 text-center bg-destructive/5">
            <p className="text-sm text-destructive font-bold">Failed to sync with live escalation data. Showing local fallback.</p>
          </div>
        )}
      </div>

      {/* Approval Workflow */}
      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Work Order Approval Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Approval Chain", items: ["L1: NOC", "L2: Asset Security", "L3: Site Operations"] },
            { title: "Review Chain", items: ["L1: NOC", "L2: Asset Security", "L3: Site Operations"] },
            { title: "Notification Timing", items: ["Auto: 5 Minutes", "Manual: 2 Hours", "Escalation: 2-4 Hrs"] },
          ].map((section) => (
            <div key={section.title} className="border border-border rounded-md p-4">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="text-sm text-foreground flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EscalationView;
