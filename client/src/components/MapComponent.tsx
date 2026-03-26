import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type GeoLocation = { lat: number; lng: number };

const MOCK_LOCATIONS = [
  { lat: 40.7128, lng: -74.0060 }, { lat: 40.7148, lng: -74.0080 },
  { lat: 40.7168, lng: -74.0020 }, { lat: 40.7098, lng: -74.0160 },
  { lat: 40.7228, lng: -73.9960 }, { lat: 40.7108, lng: -74.0010 },
  { lat: 40.7258, lng: -73.9860 }, { lat: 40.7058, lng: -74.0260 },
  { lat: 40.7328, lng: -73.9760 }, { lat: 40.7018, lng: -74.0360 },
  { lat: 40.7428, lng: -73.9660 }, { lat: 40.6958, lng: -74.0460 },
];

export function MapComponent({ locations }: { locations: GeoLocation[] }) {
  const displayLocations = (!locations || locations.length === 0) ? MOCK_LOCATIONS : locations;

  // Calculate center based on first location
  const center = { lat: displayLocations[0].lat, lng: displayLocations[0].lng };

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border" style={{ isolation: 'isolate', zIndex: 0 }}>
      {/* We set a specific height for MapContainer if its parent doesn't provide an explicit one, but passing 100% works if parent is a fixed height div */}
      <MapContainer center={center} zoom={4} style={{ height: "100%", width: "100%", zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {displayLocations.map((loc, idx) => (
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
