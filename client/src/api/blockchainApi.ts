import { httpClient } from "./httpClient";

export async function fetchLedger() {
  const { data } = await httpClient.get("/blockchain/ledger");
  return data;
}

export async function verifyIntegrity() {
  const { data } = await httpClient.get("/blockchain/verify");
  return data;
}
