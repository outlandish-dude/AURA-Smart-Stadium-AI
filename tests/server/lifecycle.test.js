import { test, describe } from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";
import { TestServer } from "../helpers/testServer.js";

describe("Server Lifecycle & Env Verification Tests", () => {
  test("Server fails to start with exit code 1 if required env variables are missing", async () => {
    return new Promise((resolve) => {
      const serverProcess = spawn("node", ["server.mjs"], {
        env: {
          ...process.env,
          GEMINI_API_KEY: "",
          SUPABASE_URL: "",
          SUPABASE_ANON_KEY: "",
          SUPABASE_SERVICE_KEY: ""
        }
      });

      let errOutput = "";
      serverProcess.stderr.on("data", (data) => {
        errOutput += data.toString();
      });

      serverProcess.stdout.on("data", (data) => {
        errOutput += data.toString();
      });

      serverProcess.on("close", (code) => {
        assert.strictEqual(code, 1);
        assert.ok(errOutput.includes("Startup Error"), "Output was: " + errOutput);
        assert.ok(errOutput.includes("Missing required environment variables"), "Output was: " + errOutput);
        resolve();
      });
    });
  });

  test("Server boots and stops cleanly on custom PORT", async () => {
    const customPort = 4208;
    const server = new TestServer(customPort);
    await server.start();

    // Verify it is responding
    const res = await server.fetch("/index.html");
    assert.strictEqual(res.status, 200);

    server.stop();
  });
});
