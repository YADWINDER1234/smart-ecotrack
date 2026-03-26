import { httpClient } from "./httpClient";

export async function fetchBins() {
  const { data } = await httpClient.get("/bins");
  return data;
}

export async function fetchBinStats() {
  const { data } = await httpClient.get("/bins/stats");
  return data;
}

export async function createBin(bin: {
  name: string;
  location_lat: number;
  location_lng: number;
  bin_type?: string;
}) {
  const { data } = await httpClient.post("/bins", bin);
  return data;
}

export async function fetchOverflowPrediction(binId: string) {
  const { data } = await httpClient.get(`/bins/${binId}/predict`);
  return data;
}

export async function ingestSensorData(binId: string, sensorData: {
  fill_level?: number;
  weight_kg?: number;
  gas_level?: number;
}) {
  const { data } = await httpClient.post(`/bins/${binId}/sensor`, sensorData);
  return data;
}
