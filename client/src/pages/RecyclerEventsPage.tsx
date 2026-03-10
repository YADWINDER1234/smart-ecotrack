import { useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import * as recyclingApi from "../api/recyclingApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, Search, Activity, Box, ClipboardList, CheckCircle2, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecyclerEventsPage() {
  const [qrId, setQrId] = useState("");
  const [notes, setNotes] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const d = await recyclingApi.getEvents(qrId);
      setData(d);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  const handleAction = async (actionFn: () => Promise<any>) => {
    setActionLoading(true);
    setError(null);
    try {
      await actionFn();
      await refresh();
      setNotes("");
      setEvidenceUrl("");
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-background">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Event Management</CardTitle>
              </div>
              <CardDescription className="text-base">
                Lookup a QR token and securely log lifecycle transitions in the ecosystem.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-sm font-medium text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="qrId" className="sr-only">QR ID</Label>
                  <Input 
                    id="qrId"
                    placeholder="Enter QR Token ID..." 
                    value={qrId} 
                    onChange={(e) => setQrId(e.target.value)} 
                    className="h-11 bg-muted/30"
                  />
                </div>
                <Button 
                  className="h-11 px-8" 
                  disabled={loading || !qrId} 
                  onClick={refresh}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-5 w-5" />
                  )}
                  Lookup
                </Button>
              </div>
            </CardContent>
          </Card>

          {data && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-muted-foreground" />
                      Log Lifecycle Action
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="notes">Action Notes</Label>
                        <Input 
                          id="notes"
                          placeholder="Condition of product, internal tracking, etc." 
                          value={notes} 
                          onChange={(e) => setNotes(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="evidence">Evidence URL <span className="text-muted-foreground font-normal">(optional, required for finalize)</span></Label>
                        <Input 
                          id="evidence"
                          placeholder="https://..." 
                          value={evidenceUrl} 
                          onChange={(e) => setEvidenceUrl(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <Button
                        variant="secondary"
                        disabled={actionLoading}
                        onClick={() => handleAction(() => recyclingApi.confirmReceived({ qr_id: qrId, notes }))}
                        className="w-full"
                      >
                        Mark RECEIVED
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={actionLoading}
                        onClick={() => handleAction(() => recyclingApi.logSorted({ qr_id: qrId, notes }))}
                        className="w-full"
                      >
                        Mark SORTED
                      </Button>
                      <Button
                        variant="default"
                        disabled={actionLoading}
                        onClick={() => handleAction(() => recyclingApi.finalize({
                          qr_id: qrId,
                          notes,
                          evidence_url: evidenceUrl || undefined
                        }))}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Finalize
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground text-center">
                      Invalid transitions will be rejected by the state machine based on the current logical state.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4 border-b border-border/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="h-5 w-5 text-muted-foreground" />
                      Event Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {(data.events ?? []).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">No events recorded yet.</p>
                      ) : (
                        <div className="relative border-l border-border/60 ml-3 pl-6 space-y-6">
                          {(data.events ?? []).map((e: any) => (
                            <div key={e.id} className="relative">
                              <span className="absolute -left-[31px] bg-background border border-primary/50 text-primary rounded-full w-4 h-4 mt-1 ring-4 ring-background" />
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                                <span className="font-semibold text-foreground">{e.event_type.replace("_", " ")}</span>
                                <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted/50 px-2 py-0.5 rounded-full">
                                  {new Date(e.timestamp).toLocaleString(undefined, {
                                    month: 'short', day: 'numeric', year: 'numeric',
                                    hour: 'numeric', minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              {e.notes && <p className="text-sm text-muted-foreground mt-1 mb-2">{e.notes}</p>}
                              {e.evidence_url && (
                                <a 
                                  href={e.evidence_url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-xs font-mono text-primary hover:underline break-all bg-primary/5 px-2 py-1 rounded-md inline-block max-w-full"
                                >
                                  {e.evidence_url}
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
                  <CardHeader className="pb-3 border-b border-primary/10">
                    <CardTitle className="text-lg flex items-center gap-2 text-primary">
                      <Box className="h-5 w-5" />
                      Current Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Logical State</Label>
                      <div className="font-semibold text-lg text-foreground">
                        {data.qr?.current_state}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Token Status</Label>
                      <div>
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase",
                          data.qr?.status === 'ACTIVE' ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" :
                          data.qr?.status === 'VOIDED' ? "bg-destructive/15 text-destructive" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {data.qr?.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

