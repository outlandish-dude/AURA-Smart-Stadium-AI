import { BaseService } from "./baseService.js";

const api = new BaseService("/api/copilot");

export async function askCopilot(query, context = {}) {
  return api.post("/chat", { query, context });
}
