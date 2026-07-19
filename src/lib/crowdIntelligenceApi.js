import { BaseService } from "./baseService.js";

const api = new BaseService("");

export async function fetchCrowdIntelligence() {
  return api.get("/api/crowd-intelligence/prediction");
}

export async function simulateCrowdScenario(scenario, timeMultiplier, inputs = {}) {
  return api.post("/api/crowd-redesign/simulate", { scenario, timeMultiplier, inputs });
}

export async function uploadCrowdCSV(csvContent) {
  return api.post("/api/crowd-redesign/upload-csv", { csv: csvContent });
}
