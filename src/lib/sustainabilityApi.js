import { BaseService } from "./baseService.js";

const api = new BaseService("/api/sustainability");

export async function fetchSustainabilityInputs() {
  return api.get("/inputs");
}

export async function fetchSustainabilityLive() {
  return api.get("/live");
}

export async function analyzeSustainabilityData(context) {
  return api.post("/analyze", context);
}
