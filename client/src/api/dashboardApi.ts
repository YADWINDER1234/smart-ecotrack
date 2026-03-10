import { httpClient } from "./httpClient";

export async function fetchAdminDashboard() {
  const { data } = await httpClient.get("/dashboard/admin");
  return data;
}

export async function fetchManufacturerDashboard() {
  const { data } = await httpClient.get("/dashboard/manufacturer");
  return data;
}

