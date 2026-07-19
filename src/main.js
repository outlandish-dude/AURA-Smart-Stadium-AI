import {
  environment,
  initialDashboardState,
  navigationItems,
  widgetDecisions
} from "./config/operations.js";
import { redesignedCrowdPanel } from "./components/crowdIntelligencePanel.js";
import { statePanel } from "./components/crowdIntelligence.js";
import { simulateCrowdScenario, uploadCrowdCSV } from "./lib/crowdIntelligenceApi.js";
import { incidentCommanderPanel } from "./components/incidentCommander.js";
import { submitIncident } from "./lib/incidentApi.js";
import { transportCommanderPanel } from "./components/transportIntelligence.js";
import { fetchTransportInputs, fetchTransportLive } from "./lib/transportApi.js";
import { accessibilityCommanderPanel } from "./components/accessibilityPanel.js";
import { fetchAccessibilityInputs, fetchAccessibilityLive } from "./lib/accessibilityApi.js";
import { sustainabilityCommanderPanel } from "./components/sustainabilityPanel.js";
import { fetchSustainabilityInputs, fetchSustainabilityLive } from "./lib/sustainabilityApi.js";
import { copilotWidget } from "./components/copilotPanel.js";
import { askCopilot } from "./lib/copilotApi.js";
import { auditPanel } from "./components/auditPanel.js";
import { fetchAuditDecisions, fetchComplianceLog } from "./lib/auditApi.js";
import { exportAuditPackage } from "./lib/auditExport.js";

const app = document.querySelector("#app");
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const toneClass = (tone) => `tone-${tone.toLowerCase()}`;
const formatNumber = (value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value));

let state = structuredClone(initialDashboardState);
let crowdIntelligenceState = {
  status: "loading",
  scenario: "default",
  timeIndex: 1.0,
  isPlaying: false,
  intervalName: "30m",
  selectedZone: null,
  csvName: "",
  csvError: "",
  csvLoading: false,
  uploadedZones: null,
  data: null,
  analysis: null,
  error: null
};

/* ---- View Router ---- */
let activeView = "Command";

/* ---- Incident Commander State ---- */
let incidentState = {
  status: "select",  // select | form | loading | results
  selectedType: null,
  formData: {},
  analysis: null,
  error: null
};

/* ---- Transport Intelligence State ---- */
let transportState = {
  status: "loading",
  inputs: null,
  analysis: null,
  error: null
};

/* ---- Accessibility Intelligence State ---- */
let accessibilityState = {
  status: "loading",
  inputs: null,
  analysis: null,
  error: null
};

/* ---- Sustainability Intelligence State ---- */
let sustainabilityState = {
  status: "loading",
  inputs: null,
  analysis: null,
  error: null
};

/* ---- Audit Intelligence State ---- */
let auditState = {
  status: "loading",
  replayId: null,
  activeFilters: {
    search: "",
    category: "all",
    severity: "all",
    zone: "All Zones",
    status: "all",
    date: "All Dates",
    operator: "All Operators",
    volunteer: "All Volunteers"
  },
  decisions: [],
  complianceLog: [],
  error: null
};

/* ---- AI Operations Copilot State ---- */
let copilotState = {
  history: [
    { sender: "ai", text: "Hello! I am AURA, your stadium operations copilot. Ask me a question like *'What concerns you today?'* or choose a suggestion above." }
  ],
  isTyping: false
};

function oscillate(value, tick, spread, min, max, offset = 0) {
  return Math.round(clamp(value + Math.sin((tick + offset) / 2) * spread, min, max));
}

