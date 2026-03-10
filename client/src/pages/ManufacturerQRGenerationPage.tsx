import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import QRCode from "react-qr-code";
import { Navbar } from "../components/layout/Navbar";
import * as qrApi from "../api/qrApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, QrCode, ArrowLeft, Copy, ExternalLink, ShieldCheck } from "lucide-react";

export function ManufacturerQRGenerationPage() {
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

  const generateToken = async () => {
    setLoading(true);
    setError(null);
    try {
      const { qr: generatedQr } = await qrApi.generateQrForProduct(productId, { daysValid });
      setQr({ qr_id: generatedQr.qr_id, expiry: generatedQr.expiry, token: generatedQr.token });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "QR generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/manufacturer/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card className="border-none shadow-sm h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <QrCode className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Generate Asset</CardTitle>
                </div>
                <CardDescription>
                  Generate a signed physical QR token for this product to attach to your packaging.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-sm text-destructive font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="daysValid">Days Valid Before Expiration</Label>
                    <Input
                      id="daysValid"
                      type="number"
                      min={1}
                      max={3650}
                      value={daysValid}
                      onChange={(e) => setDaysValid(Number(e.target.value))}
                    />
                  </div>
                  
                  <Button className="w-full" disabled={loading} onClick={generateToken}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Mint QR Token"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {qr ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Printable QR Code</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
                      <QRCode value={qr.token} size={200} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                    </div>
                    
                    <div className="w-full space-y-3">
                      <div className="flex justify-between items-center text-sm border-b pb-2">
                        <span className="text-muted-foreground">QR ID</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs font-semibold">{qr.qr_id.slice(0, 12)}...</code>
                      </div>
                      <div className="flex justify-between items-center text-sm border-b pb-2">
                        <span className="text-muted-foreground">Expires</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">{new Date(qr.expiry).toLocaleDateString()}</code>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" className="flex-1" onClick={handleCopy}>
                          <Copy className="mr-2 h-4 w-4" />
                          {copied ? "Copied!" : "Copy Token"}
                        </Button>
                        <Button variant="secondary" className="flex-1" asChild>
                          <Link to={`/scan?token=${encodeURIComponent(qr.token)}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Test Scan
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-primary/5 border border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base text-primary">Cryptographic Proof</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <textarea 
                      className="w-full h-24 text-xs font-mono p-3 rounded-md bg-background border border-border resize-none text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={qr.token} 
                      readOnly 
                    />
                    <p className="text-xs text-muted-foreground mt-3">
                      This token securely encodes identity and is signed with HMAC-SHA256. Attach the visual QR to your physical product.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-none shadow-sm h-full flex flex-col items-center justify-center p-8 bg-muted/20 border-dashed border-2">
                <QrCode className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-center text-sm text-muted-foreground">
                  Generate a QR token to see the printable asset and cryptographic payload here.
                </p>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
