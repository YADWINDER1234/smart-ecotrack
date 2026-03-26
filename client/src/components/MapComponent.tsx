import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type GeoLocation = { lat: number; lng: number };

export function MapComponent({ locations }: { locations: GeoLocation[] }) {
  if (!locations || locations.length === 0) {
    return <div className="h-full w-full flex items-center justify-center bg-muted/20 text-muted-foreground rounded-md border border-border">No location data available yet.</div>;
  }

  // Calculate center based on first location
  const center = { lat: locations[0].lat, lng: locations[0].lng };

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border" style={{ isolation: 'isolate', zIndex: 0 }}>
      {/* We set a specific height for MapContainer if its parent doesn't provide an explicit one, but passing 100% works if parent is a fixed height div */}
      <MapContainer center={center} zoom={4} style={{ height: "100%", width: "100%", zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((loc, idx) => (
          <CircleMarker 
            key={idx} 
            center={[loc.lat, loc.lng]} 
            radius={8} 
            pathOptions={{ color: '#ffffff', weight: 2, fillColor: '#ef4444', fillOpacity: 0.8 }}
          >
            <Popup>
              <div className="text-sm">
                <strong>Scan Activity</strong><br/>
                Lat: {loc.lat.toFixed(4)}<br/>
                Lng: {loc.lng.toFixed(4)}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
