import { getBinsNeedingCollection } from "./binService";
import type { BinRow } from "../repos/binRepo";

interface RouteWaypoint {
  binId: string;
  name: string;
  lat: number;
  lng: number;
  fillLevel: number;
}

interface OptimizedRoute {
  waypoints: RouteWaypoint[];
  totalDistanceKm: number;
  estimatedTimeMinutes: number;
  routeGeometry: Array<[number, number]>; // [lat, lng] pairs
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Nearest-neighbor route optimization (greedy TSP approximation)
function optimizeWaypointOrder(waypoints: RouteWaypoint[]): RouteWaypoint[] {
  if (waypoints.length <= 2) return waypoints;

  const ordered: RouteWaypoint[] = [];
  const remaining = [...waypoints];

  // Start with the first waypoint
  ordered.push(remaining.shift()!);

  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = haversineDistance(last.lat, last.lng, remaining[i].lat, remaining[i].lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    ordered.push(remaining.splice(nearestIdx, 1)[0]);
  }

  return ordered;
}

function binsToWaypoints(bins: BinRow[]): RouteWaypoint[] {
  return bins.map((b) => ({
    binId: b.id,
    name: b.name,
    lat: Number(b.location_lat),
    lng: Number(b.location_lng),
    fillLevel: b.fill_level
  }));
}

export async function optimizeRoute(bins: BinRow[]): Promise<OptimizedRoute> {
  const waypoints = binsToWaypoints(bins);

  // Sort by fill level descending first (most urgent first group)
  waypoints.sort((a, b) => b.fillLevel - a.fillLevel);

  // Optimize route order using nearest-neighbor
  const optimized = optimizeWaypointOrder(waypoints);

  // Calculate total distance
  let totalDistance = 0;
  const geometry: Array<[number, number]> = [];

  for (let i = 0; i < optimized.length; i++) {
    geometry.push([optimized[i].lat, optimized[i].lng]);
    if (i > 0) {
      totalDistance += haversineDistance(
        optimized[i - 1].lat,
        optimized[i - 1].lng,
        optimized[i].lat,
        optimized[i].lng
      );
    }
  }

  // Estimate time: ~30 km/h average speed for urban collection + 5 min per stop
  const drivingTime = (totalDistance / 30) * 60;
  const stopTime = optimized.length * 5;
  const estimatedTime = Math.round(drivingTime + stopTime);

  return {
    waypoints: optimized,
    totalDistanceKm: Math.round(totalDistance * 100) / 100,
    estimatedTimeMinutes: estimatedTime,
    routeGeometry: geometry
  };
}

export async function getCollectionPlan(fillThreshold = 70): Promise<OptimizedRoute> {
  const bins = await getBinsNeedingCollection(fillThreshold);

  if (bins.length === 0) {
    return {
      waypoints: [],
      totalDistanceKm: 0,
      estimatedTimeMinutes: 0,
      routeGeometry: []
    };
  }

  return optimizeRoute(bins);
}
