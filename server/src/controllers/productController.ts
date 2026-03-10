import type { RequestHandler } from "express";
import { z } from "zod";
import { createProduct, getProduct, getProducts } from "../services/productService";
import { audit } from "../services/auditService";
import { getMe } from "../services/authService";

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  category: z.string().min(2).max(100),
  manufacturer: z.string().min(2).max(200),
  metadata_json: z.record(z.any()).default({})
});

export const createProductHandler: RequestHandler = async (req, res, next) => {
  try {
    // Enforce data integrity: Manufacturers can only create products under their own name.
    if (req.user?.role === "MANUFACTURER") {
      const u = await getMe(req.user.id);
      req.body.manufacturer = u.name;
    }

    const product = await createProduct(req.body);
    await audit({
      actorId: req.user?.id ?? null,
      action: "PRODUCT_CREATE",
      entityType: "product",
      entityId: product.id,
      metadata: { category: product.category, manufacturer: product.manufacturer }
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
};

export const listProductsHandler: RequestHandler = async (req, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const offset = req.query.offset ? Number(req.query.offset) : undefined;
    const result = await getProducts({ limit, offset });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getProductHandler: RequestHandler = async (req, res, next) => {
  try {
    const product = await getProduct(req.params.id);
    res.json({ product });
  } catch (err) {
    next(err);
  }
};

