import { useState, useEffect } from "react";
import { Navbar } from "../components/layout/Navbar";
import RoleSidebar from "../components/RoleSidebar";
import { getRecyclerComplaints, updateComplaintStatusRecycler } from "../api/complaintApi";
import type { Complaint } from "../api/complaintApi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, FileWarning, MessageSquare, CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function RecyclerComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [responseMsg, setResponseMsg] = useState<{ [key: string]: string }>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecyclerComplaints();
      setComplaints(data.complaints || []);
      // Initialize response messages
      const msgs: Record<string, string> = {};
      (data.complaints || []).forEach((c) => {
        if (c.response_message) msgs[c.id] = c.response_message;
      });
      setResponseMsg(msgs);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateComplaintStatusRecycler(id, newStatus, responseMsg[id]);
      await load(); // Reload list to reflect changes
    } catch (err: any) {
      alert(err?.response?.data?.error?.message ?? "Failed to update complaint");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case 'IN_REVIEW': return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case 'RESOLVED': return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case 'REJECTED': return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 md:px-8">
        <RoleSidebar />
        
        <div className="flex-1 space-y-6">
          <Card className="border-none shadow-sm bg-background">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileWarning className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">Process Complaints</CardTitle>
              </div>
              <CardDescription className="text-base">
                Review and resolve physical product defects or missing items reported by consumers.
              </CardDescription>
            </CardHeader>
          </Card>

          {loading ? (
            <Card className="border-none shadow-sm flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground font-medium">Loading complaints...</span>
            </Card>
          ) : error ? (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-4 text-sm text-destructive font-medium max-w-2xl">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : complaints.length === 0 ? (
            <Card className="border-none shadow-sm flex flex-col items-center justify-center p-12 text-center bg-muted/20 border-dashed border-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-500/50 mb-4" />
              <h3 className="text-lg font-semibold mb-1">All caught up!</h3>
              <p className="text-muted-foreground">No open complaints require attention right now. Great job!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {complaints.map(c => (
                <Card key={c.id} className="border-none shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Complaint Details */}
                    <div className="flex-1 p-6 md:border-r border-border/50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                              {c.id.slice(0, 8)}...
                            </h3>
                            <span className={cn(
                              "text-xs font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider",
                              getStatusColor(c.status)
                            )}>
                              {c.status.replace("_", " ")}
                            </span>
                            {c.priority && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 uppercase tracking-wider">
                                {c.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>Product: <span className="font-medium text-foreground">{c.product_id}</span></span>
                            <span>•</span>
                            <span>QR: <span className="font-mono text-foreground">{c.qr_id?.slice(0,8) || "N/A"}</span></span>
                          </p>
                        </div>
                      </div>

                      {c.description && (
                        <div className="bg-muted/30 p-4 rounded-lg border border-border/50 relative">
                          <MessageSquare className="h-4 w-4 absolute top-4 left-4 text-muted-foreground" />
                          <p className="text-sm pl-7 text-foreground/90 italic leading-relaxed">
                            "{c.description}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="w-full md:w-80 bg-muted/10 p-6 flex flex-col justify-between">
                      <div className="space-y-3 mb-6">
                        <Label htmlFor={`response-${c.id}`} className="text-sm font-semibold flex items-center gap-2">
                          Response / Internal Note
                        </Label>
                        <textarea 
                          id={`response-${c.id}`}
                          rows={3}
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                          value={responseMsg[c.id] || ""}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponseMsg(prev => ({ ...prev, [c.id]: e.target.value }))}
                          placeholder="Explain resolution or findings..."
                          disabled={updatingId === c.id}
                        />
                      </div>

                      <div className="flex flex-col gap-2 mt-auto">
                        {c.status === "OPEN" && (
                          <Button 
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleUpdateStatus(c.id, "IN_REVIEW")}
                            disabled={updatingId === c.id}
                          >
                            <Clock className="h-4 w-4 mr-2 text-amber-500" />
                            Mark In Review
                          </Button>
                        )}
                        {(c.status === "OPEN" || c.status === "IN_REVIEW") && (
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="default"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleUpdateStatus(c.id, "RESOLVED")}
                              disabled={updatingId === c.id}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Resolve
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleUpdateStatus(c.id, "REJECTED")}
                              disabled={updatingId === c.id}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                        {/* Status updating loader */}
                        {updatingId === c.id && (
                          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-xl z-10">
                            <div className="bg-card border shadow-lg p-3 rounded-lg flex items-center gap-3">
                              <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              <span className="text-sm font-medium">Updating status...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
