import { useEffect, useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import RoleSidebar from "../components/RoleSidebar";
import { Breadcrumb } from "../components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Route, MapPin, Clock, Truck, Navigation } from "lucide-react";
import { fetchCollectionPlan } from "../api/routeApi";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MOCK_ROUTE_PLAN = {
  waypoints: [
    { binId: "mock1", name: "Downtown Plastic Bin", lat: 40.7128, lng: -74.0060, fillLevel: 95 },
    { binId: "mock2", name: "Central Park General", lat: 40.7812, lng: -73.9665, fillLevel: 88 },
    { binId: "mock3", name: "Times Square Glass", lat: 40.7580, lng: -73.9855, fillLevel: 75 },
    { binId: "mock4", name: "Brooklyn Bridge E-Waste", lat: 40.7061, lng: -73.9969, fillLevel: 100 }
  ],
  routeGeometry: [
    [40.7128, -74.0060],
    [40.7061, -73.9969],
    [40.7580, -73.9855],
    [40.7812, -73.9665]
  ],
  totalDistanceKm: 14.2,
  estimatedTimeMinutes: 45
};

export function RouteOptimizationPage() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { void loadPlan(); }, []);

  async function loadPlan() {
    setLoading(true);
    try {
      let data = await fetchCollectionPlan();
      if (!data || !data.waypoints || data.waypoints.length === 0) {
        data = MOCK_ROUTE_PLAN;
      }
      setPlan(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  const hasWaypoints = plan?.waypoints?.length > 0;

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      <Navbar />
      <main className="container mx-auto flex flex-col md:flex-row gap-8 py-8 px-4 md:px-8">
        <RoleSidebar />
        <div className="flex-1 space-y-6">
          <Breadcrumb />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <Route className="h-6 w-6 text-violet-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Route Optimizer</h1>
            </div>
            <Button onClick={loadPlan} variant="outline" className="gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              Refresh Route
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground p-4"><Loader2 className="h-5 w-5 animate-spin" /> Calculating optimal route...</div>
          ) : !hasWaypoints ? (
            <Card className="border-none shadow-sm">
              <CardContent className="p-8 text-center">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium text-foreground">No bins need collection</p>
                <p className="text-sm text-muted-foreground mt-1">All bins are below the fill threshold. Check back later.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="border-none shadow-sm"><CardContent className="p-5 text-center">
                  <MapPin className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-black">{plan.waypoints.length}</p>
                  <p className="text-xs text-muted-foreground">Stops</p>
                </CardContent></Card>
                <Card className="border-none shadow-sm"><CardContent className="p-5 text-center">
                  <Route className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-2xl font-black">{plan.totalDistanceKm} km</p>
                  <p className="text-xs text-muted-foreground">Distance</p>
                </CardContent></Card>
                <Card className="border-none shadow-sm"><CardContent className="p-5 text-center">
                  <Clock className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-2xl font-black">{plan.estimatedTimeMinutes} min</p>
                  <p className="text-xs text-muted-foreground">Est. Time</p>
                </CardContent></Card>
              </div>

              {/* Map */}
              <Card className="border-none shadow-sm h-[500px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Optimized Collection Route</CardTitle>
                  <CardDescription>Route sorted by urgency and proximity</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <div className="h-full w-full overflow-hidden rounded-md border border-border" style={{ isolation: 'isolate', zIndex: 0 }}>
                    <MapContainer
                      center={[plan.waypoints[0].lat, plan.waypoints[0].lng]}
                      zoom={5} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {/* Route polyline */}
                      <Polyline
                        positions={plan.routeGeometry}
                        pathOptions={{ color: "#7c3aed", weight: 3, opacity: 0.8, dashArray: "10 6" }}
                      />
                      {/* Waypoint markers */}
                      {plan.waypoints.map((wp: any, idx: number) => (
                        <CircleMarker key={wp.binId}
                          center={[wp.lat, wp.lng]} radius={12}
                          pathOptions={{
                            color: '#fff', weight: 2,
                            fillColor: wp.fillLevel >= 90 ? '#ef4444' : wp.fillLevel >= 70 ? '#f59e0b' : '#22c55e',
                            fillOpacity: 0.9
                          }}>
                          <Popup>
                            <div className="text-sm">
                              <strong>Stop #{idx + 1}: {wp.name}</strong><br/>
                              Fill Level: {wp.fillLevel}%
                            </div>
                          </Popup>
                        </CircleMarker>
                      ))}
                    </MapContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Stop List */}
              <Card className="border-none shadow-sm">
                <CardHeader><CardTitle className="text-lg">Collection Order</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {plan.waypoints.map((wp: any, idx: number) => (
                      <div key={wp.binId} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{wp.name}</p>
                          <p className="text-xs text-muted-foreground">({wp.lat.toFixed(4)}, {wp.lng.toFixed(4)})</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          wp.fillLevel >= 90 ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300' :
                          wp.fillLevel >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'}`}>
                          {wp.fillLevel}%
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
