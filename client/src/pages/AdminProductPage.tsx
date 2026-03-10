import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import * as productApi from "../api/productApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Package, PackagePlus, Box, QrCode } from "lucide-react";
import RoleSidebar from "../components/RoleSidebar";

export function AdminProductPage() {
  const [items, setItems] = useState<productApi.Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [manufacturer, setManufacturer] = useState("Manufacturer 1");
  const [repairability, setRepairability] = useState(0.7);
  const [materialRecoverability, setMaterialRecoverability] = useState(0.8);
  const [hazardSafety, setHazardSafety] = useState(0.75);
  const [localFacilityCompat, setLocalFacilityCompat] = useState(0.6);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{type: "success" | "error", text: string} | null>(null);

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await productApi.listProducts({ limit: 25, offset: 0 });
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg(null);
    setCreating(true);
    try {
      await productApi.createProduct({
        name,
        category,
        manufacturer,
        metadata_json: {
          repairability,
          materialRecoverability,
          hazardSafety,
          localFacilityCompat
        }
      });
      setName("");
      setCreateMsg({ type: "success", text: "Product created successfully." });
      await refresh();
    } catch (err: any) {
      setCreateMsg({ type: "error", text: err?.response?.data?.error?.message ?? "Failed to create product" });
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
            <CardHeader className="border-b border-border/50 pb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Product Management</CardTitle>
                </div>
              </div>
              <CardDescription className="text-base">
                Create products, define metadata, and manage the product registry.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8 space-y-8">
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <PackagePlus className="h-5 w-5 text-muted-foreground" />
                    Create New Product
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">Define environmental specs for a new product line.</p>
                </div>

                {createMsg && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                    createMsg.type === "success" 
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" 
                      : "bg-destructive/10 text-destructive border border-destructive/20"
                  }`}>
                    {createMsg.text}
                  </div>
                )}

                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="pName">Product Name</Label>
                      <Input 
                        id="pName" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                        placeholder="e.g. EcoPhone 14"
                        className="bg-muted/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pCategory">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="pCategory" className="bg-muted/30">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Beverages">Beverages</SelectItem>
                          <SelectItem value="Household">Household</SelectItem>
                          <SelectItem value="PersonalCare">Personal Care</SelectItem>
                          <SelectItem value="FoodPackaging">Food Packaging</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pManufacturer">Manufacturer Name</Label>
                      <Input 
                        id="pManufacturer" 
                        value={manufacturer} 
                        onChange={(e) => setManufacturer(e.target.value)} 
                        required 
                        placeholder="Company name"
                        className="bg-muted/30"
                      />
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-muted/20 border border-border/50 space-y-4">
                    <h4 className="font-medium text-sm text-foreground/80 flex items-center gap-2">
                      <Box className="h-4 w-4" /> Eco-Metadata Metrics (0.0 to 1.0)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mRepair" className="text-xs">Repairability</Label>
                        <Input 
                          id="mRepair" type="number" min={0} max={1} step={0.01} 
                          value={repairability} onChange={(e) => setRepairability(Number(e.target.value))} 
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mMaterial" className="text-xs">Material Recov.</Label>
                        <Input 
                          id="mMaterial" type="number" min={0} max={1} step={0.01} 
                          value={materialRecoverability} onChange={(e) => setMaterialRecoverability(Number(e.target.value))} 
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mHazard" className="text-xs">Hazard Safety</Label>
                        <Input 
                          id="mHazard" type="number" min={0} max={1} step={0.01} 
                          value={hazardSafety} onChange={(e) => setHazardSafety(Number(e.target.value))} 
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mLocal" className="text-xs">Facility Compat.</Label>
                        <Input 
                          id="mLocal" type="number" min={0} max={1} step={0.01} 
                          value={localFacilityCompat} onChange={(e) => setLocalFacilityCompat(Number(e.target.value))} 
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={creating} className="w-full sm:w-auto px-8">
                      {creating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Register Product"}
                    </Button>
                  </div>
                </form>
              </div>

              <hr className="border-border/50" />

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Box className="h-5 w-5 text-muted-foreground" />
                    Product Registry
                  </h3>
                  <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
                  </Button>
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm">
                    {error}
                  </div>
                )}

                {loading && items.length === 0 ? (
                  <div className="flex flex-col items-center py-12 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                    <p>Loading products...</p>
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center py-16 text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed border-border">
                    <Package className="h-12 w-12 mb-4 text-muted-foreground/30" />
                    <p>No products found in the registry.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((p) => (
                      <Card key={p.id} className="border-border/60 hover:border-primary/30 transition-colors shadow-none bg-card group flex flex-col">
                        <CardHeader className="p-5 pb-3">
                          <CardTitle className="text-base truncate group-hover:text-primary transition-colors">{p.name}</CardTitle>
                          <CardDescription className="flex items-center gap-2 text-xs">
                            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm line-clamp-1 truncate block">{p.category}</span>
                            <span className="truncate">{p.manufacturer}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-5 pt-0 mt-auto">
                          <Button variant="secondary" className="w-full mt-4 bg-muted hover:bg-muted/80 text-foreground" asChild>
                            <Link to={`/admin/products/${p.id}/qr`}>
                              <QrCode className="h-4 w-4 mr-2" />
                              Generate Token
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