function evolveState(current) {
  const next = structuredClone(current);
  next.tick += 1;
  next.loadingCharts = next.tick < 2;
  next.emptyChartKey = next.tick % 12 === 0 ? "sustainability" : null;

  next.kpis = next.kpis.map((kpi, index) => {
    const spread = kpi.id === "throughput" ? 260 : 4;
    const max = kpi.id === "throughput" ? 5600 : 100;
    const min = kpi.id === "throughput" ? 3200 : 0;
    return {
      ...kpi,
      value: oscillate(kpi.value, next.tick, spread, min, max, index),
      trend: next.tick % 2 === 0 ? "live update" : kpi.trend
    };
  });

  next.heatmap = next.heatmap.map((value, index) => oscillate(value, next.tick, 7, 20, 98, index / 4));
  next.crowdFlow = next.crowdFlow.map((row, index) => ({
    ...row,
    inbound: oscillate(row.inbound, next.tick, 120, 320, 2200, index),
    outbound: oscillate(row.outbound, next.tick, 70, 120, 1200, index + 1),
    density: oscillate(row.density, next.tick, 5, 30, 96, index + 2)
  }));
  next.alerts = next.alerts.map((alert, index) => ({
    ...alert,
    eta: clamp(alert.eta + (next.tick % 3 === 0 ? -1 : 1) - index, 3, 30)
  }));
  next.weather = {
    ...next.weather,
    temperatureC: oscillate(next.weather.temperatureC, next.tick, 1.5, 20, 34),
    humidity: oscillate(next.weather.humidity, next.tick, 3, 45, 90, 1),
    windKph: oscillate(next.weather.windKph, next.tick, 2, 4, 38, 2)
  };
  next.transportation = next.transportation.map((row, index) => ({
    ...row,
    delay: oscillate(row.delay, next.tick, 2, 0, 18, index),
    capacity: oscillate(row.capacity, next.tick, 5, 35, 98, index + 1)
  }));
  next.waste = next.waste.map((row, index) => {
    const fill = oscillate(row.fill, next.tick, 3, 25, 98, index);
    return { ...row, fill, service: fill > 85 ? "Dispatch" : fill > 70 ? "Watch" : "Normal" };
  });
  next.accessibility = next.accessibility.map((row, index) => ({
    ...row,
    requests: oscillate(row.requests, next.tick, 2, 0, 18, index),
    sla: oscillate(row.sla, next.tick, 4, 72, 100, index + 1),
    state: row.sla < 86 ? "Watch" : "Healthy"
  }));
  next.energy = next.energy.map((row, index) => {
    const load = oscillate(row.load, next.tick, 4, 35, 94, index);
    return { ...row, usage: oscillate(row.usage, next.tick, 70, 280, 1500, index), load, state: load > 80 ? "Peak" : load > 68 ? "Elevated" : "Normal" };
  });
  next.volunteers = next.volunteers.map((row, index) => ({
    ...row,
    available: oscillate(row.available, next.tick, 2, 0, 18, index),
    assigned: oscillate(row.assigned, next.tick, 2, 2, 24, index + 1)
  }));
  next.charts = Object.fromEntries(
    Object.entries(next.charts).map(([key, chart], index) => [
      key,
      {
        ...chart,
        values: [...chart.values.slice(1), oscillate(chart.values.at(-1), next.tick, index === 1 ? 230 : 5, index === 1 ? 2400 : 20, index === 1 ? 5600 : 100, index)]
      }
    ])
  );

  const latestRecommendation = next.recommendations.shift();
  next.recommendations.push({
    ...latestRecommendation,
    confidence: oscillate(latestRecommendation.confidence, next.tick, 3, 70, 98)
  });

  if (next.tick % 4 === 0) {
    next.timeline = [
      {
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        title: "Live state refreshed",
        detail: "AURA recalculated risk, flow, staffing, and sustainability signals."
      },
      ...next.timeline.slice(0, 3)
    ];
  }

  return next;
}

function navItem(item) {
  return `
    <button class="nav-item ${item.active ? "is-active" : ""}" type="button" aria-current="${item.active ? "page" : "false"}" data-nav-label="${item.label}">
      <span aria-hidden="true">${item.icon}</span>
      <span>${item.label}</span>
    </button>
  `;
}

function metricCard(metric) {
  return `
    <article class="metric-card ${toneClass(metric.tone)}" aria-label="${metric.label}">
      <div>
        <p>${metric.label}</p>
        <strong>${formatNumber(metric.value)}<span>${metric.suffix}</span></strong>
      </div>
      <small>${metric.trend}</small>
    </article>
  `;
}

function heatmapCell(value, index) {
  const intensity = Math.max(0.25, value / 100);
  return `
    <span
      class="heat-cell"
      style="--intensity: ${intensity}; --delay: ${index * 10}ms"
      aria-label="Zone density ${value} percent"
      title="Zone density ${value}%"
    ></span>
  `;
}

function widgetShell({ eyebrow, title, status = "Live", className = "", body }) {
  return `
    <article class="glass-card widget-card ${className}">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${eyebrow}</p>
          <h2>${title}</h2>
        </div>
        <span class="status-pill">${status}</span>
      </div>
      ${body}
    </article>
  `;
}

function progressBar(value, label) {
  return `
    <div class="progress" aria-label="${label} ${value} percent">
      <span style="width: ${value}%"></span>
    </div>
  `;
}

function crowdFlowWidget(rows) {
  return widgetShell({
    eyebrow: "Pedestrian velocity",
    title: "Crowd Flow",
    body: `
      <div class="flow-list">
        ${rows.map((row) => `
          <div class="flow-row">
            <div>
              <strong>${row.zone}</strong>
              <span>${row.inbound}/min in · ${row.outbound}/min out</span>
            </div>
            <b>${row.density}%</b>
            ${progressBar(row.density, `${row.zone} density`)}
          </div>
        `).join("")}
      </div>
    `
  });
}

