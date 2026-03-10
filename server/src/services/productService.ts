import { randomUUID } from "crypto";
import { AppError } from "../utils/errors";
import { findProductById, insertProduct, listProducts } from "../repos/productRepo";

export async function createProduct(input: {
  name: string;
  category: string;
  manufacturer: string;
  metadata_json: any;
}) {
  const id = randomUUID();
  await insertProduct({
    id,
    name: input.name.trim(),
    category: input.category.trim(),
    manufacturer: input.manufacturer.trim(),
    metadata_json: input.metadata_json ?? {}
  });

  const created = await findProductById(id);
  if (!created) throw new AppError("Product creation failed", 500, "PRODUCT_CREATE_FAILED");
  return created;
}

export async function getProduct(productId: string) {
  const product = await findProductById(productId);
  if (!product) throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  return product;
}

export async function getProducts(params: { limit?: number; offset?: number }) {
  const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
  const offset = Math.max(params.offset ?? 0, 0);
  const items = await listProducts(limit, offset);
  return { items, limit, offset };
}

