import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  Copy,
  Check,
  ExternalLink,
  Info,
  Save,
  ShieldCheck,
  Terminal,
  Zap,
  Globe,
  Code2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

/* â”€â”€ syntax token colors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function colorize(code: string): React.ReactNode[] {
  const lines = code.split("\n");
  return lines.map((line, i) => {
    const tokens: React.ReactNode[] = [];
    let rest = line;

    // comments
    if (rest.trim().startsWith("//")) {
      tokens.push(<span key="c" className="text-slate-500/80 italic">{rest}</span>);
      return (
        <div key={i} className="min-h-[1.4em]">
          {tokens}
        </div>
      );
    }

    // simple keyword highlight
    const keywordRx = /\b(function|var|if|for|return|break|in|new)\b/g;
    const stringRx = /"[^"]*"|'[^']*'/g;
    const numRx = /\b\d+\b/g;

    // highlight strings first
    rest = rest
      .replace(stringRx, (m) => `__STR__${m}__STR__`)
      .replace(keywordRx, (m) => `__KW__${m}__KW__`)
      .replace(numRx, (m) => `__NUM__${m}__NUM__`);

    const parts = rest.split(/(__STR__|__KW__|__NUM__)/g);
    let mode: "normal" | "str" | "kw" | "num" = "normal";
    parts.forEach((p, j) => {
      if (p === "__STR__") { mode = mode === "str" ? "normal" : "str"; return; }
      if (p === "__KW__")  { mode = mode === "kw"  ? "normal" : "kw";  return; }
      if (p === "__NUM__") { mode = mode === "num" ? "normal" : "num"; return; }
      if (!p) return;
      if (mode === "str") tokens.push(<span key={j} className="text-emerald-400 font-medium">{p}</span>);
      else if (mode === "kw") tokens.push(<span key={j} className="text-pink-400 font-extrabold">{p}</span>);
      else if (mode === "num") tokens.push(<span key={j} className="text-amber-400 font-medium">{p}</span>);
      else tokens.push(<span key={j} className="text-slate-300">{p}</span>);
    });

    return (
      <div key={i} className="min-h-[1.4em]">
        {tokens}
      </div>
    );
  });
}

/* â”€â”€ DeploymentStep â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function DeploymentStep({
  step,
  icon: Icon,
  label,
  description,
  color,
  isLast,
}: {
  step: number;
  icon: any;
  label: string;
  description: string;
  color: string;
  isLast: boolean;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${color} shadow-md ring-4 ring-white/60 dark:ring-slate-800`}
        >
          <Icon size={16} className="text-white" />
        </div>
        {!isLast && (
          <div className="my-1.5 h-10 w-0.5 bg-gradient-to-b from-indigo-500/20 to-transparent dark:from-slate-800" />
        )}
      </div>
      <div className="pb-4 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Step {step}</span>
        </div>
        <p className="mt-0.5 text-sm font-extrabold text-slate-800 tracking-tight dark:text-slate-200">{label}</p>
        <p className="mt-0.5 text-xs font-semibold leading-relaxed text-slate-400 dark:text-slate-500">{description}</p>
      </div>
    </div>
  );
}

/* â”€â”€ main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const SettingsView = () => {
  const [scriptUrl, setScriptUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("google_apps_script_url");
    if (saved) setScriptUrl(saved);
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem("google_apps_script_url", scriptUrl);
      toast.success("Configuration Verified", { description: "Google Sheets integration endpoint saved." });
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2500);
    } catch {
      toast.error("Failed to write to local configuration storage.");
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

  const deploySteps = [
    { icon: Code2, label: "Open Google Apps Script Studio", description: "Navigate to script.google.com and open the designated macro project.", color: "bg-gradient-to-br from-indigo-500 to-purple-600" },
    { icon: Globe, label: "Configure & Deploy Web Application", description: "Click Deploy â†’ New deployment â†’ Web App â†’ Set Execute as Me & Access as Anyone.", color: "bg-gradient-to-br from-blue-500 to-indigo-600" },
    { icon: ExternalLink, label: "Establish Endpoint Connection Link", description: "Copy the deployment ID url and paste it into the Web App URL input.", color: "bg-gradient-to-br from-emerald-400 to-teal-600" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(appsScriptTemplate);
    setCopied(true);
    toast.success("Apps Script code copied", { description: "Ready to deploy into Google Script Editor." });
    setTimeout(() => setCopied(false), 2000);
  };

  const configured = Boolean(scriptUrl);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Integration Settings</h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Configure Google Sheets cloud synchronization, data write-backs, and server macro webhooks.
          </p>
        </div>
        <Badge
          variant="outline"
          className={`w-fit gap-1.5 text-[10px] font-black uppercase tracking-wider ${
            configured
              ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-450"
              : "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-450"
          }`}
        >
          {configured ? <ShieldCheck size={12} className="animate-pulse text-emerald-500" /> : <AlertCircle size={12} className="text-amber-500" />}
          {configured ? "Cloud Connection Online" : "Configuration Required"}
        </Badge>
      </div>

      {/* Integration Online Banner */}
      {configured && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3.5 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent px-5 py-4 shadow-sm backdrop-blur-xl"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">
            <Zap size={18} className="text-emerald-500 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Active Pipeline Node</p>
            <p className="mt-0.5 truncate text-xs font-bold text-slate-600 dark:text-slate-300">{scriptUrl}</p>
          </div>
          <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
        </motion.div>
      )}

      {/* Settings Panel split grid layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[400px_1fr]">
        
        {/* Left: Input connection configuration portal */}
        <motion.section
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-section"
        >
          {/* Section Header */}
          <div className="border-b border-secondary/15 bg-card/30 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
                <Cloud size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-tight text-foreground">Sheets Sync</h3>
                <p className="mt-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Macro deployment connector.</p>
              </div>
            </div>
          </div>

          {/* Form Area */}
          <div className="space-y-6 p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="scriptUrl" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Web Application Script URL
                </Label>
                {configured ? (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-600">
                    <CheckCircle2 size={10} /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-600">
                    <AlertCircle size={10} /> Pending
                  </span>
                )}
              </div>
              
              {/* Custom active input wrapper */}
              <div className="relative">
                <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="scriptUrl"
                  placeholder="https://script.google.com/macros/s/â€¦"
                  value={scriptUrl}
                  onChange={(e) => setScriptUrl(e.target.value)}
                  className="glass-input h-11 rounded-2xl pl-10 text-xs font-semibold"
                />
              </div>
            </div>

            {/* Config action trigger */}
            <Button
              onClick={handleSave}
              disabled={isSaving || justSaved}
              className={`relative w-full gap-2 h-11 overflow-hidden rounded-2xl text-xs font-black uppercase tracking-wider shadow-md transition-all duration-300 ${
                justSaved
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25"
              }`}
            >
              {justSaved ? (
                <>
                  <Check size={14} />
                  Verified & Saved
                </>
              ) : (
                <>
                  <Save size={14} />
                  {isSaving ? "Syncing..." : "Connect Pipeline"}
                </>
              )}
            </Button>

            {/* Information card details */}
            <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <Info size={16} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[11px] font-semibold leading-relaxed text-muted-foreground">
                Connection URL directs live updates securely back into your Google Sheets writeback template, ensuring absolute field-level operations persistence.
              </p>
            </div>

            {/* Corporate portals links list */}
            <div className="space-y-2 border-t border-secondary/15 pt-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Integration Resources</p>
              {[
                { label: "Google Apps Script Console", href: "https://script.google.com" },
                { label: "Operations Google Drive Sheet", href: "https://sheets.google.com" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-secondary/10 px-3 py-2.5 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <ExternalLink size={12} className="text-primary" />
                  {link.label}
                  <ArrowRight size={12} className="ml-auto text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Right: Apps Script IDE code window & steps block */}
        <motion.section
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-section"
        >
          {/* Header & Copy Control */}
          <div className="flex items-center justify-between border-b border-secondary/15 bg-card/30 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm">
                <Terminal size={15} className="text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold tracking-tight text-foreground">Google Code Template</h3>
                <p className="mt-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Copy and execute GS script.</p>
              </div>
            </div>
            
            {/* Click-responsive Copy action */}
            <Button
              variant="outline"
              size="sm"
              className={`gap-1.5 h-8.5 rounded-xl border px-3 text-xs font-bold transition-all duration-200 ${
                copied
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                  : "border-secondary/20 bg-card/50 hover:bg-primary/10 hover:text-primary"
              }`}
              onClick={handleCopy}
            >
              {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              {copied ? "Template Copied" : "Copy Code Template"}
            </Button>
          </div>

          {/* Deployment steps panels */}
          <div className="border-b border-secondary/15 bg-card/20 px-6 py-5">
            <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">GS Web App Deployment Instructions</p>
            <div className="pl-1">
              {deploySteps.map((step, i) => (
                <DeploymentStep
                  key={step.label}
                  step={i + 1}
                  icon={step.icon}
                  label={step.label}
                  description={step.description}
                  color={step.color}
                  isLast={i === deploySteps.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Premium IDE shell displaying custom colorization */}
          <div className="p-5">
            <div
              className="overflow-hidden rounded-2xl border border-slate-800 shadow-2xl"
              style={{ background: "linear-gradient(145deg, #0b0f19 0%, #151b2d 100%)" }}
            >
              {/* IDE window chrome header */}
              <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-3 bg-slate-950/40">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-500/80 shadow-md shadow-red-500/10" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 shadow-md shadow-amber-500/10" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 shadow-md shadow-emerald-500/10" />
                  <span className="ml-3 font-mono text-[10px] font-bold text-slate-500 tracking-wider">DOPOST.gs â€” Sheets Script Studio</span>
                </div>
                <Badge variant="outline" className="h-5 text-[9px] font-black border-slate-700 bg-slate-900/60 text-slate-400">GAS v8</Badge>
              </div>
              
              <div className="custom-scrollbar overflow-auto p-4" style={{ maxHeight: 300 }}>
                <pre className="font-mono text-[11px] leading-[1.65] tracking-wide">
                  <code>{colorize(appsScriptTemplate)}</code>
                </pre>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default SettingsView;
