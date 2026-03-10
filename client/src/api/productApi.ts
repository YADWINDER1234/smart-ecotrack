import { httpClient } from "./httpClient";

export type Product = {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  metadata_json: any;
  created_at: string;
};

export async function listProducts(params?: { limit?: number; offset?: number }) {
  const { data } = await httpClient.get("/products", { params });
  return data as { items: Product[]; limit: number; offset: number };
}

export async function createProduct(input: {
  name: string;
  category: string;
  manufacturer: string;
  metadata_json: any;
}) {
  const { data } = await httpClient.post("/products/admin", input);
  return data as { product: Product };
}

