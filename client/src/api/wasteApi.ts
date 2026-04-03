import { httpClient } from "./httpClient";

export async function classifyWaste(
  category: string, 
  metadata?: Record<string, any>
) {
  const { data } = await httpClient.post("/waste/classify", 
    { category, metadata }
  );
  return data;
}

export async function detectFromCamera(
  base64Image: string
) {
  const { data } = await httpClient.post("/waste/detect", 
    { image: base64Image }
  );
  return data;
}

export async function fetchDisposalGuide(wasteType: string) {
  const { data } = await httpClient.get(`/waste/disposal-guide/${wasteType}`);
  return data;
}
