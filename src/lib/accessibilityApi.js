import { BaseService } from "./baseService.js";

const api = new BaseService("/api/accessibility");

export async function fetchAccessibilityInputs() {
  return api.get("/inputs");
}

export async function fetchAccessibilityLive() {
  return api.get("/live");
}

export async function analyzeAccessibilityData(context) {
  return api.post("/analyze", context);
}
