import { test, describe, before, after } from "node:test";
import assert from "node:assert";
import { TestServer } from "../helpers/testServer.js";

describe("Integration Workflows Tests", () => {
  let server;

  before(async () => {
    server = new TestServer(4204);
    await server.start();
  });

  after(() => {
    server.stop();
  });

  test("Run complete operations workflow (Crowd Sim -> Incident -> Copilot Context Reasoning)", async () => {
    // 1. Simulate What-If Scenario on Crowd
    const simRes = await server.fetchJson("/api/crowd-redesign/simulate", {
      method: "POST",
      body: {
        scenario: "close-gate-c",
        timeMultiplier: 1.5,
        inputs: {}
      }
    });
    assert.strictEqual(simRes.status, 200);
    assert.strictEqual(simRes.body.scenario, "close-gate-c");

    // 2. Submit Incident
    const incidentRes = await server.fetchJson("/api/incidents/analyze", {
      method: "POST",
      body: {
        type: "crowd_surge",
        severity: "critical",
        location: "Gate A Ingress Corridor",
        description: "Gate A closed, crowds backing up in adjacent hallway.",
        affected_count: 500
      }
    });
    assert.strictEqual(incidentRes.status, 200);
    assert.strictEqual(incidentRes.body.workflow_stage, "responded");

    // 3. Ask Copilot referencing the current simulation and incident state
    const copilotRes = await server.fetchJson("/api/copilot/chat", {
      method: "POST",
      body: {
        query: "What concerns you today?",
        context: {
          crowd: simRes.body,
          incidents: [incidentRes.body]
        }
      }
    });
    assert.strictEqual(copilotRes.status, 200);
    assert.ok(copilotRes.body.answer);
    assert.ok(copilotRes.body.reasoning.observations.length > 0);
  });
});
