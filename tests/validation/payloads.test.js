import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { TestServer } from "../helpers/testServer.js";

describe("Validation & Payloads Tests", () => {
  let server;

  before(async () => {
    server = new TestServer(4202);
    await server.start();
  });

  after(() => {
    server.stop();
  });

  test("POST /api/incidents/analyze with missing type returns 400 error", async () => {
    const payload = {
      severity: "high",
      location: "Gate B"
    };
    const { status, body } = await server.fetchJson("/api/incidents/analyze", {
      method: "POST",
      body: payload
    });
    assert.strictEqual(status, 400);
    assert.strictEqual(body.error, "missing_type");
  });

  test("POST /api/copilot/chat with missing query returns 400 error", async () => {
    const payload = {
      context: {}
    };
    const { status, body } = await server.fetchJson("/api/copilot/chat", {
      method: "POST",
      body: payload
    });
    assert.strictEqual(status, 400);
    assert.strictEqual(body.error, "missing_query");
  });

  test("POST /api/crowd-redesign/upload-csv with empty CSV content returns 400 error", async () => {
    const payload = { csv: "" };
    const { status, body } = await server.fetchJson("/api/crowd-redesign/upload-csv", {
      method: "POST",
      body: payload
    });
    assert.strictEqual(status, 400);
    assert.strictEqual(body.error, "invalid_csv");
  });

  test("POST /api/crowd-redesign/upload-csv with valid CSV parses correctly", async () => {
    const payload = {
      csv: "zone_id,occupancy,capacity,peak_time\ngate-f,1500,4000,20:00\nconcourse-east,800,2000,18:30"
    };
    const { status, body } = await server.fetchJson("/api/crowd-redesign/upload-csv", {
      method: "POST",
      body: payload
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(body.message, "CSV parsed successfully");
    assert.ok(Array.isArray(body.zones));
    assert.strictEqual(body.zones.length, 2);
    assert.strictEqual(body.zones[0].id, "gate-f");
    assert.strictEqual(body.zones[0].capacity, 4000);
  });

  test("POST requests with malformed JSON return 400 error", async () => {
    const rawRes = await server.fetch("/api/incidents/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ malformed: json "
    });
    assert.strictEqual(rawRes.status, 400);
    const body = await rawRes.json();
    assert.strictEqual(body.error, "invalid_request");
  });
});
