import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2, Settings2, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type OverrideTab = "complaints" | "bulk-ops" | "history";

export function AdminOverridePanel() {
  const [activeTab, setActiveTab] = useState<OverrideTab>("complaints");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Complaint override form
  const [complaintOverride, setComplaintOverride] = useState({
    complaintId: "",
    status: "RESOLVED" as const,
    reason: ""
  });

  // QR override form
  const [qrOverride, setQROverride] = useState({
    qrId: "",
    newState: "FINAL_DISPOSITION",
    reason: ""
  });

  // Batch update form
  const [batchUpdate, setBatchUpdate] = useState({
    complaintIds: "",
    status: "OPEN",
    priority: "MEDIUM",
    reason: ""
  });

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

  const handleComplaintOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/override/complaint-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(complaintOverride)
      });
      if (!res.ok) throw new Error("Failed to override complaint");
      setMessage({ type: "success", text: "Complaint status overridden!" });
      setComplaintOverride({ complaintId: "", status: "RESOLVED", reason: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleQROverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/admin/override/qr-state`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(qrOverride)
      });
      if (!res.ok) throw new Error("Failed to override QR state");
      setMessage({ type: "success", text: "QR state overridden!" });
      setQROverride({ qrId: "", newState: "FINAL_DISPOSITION", reason: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ids = batchUpdate.complaintIds.split(",").map((id) => id.trim()).filter(id => id.length > 0);
      const updates: any = {};
      if (batchUpdate.status && batchUpdate.status !== "no-change") updates.status = batchUpdate.status;
      if (batchUpdate.priority && batchUpdate.priority !== "no-change") updates.priority = batchUpdate.priority;

      const res = await fetch(`${apiUrl}/admin/batch/update-complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          complaintIds: ids,
          updates,
          reason: batchUpdate.reason
        })
      });
      if (!res.ok) throw new Error("Failed to batch update");
      setMessage({ type: "success", text: `Updated ${ids.length} complaints!` });
      setBatchUpdate({ complaintIds: "", status: "no-change", priority: "no-change", reason: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-red-500/20 shadow-sm overflow-hidden bg-background">
      <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
        <CardTitle className="flex items-center gap-2 text-xl text-foreground">
          <ShieldAlert className="h-5 w-5 text-red-500" />
          Admin Control Panel
        </CardTitle>
        <CardDescription>Emergency override capabilities. All actions are strictly audited.</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="complaints" value={activeTab} onValueChange={(v: string) => setActiveTab(v as OverrideTab)} className="w-full">
          <TabsList className="w-full flex justify-start rounded-none border-b border-border bg-transparent h-12 p-0">
            <TabsTrigger 
              value="complaints" 
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-background py-3"
            >
              Manual Overrides
            </TabsTrigger>
            <TabsTrigger 
              value="bulk-ops" 
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:bg-background py-3"
            >
              Batch Operations
            </TabsTrigger>
          </TabsList>
          
          <div className="p-6">
            {message && (
              <div className={cn(
                "mb-6 p-3 rounded-lg flex items-center gap-2 text-sm font-medium",
                message.type === "success" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
              )}>
                {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {message.text}
              </div>
            )}

            <TabsContent value="complaints" className="m-0 space-y-8 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold">Force Complaint Status</h4>
                </div>
                <form onSubmit={handleComplaintOverride} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="complaintId">Complaint ID</Label>
                      <Input
                        id="complaintId"
                        value={complaintOverride.complaintId}
                        onChange={(e) => setComplaintOverride({ ...complaintOverride, complaintId: e.target.value })}
                        placeholder="UUID"
                        required
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cStatus">New Status</Label>
                      <Select 
                        value={complaintOverride.status} 
                        onValueChange={(v: any) => setComplaintOverride({ ...complaintOverride, status: v })}
                      >
                        <SelectTrigger id="cStatus" className="bg-muted/30">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OPEN">OPEN</SelectItem>
                          <SelectItem value="IN_REVIEW">IN_REVIEW</SelectItem>
                          <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                          <SelectItem value="REJECTED">REJECTED</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cReason">Reason (required)</Label>
                    <textarea
                      id="cReason"
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      value={complaintOverride.reason}
                      onChange={(e) => setComplaintOverride({ ...complaintOverride, reason: e.target.value })}
                      placeholder="Why are you overriding this?"
                      required
                    />
                  </div>
                  <Button type="submit" variant="destructive" disabled={loading} className="w-full md:w-auto">
                    {loading ? "Overriding..." : "Override Status"}
                  </Button>
                </form>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <h4 className="font-semibold">Force QR State</h4>
                </div>
                <form onSubmit={handleQROverride} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="qrId">QR Code ID</Label>
                      <Input
                        id="qrId"
                        value={qrOverride.qrId}
                        onChange={(e) => setQROverride({ ...qrOverride, qrId: e.target.value })}
                        placeholder="UUID"
                        required
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="qState">New State</Label>
                      <Input
                        id="qState"
                        value={qrOverride.newState}
                        onChange={(e) => setQROverride({ ...qrOverride, newState: e.target.value })}
                        placeholder="e.g., FINAL_DISPOSITION"
                        required
                        className="bg-muted/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qReason">Reason (required)</Label>
                    <textarea
                      id="qReason"
                      className="flex min-h-[60px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      value={qrOverride.reason}
                      onChange={(e) => setQROverride({ ...qrOverride, reason: e.target.value })}
                      placeholder="Why are you overriding this?"
                      required
                    />
                  </div>
                  <Button type="submit" variant="destructive" disabled={loading} className="w-full md:w-auto">
                    {loading ? "Overriding..." : "Override State"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="bulk-ops" className="m-0 space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 border-b border-border/50 pb-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold">Batch Update Complaints</h4>
              </div>
              <form onSubmit={handleBatchUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="batchIds">Complaint IDs (comma-separated)</Label>
                  <textarea
                    id="batchIds"
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    value={batchUpdate.complaintIds}
                    onChange={(e) => setBatchUpdate({ ...batchUpdate, complaintIds: e.target.value })}
                    placeholder="uuid1, uuid2, uuid3..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bStatus">New Status (optional)</Label>
                    <Select 
                      value={batchUpdate.status} 
                      onValueChange={(v: string) => setBatchUpdate({ ...batchUpdate, status: v })}
                    >
                      <SelectTrigger id="bStatus" className="bg-muted/30">
                        <SelectValue placeholder="No change" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-change">No change</SelectItem>
                        <SelectItem value="OPEN">OPEN</SelectItem>
                        <SelectItem value="IN_REVIEW">IN_REVIEW</SelectItem>
                        <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                        <SelectItem value="REJECTED">REJECTED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bPriority">New Priority (optional)</Label>
                    <Select 
                      value={batchUpdate.priority} 
                      onValueChange={(v: string) => setBatchUpdate({ ...batchUpdate, priority: v })}
                    >
                      <SelectTrigger id="bPriority" className="bg-muted/30">
                        <SelectValue placeholder="No change" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-change">No change</SelectItem>
                        <SelectItem value="LOW">LOW</SelectItem>
                        <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                        <SelectItem value="HIGH">HIGH</SelectItem>
                        <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bReason">Reason (required)</Label>
                  <textarea
                    id="bReason"
                    className="flex min-h-[60px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    value={batchUpdate.reason}
                    onChange={(e) => setBatchUpdate({ ...batchUpdate, reason: e.target.value })}
                    placeholder="Why are you making these changes?"
                    required
                  />
                </div>
                
                <Button type="submit" variant="destructive" disabled={loading} className="w-full md:w-auto">
                  {loading ? "Updating..." : "Batch Update"}
                </Button>
              </form>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
