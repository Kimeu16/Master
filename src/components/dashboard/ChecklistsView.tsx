import { useMemo } from "react";
import { usePMChecklist } from "@/hooks/useSites";

const ChecklistsView = () => {
  const { data: pmTasks, isLoading } = usePMChecklist();

  const pmChecklistSections = useMemo(() => {
    if (!pmTasks) return [];
    
    // Group tasks by section
    const grouped = pmTasks.reduce((acc, task) => {
      if (!acc[task.section]) {
        acc[task.section] = [];
      }
      acc[task.section].push(task.field);
      return acc;
    }, {} as Record<string, string[]>);

    return Object.entries(grouped).map(([name, fields]) => ({
      name,
      fields,
    }));
  }, [pmTasks]);

  const checklists = [
    {
      title: "PM Checklist (Preventive Maintenance)",
      isLive: true,
      sections: pmChecklistSections,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">Checklists</h2>
          <p className="text-sm text-muted-foreground">Work order checklists for PM, CM, and Fueling operations</p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full">
            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-bold">Syncing...</span>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {checklists.map((checklist) => (
          <div key={checklist.title} className="bg-card rounded-md border border-border">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">{checklist.title}</h3>
              {checklist.isLive && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-success/10 text-success rounded-full border border-success/20">LIVE</span>
              )}
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checklist.sections.map((section) => (
                <div key={section.name} className="border border-border rounded-md p-4 bg-background/30">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 border-b border-border/50 pb-2">{section.name}</h4>
                  <ul className="space-y-1.5">
                    {section.fields.map((field) => (
                      <li key={field} className="text-[13px] text-foreground flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent/50 mt-1 flex-shrink-0" />
                        {field}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistsView;

