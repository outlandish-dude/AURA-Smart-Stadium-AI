import { BaseService } from "./baseService.js";

const api = new BaseService("/api/transport");

export async function fetchTransportInputs() {
  return api.get("/inputs");
}

export async function fetchTransportLive() {
  return api.get("/live");
}

export async function analyzeTransport(context) {
  return api.post("/analyze", context);
}
