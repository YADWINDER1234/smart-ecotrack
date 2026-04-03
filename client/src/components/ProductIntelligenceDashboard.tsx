import React from "react";
import { 
  Cpu, 
  Battery, 
  Smartphone, 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  Leaf, 
  Trash2, 
  Layers,
  Zap,
  ShieldCheck,
  Info,
  Recycle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { httpClient } from "@/api/httpClient";

interface DashboardProps {
  data: any;
  loading?: boolean;
}

export function ProductIntelligenceDashboard({ data, loading }: DashboardProps) {
  const [logging, setLogging] = React.useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <Layers className="absolute inset-0 m-auto h-10 w-10 text-primary animate-pulse" />
        </div>
        <p className="text-xl font-bold tracking-tight text-primary animate-pulse">Analyzing Product Architecture...</p>
      </div>
    );
  }

  // Debug: Show if no data received
  if (!data) {
    console.error("❌ No data received in ProductIntelligenceDashboard");
    return (
      <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/5">
        <p className="text-red-600 font-bold">⚠️ No product data available</p>
        <p className="text-sm text-muted-foreground mt-2">Please try searching again or uploading a different product.</p>
      </div>
    );
  }

  const { product, intelligence, waste_info } = data;

  // Ensure product is safely converted to strings
  const safeProduct = {
    name: String(product?.name || "Unknown Product"),
    brand: String(product?.brand || "Unknown"),
    category: String(product?.category || "Electronics"),
    release_year: String(product?.release_year || "Recent")
  };

  // If we have data but missing intelligence, try to use fallback
  if (!intelligence) {
    console.warn("⚠️ Intelligence data missing, will use fallbacks");
  }

  // Debug logging
  console.log("📊 Dashboard Data Received:", {
    hasProduct: !!product,
    hasIntelligence: !!intelligence,
    hasWasteInfo: !!waste_info,
    fullData: data
  });

  // Safe data fallbacks for API responses that may be incomplete
  const management = {
    optimization_suggestions: Array.isArray(intelligence?.management?.optimization_suggestions) 
      ? intelligence.management.optimization_suggestions.filter((s: any) => typeof s === 'string')
      : [
          "Clear cache regularly to improve performance",
          "Disable background apps to enhance battery life",
          "Update to the latest firmware for security patches",
          "Manage storage by removing unused apps and files",
          "Use dark mode to reduce power consumption",
          "Limit location services when not needed",
          "Close unnecessary browser tabs and applications",
          "Enable adaptive battery mode for optimal efficiency"
        ],
    maintenance_tips: Array.isArray(intelligence?.management?.maintenance_tips) 
      ? intelligence.management.maintenance_tips.filter((s: any) => typeof s === 'string')
      : [
          "Avoid exposing to extreme temperatures",
          "Keep device away from moisture and humidity",
          "Use protective case and screen protector",
          "Clean vents and ports regularly with dry cloth",
          "Avoid dropping or physical impacts",
          "Keep software and drivers up to date",
          "Check for hardware issues monthly",
          "Store in cool, dry place when not in use"
        ],
    common_issues: Array.isArray(intelligence?.management?.common_issues) 
      ? intelligence.management.common_issues.filter((s: any) => typeof s === 'string')
      : [
          "Battery drains faster than expected",
          "Device overheats during heavy usage",
          "Occasional lag or freezing",
          "Speaker or audio quality issues",
          "Display brightness problems",
          "Charging port connectivity issues",
          "Performance degradation over time",
          "Network connectivity interruptions"
        ]
  };

  const sustainability = {
    eco_score: intelligence?.sustainability?.eco_score ?? 65,
    eco_label: intelligence?.sustainability?.eco_label || "B",
    hazardous_materials: Array.isArray(intelligence?.sustainability?.hazardous_materials)
      ? intelligence.sustainability.hazardous_materials.filter((m: any) => typeof m === 'string')
      : [],
    recyclable_parts: Array.isArray(intelligence?.sustainability?.recyclable_parts)
      ? intelligence.sustainability.recyclable_parts.filter((p: any) => typeof p === 'string')
      : ["Aluminum frame", "Glass/LCD", "Battery", "Copper wiring", "Circuit boards", "Rare earth metals"],
    carbon_footprint_est: String(intelligence?.sustainability?.carbon_footprint_est || "Medium Impact").substring(0, 100),
    recycling_instructions: String(intelligence?.sustainability?.recycling_instructions || "Check with local e-waste center").substring(0, 250)
  };

  const specs = {
    cpu: String(intelligence?.specs?.cpu || "Standard").substring(0, 100),
    memory: (() => {
      const mem = intelligence?.specs?.memory;
      if (typeof mem === 'object' && mem !== null) {
        return Object.values(mem).filter(v => typeof v === 'string').join(", ") || "4GB";
      }
      return String(mem || "4GB").substring(0, 100);
    })(),
    battery: (() => {
      const batt = intelligence?.specs?.battery;
      if (typeof batt === 'object' && batt !== null) {
        return Object.values(batt).filter(v => typeof v === 'string').join(", ") || "3000-4000 mAh";
      }
      return String(batt || "3000-4000 mAh").substring(0, 100);
    })(),
    display: (() => {
      const disp = intelligence?.specs?.display;
      if (typeof disp === 'object' && disp !== null) {
        return Object.values(disp).filter(v => typeof v === 'string').join(", ") || "6.5 inch";
      }
      return String(disp || "6.5 inch").substring(0, 100);
    })(),
    notable_features: Array.isArray(intelligence?.specs?.notable_features) ? intelligence.specs.notable_features.filter((f: any) => typeof f === 'string') : ["Modern", "Connected"]
  };

  const market_value = {
    original_price_est: (() => {
      const price = intelligence?.market_value?.original_price_est;
      if (typeof price === 'object' && price !== null) {
        return Object.values(price).filter(v => typeof v === 'string').join(", ") || "$500-800";
      }
      return String(price || "$500-800").substring(0, 100);
    })(),
    current_resale_est: (() => {
      const resale = intelligence?.market_value?.current_resale_est;
      if (typeof resale === 'object' && resale !== null) {
        return Object.values(resale).filter(v => typeof v === 'string').join(", ") || "$200-400";
      }
      return String(resale || "$200-400").substring(0, 100);
    })(),
    trade_in_recommendation: (() => {
      const trade = intelligence?.market_value?.trade_in_recommendation;
      if (typeof trade === 'object' && trade !== null) {
        return Object.values(trade).filter(v => typeof v === 'string').join(", ") || "Good condition for 2-3 year devices";
      }
      return String(trade || "Good condition for 2-3 year devices").substring(0, 200);
    })()
  };

  console.log("💰 Market Value Data:", market_value);
  console.log("🌿 Sustainability Data:", sustainability);
  console.log("♻️ Waste Info:", waste_info);
  console.log("🔧 Management Suggestions:", {
    optimizationCount: management.optimization_suggestions.length,
    maintenanceCount: management.maintenance_tips.length,
    commonIssuesCount: management.common_issues.length,
    suggestions: management
  });

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${safeProduct.name.replace(/\/\s+/g, "_")}_intelligence.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleInitiateLog = async () => {
    setLogging(true);
    try {
      const response = await httpClient.post("/products", {
        name: safeProduct.name,
        category: safeProduct.category,
        manufacturer: safeProduct.brand,
        metadata_json: intelligence
      });
      
      if (response.status === 200 || response.status === 201) {
        alert("🚀 Product Lifecycle Log Initiated Successfully!");
      } else {
        throw new Error("Failed to log product");
      }
    } catch (err: any) {
      console.error("Lifecycle log error:", err.response?.data || err.message);
      alert("❌ Error: Could not initiate lifecycle log.");
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header / Identity */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-background to-background border border-primary/10 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Smartphone className="w-48 h-48 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6">
          <div className="flex bg-primary h-20 w-20 rounded-2xl items-center justify-center shadow-lg shadow-primary/20 ring-4 ring-primary/10">
            <Smartphone className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              AI Verified Identification
            </div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">{safeProduct.name}</h1>
            <p className="text-lg text-muted-foreground font-medium">
              {safeProduct.brand} • {safeProduct.category} • Released {safeProduct.release_year}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Specifications HUD */}
        <Card className="md:col-span-2 glass-card border-none overflow-hidden">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cpu className="h-5 w-5 text-primary" />
              Technical Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                  <Cpu className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Processor</p>
                  <p className="text-sm font-bold text-foreground">{specs.cpu || "Standard Chipset"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                  <Battery className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Energy Unit</p>
                  <p className="text-sm font-bold text-foreground">{specs.battery || "Proprietary Li-ion"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                  <Layers className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Architecture</p>
                  <p className="text-sm font-bold text-foreground">{specs.memory || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center shadow-sm">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase">Display Matrix</p>
                  <p className="text-sm font-bold text-foreground">{specs.display || "N/A"}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Key Features</p>
              <div className="flex flex-wrap gap-2">
                {specs.notable_features.map((f: string) => (
                  <span key={f} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-tight">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Value & Life Tracking */}
        <Card className="glass-card border-none bg-gradient-to-b from-indigo-500/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              Lifecycle Economy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <p className="text-xs font-bold text-indigo-500 uppercase mb-1">Current Resale Range</p>
              <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{market_value.current_resale_est}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Launch Value</p>
                <p className="text-lg font-bold">{market_value.original_price_est}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground uppercase">Expert Verdict</p>
                <p className="text-sm leading-relaxed">{market_value.trade_in_recommendation}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intelligent Management */}
        <Card className="glass-card border-none">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-amber-500" />
              Smart Management Hub
            </CardTitle>
            <CardDescription>AI-driven suggestions to maximize product performance.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Performance Optimization</h4>
              <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {management.optimization_suggestions.map((s: string, idx: number) => (
                  <li key={idx} className="text-sm flex gap-3 text-muted-foreground hover:text-foreground transition-colors">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 pt-2 border-t border-border/30">
              <h4 className="text-sm font-bold flex items-center gap-2"><Battery className="h-4 w-4 text-emerald-500" /> Maintenance Guard</h4>
              <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {management.maintenance_tips.map((s: string, idx: number) => (
                  <li key={idx} className="text-sm flex gap-3 text-muted-foreground hover:text-foreground transition-colors">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 pt-2 border-t border-border/30">
              <h4 className="text-sm font-bold flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /> Common Issues & Solutions</h4>
              <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
                {management.common_issues.map((issue: string, idx: number) => (
                  <li key={idx} className="text-sm flex gap-3 text-muted-foreground hover:text-foreground transition-colors">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Sustainability Intelligence */}
        <Card className="glass-card border-none bg-gradient-to-br from-emerald-500/5 to-background border-emerald-500/20">
          <CardHeader className="border-b border-emerald-500/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Leaf className="h-5 w-5 text-emerald-500" />
                Sustainability Profile
              </CardTitle>
              <div className="flex items-center justify-center font-black text-2xl h-14 w-14 rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/10">
                {sustainability.eco_score}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Eco Score Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Sustainability Score</p>
                <p className="text-xs font-bold text-emerald-600">{Math.min(100, Math.max(0, sustainability.eco_score))}%</p>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, sustainability.eco_score))}%` }}
                />
              </div>
            </div>

            {/* Eco Label */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Classification</p>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">Grade {sustainability.eco_label}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                {sustainability.eco_label === "A" && "Excellent environmental performance"}
                {sustainability.eco_label === "B" && "Good environmental performance"}
                {sustainability.eco_label === "C" && "Moderate environmental performance"}
                {sustainability.eco_label === "D" && "Below average environmental performance"}
                {!["A", "B", "C", "D"].includes(sustainability.eco_label) && "Carbon neutral certified or optimal eco rating"}
              </p>
            </div>

            {/* Carbon Footprint */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase text-amber-600 dark:text-amber-400">Carbon Footprint Impact</p>
                <p className="text-sm font-medium text-foreground mt-1">{sustainability.carbon_footprint_est}</p>
                <p className="text-xs text-muted-foreground mt-1">Estimated environmental impact from production and usage</p>
              </div>
            </div>

            {/* Hazardous Materials */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase text-red-600 dark:text-red-400">Hazardous Materials</p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {sustainability.hazardous_materials.length > 0 ? sustainability.hazardous_materials.join(", ") : "✓ None detected"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {sustainability.hazardous_materials.length > 0 
                    ? "Contains materials requiring special disposal care"
                    : "Safe for standard recycling programs"}
                </p>
              </div>
            </div>

            {/* Recycling Info */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Trash2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400">End-of-Life Strategy</p>
                <p className="text-sm font-medium text-foreground mt-1 leading-relaxed">{sustainability.recycling_instructions}</p>
                <p className="text-xs text-muted-foreground mt-2">💡 Tip: Contact local e-waste centers for certified recycling</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recyclable Parts Inventory */}
        <Card className="glass-card border-none bg-gradient-to-br from-cyan-500/5 to-background border-cyan-500/20">
          <CardHeader className="border-b border-cyan-500/10">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Recycle className="h-5 w-5 text-cyan-500" />
              Recyclable Parts & Materials
            </CardTitle>
            <CardDescription>Components that can be recovered and reused</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-3">
              {sustainability.recyclable_parts.map((part: string, idx: number) => (
                <div 
                  key={idx} 
                  className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                    <p className="text-sm font-medium text-foreground line-clamp-2">{part}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Footer */}
      <div className="rounded-2xl p-6 bg-muted/20 border border-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <Info className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground">Next Suggested Action</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {waste_info?.disposal 
                ? (typeof waste_info.disposal === 'string' ? waste_info.disposal : waste_info.disposal?.instructions || "Follow local e-waste disposal protocols.")
                : "Follow local e-waste disposal protocols."}
            </p>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0 justify-end">
          <button 
            onClick={handleInitiateLog}
            disabled={logging}
            className="flex-1 md:flex-none px-6 py-2.5 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
          >
            {logging ? "Logging..." : "Initiate Lifecycle Log"}
          </button>
          <button 
            onClick={handleExport}
            className="flex-1 md:flex-none px-6 py-2.5 bg-background border border-border rounded-lg font-bold hover:bg-muted transition-all"
          >
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}
