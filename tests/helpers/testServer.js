import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

export class TestServer {
  constructor(port = 4199, customEnv = {}) {
    this.port = port;
    this.customEnv = customEnv;
    this.process = null;
  }

  async start() {
    return new Promise((resolve, reject) => {
      this.process = spawn("node", ["server.mjs"], {
        env: {
          ...process.env,
          PORT: String(this.port),
          GEMINI_API_KEY: "test_gemini_key",
          SUPABASE_URL: "https://test.supabase.co",
          SUPABASE_ANON_KEY: "test_anon_key",
          SUPABASE_SERVICE_KEY: "test_service_key",
          ...this.customEnv
        }
      });

      let started = false;
      const onData = (data) => {
        const text = data.toString();
        if (text.includes("available at")) {
          started = true;
          resolve();
        }
      };

      const onError = (err) => {
        if (!started) reject(err);
      };

      this.process.stdout.on("data", onData);
      this.process.stderr.on("data", onData);
      this.process.on("error", onError);

      // Timeout safety
      setTimeout(5000).then(() => {
        if (!started) {
          this.stop();
          reject(new Error("Server start timed out after 5 seconds"));
        }
      });
    });
  }

  stop() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }

  async fetch(endpoint, options = {}) {
    const url = `http://localhost:${this.port}${endpoint}`;
    return fetch(url, options);
  }

  async fetchJson(endpoint, options = {}) {
    const headers = { ...options.headers };
    let body = options.body;
    if (body && typeof body === "object") {
      body = JSON.stringify(body);
      headers["Content-Type"] = "application/json";
    }
    const res = await this.fetch(endpoint, {
      ...options,
      headers,
      body
    });
    if (res.headers.get("content-type")?.includes("application/json")) {
      return { status: res.status, body: await res.json(), headers: res.headers };
    }
    return { status: res.status, body: await res.text(), headers: res.headers };
  }
}