function alertCard(alert) {
  return `
    <article class="alert-card severity-${alert.severity.toLowerCase()}">
      <div class="alert-topline">
        <span>${alert.severity}</span>
        <time>${alert.eta}m</time>
      </div>
      <h3>${alert.title}</h3>
      <p>${alert.body}</p>
      <footer>
        <span>${alert.owner}</span>
        <button type="button">Review</button>
      </footer>
    </article>
  `;
}

function weatherWidget(weather) {
  return widgetShell({
    eyebrow: "Environmental risk",
    title: "Weather",
    body: `
      <div class="weather-display">
        <strong>${weather.temperatureC}°C</strong>
        <p>${weather.condition}</p>
      </div>
      <div class="mini-grid">
        <span>Humidity <b>${weather.humidity}%</b></span>
        <span>Wind <b>${weather.windKph} kph</b></span>
        <span>Risk <b>${weather.risk}</b></span>
      </div>
    `
  });
}

function tableWidget({ eyebrow, title, columns, rows, keys }) {
  return widgetShell({
    eyebrow,
    title,
    className: "data-panel",
    body: `
      <table>
        <thead><tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((row) => `<tr>${keys.map((key) => `<td>${row[key]}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    `
  });
}

function recommendationCard(recommendation) {
  return `
    <article class="recommendation-card">
      <div class="card-header">
        <h3>${recommendation.title}</h3>
        <span>${recommendation.confidence}%</span>
      </div>
      <p>${recommendation.action}</p>
      <small>${recommendation.impact}</small>
    </article>
  `;
}

function timelineItem(item) {
  return `
    <li>
      <time>${item.time}</time>
      <div>
        <strong>${item.title}</strong>
        <p>${item.detail}</p>
      </div>
    </li>
  `;
}

function chartWidget(key, chart, { isLoading, isEmpty }) {
  const max = Math.max(...chart.values, 1);
  let body = "";

  if (isLoading) {
    body = `<div class="chart-state loading-state" role="status">Loading ${chart.title.toLowerCase()}...</div>`;
  } else if (isEmpty) {
    body = `<div class="chart-state empty-state">No ${chart.title.toLowerCase()} data in the selected window.</div>`;
  } else {
    body = `
      <div class="bar-chart" aria-label="${chart.title} chart">
        ${chart.values.map((value) => `<span style="height: ${(value / max) * 100}%"><b>${formatNumber(value)}${chart.unit}</b></span>`).join("")}
      </div>
    `;
  }

  return widgetShell({
    eyebrow: "Trend analysis",
    title: chart.title,
    status: isLoading ? "Loading" : isEmpty ? "Empty" : "Live",
    className: `chart-card chart-${key}`,
    body
  });
}

function decisionCard(decision) {
  return `
    <article class="decision">
      <strong>${decision.widget}</strong>
      <p>${decision.decision}</p>
    </article>
  `;
}

/* ---- Command Dashboard ---- */
function commandCrowdSummary(analysis) {
  if (!analysis || !analysis.predictions) {
    return statePanel({
      title: "Crowd Intelligence",
      message: "No crowd intelligence response is available.",
      type: "empty"
    });
  }

  const critical = analysis.predictions.filter((p) => p.risk_level === "critical" || p.risk_level === "high");
  const top = [...analysis.predictions]
    .sort((a, b) => b.fill_percent - a.fill_percent)
    .slice(0, 4);

  return `
    <article class="glass-card widget-card crowd-intel-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AI Crowd Intelligence Snapshot</p>
          <h2>Live Zone Pressure</h2>
        </div>
        <span class="status-pill">${critical.length} elevated</span>
      </div>
      <div class="insight-list">
        ${top.map((z) => `
          <article class="recommendation-card severity-${z.risk_level === "normal" ? "low" : z.risk_level}">
            <div class="card-header">
              <div>
                <p class="eyebrow">${z.fill_percent}% · peak ${z.peak_time}</p>
                <h3>${z.name}</h3>
              </div>
              <span>${z.confidence_score}%</span>
            </div>
            <p>${z.reason}</p>
          </article>
        `).join("")}
      </div>
      <p class="ci-command-link">Open the <strong>Crowd</strong> view for heatmap, what-if simulation, routes, and full analytics.</p>
    </article>
  `;
}

function renderCommandDashboard() {
  return `
    <section class="metrics-grid" aria-label="Live KPIs">
      ${state.kpis.map(metricCard).join("")}
    </section>

    <section class="mission-grid">
      ${widgetShell({
        eyebrow: "Live spatial intelligence",
        title: "Heatmap",
        status: "Predictive",
        className: "map-card",
        body: `
          <div class="stadium-map" role="img" aria-label="Stadium heatmap showing crowd density by zone">
            <div class="pitch"></div>
            <div class="heatmap">${state.heatmap.map(heatmapCell).join("")}</div>
          </div>
        `
      })}
      <section class="command-stack" aria-label="Crowd and alert operations">
        ${crowdFlowWidget(state.crowdFlow)}
        <div class="alert-list">${state.alerts.map(alertCard).join("")}</div>
      </section>
    </section>

    ${
      crowdIntelligenceState.status === "loading"
        ? statePanel({
            title: "Crowd Intelligence",
            message: "Analyzing gate entries, density, history, transportation, and weather...",
            type: "loading"
          })
        : crowdIntelligenceState.status === "error"
          ? statePanel({
              title: "Crowd Intelligence Error",
              message: crowdIntelligenceState.error ?? "Unable to load crowd intelligence.",
              type: "empty"
            })
          : commandCrowdSummary(crowdIntelligenceState.analysis)
    }

    <section class="domain-grid">
      ${weatherWidget(state.weather)}
      ${tableWidget({
        eyebrow: "Upstream pressure",
        title: "Transportation",
        columns: ["Route", "Status", "Delay", "Capacity"],
        rows: state.transportation.map((row) => ({ ...row, delay: `${row.delay}m`, capacity: `${row.capacity}%` })),
        keys: ["route", "status", "delay", "capacity"]
      })}
      ${tableWidget({
        eyebrow: "Sustainability ops",
        title: "Waste",
        columns: ["Zone", "Fill", "Contam.", "Service"],
        rows: state.waste.map((row) => ({ ...row, fill: `${row.fill}%`, contamination: `${row.contamination}%` })),
        keys: ["zone", "fill", "contamination", "service"]
      })}
      ${tableWidget({
        eyebrow: "Inclusive operations",
        title: "Accessibility",
        columns: ["Area", "Requests", "SLA", "State"],
        rows: state.accessibility.map((row) => ({ ...row, sla: `${row.sla}%` })),
        keys: ["area", "requests", "sla", "state"]
      })}
      ${tableWidget({
        eyebrow: "Venue systems",
        title: "Energy",
        columns: ["System", "Usage", "Load", "State"],
        rows: state.energy.map((row) => ({ ...row, usage: `${row.usage} kW`, load: `${row.load}%` })),
        keys: ["system", "usage", "load", "state"]
      })}
      ${tableWidget({
        eyebrow: "Staff readiness",
        title: "Volunteer Status",
        columns: ["Team", "Avail.", "Assigned", "Zone"],
        rows: state.volunteers,
        keys: ["team", "available", "assigned", "zone"]
      })}
    </section>

    <section class="content-grid">
      ${widgetShell({
        eyebrow: "Gemini reasoning output",
        title: "Recent AI Recommendations",
        className: "recommendations-panel",
        body: `<div class="insight-list">${state.recommendations.map(recommendationCard).join("")}</div>`
      })}
      ${widgetShell({
        eyebrow: "Explainable sequence",
        title: "Timeline",
        className: "timeline-card",
        body: `<ol>${state.timeline.map(timelineItem).join("")}</ol>`
      })}
    </section>

    <section class="charts-grid" aria-label="Operational charts">
      ${Object.entries(state.charts).map(([key, chart]) => chartWidget(key, chart, {
        isLoading: state.loadingCharts,
        isEmpty: state.emptyChartKey === key
      })).join("")}
    </section>

    <section class="ux-section" aria-label="Widget decision explanations">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Decision support rationale</p>
          <h2>How Each Widget Helps Organizers</h2>
        </div>
      </div>
      <div class="decision-grid">${widgetDecisions.map(decisionCard).join("")}</div>
    </section>
  `;
}

/* ---- Incident Commander View ---- */
function renderIncidentView() {
  return incidentCommanderPanel(incidentState);
}

/* ---- Transport Intelligence View ---- */
function renderTransportView() {
  return transportCommanderPanel(transportState);
}

/* ---- Accessibility Intelligence View ---- */
function renderAccessibilityView() {
  return accessibilityCommanderPanel(accessibilityState);
}

/* ---- Sustainability Intelligence View ---- */
function renderSustainabilityView() {
  return sustainabilityCommanderPanel(sustainabilityState);
}

/* ---- Main Render ---- */
function renderApp() {
  const updatedNavItems = navigationItems.map((item) => ({
    ...item,
    active: item.label === activeView
  }));

  let mainContent = "";
  let viewTitle = environment.tagline;

  if (activeView === "Incident") {
    mainContent = renderIncidentView();
    viewTitle = "AI Incident Commander";
  } else if (activeView === "Transport") {
    mainContent = renderTransportView();
    viewTitle = "AI Transportation Intelligence";
  } else if (activeView === "Access") {
    mainContent = renderAccessibilityView();
    viewTitle = "AI Accessibility Intelligence";
  } else if (activeView === "Sustainability") {
    mainContent = renderSustainabilityView();
    viewTitle = "AI Sustainability Operations";
  } else if (activeView === "Crowd") {
    mainContent = redesignedCrowdPanel(crowdIntelligenceState);
    viewTitle = "AI Crowd Intelligence";
  } else if (activeView === "Audit") {
    mainContent = auditPanel(auditState);
    viewTitle = "AI Decision Intelligence Center";
    viewTitle = "AI Decision Intelligence Center";
  } else {
    mainContent = renderCommandDashboard();
  }

  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar" aria-label="Primary">
        <div class="brand-block">
          <div class="brand-mark" aria-hidden="true">A</div>
          <div>
            <strong>${environment.appName}</strong>
            <span>${environment.fullName}</span>
          </div>
        </div>
        <nav>${updatedNavItems.map(navItem).join("")}</nav>
        <div class="sidebar-footer">
          <span class="live-dot"></span>
          <div>
            <strong>${environment.mode}</strong>
            <span>Updated tick ${state.tick}</span>
          </div>
        </div>
      </aside>

      <div class="workspace">
        <header class="topbar">
          <div>
            <p class="eyebrow">${environment.eventName} · ${environment.venue}</p>
            <h1>${viewTitle}</h1>
          </div>
          <div class="topbar-actions">
            <button type="button">Escalate</button>
            <button class="primary-action" type="button">Approve Plan</button>
          </div>
        </header>

        <main id="main-content" class="dashboard">
          ${mainContent}
          ${copilotWidget(copilotState.history, copilotState.isTyping)}
        </main>
      </div>
    </div>
  `;

  bindEventListeners();
}

/* ---- Event Binding ---- */
function bindEventListeners() {
  // Navigation
  document.querySelectorAll("[data-nav-label]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const label = btn.getAttribute("data-nav-label");
      if (label !== activeView) {
        activeView = label;
        renderApp();
        if (activeView === "Transport") {
          refreshTransportIntelligence();
        } else if (activeView === "Access") {
          refreshAccessibilityIntelligence();
        } else if (activeView === "Sustainability") {
          refreshSustainabilityIntelligence();
        } else if (activeView === "Crowd") {
          refreshCrowdRedesign();
        } else if (activeView === "Audit") {
          refreshAuditIntelligence();
        }
      }
    });
  });

  // Only bind incident-specific events if viewing Incident
  if (activeView === "Incident") {

  // Type selector
  document.querySelectorAll("[data-incident-type]").forEach((card) => {
    card.addEventListener("click", () => {
      incidentState.selectedType = card.getAttribute("data-incident-type");
      incidentState.status = "form";
      renderApp();

      // Scroll to form
      const formPanel = document.getElementById("incident-form-panel");
      if (formPanel) formPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  // Back to types
  const btnBack = document.getElementById("btn-back-to-types");
  if (btnBack) {
    btnBack.addEventListener("click", () => {
      incidentState.status = "select";
      incidentState.selectedType = null;
      incidentState.formData = {};
      renderApp();
    });
  }

  // Form submission
  const form = document.getElementById("incident-form");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(form).entries());
      formData.affected_count = Number(formData.affected_count) || 1;

      incidentState.status = "loading";
      incidentState.formData = formData;
      renderApp();

      try {
        const analysis = await submitIncident(formData);
        incidentState.status = "results";
        incidentState.analysis = analysis;
      } catch (err) {
        incidentState.status = "form";
        incidentState.error = err.message;
      }
      renderApp();
    });
  }

  // Language tabs
  const languageTabs = document.getElementById("language-tabs");
  if (languageTabs) {
    languageTabs.addEventListener("click", (e) => {
      const tab = e.target.closest("[data-lang]");
      if (!tab) return;
      const lang = tab.getAttribute("data-lang");

      // Update active tab
      languageTabs.querySelectorAll(".language-tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");

      // Show selected message
      document.querySelectorAll("[data-lang-content]").forEach((msg) => {
        msg.classList.toggle("is-visible", msg.getAttribute("data-lang-content") === lang);
      });
    });
  }

  // New incident button
  const btnNew = document.getElementById("btn-new-incident");
  if (btnNew) {
    btnNew.addEventListener("click", () => {
      incidentState = { status: "select", selectedType: null, formData: {}, analysis: null, error: null };
      renderApp();
    });
  }

  // Escalate button
  const btnEscalate = document.getElementById("btn-escalate-incident");
  if (btnEscalate) {
    btnEscalate.addEventListener("click", () => {
      if (incidentState.analysis) {
        incidentState.analysis.workflow_stage = "monitoring";
        renderApp();
      }
    });
  }
  }

  // --- AI Copilot Event Handling ---
  
  // Submit Custom Query
  const copilotForm = document.getElementById("copilot-input-form");
  if (copilotForm) {
    copilotForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("copilot-query-input");
      if (!input || !input.value.trim()) return;
      
      const query = input.value.trim();
      input.value = "";
      
      await handleCopilotQuery(query);
    });
  }

  // Click Suggested Prompts
  document.querySelectorAll("[data-copilot-prompt]").forEach((chip) => {
    chip.addEventListener("click", async () => {
      const promptText = chip.getAttribute("data-copilot-prompt");
      await handleCopilotQuery(promptText);
    });
  });

  // Click Action Redirection Buttons
  document.querySelectorAll("[data-action-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetAction = btn.getAttribute("data-action-view");
      const mapping = {
        route_command: "Command",
        route_incident: "Incident",
        route_transport: "Transport",
        route_access: "Access",
        route_sustainability: "Sustainability"
      };
      
      const view = mapping[targetAction];
      if (view) {
        activeView = view;
        renderApp();
        
        // Auto scroll to main content
        const main = document.getElementById("main-content");
        if (main) main.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Only bind Crowd-specific events if activeView is Crowd
  if (activeView === "Crowd") {
    // Map Zone clicks (opens drawer)
    document.querySelectorAll(".ci-map-zone, .map-zone-path").forEach((path) => {
      path.addEventListener("click", () => {
        const zoneId = path.getAttribute("data-zone-id");
        crowdIntelligenceState.selectedZone = zoneId;
        renderApp();
      });
    });

    // Close Zone Drawer
    const btnCloseDrawer = document.getElementById("btn-close-zone-drawer");
    if (btnCloseDrawer) {
      btnCloseDrawer.addEventListener("click", () => {
        crowdIntelligenceState.selectedZone = null;
        renderApp();
      });
    }

    // Change What-If Scenario
    document.querySelectorAll("[data-scenario-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const scId = btn.getAttribute("data-scenario-id");
        crowdIntelligenceState.scenario = scId;
        await refreshCrowdRedesign();
      });
    });

    const btnCrowdRetry = document.getElementById("btn-crowd-retry");
    if (btnCrowdRetry) {
      btnCrowdRetry.addEventListener("click", () => {
        crowdIntelligenceState.status = "loading";
        crowdIntelligenceState.error = null;
        renderApp();
        refreshCrowdRedesign();
      });
    }

    // Playback Play/Pause Toggle
    const btnPlayToggle = document.getElementById("btn-crowd-play-toggle");
    if (btnPlayToggle) {
      btnPlayToggle.addEventListener("click", () => {
        crowdIntelligenceState.isPlaying = !crowdIntelligenceState.isPlaying;
        renderApp();
        if (crowdIntelligenceState.isPlaying) {
          runPlaybackLoop();
        }
      });
    }

    // Playback Timeline Slider change
    const timelineSlider = document.getElementById("crowd-timeline-range");
    if (timelineSlider) {
      timelineSlider.addEventListener("input", async (e) => {
        crowdIntelligenceState.timeIndex = Number(e.target.value);
        await refreshCrowdRedesign();
      });
    }

    // Playback Interval click
    document.querySelectorAll("[data-interval-name]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const val = Number(btn.getAttribute("data-interval-val"));
        crowdIntelligenceState.intervalName = btn.getAttribute("data-interval-name");
        crowdIntelligenceState.timeIndex = val;
        await refreshCrowdRedesign();
      });
    });

    // CSV Drag/Click Upload
    const csvBox = document.getElementById("csv-upload-box");
    const fileInput = document.getElementById("crowd-csv-file-input");
    
    if (csvBox && fileInput) {
      csvBox.addEventListener("click", () => fileInput.click());
      
      fileInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        crowdIntelligenceState.csvName = file.name;
        crowdIntelligenceState.csvError = "";
        crowdIntelligenceState.csvLoading = true;
        renderApp();

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const csvText = event.target.result;
            const response = await uploadCrowdCSV(csvText);
            crowdIntelligenceState.uploadedZones = response.zones;
            crowdIntelligenceState.csvLoading = false;
            await refreshCrowdRedesign();
          } catch (err) {
            crowdIntelligenceState.csvError = err.message;
            crowdIntelligenceState.csvLoading = false;
            renderApp();
          }
        };
        reader.onerror = () => {
          crowdIntelligenceState.csvError = "Failed to read file.";
          crowdIntelligenceState.csvLoading = false;
          renderApp();
        };
        reader.readAsText(file);
      });
    }
  }

  // Bind Audit page events if activeView is Audit
  if (activeView === "Audit") {
    // Replay Incident
    document.querySelectorAll("[data-replay-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const repId = btn.getAttribute("data-replay-id");
        auditState.replayId = repId;
        renderApp();
      });
    });

    // Full Analysis (Expand/Scroll to XAI Card)
    document.querySelectorAll("[data-expand-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const xId = btn.getAttribute("data-expand-id");
        const el = document.getElementById(`xai-${xId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });

    // Reset Filters
    const btnReset = document.getElementById("btn-audit-filter-reset");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        auditState.activeFilters = {
          search: "",
          category: "all",
          severity: "all",
          zone: "All Zones",
          status: "all",
          date: "All Dates",
          operator: "All Operators",
          volunteer: "All Volunteers"
        };
        renderApp();
      });
    }

    const btnAuditRetry = document.getElementById("btn-audit-retry");
    if (btnAuditRetry) {
      btnAuditRetry.addEventListener("click", () => {
        auditState.status = "loading";
        auditState.error = null;
        renderApp();
        refreshAuditIntelligence();
      });
    }

    // Search Input
    const searchInput = document.getElementById("audit-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        auditState.activeFilters.search = e.target.value;
        renderApp();
        const newIn = document.getElementById("audit-search");
        if (newIn) {
          newIn.focus();
          newIn.setSelectionRange(newIn.value.length, newIn.value.length);
        }
      });
    }

    // Filter selectors
    const bindFilter = (id, key) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("change", (e) => {
          auditState.activeFilters[key] = e.target.value;
          renderApp();
        });
      }
    };
    bindFilter("audit-filter-category", "category");
    bindFilter("audit-filter-severity", "severity");
    bindFilter("audit-filter-zone", "zone");
    bindFilter("audit-filter-status", "status");
    bindFilter("audit-filter-date", "date");
    bindFilter("audit-filter-operator", "operator");
    bindFilter("audit-filter-volunteer", "volunteer");

    // Export Buttons — real file downloads
    document.querySelectorAll("[data-export-type]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.getAttribute("data-export-type");
        const decId = btn.getAttribute("data-decision-id");
        try {
          exportAuditPackage(type, decId);
        } catch (err) {
          console.error(err);
          alert(`Export failed: ${err.message}`);
        }
      });
    });
  }
}

