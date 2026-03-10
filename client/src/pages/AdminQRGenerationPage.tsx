import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { Navbar } from "../components/layout/Navbar";
import * as qrApi from "../api/qrApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, QrCode, Copy, ExternalLink, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminQRGenerationPage() {
  const { id } = useParams();
  const productId = id!;
  const [daysValid, setDaysValid] = useState(365);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<{ qr_id: string; expiry: number; token: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!qr) return;
    await navigator.clipboard.writeText(qr.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const { qr: newQr } = await qrApi.generateQrForProduct(productId, { daysValid });
      setQr({ qr_id: newQr.qr_id, expiry: newQr.expiry, token: newQr.token });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "QR generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto py-8 px-4 md:px-8 max-w-5xl">
        
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full h-10 w-10">
            <Link to="/admin/products">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">QR Generation</h2>
            <p className="text-muted-foreground text-sm">Generate secure, verifiable tokens for products.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`space-y-6 ${qr ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'}`}>
            <Card className="border-none shadow-sm bg-background">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  Generate Token
                </CardTitle>
                <CardDescription>
                  This creates a cryptographically signed token valid for a specific duration.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="validityDays">Token Validity (Days)</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="validityDays"
                      type="number"
                      min={1}
                      max={3650}
                      value={daysValid}
                      onChange={(e) => setDaysValid(Number(e.target.value))}
                      className="pl-9 bg-muted/30"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Button 
                    className="flex-1" 
                    onClick={handleGenerate} 
                    disabled={loading}
                  >
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...</> : "Generate Token"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {qr && (
            <div className="lg:col-span-7 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-sm bg-background overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <QrCode className="h-48 w-48" />
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl">Generated Asset</CardTitle>
                  <CardDescription>Scan or copy the token to proceed.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start p-6 bg-muted/20 rounded-2xl border border-border/50">
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-border/50 shrink-0">
                      <QRCode value={qr.token} size={160} />
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">QR ID</p>
                        <code className="text-sm bg-background border border-border/60 px-2 py-1 rounded block truncate">
                          {qr.qr_id}
                        </code>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Expires</p>
                        <div className="text-sm font-medium">
                          {new Date(qr.expiry).toLocaleString()}
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-2">
                        <Button 
                          variant={copied ? "default" : "secondary"} 
                          className={cn("flex-1", copied && "bg-emerald-600 hover:bg-emerald-700 text-white")}
                          onClick={handleCopy}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          {copied ? "Copied!" : "Copy Token"}
                        </Button>
                        <Button variant="default" asChild className="flex-1">
                          <Link to={`/scan?token=${encodeURIComponent(qr.token)}`}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open Scanner
                          </Link>
                        </Button>
                      </div>
                    </div>

                  </div>

                  <div className="mt-6 space-y-2">
                    <Label className="text-xs uppercase text-muted-foreground tracking-wider">Raw JWT Token</Label>
                    <div className="relative">
                      <textarea 
                        value={qr.token} 
                        readOnly 
                        className="w-full h-24 p-3 text-xs font-mono bg-muted/50 border border-border/60 rounded-xl resize-none focus:outline-none text-muted-foreground"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

