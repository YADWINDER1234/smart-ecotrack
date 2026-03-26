import { useEffect, useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import RoleSidebar from "../components/RoleSidebar";
import { Breadcrumb } from "../components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, ShieldCheck, ShieldX, Link2, Hash, Clock } from "lucide-react";
import { fetchLedger, verifyIntegrity } from "../api/blockchainApi";

export function BlockchainLedgerPage() {
  const [ledger, setLedger] = useState<any[]>([]);
  const [integrity, setIntegrity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => { void loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchLedger();
      setLedger(data.ledger || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleVerify() {
    setVerifying(true);
    try {
      const result = await verifyIntegrity();
      setIntegrity(result);
    } catch (err) { console.error(err); } finally { setVerifying(false); }
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 md:px-8">
        <RoleSidebar />
        <div className="flex-1 space-y-6">
          <Breadcrumb />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-teal-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Blockchain Ledger</h1>
            </div>
            <Button onClick={handleVerify} variant="outline" className="gap-2" disabled={verifying}>
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Verify Integrity
            </Button>
          </div>

          {/* Integrity Status */}
          {integrity && (
            <Card className={`border-none shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 ${integrity.isValid ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-red-500/5 border border-red-500/20'}`}>
              <CardContent className="p-5 flex items-center gap-4">
                {integrity.isValid ? (
                  <>
                    <ShieldCheck className="h-8 w-8 text-emerald-500" />
                    <div>
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">Chain Verified ✓</p>
                      <p className="text-sm text-muted-foreground">All {integrity.totalBlocks} blocks have valid hash linkage. No tampering detected.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <ShieldX className="h-8 w-8 text-red-500" />
                    <div>
                      <p className="font-bold text-red-700 dark:text-red-400">Integrity Violation Detected!</p>
                      <p className="text-sm text-muted-foreground">{integrity.invalidBlocks.length} invalid block(s) found at positions: {integrity.invalidBlocks.join(", ")}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground p-4"><Loader2 className="h-5 w-5 animate-spin" /> Loading ledger...</div>
          ) : ledger.length === 0 ? (
            <Card className="border-none shadow-sm"><CardContent className="p-8 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium text-foreground">No blocks recorded yet</p>
              <p className="text-sm text-muted-foreground mt-1">Blocks are created when recycling events reach FINAL_DISPOSITION.</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {ledger.map((block: any, idx: number) => (
                <Card key={block.blockNumber} className="border-none shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          #{block.blockNumber}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Block #{block.blockNumber}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {new Date(block.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {idx > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Link2 className="h-3 w-3" /> Linked
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex items-start gap-2 bg-muted/50 p-2 rounded">
                        <Hash className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                        <div>
                          <span className="text-muted-foreground">Hash: </span>
                          <span className="text-foreground break-all">{block.dataHash}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-muted/30 p-2 rounded">
                        <Link2 className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                        <div>
                          <span className="text-muted-foreground">Prev: </span>
                          <span className="text-foreground/70 break-all">{block.prevHash}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Event ID: {block.eventId}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