// Global query controller for streaming simulation
async function handleCopilotQuery(query) {
  // Append user message
  copilotState.history.push({ sender: "user", text: query });
  copilotState.isTyping = true;
  renderApp();

  // Scroll chat history to bottom
  const historyBox = document.getElementById("copilot-chat-history");
  if (historyBox) historyBox.scrollTop = historyBox.scrollHeight;

  // Build current system state context vector
  const systemContext = {
    crowd: crowdIntelligenceState.data,
    incidents: incidentState.analysis ? [incidentState.analysis] : [],
    transport: transportState.data || transportState.analysis || {},
    accessibility: accessibilityState.analysis || {},
    sustainability: sustainabilityState.analysis || {}
  };

  try {
    const response = await askCopilot(query, systemContext);
    
    // Simulate streaming by typing response out gradually
    copilotState.isTyping = false;
    
    // We add an empty AI message first
    const aiMsgIndex = copilotState.history.length;
    copilotState.history.push({
      sender: "ai",
      text: "",
      reasoning: response.reasoning,
      actions: response.reasoning.actions
    });

    const fullText = response.answer;
    let currentIdx = 0;
    
    // Quick interval simulation
    const timer = setInterval(() => {
      if (currentIdx < fullText.length) {
        // Add chunks of 4 characters to look natural and stream fast
        currentIdx += 4;
        copilotState.history[aiMsgIndex].text = fullText.slice(0, currentIdx);
        
        // Render minimal UI updates just for chat text
        const bubbleContentEl = document.querySelectorAll(".from-ai .bubble-content");
        if (bubbleContentEl.length > 0) {
          bubbleContentEl[bubbleContentEl.length - 1].innerHTML = fullText.slice(0, currentIdx);
        }
        
        if (historyBox) historyBox.scrollTop = historyBox.scrollHeight;
      } else {
        clearInterval(timer);
        copilotState.history[aiMsgIndex].text = fullText;
        renderApp();
      }
    }, 15);

  } catch (err) {
    copilotState.isTyping = false;
    copilotState.history.push({ sender: "ai", text: `Sorry, AURA encountered an operational communication failure: ${err.message}` });
    renderApp();
  }
}

