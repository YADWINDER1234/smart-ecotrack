import { useEffect, useState } from "react";
import RoleSidebar from "../components/RoleSidebar";
import { Navbar } from "../components/layout/Navbar";
import { httpClient } from "../api/httpClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldAlert, Fingerprint, Calendar, FileJson2 } from "lucide-react";

export function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await httpClient.get("/dashboard/audit");
        if (!cancelled) setLogs(data.logs);
      } catch (err) {
        // ignore
        console.error("Failed to load audit logs", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 md:px-8">
        <RoleSidebar />
        
        <div className="flex-1 space-y-6">
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="border-b border-border/50 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <ShieldAlert className="h-6 w-6 text-violet-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Security Audit Logs</CardTitle>
                </div>
              </div>
              <CardDescription className="text-base">
                An immutable record of critical administrative actions and system overrides.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center p-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mr-3" />
                  <span>Loading audit trail...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground">
                  <Fingerprint className="h-10 w-10 mb-4 text-muted-foreground/30" />
                  <p>No audit logs recorded yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {logs.map((l: any) => (
                    <div key={l.id} className="p-4 sm:p-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row gap-4 sm:items-start group animate-in fade-in duration-300">
                      
                      {/* Left: Action Icon / Badge */}
                      <div className="hidden sm:flex shrink-0 h-10 w-10 rounded-full bg-violet-500/10 border border-violet-500/20 items-center justify-center text-violet-600">
                        <Fingerprint className="h-4 w-4" />
                      </div>

                      {/* Right: Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-2">
                          <h4 className="font-semibold text-foreground break-words">{l.action.replace(/_/g, " ")}</h4>
                          <span className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 shrink-0 bg-muted px-2 py-1 rounded-md">
                            <Calendar className="h-3 w-3" />
                            {new Date(l.created_at).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground/80">Entity:</span>
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-sm text-xs font-semibold uppercase tracking-wider">{l.entity_type}</span>
                          <span className="text-foreground/60">•</span>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded border border-border/50 break-all">{l.entity_id}</code>
                        </div>

                        {l.metadata_json && Object.keys(l.metadata_json).length > 0 && (
                          <div className="mt-3 bg-card border border-border/60 rounded-lg p-3 overflow-x-auto relative group-hover:border-violet-500/30 transition-colors">
                            <FileJson2 className="h-3 w-3 absolute top-3 right-3 text-muted-foreground/40" />
                            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap word-break">
                              {JSON.stringify(l.metadata_json, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
