import { useEffect, useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import RoleSidebar from "../components/RoleSidebar";
import { Breadcrumb } from "../components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Plus, AlertTriangle, CheckCircle2, MapPin } from "lucide-react";
import { fetchBins, fetchBinStats, createBin } from "../api/binApi";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Bin = {
  id: string;
  name: string;
  location_lat: number;
  location_lng: number;
  bin_type: string;
  fill_level: number;
  weight_kg: number;
  gas_level: number;
  status: string;
  last_reading_at: string | null;
  predicted_overflow_at: string | null;
};

function BinGauge({ level }: { level: number }) {
  const color = level >= 90 ? "#ef4444" : level >= 70 ? "#f59e0b" : level >= 40 ? "#3b82f6" : "#22c55e";
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (level / 100) * circumference;
  return (
    <svg width="88" height="88" className="transform -rotate-90">
      <circle cx="44" cy="44" r="36" stroke="currentColor" strokeWidth="6" fill="none" className="text-muted/30" />
      <circle cx="44" cy="44" r="36" stroke={color} strokeWidth="6" fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
        className="transition-all duration-700 ease-out" />
      <text x="44" y="48" textAnchor="middle" className="fill-current transform rotate-90 origin-center"
        style={{ fontSize: "14px", fontWeight: 800 }}>{level}%</text>
    </svg>
  );
}

const BIN_TYPE_COLORS: Record<string, string> = {
  PLASTIC: "#3b82f6", METAL: "#6b7280", GLASS: "#06b6d4", PAPER: "#f59e0b",
  ORGANIC: "#22c55e", EWASTE: "#a855f7", GENERAL: "#64748b"
};

export function SmartBinDashboard() {
  const [bins, setBins] = useState<Bin[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", location_lat: "", location_lng: "", bin_type: "GENERAL" });
  const [creating, setCreating] = useState(false);

  useEffect(() => { void loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [binData, statsData] = await Promise.all([fetchBins(), fetchBinStats()]);
      setBins(binData.bins || []);
      setStats(statsData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleCreate() {
    setCreating(true);
    try {
      await createBin({
        name: form.name,
        location_lat: parseFloat(form.location_lat),
        location_lng: parseFloat(form.location_lng),
        bin_type: form.bin_type
      });
      setShowForm(false);
      setForm({ name: "", location_lat: "", location_lng: "", bin_type: "GENERAL" });
      await loadData();
    } catch (err) { console.error(err); } finally { setCreating(false); }
  }

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 md:px-8">
        <RoleSidebar />
        <div className="flex-1 space-y-6">
          <div className="mb-2">
            <Breadcrumb />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-emerald-500" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Smart Bin Monitor</h1>
              </div>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" /> Add Bin
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-sm"><CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Bins</p>
                <p className="text-3xl font-black text-foreground mt-1">{stats.total}</p>
              </CardContent></Card>
              <Card className="border-none shadow-sm border-l-4 border-l-amber-500"><CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-500">Near Full (≥80%)</p>
                <p className="text-3xl font-black text-foreground mt-1">{stats.nearFull}</p>
              </CardContent></Card>
              <Card className="border-none shadow-sm border-l-4 border-l-red-500"><CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-500">Full (≥95%)</p>
                <p className="text-3xl font-black text-foreground mt-1">{stats.full}</p>
              </CardContent></Card>
              <Card className="border-none shadow-sm"><CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Avg Fill Level</p>
                <p className="text-3xl font-black text-blue-500 mt-1">{Number(stats.avgFill).toFixed(0)}%</p>
              </CardContent></Card>
            </div>
          )}

          {/* Create Bin Form */}
          {showForm && (
            <Card className="border-2 border-primary/30 shadow-md animate-in fade-in slide-in-from-top-4 duration-300">
              <CardHeader><CardTitle>Add New Bin</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input id="bin-name" placeholder="Bin Name" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <select id="bin-type" value={form.bin_type} onChange={e => setForm(p => ({...p, bin_type: e.target.value}))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {["GENERAL","PLASTIC","METAL","GLASS","PAPER","ORGANIC","EWASTE"].map(t =>
                      <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input id="bin-lat" placeholder="Latitude" type="number" step="any" value={form.location_lat}
                    onChange={e => setForm(p => ({...p, location_lat: e.target.value}))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                  <input id="bin-lng" placeholder="Longitude" type="number" step="any" value={form.location_lng}
                    onChange={e => setForm(p => ({...p, location_lng: e.target.value}))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreate} disabled={creating || !form.name}>
                    {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground p-4"><Loader2 className="h-5 w-5 animate-spin" /> Loading bins...</div>
          ) : bins.length === 0 ? (
            <Card className="border-none shadow-sm"><CardContent className="p-8 text-center text-muted-foreground">
              No bins registered yet. Click "Add Bin" to create one.
            </CardContent></Card>
          ) : (
            <>
              {/* Map View */}
              <Card className="border-none shadow-sm h-[400px]">
                <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5" /> Bin Locations</CardTitle></CardHeader>
                <CardContent className="h-[320px]">
                  <div className="h-full w-full overflow-hidden rounded-md border border-border" style={{ isolation: 'isolate', zIndex: 0 }}>
                    <MapContainer center={[Number(bins[0].location_lat), Number(bins[0].location_lng)]} zoom={4}
                      style={{ height: "100%", width: "100%", zIndex: 0 }}>
                      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {bins.map(bin => (
                        <CircleMarker key={bin.id} center={[Number(bin.location_lat), Number(bin.location_lng)]}
                          radius={10 + (bin.fill_level / 10)}
                          pathOptions={{ color: "#fff", weight: 2, fillColor: BIN_TYPE_COLORS[bin.bin_type] || "#64748b", fillOpacity: 0.85 }}>
                          <Popup>
                            <div className="text-sm"><strong>{bin.name}</strong><br/>Type: {bin.bin_type}<br/>Fill: {bin.fill_level}%<br/>Status: {bin.status}</div>
                          </Popup>
                        </CircleMarker>
                      ))}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Bin Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {bins.map(bin => (
                  <Card key={bin.id} className={`border-none shadow-sm transition-all hover:shadow-md ${bin.status === 'FULL' ? 'ring-2 ring-red-500/50' : ''}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold"
                              style={{ backgroundColor: (BIN_TYPE_COLORS[bin.bin_type] || "#64748b") + "20", color: BIN_TYPE_COLORS[bin.bin_type] || "#64748b" }}>
                              {bin.bin_type}
                            </span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                              bin.status === 'FULL' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                              bin.status === 'MAINTENANCE' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'}`}>
                              {bin.status === 'FULL' ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                              {bin.status}
                            </span>
                          </div>
                          <h3 className="font-bold text-foreground">{bin.name}</h3>
                          <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                            <p>Weight: {Number(bin.weight_kg).toFixed(1)} kg</p>
                            <p>Gas: {Number(bin.gas_level).toFixed(1)}</p>
                            {bin.last_reading_at && <p>Last reading: {new Date(bin.last_reading_at).toLocaleString()}</p>}
                          </div>
                        </div>
                        <BinGauge level={bin.fill_level} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
