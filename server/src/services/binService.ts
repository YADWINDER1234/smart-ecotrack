import { randomUUID } from "crypto";
import {
  insertBin,
  findAllBins,
  findBinById,
  updateBinSensorData as repoUpdateSensor,
  findBinsNearingFull,
  getBinStats as repoGetBinStats,
  type BinRow,
  type BinType
} from "../repos/binRepo";
import { AppError } from "../utils/errors";

export async function getAllBins(): Promise<BinRow[]> {
  return findAllBins();
}

export async function getBinById(id: string): Promise<BinRow> {
  const bin = await findBinById(id);
  if (!bin) throw new AppError("Bin not found", 404, "BIN_NOT_FOUND");
  return bin;
}

export async function createBin(data: {
  name: string;
  location_lat: number;
  location_lng: number;
  bin_type?: BinType;
}): Promise<{ id: string }> {
  const id = randomUUID();
  await insertBin({
    id,
    name: data.name,
    location_lat: data.location_lat,
    location_lng: data.location_lng,
    bin_type: data.bin_type || "GENERAL",
    fill_level: 0,
    weight_kg: 0,
    gas_level: 0,
    status: "ACTIVE"
  });
  return { id };
}

export async function updateBinSensorData(
  binId: string,
  data: { fill_level?: number; weight_kg?: number; gas_level?: number }
): Promise<BinRow> {
  const bin = await findBinById(binId);
  if (!bin) throw new AppError("Bin not found", 404, "BIN_NOT_FOUND");
  await repoUpdateSensor(binId, data);
  return getBinById(binId);
}

export async function predictOverflow(binId: string): Promise<{
  binId: string;
  currentFillLevel: number;
  predictedOverflowAt: string | null;
  hoursUntilFull: number | null;
}> {
  const bin = await getBinById(binId);

  if (bin.fill_level >= 95) {
    return {
      binId,
      currentFillLevel: bin.fill_level,
      predictedOverflowAt: new Date().toISOString(),
      hoursUntilFull: 0
    };
  }

  if (bin.fill_level <= 5) {
    return {
      binId,
      currentFillLevel: bin.fill_level,
      predictedOverflowAt: null,
      hoursUntilFull: null
    };
  }

  // Simple linear prediction: assume fill rate based on current level
  // In production, use historical data with actual regression
  const fillRate = bin.fill_level / 24; // assume current level accumulated over ~24 hours
  const remaining = 100 - bin.fill_level;
  const hoursUntilFull = fillRate > 0 ? Math.round(remaining / fillRate) : null;
  const predictedOverflowAt = hoursUntilFull
    ? new Date(Date.now() + hoursUntilFull * 3600000).toISOString()
    : null;

  return {
    binId,
    currentFillLevel: bin.fill_level,
    predictedOverflowAt,
    hoursUntilFull
  };
}

export async function getBinStats() {
  return repoGetBinStats();
}

export async function getBinsNeedingCollection(threshold = 70): Promise<BinRow[]> {
  return findBinsNearingFull(threshold);
}
