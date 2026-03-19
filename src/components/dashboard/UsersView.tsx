import { useMemo, useState } from "react";
import { useUsers } from "@/hooks/useSites";
import { updateUser } from "@/lib/googleSheets";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Mail, Phone, Cloud, Eye } from "lucide-react";
import UserDetailModal from "./UserDetailModal";
import { User } from "@/types/site";
import { useQueryClient } from "@tanstack/react-query";

const UsersView = () => {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  const { data: remoteUsersData, isLoading, isError } = useUsers();

  const [localOverrides, setLocalOverrides] = useState<Record<string, Partial<User>>>(() => {
    const saved = localStorage.getItem("user_overrides");
    return saved ? JSON.parse(saved) : {};
  });

  const usersData = useMemo(() => {
    const baseData = remoteUsersData || [];
    return baseData.map(user => {
      const override = localOverrides[user.no];
      return override ? { ...user, ...override } : user;
    });
  }, [remoteUsersData, localOverrides]);

  const handleSaveUser = async (updatedUser: User) => {
    const newOverrides = {
      ...localOverrides,
      [updatedUser.no]: updatedUser
    };
    setLocalOverrides(newOverrides);
    localStorage.setItem("user_overrides", JSON.stringify(newOverrides));

    setIsSyncing(true);
    try {
      await updateUser(updatedUser.no, updatedUser);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (err) {
      console.error("Cloud sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const management = useMemo(
    () => usersData.filter((u) => !u.department?.includes("TEAMs") && !u.department?.includes("Maintenance and Operations TEAMs")),
    [usersData]
  );
  const fieldTeams = useMemo(
    () => usersData.filter((u) => u.department?.includes("TEAMs") || u.department?.includes("Maintenance and Operations TEAMs")),
    [usersData]
  );

  const filtered = useMemo(() => {
    if (!search) return { management, fieldTeams };
    const s = search.toLowerCase();
    return {
      management: management.filter(
        (u) => (u.userName || "").toLowerCase().includes(s) || (u.email || "").toLowerCase().includes(s) || (u.roles || "").toLowerCase().includes(s)
      ),
      fieldTeams: fieldTeams.filter(
        (u) => (u.userName || "").toLowerCase().includes(s) || (u.email || "").toLowerCase().includes(s) || (u.region || "").toLowerCase().includes(s)
      ),
    };
  }, [search, management, fieldTeams]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="font-display font-bold text-xl text-foreground">Users & Teams</h2>
          <p className="text-sm text-muted-foreground">{usersData.length} users across all departments</p>
        </div>
        <div className="flex items-center gap-3">
          {isSyncing && (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 animate-pulse gap-1.5 px-3">
              <Cloud size={12} className="animate-bounce" /> Syncing...
            </Badge>
          )}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm w-56 bg-card"
            />
          </div>
        </div>
      </div>

      {/* Management */}
      <div className="bg-card rounded-md border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-semibold text-foreground text-sm">Management & Office Support</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">#</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">Department</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">Access</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">REON</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.management.map((user, i) => (
                <tr 
                  key={i} 
                  onClick={() => setSelectedUser(user)}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer group"
                >
                  <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{user.no?.replace(".0", "")}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground">{user.userName}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-accent flex items-center gap-1"><Mail size={10} />{user.email}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={10} />{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground">{user.department}</td>
                  <td className="px-3 py-2.5">
                    <Badge variant="outline" className="text-xs">{user.accessLevel}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge className={user.reonOnboarding === "Done" ? "bg-success/10 text-success border-success/20 text-xs" : "bg-warning/10 text-warning border-warning/20 text-xs"}>
                      {user.reonOnboarding}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-muted-foreground max-w-[200px] truncate">{user.roles}</td>
                  <td className="px-3 py-2.5">
                    <button className="p-1.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Field Teams */}
      <div className="bg-card rounded-md border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-semibold text-foreground text-sm">Field Teams & Technicians</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">#</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">Contact</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">Region</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">Sites</th>
                <th className="text-left px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">REON</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.fieldTeams.map((user, i) => (
                <tr 
                  key={i} 
                  onClick={() => setSelectedUser(user)}
                  className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer group"
                >
                  <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">{user.no?.replace(".0", "")}</td>
                  <td className="px-3 py-2.5 font-medium text-foreground">{user.userName}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-accent flex items-center gap-1"><Mail size={10} />{user.email}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={10} />{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">{user.region}</Badge>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground text-sm font-medium">{user.sites}</td>
                  <td className="px-3 py-2.5">
                    <Badge className={user.reonOnboarding === "Done" ? "bg-success/10 text-success border-success/20 text-xs" : "bg-warning/10 text-warning border-warning/20 text-xs"}>
                      {user.reonOnboarding}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <button className="p-1.5 opacity-0 group-hover:opacity-100 text-primary transition-opacity">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailModal
          user={usersData.find(u => u.no === selectedUser.no) || selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {(isLoading) && (
        <div className="fixed inset-0 z-50 bg-background/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-background border border-border p-4 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold">Updating Teams...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView;
