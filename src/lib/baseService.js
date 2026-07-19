/* ============================================================
   AURA Core API Client Class (SOLID & DRY Principles)
   ============================================================ */

export class BaseService {
  constructor(basePath) {
    this.basePath = basePath;
  }

  async request(endpoint = "", options = {}) {
    const url = `${this.basePath}${endpoint}`;
    const defaultHeaders = { Accept: "application/json" };
    
    if (options.body && typeof options.body === "object") {
      options.body = JSON.stringify(options.body);
      defaultHeaders["Content-Type"] = "application/json";
    }

    const mergedOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    const response = await fetch(url, mergedOptions);
    if (!response.ok) {
      throw new Error(`API Service request to ${url} failed with status code ${response.status}`);
    }
    return response.json();
  }

  async get(endpoint = "") {
    return this.request(endpoint, { method: "GET" });
  }

  async post(endpoint = "", body = {}) {
    return this.request(endpoint, { method: "POST", body });
  }
}
