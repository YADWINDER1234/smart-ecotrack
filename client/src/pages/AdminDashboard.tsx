import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import RoleSidebar from "../components/RoleSidebar";
import { AdminOverridePanel } from "../components/AdminOverridePanel";
import { Breadcrumb } from "../components/Breadcrumb";
import { FunnelChart } from "../components/charts/FunnelChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, LayoutDashboard, ClipboardList, Package, Fingerprint, AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { getAccessToken } from "../api/httpClient";

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const rawBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const apiUrl = rawBase.endsWith("/api") ? rawBase : `${rawBase.replace(/\/$/, "")}/api`;

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [pendingRes, analyticsRes] = await Promise.all([
          fetch(`${apiUrl}/admin/pending-metrics`, { credentials: "include" }),
          fetch(`${apiUrl}/dashboard/admin`, { credentials: "include" })
        ]);
        let pendingMetrics = {} as any;
        if (pendingRes.ok) {
          const d = await pendingRes.json();
          pendingMetrics = d.metrics;
        }
        let funnel: any[] = [];
        if (analyticsRes.ok) {
          const d = await analyticsRes.json();
          funnel = d.funnel || [];
        }
        setMetrics({ ...pendingMetrics, funnel });
      } catch (err) {
        console.error("Failed to load metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    void loadMetrics();

    // realtime update
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
    const es = new EventSource(`${baseUrl}/api/notifications/stream`, { withCredentials: true } as any);
    es.addEventListener("qr_state_change", () => {
      void loadMetrics();
    });

    return () => es.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerEscalation = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/escalate-now`, {
        method: "POST",
        credentials: "include",
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });
      if (res.ok) {
        alert("Auto-escalation triggered!");
        // Reload metrics
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to trigger escalation:", err);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 md:px-8">
        <RoleSidebar />

        <div className="flex-1 space-y-6">
          <div className="mb-2">
            <Breadcrumb />
            <div className="flex items-center gap-2 mt-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground p-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              Fetching metrics...
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-l-4 border-l-red-500 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-500">Open Complaints</p>
                      <p className="text-3xl font-black text-foreground">{metrics.openComplaints}</p>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 font-medium flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Pending review
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">High Priority</p>
                      <p className="text-3xl font-black text-foreground">{metrics.highPriority}</p>
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 font-medium flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Requires attention
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-violet-500 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">Overdue 3+ Days</p>
                      <p className="text-3xl font-black text-foreground">{metrics.overdueByThreeDays}</p>
                    </div>
                    <div className="p-2 bg-violet-500/10 rounded-lg text-violet-500">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 font-medium">Medium risk</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-600 shadow-sm overflow-hidden group hover:shadow-md transition-all bg-red-500/5 dark:bg-red-500/10">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">Overdue 7+ Days</p>
                      <p className="text-3xl font-black text-red-700 dark:text-red-300">{metrics.overdueBySevenDays}</p>
                    </div>
                    <div className="p-2 bg-red-600/10 rounded-lg text-red-600 dark:text-red-400">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-4 font-bold">Critical risk</p>
                </CardContent>
              </Card>
            </div>
          ) : null}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Product Lifecycle Funnel</CardTitle>
                  <CardDescription>Conversion metrics from QR generation to final disposition</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border border-border/50 rounded-lg p-1 bg-background">
                    <FunnelChart data={metrics ? metrics.funnel || [] : []} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card className="border-none shadow-sm bg-primary/5 border border-primary/20">
                <CardHeader className="pb-3 border-b border-primary/10">
                  <CardTitle className="text-lg text-primary flex items-center gap-2">
                    <Zap className="h-5 w-5" /> Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <Button variant="outline" className="w-full justify-start h-12 bg-background hover:bg-muted" asChild>
                    <Link to="/admin/complaints">
                      <ClipboardList className="mr-3 h-5 w-5 text-blue-500" />
                      <span className="font-medium">Manage Complaints</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 bg-background hover:bg-muted" asChild>
                    <Link to="/admin/products">
                      <Package className="mr-3 h-5 w-5 text-emerald-500" />
                      <span className="font-medium">Manage Products</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 bg-background hover:bg-muted" asChild>
                    <Link to="/admin/audit">
                      <Fingerprint className="mr-3 h-5 w-5 text-violet-500" />
                      <span className="font-medium">View Audit Log</span>
                    </Link>
                  </Button>
                  <div className="h-px bg-border my-2" />
                  <Button
                    variant="destructive"
                    className="w-full justify-start h-12 font-medium"
                    onClick={triggerEscalation}
                  >
                    <AlertTriangle className="mr-3 h-5 w-5" />
                    Run Escalation
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-muted-foreground" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                      <span className="text-sm font-semibold">All systems operational</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="w-full">
            <AdminOverridePanel />
          </div>

        </div>
      </main>
    </div>
  );
}
