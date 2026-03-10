import { httpClient } from "./httpClient";

export async function generateQrForProduct(productId: string, input?: { daysValid?: number }) {
  const { data } = await httpClient.post(`/qr/admin/products/${productId}/qr`, input ?? {});
  return data as { qr: { qr_id: string; expiry: number; token: string; token_hash: string } };
}

export async function revokeQr(qrId: string) {
  await httpClient.post(`/qr/admin/qr/${qrId}/revoke`);
}

export async function scanQr(token: string) {
  const { data } = await httpClient.post("/qr/scan", { token });
  return data;
}

