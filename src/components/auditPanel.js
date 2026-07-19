import {
  auditDecisions,
  complianceLog,
  performanceMetrics,
  executiveSummary,
  auditFilters
} from "../config/auditIntelligence.js";

/* ============================================================
   Reusable Primitives
   ============================================================ */

function severityBadge(s) {
  const map = {
    critical: { cls: "audit-sev-critical", label: "CRITICAL" },
    high:     { cls: "audit-sev-high",     label: "HIGH" },
    medium:   { cls: "audit-sev-medium",   label: "MEDIUM" },
    low:      { cls: "audit-sev-low",      label: "LOW" }
  };
  const r = map[s] || map["low"];
  return `<span class="audit-sev-badge ${r.cls}">${r.label}</span>`;
}

function statusBadge(s) {
  const map = {
    successful: { cls: "audit-status-success", label: "✓ Successful" },
    partial:    { cls: "audit-status-partial",  label: "◑ Partial" },
    failed:     { cls: "audit-status-fail",     label: "✗ Failed" },
    pending:    { cls: "audit-status-pending",  label: "⏳ Pending" }
  };
  const r = map[s] || map["pending"];
  return `<span class="audit-status-badge ${r.cls}">${r.label}</span>`;
}

function miniBar(pct, color = "var(--cyan)") {
  return `
    <div class="audit-mini-bar">
      <div class="audit-mini-fill" style="width:${Math.min(100, pct)}%; background:${color}"></div>
    </div>`;
}

function auditChart(data, maxOverride) {
  if (!data || !data.values) return `<div class="audit-chart-empty">No data</div>`;
  const max = maxOverride || Math.max(...data.values, 1);
  return `
    <div class="audit-bar-chart">
      ${data.values.map((v, i) => `
        <div class="audit-bar-col">
          <div class="audit-bar" style="height:${Math.round((v / max) * 100)}%">
            <span class="audit-bar-val">${v}</span>
          </div>
          ${data.labels ? `<span class="audit-bar-lbl">${data.labels[i]}</span>` : ""}
        </div>
      `).join("")}
    </div>`;
}

/* ============================================================
   1. Hero Metrics Row
   ============================================================ */
function auditKpiStrip(metrics) {
  const kpis = [
    { label: "Avg Response Time", value: `${metrics.avg_response_time_sec}s`, sub: "per AI recommendation", color: "var(--cyan)" },
    { label: "Decision Accuracy", value: `${metrics.decision_accuracy_pct}%`, sub: "correct predictions acted on", color: "var(--green)" },
    { label: "Prediction Accuracy", value: `${metrics.prediction_accuracy_pct}%`, sub: "AI forecasts validated", color: "var(--blue)" },
    { label: "Volunteer Response", value: `${metrics.volunteer_response_time_min}m`, sub: "avg steward deployment", color: "var(--violet)" },
    { label: "Accepted / Rejected", value: `${metrics.accepted_recommendations}/${metrics.rejected_recommendations}`, sub: "recommendations today", color: "var(--amber)" },
    { label: "Avg Resolution", value: `${metrics.avg_resolution_time_min}m`, sub: `${metrics.false_alerts} false alerts`, color: metrics.false_alerts > 3 ? "var(--red)" : "var(--green)" }
  ];

  return `
    <div class="audit-kpi-strip">
      ${kpis.map(k => `
        <div class="audit-kpi-card">
          <span class="audit-kpi-label">${k.label}</span>
          <strong class="audit-kpi-value" style="color:${k.color}">${k.value}</strong>
          <span class="audit-kpi-sub">${k.sub}</span>
        </div>
      `).join("")}
    </div>`;
}

/* ============================================================
   2. Search & Filters
   ============================================================ */
