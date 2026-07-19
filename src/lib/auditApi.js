import { BaseService } from "./baseService.js";

const api = new BaseService("");

export async function fetchAuditDecisions() {
  return api.get("/api/audit/decisions");
}

export async function fetchComplianceLog() {
  return api.get("/api/audit/compliance");
}

export async function fetchPerformanceMetrics() {
  return api.get("/api/audit/performance");
}

export async function fetchExecutiveSummary() {
  return api.get("/api/audit/summary");
}
