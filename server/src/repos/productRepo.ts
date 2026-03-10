import { db } from "../db/connection";

export type ProductRow = {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  metadata_json: any;
  created_at: Date;
};

export async function insertProduct(input: {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  metadata_json: any;
}): Promise<void> {
  await db("products").insert(input);
}

export async function findProductById(id: string): Promise<ProductRow | null> {
  const row = await db<ProductRow>("products").where({ id }).first();
  return row ?? null;
}

export async function listProducts(limit = 50, offset = 0): Promise<ProductRow[]> {
  return db<ProductRow>("products")
    .select("*")
    .orderBy("created_at", "desc")
    .limit(limit)
    .offset(offset);
}