renderApp();

setInterval(() => {
  state = evolveState(state);
  // Only re-render if viewing the command dashboard to avoid disrupting incident forms or transport maps
  if (activeView === "Command") {
    renderApp();
  }
}, environment.refreshIntervalMs);

async function refreshCrowdRedesign() {
  try {
    const contextInputs = crowdIntelligenceState.uploadedZones 
      ? { zones: crowdIntelligenceState.uploadedZones }
      : {};

    const data = await simulateCrowdScenario(
      crowdIntelligenceState.scenario,
      crowdIntelligenceState.timeIndex,
      contextInputs
    );

    crowdIntelligenceState.status = "ready";
    crowdIntelligenceState.analysis = data;
    crowdIntelligenceState.error = null;
  } catch (error) {
    crowdIntelligenceState.status = "error";
    crowdIntelligenceState.error = error.message;
  }
  if (activeView === "Crowd" || activeView === "Command") {
    renderApp();
  }
}

function runPlaybackLoop() {
  if (!crowdIntelligenceState.isPlaying || activeView !== "Crowd") return;
  
  // Advance time Index
  let nextIdx = crowdIntelligenceState.timeIndex + 0.1;
  if (nextIdx > 2.5) nextIdx = 0.5; // Loop back
  
  crowdIntelligenceState.timeIndex = nextIdx;
  
  refreshCrowdRedesign().then(() => {
    setTimeout(runPlaybackLoop, 1500);
  });
}

