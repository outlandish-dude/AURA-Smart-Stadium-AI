import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { TestServer } from "../helpers/testServer.js";
import { crowdIntelligenceInputs } from "../../src/config/crowdIntelligence.js";

describe("API Endpoints Tests", () => {
  let server;

  before(async () => {
    server = new TestServer(4201);
    await server.start();
  });

  after(() => {
    server.stop();
  });

  // --- Crowd Intelligence ---
  test("GET /api/crowd-intelligence/inputs returns inputs config", async () => {
    const { status, body, headers } = await server.fetchJson("/api/crowd-intelligence/inputs");
    assert.strictEqual(status, 200);
    assert.strictEqual(headers.get("content-type"), "application/json; charset=utf-8");
    assert.ok(Array.isArray(body.gates));
    assert.ok(body.gates.length > 0);
  });

  test("GET /api/crowd-intelligence/prediction returns current crowd prediction", async () => {
    const { status, body } = await server.fetchJson("/api/crowd-intelligence/prediction");
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body.predicted_congestion));
    assert.ok(typeof body.model === "string");
  });

  test("POST /api/crowd-intelligence/analyze returns analyzed crowd results", async () => {
    const { status, body } = await server.fetchJson("/api/crowd-intelligence/analyze", {
      method: "POST",
      body: crowdIntelligenceInputs
    });
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body.predicted_congestion));
  });

  // --- Incidents ---
  test("GET /api/incidents/types returns defined incident types", async () => {
    const { status, body } = await server.fetchJson("/api/incidents/types");
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.some(t => t.id === "medical"));
  });

  test("POST /api/incidents/analyze triages incident correctly", async () => {
    const payload = {
      type: "medical",
      severity: "critical",
      location: "East Stand Concourse",
      description: "Fan experiencing chest pains.",
      affected_count: 1
    };
    const { status, body } = await server.fetchJson("/api/incidents/analyze", {
      method: "POST",
      body: payload
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(body.workflow_stage, "responded");
    assert.strictEqual(body.severity, "critical");
    assert.strictEqual(body.incident_type, "medical");
    assert.ok(body.immediate_actions);
  });

  test("GET /api/incidents/demo returns incident commander demo results", async () => {
    const { status, body } = await server.fetchJson("/api/incidents/demo");
    assert.strictEqual(status, 200);
    assert.strictEqual(body.incident_type, "crowd_surge");
  });

  // --- Transport ---
  test("GET /api/transport/inputs returns transport parameters", async () => {
    const { status, body } = await server.fetchJson("/api/transport/inputs");
    assert.strictEqual(status, 200);
    assert.ok(body.metro);
    assert.ok(body.parking);
  });

  test("GET /api/transport/live returns current transit metrics", async () => {
    const { status, body } = await server.fetchJson("/api/transport/live");
    assert.strictEqual(status, 200);
    assert.ok(body.predictions);
  });

  test("POST /api/transport/analyze predicts transit gaps", async () => {
    const payload = {
      transit_modes: [
        { id: "rail", arrival_load: 1200, capacity: 1500, delay_minutes: 5 }
      ]
    };
    const { status, body } = await server.fetchJson("/api/transport/analyze", {
      method: "POST",
      body: payload
    });
    assert.strictEqual(status, 200);
    assert.ok(body.predictions);
  });

  // --- Accessibility ---
  test("GET /api/accessibility/inputs returns accessibility setup", async () => {
    const { status, body } = await server.fetchJson("/api/accessibility/inputs");
    assert.strictEqual(status, 200);
    assert.ok(body.elevators);
    assert.ok(body.wheelchair_queues);
  });

  test("GET /api/accessibility/live returns live mobility analytics", async () => {
    const { status, body } = await server.fetchJson("/api/accessibility/live");
    assert.strictEqual(status, 200);
    assert.ok(body.predictions);
  });

  test("POST /api/accessibility/analyze returns accessibility analysis", async () => {
    const payload = {
      elevators: [
        { id: "el-north-1", status: "operational", wait_time_sec: 25 }
      ]
    };
    const { status, body } = await server.fetchJson("/api/accessibility/analyze", {
      method: "POST",
      body: payload
    });
    assert.strictEqual(status, 200);
    assert.ok(body.predictions);
  });

  // --- Sustainability ---
  test("GET /api/sustainability/inputs returns target thresholds", async () => {
    const { status, body } = await server.fetchJson("/api/sustainability/inputs");
    assert.strictEqual(status, 200);
    assert.ok(body.waste_bins);
    assert.ok(body.water_flow);
  });

  test("GET /api/sustainability/live returns live metrics", async () => {
    const { status, body } = await server.fetchJson("/api/sustainability/live");
    assert.strictEqual(status, 200);
    assert.ok(body.predictions);
  });

  test("POST /api/sustainability/analyze returns carbon and energy analytics", async () => {
    const payload = {
      waste_bins: [
        { id: "bin-concourse-north", fill_pct: 88 }
      ]
    };
    const { status, body } = await server.fetchJson("/api/sustainability/analyze", {
      method: "POST",
      body: payload
    });
    assert.strictEqual(status, 200);
    assert.ok(body.predictions);
  });

  // --- Copilot ---
  test("POST /api/copilot/chat answers user queries with context", async () => {
    const payload = {
      query: "Which gate is at highest risk?",
      context: {
        crowd: { predicted_congestion: [{ risk_score: 92 }] }
      }
    };
    const { status, body } = await server.fetchJson("/api/copilot/chat", {
      method: "POST",
      body: payload
    });
    assert.strictEqual(status, 200);
    assert.ok(body.answer);
    assert.ok(Array.isArray(body.reasoning.observations));
  });

  // --- Crowd Redesign ---
  test("POST /api/crowd-redesign/simulate returns what-if scenario prediction", async () => {
    const payload = {
      scenario: "rain",
      timeMultiplier: 1.4
    };
    const { status, body } = await server.fetchJson("/api/crowd-redesign/simulate", {
      method: "POST",
      body: payload
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(body.scenario, "rain");
    assert.strictEqual(body.time_multiplier, 1.4);
    assert.ok(body.predictions.length > 0);
  });

  // --- Audit ---
  test("GET /api/audit/decisions returns full decisions logs", async () => {
    const { status, body } = await server.fetchJson("/api/audit/decisions");
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body));
    assert.ok(body.length > 0);
  });

  test("GET /api/audit/compliance returns compliance logs", async () => {
    const { status, body } = await server.fetchJson("/api/audit/compliance");
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body));
  });

  test("GET /api/audit/performance returns performance kpis", async () => {
    const { status, body } = await server.fetchJson("/api/audit/performance");
    assert.strictEqual(status, 200);
    assert.ok(body.decision_trends);
  });

  test("GET /api/audit/summary returns executive summary payload", async () => {
    const { status, body } = await server.fetchJson("/api/audit/summary");
    assert.strictEqual(status, 200);
    assert.ok(body.operational_summary);
  });
});
