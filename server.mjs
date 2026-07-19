import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { crowdIntelligenceInputs } from "./src/config/crowdIntelligence.js";
import { analyzeCrowdIntelligence } from "./src/lib/crowdIntelligence.js";
import { incidentTypes } from "./src/config/incidentCommander.js";
import { analyzeIncident } from "./src/lib/incidentAnalysis.js";
import { transportInputs } from "./src/config/transportIntelligence.js";
import { analyzeTransport } from "./src/lib/transportAnalysis.js";
import { accessibilityInputs } from "./src/config/accessibilityIntelligence.js";
import { analyzeAccessibility } from "./src/lib/accessibilityAnalysis.js";
import { sustainabilityInputs } from "./src/config/sustainabilityIntelligence.js";
import { analyzeSustainability } from "./src/lib/sustainabilityAnalysis.js";
import { analyzeCopilot } from "./src/lib/copilotEngine.js";
import { analyzeCrowdRedesign } from "./src/lib/crowdAnalysisRedesign.js";
import { auditDecisions, complianceLog, performanceMetrics, executiveSummary } from "./src/config/auditIntelligence.js";

const port = Number.parseInt(process.env.PORT ?? "4173", 10);
const root = process.cwd();

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (requestUrl.pathname === "/api/crowd-intelligence/inputs" && request.method === "GET") {
    sendJson(response, 200, crowdIntelligenceInputs);
    return;
  }

  if (requestUrl.pathname === "/api/crowd-intelligence/prediction" && request.method === "GET") {
    sendJson(response, 200, analyzeCrowdIntelligence(crowdIntelligenceInputs));
    return;
  }

  if (requestUrl.pathname === "/api/crowd-intelligence/analyze" && request.method === "POST") {
    readJsonBody(request)
      .then((body) => sendJson(response, 200, analyzeCrowdIntelligence(body)))
      .catch((error) => sendJson(response, 400, {
        error: "invalid_request",
        message: error instanceof Error ? error.message : "Unable to parse request body"
      }));
    return;
  }

  /* ---- Incident Commander API ---- */
  if (requestUrl.pathname === "/api/incidents/types" && request.method === "GET") {
    sendJson(response, 200, incidentTypes);
    return;
  }

  if (requestUrl.pathname === "/api/incidents/analyze" && request.method === "POST") {
    readJsonBody(request)
      .then((body) => {
        if (!body.type) {
          sendJson(response, 400, { error: "missing_type", message: "Incident type is required." });
          return;
        }
        sendJson(response, 200, analyzeIncident(body));
      })
      .catch((error) => sendJson(response, 400, {
        error: "invalid_request",
        message: error instanceof Error ? error.message : "Unable to parse request body"
      }));
    return;
  }

  if (requestUrl.pathname === "/api/incidents/demo" && request.method === "GET") {
    sendJson(response, 200, analyzeIncident({
      type: "crowd_surge",
      severity: "critical",
      location: "North Concourse",
      description: "Dangerous crowd compression detected after two trains arrived simultaneously. Density exceeding safe threshold with restricted flow velocity. Guests reporting difficulty breathing at front of crowd.",
      affected_count: 350
    }));
    return;
  }

  /* ---- Transport Intelligence API ---- */
  if (requestUrl.pathname === "/api/transport/inputs" && request.method === "GET") {
    sendJson(response, 200, transportInputs);
    return;
  }

  if (requestUrl.pathname === "/api/transport/live" && request.method === "GET") {
    sendJson(response, 200, analyzeTransport(transportInputs));
    return;
  }

  if (requestUrl.pathname === "/api/transport/analyze" && request.method === "POST") {
    readJsonBody(request)
      .then((body) => sendJson(response, 200, analyzeTransport(body)))
      .catch((error) => sendJson(response, 400, {
        error: "invalid_request",
        message: error instanceof Error ? error.message : "Unable to parse request body"
      }));
    return;
  }

  /* ---- Accessibility Intelligence API ---- */
  if (requestUrl.pathname === "/api/accessibility/inputs" && request.method === "GET") {
    sendJson(response, 200, accessibilityInputs);
    return;
  }

  if (requestUrl.pathname === "/api/accessibility/live" && request.method === "GET") {
    sendJson(response, 200, analyzeAccessibility(accessibilityInputs));
    return;
  }

  if (requestUrl.pathname === "/api/accessibility/analyze" && request.method === "POST") {
    readJsonBody(request)
      .then((body) => sendJson(response, 200, analyzeAccessibility(body)))
      .catch((error) => sendJson(response, 400, {
        error: "invalid_request",
        message: error instanceof Error ? error.message : "Unable to parse request body"
      }));
    return;
  }

  /* ---- Sustainability Intelligence API ---- */
  if (requestUrl.pathname === "/api/sustainability/inputs" && request.method === "GET") {
    sendJson(response, 200, sustainabilityInputs);
    return;
  }

  if (requestUrl.pathname === "/api/sustainability/live" && request.method === "GET") {
    sendJson(response, 200, analyzeSustainability(sustainabilityInputs));
    return;
  }

  if (requestUrl.pathname === "/api/sustainability/analyze" && request.method === "POST") {
    readJsonBody(request)
      .then((body) => sendJson(response, 200, analyzeSustainability(body)))
      .catch((error) => sendJson(response, 400, {
        error: "invalid_request",
        message: error instanceof Error ? error.message : "Unable to parse request body"
      }));
    return;
  }

  /* ---- AI Operations Copilot API ---- */
  if (requestUrl.pathname === "/api/copilot/chat" && request.method === "POST") {
    readJsonBody(request)
      .then((body) => {
        if (!body.query) {
          sendJson(response, 400, { error: "missing_query", message: "Query text is required." });
          return;
        }
        sendJson(response, 200, analyzeCopilot(body.query, body.context || {}));
      })
      .catch((error) => sendJson(response, 400, {
        error: "invalid_request",
        message: error instanceof Error ? error.message : "Unable to parse request body"
      }));
    return;
  }

  /* ---- Crowd Redesign API ---- */
  if (requestUrl.pathname === "/api/crowd-redesign/simulate" && request.method === "POST") {
    readJsonBody(request)
      .then((body) => {
        const scenario = body.scenario || "default";
        const val = Number(body.timeMultiplier) || 1.0;
        const inputs = body.inputs || {};
        sendJson(response, 200, analyzeCrowdRedesign(inputs, scenario, val));
      })
      .catch((error) => sendJson(response, 400, {
        error: "invalid_request",
        message: error instanceof Error ? error.message : "Unable to parse request body"
      }));
    return;
  }

  if (requestUrl.pathname === "/api/crowd-redesign/upload-csv" && request.method === "POST") {
    readJsonBody(request)
      .then((body) => {
        const csvContent = body.csv || "";
        // Parse CSV simple parser
        const lines = csvContent.split("\n").map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) {
          sendJson(response, 400, { error: "invalid_csv", message: "CSV must contain headers and data rows." });
          return;
        }
        
        const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
        const dataRows = [];
        
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map(c => c.trim());
          const rowObj = {};
          headers.forEach((h, idx) => {
            rowObj[h] = cols[idx];
          });
          dataRows.push(rowObj);
        }
        
        // Map to zones
        const mappedZones = dataRows.map((r, i) => ({
          id: r.zone_id || `zone-${i}`,
          name: r.zone_id ? r.zone_id.replace("-", " ").toUpperCase() : `Zone ${i+1}`,
          base_occupancy: Number(r.occupancy) || 1000,
          capacity: Number(r.capacity) || 3000,
          risk_threshold: Number(r.capacity) * 0.8 || 2400,
          peak_time: r.peak_time || "19:00"
        }));

        sendJson(response, 200, {
          message: "CSV parsed successfully",
          zones: mappedZones
        });
      })
      .catch((error) => sendJson(response, 400, {
        error: "invalid_request",
        message: error instanceof Error ? error.message : "Unable to parse request body"
      }));
    return;
  }

  /* ---- Audit Intelligence API ---- */
  if (requestUrl.pathname === "/api/audit/decisions" && request.method === "GET") {
    sendJson(response, 200, auditDecisions);
    return;
  }

  if (requestUrl.pathname === "/api/audit/compliance" && request.method === "GET") {
    sendJson(response, 200, complianceLog);
    return;
  }

  if (requestUrl.pathname === "/api/audit/performance" && request.method === "GET") {
    sendJson(response, 200, performanceMetrics);
    return;
  }

  if (requestUrl.pathname === "/api/audit/summary" && request.method === "GET") {
    sendJson(response, 200, executiveSummary);
    return;
  }

  const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);

  if (!filePath.startsWith(root) || !existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream"
  });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`AURA Mission Control available at http://localhost:${port}`);
});