async function refreshTransportIntelligence() {
  try {
    const inputs = await fetchTransportInputs();
    const analysis = await fetchTransportLive();
    transportState = {
      status: "ready",
      inputs,
      analysis,
      error: null
    };
  } catch (error) {
    transportState = {
      status: "error",
      inputs: null,
      analysis: null,
      error: error instanceof Error ? error.message : "Unknown transport intelligence failure"
    };
  }
  if (activeView === "Transport") {
    renderApp();
  }
}

async function refreshAccessibilityIntelligence() {
  try {
    const inputs = await fetchAccessibilityInputs();
    const analysis = await fetchAccessibilityLive();
    accessibilityState = {
      status: "ready",
      inputs,
      analysis,
      error: null
    };
  } catch (error) {
    accessibilityState = {
      status: "error",
      inputs: null,
      analysis: null,
      error: error instanceof Error ? error.message : "Unknown accessibility intelligence failure"
    };
  }
  if (activeView === "Access") {
    renderApp();
  }
}

async function refreshSustainabilityIntelligence() {
  try {
    const inputs = await fetchSustainabilityInputs();
    const analysis = await fetchSustainabilityLive();
    sustainabilityState = {
      status: "ready",
      inputs,
      analysis,
      error: null
    };
  } catch (error) {
    sustainabilityState = {
      status: "error",
      inputs: null,
      analysis: null,
      error: error instanceof Error ? error.message : "Unknown sustainability intelligence failure"
    };
  }
  if (activeView === "Sustainability") {
    renderApp();
  }
}

