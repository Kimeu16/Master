import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Save, Cloud, Info, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const SettingsView = () => {
  const [scriptUrl, setScriptUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("google_apps_script_url");
    if (saved) setScriptUrl(saved);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem("google_apps_script_url", scriptUrl);
      toast.success("Settings saved successfully!", {
        description: "Cloud sync is now configured."
      });
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const appsScriptTemplate = `function doPost(e) {
  var params = JSON.parse(e.postData.contents);
  var action = params.action;
  var sheetName = params.sheetName;
  var data = params.data;
  var idKey = params.idKey;
  var idValue = String(params.idValue).trim().replace(".0", "");
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) return ContentService.createTextOutput("Sheet not found");
  
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0].map(function(h) { return String(h).trim(); });
  var idColIndex = headers.indexOf(idKey.trim());
  
  if (idColIndex === -1) return ContentService.createTextOutput("ID column not found: " + idKey);
  
  if (action === "update") {
    var updatedCount = 0;
    for (var i = 1; i < rows.length; i++) {
      var rowId = String(rows[i][idColIndex]).trim().replace(".0", "");
      if (rowId === idValue) {
        for (var key in data) {
          var colIndex = headers.indexOf(key.trim());
          if (colIndex !== -1) {
            sheet.getRange(i + 1, colIndex + 1).setValue(data[key]);
          }
        }
        updatedCount++;
        break;
      }
    }
    return ContentService.createTextOutput(updatedCount > 0 ? "Success" : "Record not found");
  }
}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-1">
        <h2 className="font-display font-bold text-3xl text-foreground tracking-tight">System Settings</h2>
        <p className="text-muted-foreground">Configure your Google Sheets integration and cloud sync preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-primary/5 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Cloud size={24} />
              </div>
              <div>
                <CardTitle>Google Sheets Sync</CardTitle>
                <CardDescription>Enter your deployed Google Apps Script URL to enable real-time updates.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="scriptUrl" className="text-sm font-bold">Apps Script Web App URL</Label>
                {scriptUrl ? (
                  <Badge variant="outline" className="bg-success/5 text-success border-success/20 gap-1.5">
                    <ShieldCheck size={12} /> Configured
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-warning/5 text-warning border-warning/20 gap-1.5">
                    <AlertCircle size={12} /> Pending Setup
                  </Badge>
                )}
              </div>
              <div className="flex gap-3">
                <Input
                  id="scriptUrl"
                  placeholder="https://script.google.com/macros/s/..."
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  className="bg-background/50 border-border/50 focus:border-primary/50"
                />
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-6"
                >
                  <Save size={16} className="mr-2" />
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 px-1 font-medium">
                <Info size={12} className="text-primary" />
                This URL connects your app to the "Google Sheets Proxy" for write operations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <ExternalLink size={16} className="text-primary" />
                  Setup Instructions
                </h4>
              </div>
              <div className="space-y-3">
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  1. Open your <strong>Google Sheet</strong>.<br />
                  2. Go to <strong>Extensions &gt; Apps Script</strong>.<br />
                  3. Paste the code below and <strong>Save</strong>.<br />
                  4. Click <strong>Deploy &gt; New Deployment</strong>.<br />
                  5. Select <strong>Web App</strong>, set "Who has access" to <strong>Anyone</strong>.<br />
                  6. Click <strong>Deploy</strong> and copy the URL provided.
                </p>
                <div className="relative group">
                  <pre className="p-4 bg-background border border-border/50 rounded-xl text-[11px] font-mono text-muted-foreground overflow-x-auto max-h-[300px] custom-scrollbar">
                    {appsScriptTemplate}
                  </pre>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="absolute top-3 right-3 text-[10px] h-7 bg-background/80 hover:bg-primary hover:text-white backdrop-blur-md"
                    onClick={() => {
                        navigator.clipboard.writeText(appsScriptTemplate);
                        toast.success("Code copied to clipboard!");
                    }}
                  >
                    Copy Code
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsView;
