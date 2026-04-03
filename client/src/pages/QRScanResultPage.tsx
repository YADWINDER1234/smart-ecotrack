import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { httpClient } from "../api/httpClient";
import { useAuth } from "../hooks/useAuth";
import * as recyclingApi from "../api/recyclingApi";
import { QRScanner } from "../components/QRScanner";
import { ProductIntelligenceDashboard } from "../components/ProductIntelligenceDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, QrCode, Search, CheckCircle2, Factory, Leaf, BatteryWarning, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function QRScanResultPage() {
  const [params, setParams] = useSearchParams();
  const token = params.get("token") || "";
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [intentNotes, setIntentNotes] = useState("");
  const [intentMsg, setIntentMsg] = useState<string | null>(null);
  const [isSuccessMsg, setIsSuccessMsg] = useState(false);

  const canScan = useMemo(() => token.length > 0, [token]);
  const state = result?.qr?.current_state as string | undefined;

  useEffect(() => {
    if (token && !result && !loading) {
      handleManualScan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  
  const stages = ["SCAN", "INTENT_SUBMITTED", "RECEIVED", "SORTED", "FINAL_DISPOSITION"];
  const currentStageIndex = state ? stages.indexOf(state) : -1;

  const handleManualScan = async () => {
    if (!canScan) return;
    setLoading(true);
    setError(null);
    setResult(null);

    let lat, lng;
    try {
      if ("geolocation" in navigator) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }
    } catch (e) {
      console.warn("Could not get location", e);
    }

    try {
      const { data } = await httpClient.post("/qr/scan", { token, lat, lng });
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Scan failed");
      // If native scan fails, it might be a regular product barcode/name
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAiDeepScan = async () => {
    setAiLoading(true);
    setError(null);
    setAiResult(null);
    try {
      const { data } = await httpClient.post("/qr/ai-scan", { token });
      setAiResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "AI Analysis failed");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitIntent = async () => {
    setIntentMsg(null);
    try {
      await recyclingApi.submitIntent({
        qr_id: result.qr.id,
        notes: intentNotes || undefined
      });
      setIntentMsg("Intent submitted successfully. Re-scan token to see updated state.");
      setIsSuccessMsg(true);
      setIntentNotes("");
    } catch (err: any) {
      setIntentMsg(err?.response?.data?.error?.message ?? "Intent submission failed");
      setIsSuccessMsg(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-5xl">
        <div className="space-y-8">
          
          {/* Scanner Input Section */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Scan Product QR</CardTitle>
              <CardDescription className="text-base max-w-md mx-auto">
                Paste a QR token below or scan via the camera to view sustainability details and lifecycle traceability.
              </CardDescription>
            </CardHeader>
            <CardContent className="max-w-xl mx-auto space-y-4">
              <div className="space-y-2">
                <Label htmlFor="token" className="sr-only">Token</Label>
                <div className="relative">
                  <textarea
                    id="token"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    value={token}
                    onChange={(e) => {
                      params.set("token", e.target.value);
                      setParams(params, { replace: true });
                    }}
                    placeholder="eyJhb..."
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 h-12 text-base"
                  disabled={loading || aiLoading || !token}
                  onClick={handleManualScan}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-5 w-5" />
                      Verify QR
                    </>
                  )}
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 h-12 text-base bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
                  disabled={loading || aiLoading || !token}
                  onClick={handleAiDeepScan}
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AI Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      AI Deep Scan
                    </>
                  )}
                </Button>
              </div>

              {!token && (
                <div className="pt-6 mt-6 border-t border-border">
                  <p className="text-sm font-medium text-center text-muted-foreground mb-4">Or scan with camera</p>
                  <div className="rounded-xl overflow-hidden border border-border bg-black/5 aspect-video md:aspect-[21/9] flex items-center justify-center relative">
                    <QRScanner
                      onScan={(decoded) => {
                        try {
                          const url = new URL(decoded);
                          const t = url.searchParams.get("token");
                          if (t) {
                            params.set("token", t);
                            setParams(params, { replace: true });
                          } else {
                            params.set("token", decoded);
                            setParams(params, { replace: true });
                          }
                        } catch {
                          params.set("token", decoded);
                          setParams(params, { replace: true });
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <div className="flex flex-col gap-4 rounded-lg bg-destructive/15 p-6 text-sm text-destructive shadow-sm max-w-xl mx-auto border border-destructive/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="font-bold text-base">{error}</span>
              </div>
              <p className="text-destructive/80">This doesn't look like a standard system token. Try an <strong>AI Deep Scan</strong> to identify this product instead.</p>
              <Button variant="destructive" className="w-full" onClick={handleAiDeepScan} disabled={aiLoading}>
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                Run AI Intelligence Scan
              </Button>
            </div>
          )}

          {/* AI Intelligence View */}
          {(aiLoading || aiResult) && (
            <ProductIntelligenceDashboard data={aiResult} loading={aiLoading} />
          )}

          {result && (result.product?.category === "Electronics" || result.product?.category === "Batteries") && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/50 bg-red-500/10 p-5 text-sm text-red-600 dark:text-red-400 shadow-sm max-w-5xl mx-auto animate-in fade-in slide-in-from-top-2">
              <BatteryWarning className="h-6 w-6 shrink-0 text-red-500" />
              <div>
                <strong className="block text-base mb-0.5">⚠️ Hazardous E-Waste Material</strong>
                <span>Please do not dispose of this in regular bins. Route to a designated E-Waste center to earn a <strong>50 Point Bonus</strong>!</span>
              </div>
            </div>
          )}

          {/* Result Section */}
          {result && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <Card className="border-none shadow-sm flex flex-col">
                <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Factory className="h-5 w-5" />
                    <CardTitle className="text-lg">Product Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 flex-1">
                  <dl className="space-y-4">
                    <div className="flex flex-col gap-1 border-b border-border/50 pb-3">
                      <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                      <dd className="text-base font-semibold text-foreground">{result.product?.name || "N/A"}</dd>
                    </div>
                    <div className="flex flex-col gap-1 border-b border-border/50 pb-3">
                      <dt className="text-sm font-medium text-muted-foreground">Category</dt>
                      <dd className="text-base font-semibold text-foreground">{result.product?.category || "N/A"}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-sm font-medium text-muted-foreground">Manufacturer</dt>
                      <dd className="text-base font-semibold text-foreground">{result.product?.manufacturer || "N/A"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Leaf className="w-32 h-32" />
                </div>
                <CardHeader className="bg-emerald-500/10 dark:bg-emerald-900/20 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <Leaf className="h-5 w-5" />
                      <CardTitle className="text-lg">Sustainability Profile</CardTitle>
                    </div>
                    <div className="flex items-center justify-center font-bold text-2xl h-12 w-12 rounded-full bg-emerald-500 text-white shadow-sm ring-4 ring-emerald-500/20">
                      {Math.round(Number(result.eco?.ecoScore ?? 0))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 flex-1">
                  <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
                    {result.eco?.explanation || "No explanation available."}
                  </p>
                  <dl className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Eco Label</dt>
                      <dd className="text-sm font-semibold text-foreground">{result.eco?.label || "None"}</dd>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Current State</dt>
                      <dd className="text-sm font-semibold text-foreground break-words">{result.qr?.current_state || "UNKNOWN"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Lifecycle Progress */}
              <Card className="border-none shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Lifecycle Progress</CardTitle>
                  <CardDescription>End-to-end traceability of the product's post-consumer journey.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative py-4">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-muted rounded-full overflow-hidden hidden md:block">
                      <div 
                        className="h-full bg-primary transition-all duration-1000 ease-in-out" 
                        style={{ width: `${Math.max(0, currentStageIndex) / (stages.length - 1) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between relative gap-6 md:gap-0">
                      {stages.map((s, i) => {
                        const isCompleted = i < currentStageIndex;
                        const isCurrent = i === currentStageIndex;
                        
                        return (
                          <div key={s} className="flex md:flex-col items-center gap-4 md:gap-2 z-10 w-full md:w-auto relative bg-card md:bg-transparent">
                            {/* Vertical line for mobile */}
                            {i < stages.length - 1 && (
                              <div className="absolute left-5 top-10 bottom-[-40px] w-0.5 bg-muted md:hidden" />
                            )}
                            
                            <div className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                              isCompleted ? "border-primary bg-primary text-primary-foreground" :
                              isCurrent ? "border-primary bg-background text-primary ring-4 ring-primary/20" :
                              "border-muted bg-background text-muted-foreground"
                            )}>
                              {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-sm font-bold">{i + 1}</span>}
                            </div>
                            <span className={cn(
                              "text-sm font-medium",
                              isCompleted ? "text-foreground" :
                              isCurrent ? "text-primary font-bold" :
                              "text-muted-foreground"
                            )}>
                              {s.replace("_", " ")}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Consumer Action */}
              <Card className="border-none shadow-sm lg:col-span-2 bg-primary/5 dark:bg-primary/10 border border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Take Action</CardTitle>
                  <CardDescription>Indicate your intention to dispose of this product.</CardDescription>
                </CardHeader>
                <CardContent>
                  {intentMsg && (
                    <div className={cn(
                      "mb-6 flex items-center gap-3 rounded-lg p-4 text-sm shadow-sm",
                      isSuccessMsg ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-destructive/15 text-destructive"
                    )}>
                      {isSuccessMsg ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                      <span className="font-medium">{intentMsg}</span>
                    </div>
                  )}

                  {!user || user.role !== "CONSUMER" ? (
                    <div className="rounded-lg border border-border bg-background p-6 text-center">
                      <p className="text-muted-foreground mb-4">You must be logged in as a Consumer to submit a disposal intent.</p>
                      <Button variant="outline" asChild>
                        <a href="/login">Sign in</a>
                      </Button>
                    </div>
                  ) : state !== "SCAN" ? (
                    <div className="rounded-lg border border-border bg-background p-6 text-center">
                      <p className="text-muted-foreground">
                        Intent can only be submitted at the <strong className="text-foreground font-semibold">SCAN</strong> stage. 
                        This product is currently at <strong className="text-foreground font-semibold">{state}</strong>.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-xl">
                      <div className="space-y-2">
                        <Label htmlFor="intentNotes">Notes (Optional)</Label>
                        <Input
                          id="intentNotes"
                          value={intentNotes}
                          onChange={(e) => setIntentNotes(e.target.value)}
                          placeholder="e.g., dropping at nearest facility this weekend"
                          className="bg-background"
                        />
                      </div>
                      <Button onClick={handleSubmitIntent}>
                        Submit Disposal Intent
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

