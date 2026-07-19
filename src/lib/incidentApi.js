import { BaseService } from "./baseService.js";

const api = new BaseService("/api/incidents");

export async function fetchIncidentTypes() {
  return api.get("/types");
}

export async function submitIncident(incident) {
  return api.post("/analyze", incident);
}

export async function fetchDemoIncident() {
  return api.get("/demo");
}
