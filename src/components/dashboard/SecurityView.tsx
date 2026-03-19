import { Badge } from "@/components/ui/badge";

const SecurityView = () => {
  const securityCompanies = [
    { name: "Hatari", sites: "Multiple regions including Eldoret, Bomet, Kisii", coverage: "Western & Rift Valley" },
    { name: "Serico", sites: "Multiple regions including Nairobi, Kisumu, Kakamega", coverage: "Central & Western" },
    { name: "N/A", sites: "Self-managed or IBS sites", coverage: "Various" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-xl text-foreground">Security Overview</h2>
        <p className="text-sm text-muted-foreground">Security companies and access management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {securityCompanies.map((company) => (
          <div key={company.name} className="bg-card rounded-md border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-foreground">{company.name}</h3>
              <Badge variant="outline" className="text-xs">{company.coverage}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{company.sites}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-md border border-border p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Electronic Lock Management</h3>
        <p className="text-sm text-muted-foreground">
          All sites are equipped with electronic locks identified by unique Lock IDs. Access is managed through the NOC Operations center with proper authorization protocols.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-border rounded-md p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Access Protocol</h4>
            <ul className="space-y-1.5 text-sm text-foreground">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" />Request through NOC</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" />Verification of identity</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" />Lock code generation</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" />Activity logging</li>
            </ul>
          </div>
          <div className="border border-border rounded-md p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Alert Types</h4>
            <ul className="space-y-1.5 text-sm text-foreground">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-destructive" />Electric Fence breach</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-destructive" />Main Gate Open alarm</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-warning" />Unauthorized access attempt</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-accent" />Scheduled patrol check</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityView;
