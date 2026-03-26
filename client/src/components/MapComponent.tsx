import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export type GeoLocation = { lat: number; lng: number };

const MOCK_LOCATIONS = [
  // Major Indian Cities
  { lat: 28.6139, lng: 77.2090 }, // New Delhi
  { lat: 19.0760, lng: 72.8777 }, // Mumbai
  { lat: 12.9716, lng: 77.5946 }, // Bangalore
  { lat: 17.3850, lng: 78.4867 }, // Hyderabad
  { lat: 13.0827, lng: 80.2707 }, // Chennai
  { lat: 22.5726, lng: 88.3639 }, // Kolkata
  { lat: 18.5204, lng: 73.8567 }, // Pune
  { lat: 23.0225, lng: 72.5714 }, // Ahmedabad
  { lat: 26.9124, lng: 75.7873 }, // Jaipur
  { lat: 26.8467, lng: 80.9462 }, // Lucknow
  { lat: 30.7333, lng: 76.7794 }, // Chandigarh
  { lat: 9.9312, lng: 76.2673 },  // Kochi
  { lat: 22.7196, lng: 75.8577 }, // Indore
  { lat: 25.5941, lng: 85.1376 }, // Patna
  { lat: 21.1458, lng: 79.0882 }, // Nagpur
];

export function MapComponent({ locations }: { locations: GeoLocation[] }) {
  const displayLocations = (!locations || locations.length === 0) ? MOCK_LOCATIONS : locations;

  // If we are strictly using mock locations, center on India to see all points
  const center: [number, number] = displayLocations === MOCK_LOCATIONS 
    ? [20.5937, 78.9629] // Center of India
    : [displayLocations[0].lat, displayLocations[0].lng];

  return (
    <div className="h-full w-full overflow-hidden rounded-md border border-border" style={{ isolation: 'isolate', zIndex: 0 }}>
      {/* We set a specific height for MapContainer if its parent doesn't provide an explicit one, but passing 100% works if parent is a fixed height div */}
      <MapContainer center={center} zoom={displayLocations === MOCK_LOCATIONS ? 4 : 5} style={{ height: "100%", width: "100%", zIndex: 0 }}>
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
