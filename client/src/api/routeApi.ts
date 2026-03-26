import { httpClient } from "./httpClient";

export async function fetchOptimizedRoute(threshold?: number) {
  const params = threshold ? { threshold } : {};
  const { data } = await httpClient.get("/routes/optimize", { params });
  return data;
}

export async function fetchCollectionPlan() {
  const { data } = await httpClient.get("/routes/collection-plan");
  return data;
}
