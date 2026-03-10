import { useEffect, useState } from "react";
import { listOpenComplaints, assignComplaint, updateComplaintStatus } from "../api/complaintApi";
import { Navbar } from "../components/layout/Navbar";
import RoleSidebar from "../components/RoleSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ClipboardList, CheckCircle2, XCircle, Clock } from "lucide-react";

export function AdminComplaintPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { complaints } = await listOpenComplaints();
        if (!cancelled) setComplaints(complaints || []);
      } catch (err) {
        // ignore
        console.error("Failed to load complaints", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAssign = async (id: string) => {
    setActionLoading(id);
    try {
      await assignComplaint(id);
      setComplaints((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await updateComplaintStatus(id, "REJECTED");
      setComplaints((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
      case "CRITICAL": return "text-red-600 bg-red-600/10 border-red-600/20";
      case "MEDIUM": return "text-amber-600 bg-amber-600/10 border-amber-600/20";
      default: return "text-emerald-600 bg-emerald-600/10 border-emerald-600/20";
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 md:px-8">
        <RoleSidebar />
        
        <div className="flex-1 space-y-6">
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="border-b border-border/50 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Open Complaints</CardTitle>
                </div>
              </div>
              <CardDescription className="text-base">
                Manage and assign consumer reported issues to field teams or investigators.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                  <span className="font-medium">Loading complaints...</span>
                </div>
              ) : complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed border-border">
                  <CheckCircle2 className="h-12 w-12 mb-4 text-emerald-500/50" />
                  <h3 className="text-lg font-semibold text-foreground mb-1">Queue Empty</h3>
                  <p>There are no open complaints requiring administrative action.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {complaints.map((c) => (
                    <div 
                      key={c.id} 
                      className="group flex flex-col md:flex-row gap-4 p-5 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-colors animate-in fade-in slide-in-from-bottom-2"
                    >
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getPriorityColor(c.priority)}`}>
                            {c.priority || "NORMAL"}
                          </span>
                          <span className="text-sm font-mono text-muted-foreground flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md">
                            ID: {c.id.slice(0, 8)}...
                          </span>
                        </div>
                        
                        <p className="text-foreground/90 font-medium">
                          {c.description || <span className="italic text-muted-foreground">No description provided</span>}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">Filed by:</span>
                            <code className="bg-muted px-1.5 py-0.5 rounded">{c.filed_by}</code>
                          </div>
                          {c.created_at && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{new Date(c.created_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 shrink-0 md:w-32 justify-end md:justify-start">
                        <Button
                          variant="default"
                          className="flex-1 w-full bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={actionLoading === c.id}
                          onClick={() => handleAssign(c.id)}
                        >
                          {actionLoading === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign to Team"}
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1 w-full"
                          disabled={actionLoading === c.id}
                          onClick={() => handleReject(c.id)}
                        >
                          {actionLoading === c.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                            <>
                              <XCircle className="h-4 w-4 mr-2 hidden md:inline-block" />
                              Reject
                            </>
                          )}
                        </Button>
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
