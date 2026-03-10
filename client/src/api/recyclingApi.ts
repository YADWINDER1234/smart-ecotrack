import { httpClient } from "./httpClient";

export async function submitIntent(input: { qr_id: string; notes?: string }) {
  const { data } = await httpClient.post("/recycling/intent", input);
  return data;
}

export async function confirmReceived(input: { qr_id: string; notes?: string }) {
  const { data } = await httpClient.post("/recycling/received", input);
  return data;
}

export async function logSorted(input: { qr_id: string; notes?: string }) {
  const { data } = await httpClient.post("/recycling/sorted", input);
  return data;
}

export async function finalize(input: { qr_id: string; notes?: string; evidence_url?: string }) {
  const { data } = await httpClient.post("/recycling/finalize", input);
  return data;
}

export async function getEvents(qrId: string) {
  const { data } = await httpClient.get(`/recycling/qr/${qrId}/events`);
  return data;
}

