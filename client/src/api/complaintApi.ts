import { httpClient } from "./httpClient";

export type Complaint = {
  id: string;
  product_id: string;
  qr_id?: string | null;
  filed_by: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  description?: string | null;
  image_url?: string | null;
  response_message?: string | null;
  created_at: string;
  updated_at: string;
};

export async function listOpenComplaints(): Promise<{ complaints: Complaint[] }> {
  const { data } = await httpClient.get("/complaints/admin/open");
  return data;
}

export async function assignComplaint(id: string): Promise<void> {
  await httpClient.post(`/complaints/admin/${id}/assign`);
}

export async function updateComplaintStatus(id: string, status: string, responseMessage?: string): Promise<void> {
  await httpClient.post(`/complaints/admin/${id}/status`, { status, responseMessage });
}

export async function getMyComplaints(): Promise<{ complaints: Complaint[] }> {
  const { data } = await httpClient.get("/complaints/my");
  return data;
}

export async function getRecyclerComplaints(): Promise<{ complaints: Complaint[] }> {
  const { data } = await httpClient.get("/complaints/recycler/open");
  return data;
}

export async function updateComplaintStatusRecycler(id: string, status: string, responseMessage?: string): Promise<void> {
  await httpClient.post(`/complaints/recycler/${id}/status`, { status, responseMessage });
}

export async function getComplaint(id: string): Promise<{ complaint: Complaint }> {
  const { data } = await httpClient.get(`/complaints/${id}`);
  return data;
}