async function refreshAuditIntelligence() {
  try {
    const decisions = await fetchAuditDecisions();
    const log = await fetchComplianceLog();
    auditState.status = "ready";
    auditState.decisions = decisions;
    auditState.complianceLog = log;
    auditState.error = null;
  } catch (error) {
    auditState.status = "error";
    auditState.error = error.message;
  }
  if (activeView === "Audit") {
    renderApp();
  }
}

refreshCrowdRedesign();
refreshAuditIntelligence();

setInterval(() => {
  if (activeView === "Crowd") {
    refreshCrowdRedesign();
  }
}, environment.refreshIntervalMs * 3);

// Initial transport load if needed
if (activeView === "Transport") {
  refreshTransportIntelligence();
}
setInterval(() => {
  if (activeView === "Transport") {
    refreshTransportIntelligence();
  }
}, environment.refreshIntervalMs * 4);

// Initial access load if needed
if (activeView === "Access") {
  refreshAccessibilityIntelligence();
}
setInterval(() => {
  if (activeView === "Access") {
    refreshAccessibilityIntelligence();
  }
}, environment.refreshIntervalMs * 4);

// Initial sustainability load if needed
if (activeView === "Sustainability") {
  refreshSustainabilityIntelligence();
}
setInterval(() => {
  if (activeView === "Sustainability") {
    refreshSustainabilityIntelligence();
  }
}, environment.refreshIntervalMs * 4);

// Periodic audit load
setInterval(() => {
  if (activeView === "Audit") {
    refreshAuditIntelligence();
  }
}, environment.refreshIntervalMs * 4);