function auditFiltersBar(activeFilters = {}) {
  return `
    <div class="audit-filters-bar glass-card">
      <div class="audit-filter-group">
        <label for="audit-search">Search</label>
        <input type="text" id="audit-search" placeholder="Incident, zone, organizer, volunteer…" class="audit-search-input" aria-label="Search audit records" value="${activeFilters.search || ""}"/>
      </div>
      <div class="audit-filter-group">
        <label for="audit-filter-category">Category</label>
        <select id="audit-filter-category" class="audit-select" aria-label="Filter by category">
          ${auditFilters.categories.map(c => `<option value="${c.toLowerCase()}" ${(activeFilters.category || "all") === c.toLowerCase() ? "selected" : ""}>${c}</option>`).join("")}
        </select>
      </div>
      <div class="audit-filter-group">
        <label for="audit-filter-severity">Severity</label>
        <select id="audit-filter-severity" class="audit-select" aria-label="Filter by severity">
          ${auditFilters.severities.map(s => `<option value="${s.toLowerCase()}" ${(activeFilters.severity || "all") === s.toLowerCase() ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
      <div class="audit-filter-group">
        <label for="audit-filter-zone">Zone</label>
        <select id="audit-filter-zone" class="audit-select" aria-label="Filter by zone">
          ${auditFilters.zones.map(z => `<option value="${z}" ${(activeFilters.zone || "All Zones") === z ? "selected" : ""}>${z}</option>`).join("")}
        </select>
      </div>
      <div class="audit-filter-group">
        <label for="audit-filter-date">Date</label>
        <select id="audit-filter-date" class="audit-select" aria-label="Filter by date">
          ${auditFilters.dates.map(d => `<option value="${d}" ${(activeFilters.date || "All Dates") === d ? "selected" : ""}>${d}</option>`).join("")}
        </select>
      </div>
      <div class="audit-filter-group">
        <label for="audit-filter-operator">Organizer</label>
        <select id="audit-filter-operator" class="audit-select" aria-label="Filter by organizer">
          ${auditFilters.operators.map(o => `<option value="${o}" ${(activeFilters.operator || "All Operators") === o ? "selected" : ""}>${o}</option>`).join("")}
        </select>
      </div>
      <div class="audit-filter-group">
        <label for="audit-filter-volunteer">Volunteer</label>
        <select id="audit-filter-volunteer" class="audit-select" aria-label="Filter by volunteer">
          ${auditFilters.volunteers.map(v => `<option value="${v}" ${(activeFilters.volunteer || "All Volunteers") === v ? "selected" : ""}>${v}</option>`).join("")}
        </select>
      </div>
      <div class="audit-filter-group">
        <label for="audit-filter-status">Status</label>
        <select id="audit-filter-status" class="audit-select" aria-label="Filter by status">
          ${auditFilters.statuses.map(s => `<option value="${s.toLowerCase()}" ${(activeFilters.status || "all") === s.toLowerCase() ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </div>
      <button type="button" class="audit-filter-reset" id="btn-audit-filter-reset">Reset</button>
    </div>`;
}

/* ============================================================
   3. AI Decision Timeline
   ============================================================ */
function decisionTimelinePanel(decisions, replayId) {
  return `
    <article class="glass-card audit-timeline-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Immutable Chronological Record</p>
          <h2>AI Decision Timeline</h2>
        </div>
        <span class="status-pill">${decisions.length} Incidents</span>
      </div>
      <div class="audit-timeline">
        ${decisions.length === 0 ? `
          <div class="audit-no-results"><span>⌀</span><p>No timeline events match the current filters.</p></div>
        ` : decisions.map((dec, i) => `
          <div class="audit-timeline-item ${replayId === dec.id ? "is-replaying" : ""}">
            <div class="audit-tl-spine">
              <div class="audit-tl-dot audit-dot-${dec.severity}"></div>
              ${i < decisions.length - 1 ? '<div class="audit-tl-line"></div>' : ""}
            </div>
            <div class="audit-tl-content">
              <div class="audit-tl-header">
                <time class="audit-tl-time">${dec.timestamp}</time>
                <strong class="audit-tl-zone">${dec.zone}</strong>
                ${severityBadge(dec.severity)}
                ${statusBadge(dec.status)}
              </div>

              <div class="audit-chrono-cascade" aria-label="Decision cascade for ${dec.id}">
                ${(dec.cascade || []).map((step, si) => `
                  <div class="audit-chrono-step">
                    <time>${step.time}</time>
                    <p>${step.event}</p>
                    ${si < (dec.cascade.length - 1) ? '<span class="audit-chrono-arrow" aria-hidden="true">↓</span>' : ""}
                  </div>
                `).join("")}
              </div>

              <div class="audit-tl-actions">
                <button type="button" class="audit-btn-replay" data-replay-id="${dec.id}">
                  ${replayId === dec.id ? "Replaying…" : "Replay Incident"}
                </button>
                <button type="button" class="audit-btn-expand" data-expand-id="${dec.id}">Full Analysis</button>
                <span class="audit-tl-meta">Response: ${dec.response_time_sec}s · ${dec.ai_version} · ${dec.operator}</span>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </article>`;
}

/* ============================================================
   4. Explainable AI Cards
   ============================================================ */
function xaiCard(dec) {
  return `
    <article class="audit-xai-card glass-card" id="xai-${dec.id}" aria-label="AI Decision ${dec.id}">
      <div class="audit-xai-header">
        <div>
          <p class="eyebrow">Explainable AI · ${dec.id}</p>
          <h3>${dec.zone} — ${dec.timestamp}</h3>
        </div>
        <div style="display:flex;gap:var(--space-2);align-items:center">
          ${severityBadge(dec.severity)}
          ${statusBadge(dec.status)}
        </div>
      </div>

      <div class="audit-xai-body">
        <div class="audit-xai-field">
          <span class="audit-xai-label">🔍 Problem</span>
          <p>${dec.problem}</p>
        </div>

        <div class="audit-xai-field">
          <span class="audit-xai-label">📊 Evidence</span>
          <ul class="audit-xai-evidence">
            ${dec.evidence.map(e => `<li>${e}</li>`).join("")}
          </ul>
        </div>

        <div class="audit-xai-field">
          <span class="audit-xai-label">🧠 Gemini Reasoning</span>
          <p>${dec.reasoning}</p>
        </div>

        <div class="audit-xai-field">
          <span class="audit-xai-label">🔮 Prediction</span>
          <p>${dec.prediction}</p>
        </div>

        <div class="audit-xai-conf">
          <span class="audit-xai-label">Confidence Score</span>
          <div class="audit-conf-display">
            <strong style="color:${dec.confidence_score >= 90 ? "var(--green)" : dec.confidence_score >= 75 ? "var(--cyan)" : "var(--amber)"}">${dec.confidence_score}%</strong>
            ${miniBar(dec.confidence_score, dec.confidence_score >= 90 ? "var(--green)" : "var(--cyan)")}
          </div>
        </div>

        <div class="audit-xai-field audit-xai-rec">
          <span class="audit-xai-label">💡 AI Recommendation</span>
          <p>${dec.recommendation}</p>
        </div>

        <div class="audit-xai-compare">
          <div class="audit-compare-col audit-compare-ai">
            <span class="audit-xai-label">AI Expected Impact</span>
            <p>${dec.expected_impact}</p>
          </div>
          <div class="audit-compare-col audit-compare-human">
            <span class="audit-xai-label">Human Decision</span>
            <p>${dec.human_decision}</p>
          </div>
          <div class="audit-compare-col audit-compare-outcome">
            <span class="audit-xai-label">Actual Outcome</span>
            <p>${dec.actual_outcome}</p>
          </div>
        </div>

        <div class="audit-xai-meta">
          <span>Response: <strong>${dec.response_time_sec}s</strong></span>
          <span>Resolution: <strong>${dec.resolution_time_min}m</strong></span>
          <span>Organizer: <strong>${dec.operator}</strong></span>
          <span>Volunteer: <strong>${dec.volunteer || "—"}</strong></span>
          <span>Model: <strong>${dec.ai_version}</strong></span>
        </div>
      </div>
    </article>`;
}

/* ============================================================
   5. Decision Replay Panel
   ============================================================ */
function decisionReplayPanel(dec) {
  if (!dec) return `
    <article class="glass-card audit-replay-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Incident Reconstruction</p>
          <h2>Decision Replay</h2>
        </div>
        <span class="status-pill">Select an Incident</span>
      </div>
      <div class="audit-replay-empty">
        <span>↺</span>
        <p>Click "Replay Incident" on any timeline event to step through the full decision sequence.</p>
      </div>
    </article>`;

  const steps = (dec.cascade && dec.cascade.length)
    ? [
        { step: 1, label: "Original Data", icon: "📡", content: `Sensors detected: ${dec.evidence[0]}. Timestamp: ${dec.cascade[0].time}. Zone: ${dec.zone}.` },
        { step: 2, label: "AI Reasoning", icon: "🧠", content: `${dec.cascade[1]?.event || ""}\n\n${dec.reasoning}` },
        { step: 3, label: "Recommendation Issued", icon: "💡", content: `${dec.cascade[2]?.event || ""}\n\n${dec.recommendation}` },
        { step: 4, label: "Human Action", icon: "👤", content: `${dec.cascade[3]?.event || ""}\n\n${dec.operator}: ${dec.human_decision}` },
        { step: 5, label: "Final Result", icon: "✅", content: `${dec.cascade[4]?.event || ""}\n\n${dec.actual_outcome}` }
      ]
    : [
        { step: 1, label: "Original Data", icon: "📡", content: `Sensors detected: ${dec.evidence[0]}. Timestamp: ${dec.timestamp}. Zone: ${dec.zone}.` },
        { step: 2, label: "AI Reasoning", icon: "🧠", content: dec.reasoning },
        { step: 3, label: "Recommendation Issued", icon: "💡", content: dec.recommendation },
        { step: 4, label: "Human Action", icon: "👤", content: `${dec.operator}: ${dec.human_decision}` },
        { step: 5, label: "Final Result", icon: "✅", content: dec.actual_outcome }
      ];

  return `
    <article class="glass-card audit-replay-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Incident Reconstruction — ${dec.id}</p>
          <h2>Replaying: ${dec.zone}</h2>
        </div>
        ${severityBadge(dec.severity)}
      </div>
      <div class="audit-replay-steps">
        ${steps.map((s, i) => `
          <div class="audit-replay-step" style="animation-delay:${i * 120}ms">
            <div class="audit-rs-icon">${s.icon}</div>
            <div class="audit-rs-body">
              <span class="audit-rs-num">Step ${s.step}</span>
              <strong>${s.label}</strong>
              <p>${s.content}</p>
            </div>
            ${i < steps.length - 1 ? '<div class="audit-rs-connector"></div>' : ""}
          </div>
        `).join("")}
      </div>
      <div class="audit-replay-footer">
        <span>Resolution: <strong>${dec.resolution_time_min} minutes</strong></span>
        <span>AI Confidence: <strong style="color:var(--cyan)">${dec.confidence_score}%</strong></span>
        ${statusBadge(dec.status)}
      </div>
    </article>`;
}

/* ============================================================
   6. Performance Analytics
   ============================================================ */
function performancePanel(metrics) {
  return `
    <section class="audit-performance-section">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Operational Intelligence</p>
          <h2>Performance Analytics</h2>
        </div>
        <span class="status-pill">Match Day</span>
      </div>
      <div class="audit-perf-grid">

        <article class="glass-card audit-perf-card">
          <p class="eyebrow">Decision Trends</p>
          <h3>Decisions Over Time</h3>
          ${auditChart(metrics.decision_trends, 5)}
        </article>

        <article class="glass-card audit-perf-card">
          <p class="eyebrow">Incident Breakdown</p>
          <h3>By Category</h3>
          ${auditChart(metrics.incident_categories)}
        </article>

        <article class="glass-card audit-perf-card">
          <p class="eyebrow">AI Success Rate</p>
          <h3>Recommendation Outcomes</h3>
          <div class="audit-donut-grid">
            ${[
              { label: "Accepted", value: metrics.accepted_recommendations, color: "var(--green)" },
              { label: "Rejected", value: metrics.rejected_recommendations, color: "var(--red)" },
              { label: "Partial",  value: 3, color: "var(--amber)" },
              { label: "Pending",  value: 1, color: "var(--text-subtle)" }
            ].map(r => `
              <div class="audit-donut-row">
                <span class="audit-donut-dot" style="background:${r.color}"></span>
                <span>${r.label}</span>
                <strong>${r.value}</strong>
                ${miniBar(Math.round(r.value / metrics.total_recommendations * 100), r.color)}
                <span class="audit-donut-pct">${Math.round(r.value / metrics.total_recommendations * 100)}%</span>
              </div>
            `).join("")}
          </div>
        </article>

        <article class="glass-card audit-perf-card">
          <p class="eyebrow">Time Analysis</p>
          <h3>Resolution Time by Incident</h3>
          ${auditChart(metrics.resolution_time_trend, 30)}
        </article>

        <article class="glass-card audit-perf-card">
          <p class="eyebrow">Risk Profile</p>
          <h3>Risk Distribution</h3>
          ${auditChart(metrics.risk_distribution)}
        </article>

        <article class="glass-card audit-perf-card">
          <p class="eyebrow">Model Accuracy</p>
          <h3>Prediction Accuracy Trend</h3>
          ${auditChart(metrics.prediction_accuracy_trend, 100)}
        </article>

      </div>
    </section>`;
}

/* ============================================================
   7. AI Recommendation Accuracy
   ============================================================ */
function recommendationAccuracyPanel(metrics) {
  const confColor = metrics.avg_confidence_pct >= 90 ? "var(--green)" : "var(--cyan)";
  return `
    <article class="glass-card audit-accuracy-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Model Intelligence</p>
          <h2>AI Recommendation Accuracy</h2>
        </div>
        <span class="status-pill pill-cyan">${metrics.model_reliability_pct}% Reliable</span>
      </div>
      <div class="audit-acc-grid">
        <div class="audit-acc-stat">
          <span>Total Recommendations</span>
          <strong>${metrics.total_recommendations}</strong>
        </div>
        <div class="audit-acc-stat">
          <span>Accepted</span>
          <strong style="color:var(--green)">${metrics.accepted_recommendations}</strong>
        </div>
        <div class="audit-acc-stat">
          <span>Rejected</span>
          <strong style="color:var(--red)">${metrics.rejected_recommendations}</strong>
        </div>
        <div class="audit-acc-stat">
          <span>Successful</span>
          <strong style="color:var(--green)">${metrics.successful_outcomes}</strong>
        </div>
        <div class="audit-acc-stat">
          <span>Partial</span>
          <strong style="color:var(--amber)">${metrics.partial_outcomes}</strong>
        </div>
        <div class="audit-acc-stat">
          <span>Failed</span>
          <strong style="color:var(--red)">${metrics.failed_outcomes}</strong>
        </div>
      </div>
      <div class="audit-acc-confidence">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)">
          <span class="audit-xai-label">Average AI Confidence</span>
          <strong style="color:${confColor};font-size:1.4rem">${metrics.avg_confidence_pct}%</strong>
        </div>
        ${miniBar(metrics.avg_confidence_pct, confColor)}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--space-4);margin-bottom:var(--space-2)">
          <span class="audit-xai-label">Model Reliability Score</span>
          <strong style="color:var(--cyan);font-size:1.4rem">${metrics.model_reliability_pct}%</strong>
        </div>
        ${miniBar(metrics.model_reliability_pct, "var(--cyan)")}
      </div>
    </article>`;
}

/* ============================================================
   8. Compliance Log
   ============================================================ */
function complianceLogPanel(log) {
  return `
    <article class="glass-card audit-compliance-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Immutable Audit Trail</p>
          <h2>Compliance Log</h2>
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-2)">
          <span style="font-size:0.68rem;color:var(--green);font-weight:800">🔒 IMMUTABLE</span>
          <span class="status-pill">${log.length} Records</span>
        </div>
      </div>
      <div class="audit-compliance-table-wrap data-panel">
        <table class="audit-compliance-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>AI Version</th>
              <th>Prev State</th>
              <th>New State</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            ${log.map(entry => `
              <tr class="audit-log-row">
                <td><code class="audit-log-id">${entry.id}</code></td>
                <td><time class="audit-log-ts">${entry.timestamp}</time></td>
                <td class="${entry.user.startsWith("AURA") ? "audit-log-ai" : "audit-log-human"}">${entry.user}</td>
                <td class="audit-log-action">${entry.action}</td>
                <td><code class="audit-log-ver">${entry.ai_version}</code></td>
                <td><span class="audit-state-pill audit-state-prev">${entry.prev_state}</span></td>
                <td><span class="audit-state-pill audit-state-next ${getStateClass(entry.new_state)}">${entry.new_state}</span></td>
                <td class="audit-log-reason">${entry.reason}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </article>`;
}

function getStateClass(state) {
  const map = { Critical: "state-critical", High: "state-high", Active: "state-active", Breach: "state-critical", Recovering: "state-recover", Partial: "state-partial", Modified: "state-partial", Watch: "state-watch" };
  return map[state] || "";
}

/* ============================================================
   9. Decision Comparison
   ============================================================ */
function decisionComparisonPanel(decisions) {
  return `
    <article class="glass-card audit-comparison-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AI vs Human vs Outcome</p>
          <h2>Decision Comparison</h2>
        </div>
        <span class="status-pill">Differences Highlighted</span>
      </div>
      <div class="audit-comparison-table-wrap data-panel">
        <table class="audit-comparison-table">
          <thead>
            <tr>
              <th>Zone / Time</th>
              <th>Severity</th>
              <th>AI Recommendation</th>
              <th>Human Decision</th>
              <th>Alignment</th>
              <th>Final Outcome</th>
              <th>Resolution</th>
            </tr>
          </thead>
          <tbody>
            ${decisions.map(dec => {
              const lower = dec.human_decision.toLowerCase();
              const fullMatch = lower.includes("approved") && !lower.includes("partial") && !lower.includes("modified") && !lower.includes("deferred");
              const partial = lower.includes("partial") || lower.includes("modified") || lower.includes("delayed");
              const alignLabel = fullMatch ? "Aligned" : partial ? "Diverged" : "Rejected";
              const alignCls = fullMatch ? "comp-match" : "comp-diff";
              return `
                <tr class="audit-comp-row ${alignCls}">
                  <td><strong>${dec.zone}</strong><br/><time>${dec.timestamp}</time></td>
                  <td>${severityBadge(dec.severity)}</td>
                  <td class="audit-comp-ai">${dec.recommendation.slice(0, 90)}…</td>
                  <td class="audit-comp-human ${alignCls}">${dec.human_decision.slice(0, 90)}…</td>
                  <td><span class="audit-match-icon ${alignCls}">${fullMatch ? "✓" : "~"} ${alignLabel}</span></td>
                  <td class="audit-comp-outcome">${dec.actual_outcome.slice(0, 80)}…</td>
                  <td>${dec.resolution_time_min}m<br/>${statusBadge(dec.status)}</td>
                </tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
    </article>`;
}

/* ============================================================
   10. Incident Reports
   ============================================================ */
function incidentReportsPanel(decisions) {
  return `
    <article class="glass-card audit-reports-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Downloadable Documentation</p>
          <h2>Incident Reports</h2>
        </div>
        <span class="status-pill">${decisions.length} Reports</span>
      </div>
      <div class="audit-report-list">
        ${decisions.map(dec => `
          <div class="audit-report-card">
            <div class="audit-report-info">
              <div>
                <strong>${dec.zone}</strong>
                <span>${dec.timestamp} · ${dec.category.toUpperCase()} · ${dec.response_time_sec}s response</span>
              </div>
              <div style="display:flex;gap:var(--space-2);align-items:center">
                ${severityBadge(dec.severity)}
                ${statusBadge(dec.status)}
              </div>
            </div>
            <p class="audit-report-summary">${dec.problem}</p>
            <div class="audit-report-actions">
              <button type="button" class="audit-export-btn" data-export-type="pdf" data-decision-id="${dec.id}">PDF Report</button>
              <button type="button" class="audit-export-btn" data-export-type="csv" data-decision-id="${dec.id}">CSV Export</button>
              <button type="button" class="audit-export-btn" data-export-type="json" data-decision-id="${dec.id}">JSON</button>
              <button type="button" class="audit-export-btn audit-export-timeline" data-export-type="timeline" data-decision-id="${dec.id}">Timeline</button>
            </div>
          </div>
        `).join("")}
      </div>
    </article>`;
}

/* ============================================================
   11. Executive Summary
   ============================================================ */
function executiveSummaryPanel(summary) {
  return `
    <article class="glass-card audit-exec-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Gemini Generated · ${summary.generated_at}</p>
          <h2>Executive Summary</h2>
        </div>
        <div style="display:flex;gap:var(--space-2)">
          <span class="status-pill pill-violet">AI Generated</span>
          <button type="button" class="audit-export-btn" data-export-type="pdf" data-decision-id="summary">Export PDF</button>
        </div>
      </div>

      <div class="audit-exec-narrative">
        <p>${summary.operational_summary}</p>
      </div>

      <div class="audit-exec-grid">
        <div class="audit-exec-section">
          <h3>⚠️ Major Risks</h3>
          <ul>
            ${summary.major_risks.map(r => `<li>${r}</li>`).join("")}
          </ul>
        </div>

        <div class="audit-exec-section">
          <h3>🎯 Key Decisions</h3>
          <ul>
            ${summary.key_decisions.map(d => `<li>${d}</li>`).join("")}
          </ul>
        </div>

        <div class="audit-exec-section audit-exec-full">
          <h3>📈 Response Effectiveness</h3>
          <p>${summary.response_effectiveness}</p>
        </div>

        <div class="audit-exec-section">
          <h3>📚 Lessons Learned</h3>
          <ul>
            ${summary.lessons_learned.map(l => `<li>${l}</li>`).join("")}
          </ul>
        </div>

        <div class="audit-exec-section">
          <h3>🔭 Future Suggestions</h3>
          <ul>
            ${summary.future_suggestions.map(s => `<li>${s}</li>`).join("")}
          </ul>
        </div>
      </div>

      <div class="audit-exec-footer">
        <span>Generated by <strong>${summary.generated_by}</strong></span>
        <span>at <strong>${summary.generated_at}</strong></span>
        <button type="button" class="audit-export-btn" data-export-type="csv" data-decision-id="summary">Export CSV</button>
        <button type="button" class="audit-export-btn" data-export-type="json" data-decision-id="summary">Export JSON</button>
      </div>
    </article>`;
}

/* ============================================================
   12. Export Panel
   ============================================================ */
function exportPanel() {
  const exports = [
    { type: "pdf",      icon: "📄", label: "Full PDF Report",      desc: "Complete audit trail as formatted PDF" },
    { type: "csv",      icon: "📊", label: "CSV Dataset",           desc: "All decisions, compliance log, metrics" },
    { type: "json",     icon: "{}",  label: "JSON Export",           desc: "Machine-readable full event log" },
    { type: "incident", icon: "🚨", label: "Incident Reports",      desc: "Per-incident PDF with recommendations" },
    { type: "ai",       icon: "🧠", label: "AI Analysis Report",    desc: "Gemini reasoning and prediction summary" },
    { type: "timeline", icon: "⏱",  label: "Full Timeline Export",  desc: "Chronological event log in all formats" }
  ];
  return `
    <article class="glass-card audit-export-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Data Portability</p>
          <h2>Export Options</h2>
        </div>
        <span class="status-pill">${exports.length} Formats</span>
      </div>
      <div class="audit-export-grid">
        ${exports.map(e => `
          <button type="button" class="audit-export-card" data-export-type="${e.type}" data-decision-id="all">
            <span class="audit-export-icon">${e.icon}</span>
            <strong>${e.label}</strong>
            <span>${e.desc}</span>
          </button>
        `).join("")}
      </div>
    </article>`;
}

/* ============================================================
   Main Audit Panel
   ============================================================ */
function auditPageHeader() {
  return `
    <header class="audit-page-header glass-card">
      <div>
        <p class="eyebrow">Mission-Critical Explainability · Not Another Dashboard</p>
        <h1>AI Decision Intelligence Center</h1>
        <p class="audit-page-lede">Complete transparency for every Gemini recommendation and every human decision — chronological audit trail, replay, compliance, and executive accountability.</p>
      </div>
      <div class="audit-page-header-meta">
        <span class="status-pill" style="color:var(--green);border-color:rgba(85,213,138,0.35)">Immutable Trail</span>
        <span class="status-pill pill-violet">Gemini XAI</span>
      </div>
    </header>`;
}

export function auditPanel(state) {
  const {
    status = "ready",
    replayId = null,
    activeFilters = {},
    decisions = auditDecisions,
    error = null
  } = state || {};

  if (status === "loading" && (!decisions || decisions.length === 0)) {
    return `
      <div class="audit-page-shell">
        ${auditPageHeader()}
        <div class="audit-loading-shell glass-card">
          <h2>Loading Decision Intelligence…</h2>
          <p>Hydrating audit trail, compliance log, and performance analytics.</p>
          <div class="ci-loading-bar"><div class="ci-loading-fill"></div></div>
        </div>
      </div>`;
  }

  if (status === "error") {
    return `
      <div class="audit-page-shell">
        ${auditPageHeader()}
        <div class="audit-error-shell glass-card" role="alert">
          <h2>Audit trail unavailable</h2>
          <p>${error || "Unable to load decision intelligence records."}</p>
          <button type="button" class="audit-filter-reset" id="btn-audit-retry">Retry</button>
        </div>
      </div>`;
  }

  const replayDec = replayId ? auditDecisions.find(d => d.id === replayId) : null;

  const filteredDecisions = decisions.filter(dec => {
    if (activeFilters.category && activeFilters.category !== "all" && dec.category !== activeFilters.category) return false;
    if (activeFilters.severity && activeFilters.severity !== "all" && dec.severity !== activeFilters.severity) return false;
    if (activeFilters.status && activeFilters.status !== "all" && dec.status !== activeFilters.status) return false;
    if (activeFilters.zone && activeFilters.zone !== "All Zones" && dec.zone !== activeFilters.zone) return false;
    if (activeFilters.date && activeFilters.date !== "All Dates" && dec.date !== activeFilters.date) return false;
    if (activeFilters.operator && activeFilters.operator !== "All Operators" && dec.operator !== activeFilters.operator) return false;
    if (activeFilters.volunteer && activeFilters.volunteer !== "All Volunteers" && dec.volunteer !== activeFilters.volunteer) return false;
    if (activeFilters.search) {
      const q = activeFilters.search.toLowerCase();
      const hay = `${dec.zone} ${dec.problem} ${dec.operator} ${dec.volunteer || ""} ${dec.category} ${dec.id}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return `
    <div class="audit-page-shell">

      ${auditPageHeader()}
      ${auditKpiStrip(performanceMetrics)}
      ${auditFiltersBar(activeFilters)}

      <div class="audit-main-grid">

        <div class="audit-col-left">
          ${decisionTimelinePanel(filteredDecisions, replayId)}
          <section class="audit-xai-section" aria-label="Explainable AI Decision Cards">
            <div class="section-heading" style="margin-bottom:var(--space-4)">
              <div>
                <p class="eyebrow">Full Decision Breakdown</p>
                <h2>Explainable AI Cards</h2>
              </div>
              <span class="status-pill">${filteredDecisions.length} Records</span>
            </div>
            ${filteredDecisions.length === 0
              ? `<div class="audit-no-results"><span>⌀</span><p>No decisions match the current filters. Try adjusting your search criteria.</p></div>`
              : filteredDecisions.map(xaiCard).join("")
            }
          </section>
        </div>

        <div class="audit-col-right">
          ${decisionReplayPanel(replayDec)}
          ${recommendationAccuracyPanel(performanceMetrics)}
          ${incidentReportsPanel(filteredDecisions)}
          ${exportPanel()}
        </div>

      </div>

      ${decisionComparisonPanel(filteredDecisions)}
      ${performancePanel(performanceMetrics)}
      ${executiveSummaryPanel(executiveSummary)}
      ${complianceLogPanel(complianceLog)}

    </div>`;
}
