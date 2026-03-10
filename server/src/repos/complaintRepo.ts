import { db } from "../db/connection";

export type ComplaintRow = {
  id: string;
  product_id: string;
  qr_id?: string | null;
  filed_by: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  assigned_to?: string | null;
  description?: string | null;
  image_url?: string | null;
  response_message?: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function insertComplaint(input: {
  id: string;
  product_id: string;
  qr_id?: string | null;
  filed_by: string;
  status?: ComplaintRow["status"];
  priority?: ComplaintRow["priority"];
  assigned_to?: string | null;
  description?: string | null;
  image_url?: string | null;
}): Promise<void> {
  await db("complaints").insert({
    ...input,
    status: input.status ?? "OPEN",
    priority: input.priority ?? "LOW",
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  });
}

export async function findComplaintById(id: string): Promise<ComplaintRow | null> {
  const row = await db<ComplaintRow>("complaints").where({ id }).first();
  return row ?? null;
}

export async function listOpenComplaints(): Promise<ComplaintRow[]> {
  return await db<ComplaintRow>("complaints").where({ status: "OPEN" }).orderBy("created_at", "desc");
}

export async function listComplaintsByUser(userId: string): Promise<ComplaintRow[]> {
  return await db<ComplaintRow>("complaints")
    .where({ filed_by: userId })
    .orderBy("created_at", "desc");
}

export async function listComplaintsForRecycler(): Promise<ComplaintRow[]> {
  return await db<ComplaintRow>("complaints")
    .whereIn("status", ["OPEN", "IN_REVIEW"])
    .orderBy("created_at", "desc");
}

export async function updateComplaint(id: string, patch: Partial<ComplaintRow>): Promise<void> {
  await db("complaints").where({ id }).update({ ...patch, updated_at: db.fn.now() });
}
