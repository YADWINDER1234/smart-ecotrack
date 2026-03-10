import { randomUUID } from "crypto";
import * as repo from "../repos/complaintRepo";
import { audit } from "./auditService";

export async function fileComplaint(input: {
  productId: string;
  qrId?: string | null;
  filedBy: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  description?: string | null;
  imageUrl?: string | null;
}) {
  const id = randomUUID();
  await repo.insertComplaint({
    id,
    product_id: input.productId,
    qr_id: input.qrId ?? null,
    filed_by: input.filedBy,
    priority: input.priority ?? "LOW",
    description: input.description ?? null,
    image_url: input.imageUrl ?? null
  });

  await audit({
    actorId: input.filedBy,
    action: "COMPLAINT_CREATE",
    entityType: "complaint",
    entityId: id,
    metadata: { productId: input.productId, qrId: input.qrId }
  });

  return id;
}

export async function assignComplaint(complaintId: string, adminId: string) {
  await repo.updateComplaint(complaintId, { assigned_to: adminId, status: "IN_REVIEW" as any });
  await audit({
    actorId: adminId,
    action: "COMPLAINT_ASSIGN",
    entityType: "complaint",
    entityId: complaintId
  });
}

export async function updateComplaintStatus(complaintId: string, status: repo.ComplaintRow["status"], actorId: string, responseMessage?: string) {
  await repo.updateComplaint(complaintId, { status: status as any, response_message: responseMessage ?? null });
  await audit({
    actorId,
    action: "COMPLAINT_UPDATE",
    entityType: "complaint",
    entityId: complaintId,
    metadata: { status, responseMessage }
  });
}
