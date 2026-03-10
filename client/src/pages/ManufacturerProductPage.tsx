import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import RoleSidebar from "../components/RoleSidebar";
import * as productApi from "../api/productApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, PlusCircle, Package, Settings2, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export function ManufacturerProductPage() {
  const [items, setItems] = useState<productApi.Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [repairability, setRepairability] = useState(0.7);
  const [materialRecoverability, setMaterialRecoverability] = useState(0.8);
  const [hazardSafety, setHazardSafety] = useState(0.75);
  const [localFacilityCompat, setLocalFacilityCompat] = useState(0.6);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.listProducts({ limit: 50, offset: 0 });
      setItems(data.items);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg(null);
    setCreating(true);
    try {
      await productApi.createProduct({
        name,
        category,
        manufacturer: "AUTO", // The backend safely overrides this
        metadata_json: {
          repairability,
          materialRecoverability,
          hazardSafety,
          localFacilityCompat
        }
      });
      setName("");
      setCreateMsg("Product created successfully.");
      setIsSuccess(true);
      await refresh();
    } catch (err: any) {
      setCreateMsg(err?.response?.data?.error?.message ?? "Create failed");
      setIsSuccess(false);
    } finally {
      setCreating(false);
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
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-2xl">My Products</CardTitle>
              </div>
              <CardDescription className="text-base">
                Register new product lines into the Smart EcoTrack global ecosystem.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-muted-foreground" />
                    Register New Product
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {createMsg && (
                    <div className={cn(
                      "mb-6 flex items-center gap-2 rounded-lg p-3 text-sm font-medium",
                      isSuccess ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-destructive/15 text-destructive"
                    )}>
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{createMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input 
                          id="name"
                          value={name} 
                          onChange={(e) => setName(e.target.value)} 
                          required 
                          placeholder="e.g. Quantum Blender X2" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <select
                          id="category"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option>Electronics</option>
                          <option>Beverages</option>
                          <option>Household</option>
                          <option>PersonalCare</option>
                          <option>FoodPackaging</option>
                          <option>Others</option>
                        </select>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-4">
                      <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                        <Settings2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Eco Metadata Scoring (0-1)</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="repairability" className="text-xs">Repairability</Label>
                          <Input
                            id="repairability"
                            type="number"
                            min={0} max={1} step={0.01}
                            value={repairability}
                            onChange={(e) => setRepairability(Number(e.target.value))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="material" className="text-xs text-nowrap">Material Recovery</Label>
                          <Input
                            id="material"
                            type="number"
                            min={0} max={1} step={0.01}
                            value={materialRecoverability}
                            onChange={(e) => setMaterialRecoverability(Number(e.target.value))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hazard" className="text-xs">Hazard Safety</Label>
                          <Input
                            id="hazard"
                            type="number"
                            min={0} max={1} step={0.01}
                            value={hazardSafety}
                            onChange={(e) => setHazardSafety(Number(e.target.value))}
                            className="bg-background"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="facility" className="text-xs text-nowrap">Facility Compat.</Label>
                          <Input
                            id="facility"
                            type="number"
                            min={0} max={1} step={0.01}
                            value={localFacilityCompat}
                            onChange={(e) => setLocalFacilityCompat(Number(e.target.value))}
                            className="bg-background"
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" disabled={creating} className="w-full sm:w-auto">
                      {creating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register Product"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 border-none shadow-sm">
              <Card className="h-full flex flex-col border-none shadow-sm">
                <CardHeader className="pb-4 border-b border-border/50">
                  <CardTitle className="text-lg">Recent Portfolio</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex-1 overflow-auto">
                  {loading ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                      <span className="text-sm text-muted-foreground">Loading portfolio...</span>
                    </div>
                  ) : error ? (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                      {error}
                    </div>
                  ) : items.length === 0 ? (
                    <div className="text-center p-6 text-sm text-muted-foreground border border-dashed rounded-lg">
                      No products registered yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map((p) => (
                        <div 
                          key={p.id} 
                          className="group relative flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground truncate">{p.name}</span>
                            <span className="text-xs text-muted-foreground bg-muted w-fit px-2 py-0.5 rounded-full mt-1.5">{p.category}</span>
                          </div>
                          <div className="mt-auto pt-2 flex justify-end">
                            <Button variant="secondary" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                              <Link to={`/manufacturer/products/${p.id}/qr`}>
                                <QrCode className="mr-2 h-4 w-4" />
                                Generate QR
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
