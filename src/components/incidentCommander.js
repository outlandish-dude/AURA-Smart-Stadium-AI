import { incidentTypes, severityLevels, workflowStages, stadiumLocations, supportedLanguages } from "../config/incidentCommander.js";

/* ---- Workflow Bar ---- */
export function workflowBar(currentStage) {
  const stageIndex = workflowStages.findIndex((s) => s.id === currentStage);
  return `
    <div class="workflow-bar" aria-label="Incident workflow progress">
      ${workflowStages.map((stage, i) => {
        const isCompleted = i < stageIndex;
        const isActive = i === stageIndex;
        const cls = isCompleted ? "is-completed" : isActive ? "is-active" : "";
        const connector = i < workflowStages.length - 1
          ? `<div class="workflow-connector ${isCompleted ? "is-completed" : ""}"></div>`
          : "";
        return `
          <div class="workflow-step ${cls}" aria-current="${isActive ? "step" : "false"}">
            <span aria-hidden="true">${stage.icon}</span>
            <span>${stage.label}</span>
          </div>
          ${connector}
        `;
      }).join("")}
    </div>
  `;
}

/* ---- Type Selector ---- */
export function incidentTypeSelector(selectedType) {
  return `
    <article class="glass-card widget-card incident-form-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AI Incident Commander</p>
          <h2>Select Incident Type</h2>
        </div>
        <span class="status-pill">Step 1</span>
      </div>
      <div class="incident-type-grid" id="incident-type-grid">
        ${incidentTypes.map((type) => `
          <div
            class="incident-type-card ${selectedType === type.id ? "is-selected" : ""}"
            data-incident-type="${type.id}"
            style="--card-glow: ${type.color}33; --card-border: ${type.color}"
            role="button"
            tabindex="0"
            aria-pressed="${selectedType === type.id}"
            aria-label="Select ${type.label} incident"
          >
            <span class="incident-type-icon" aria-hidden="true">${type.icon}</span>
            <h3>${type.label}</h3>
            <p>${type.description}</p>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

/* ---- Incident Form ---- */
export function incidentReportForm(selectedType, formData = {}) {
  const type = incidentTypes.find((t) => t.id === selectedType);
  if (!type) return "";

  return `
    <article class="glass-card widget-card incident-form-panel" id="incident-form-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">${type.icon} ${type.label} Incident</p>
          <h2>Report Details</h2>
        </div>
        <span class="status-pill">Step 2</span>
      </div>
      <form class="incident-form" id="incident-form">
        <input type="hidden" name="type" value="${selectedType}" />

        <div class="incident-form-row">
          <div class="form-field">
            <label for="incident-severity">Severity Level</label>
            <select id="incident-severity" name="severity">
              ${severityLevels.map((s) => `
                <option value="${s.id}" ${s.id === (formData.severity || type.defaultSeverity) ? "selected" : ""}>${s.label}</option>
              `).join("")}
            </select>
          </div>

          <div class="form-field">
            <label for="incident-location">Location</label>
            <select id="incident-location" name="location">
              <option value="">Select location...</option>
              ${stadiumLocations.map((loc) => `
                <option value="${loc}" ${formData.location === loc ? "selected" : ""}>${loc}</option>
              `).join("")}
            </select>
          </div>

          <div class="form-field">
            <label for="incident-affected">Estimated Affected</label>
            <input
              type="number"
              id="incident-affected"
              name="affected_count"
              min="1"
              max="10000"
              value="${formData.affected_count || 1}"
              placeholder="Number of people affected"
            />
          </div>
        </div>

        <div class="form-field">
          <label for="incident-description">Incident Description</label>
          <textarea
            id="incident-description"
            name="description"
            placeholder="Describe the incident in detail — what happened, what you observe, any immediate concerns..."
          >${formData.description || ""}</textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" id="btn-back-to-types">← Back</button>
          <button type="submit" class="btn-analyze" id="btn-analyze-incident">
            🧠 Analyze with AI
          </button>
        </div>
      </form>
    </article>
  `;
}

/* ---- Loading State ---- */
export function incidentLoadingPanel() {
  return `
    <article class="glass-card widget-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AI Incident Commander</p>
          <h2>Analyzing Incident</h2>
        </div>
        <span class="status-pill">Processing</span>
      </div>
      ${workflowBar("analyzing")}
      <div class="incident-loading">
        <p>🧠 AURA is generating executive summary, root cause analysis, immediate actions, volunteer instructions, public announcement, multilingual messages, recovery plan, timeline, and risk assessment...</p>
      </div>
    </article>
  `;
}

/* ---- Analysis Dashboard ---- */
function executiveSummaryCard(analysis) {
  return `
    <div class="analysis-card full-width">
      <div class="analysis-card-header">
        <h3><span class="section-icon">📋</span> Executive Summary</h3>
        <span class="severity-badge severity-${analysis.severity}">${analysis.severity}</span>
      </div>
      <p class="executive-summary-text">${analysis.executive_summary}</p>
    </div>
  `;
}

function rootCauseCard(analysis) {
  const rc = analysis.root_cause;
  return `
    <div class="analysis-card">
      <div class="analysis-card-header">
        <h3><span class="section-icon">🔍</span> Root Cause</h3>
      </div>
      <p class="root-cause-primary">${rc.probable_cause}</p>
      <ul class="contributing-factors">
        ${rc.contributing_factors.map((f) => `<li>${f}</li>`).join("")}
      </ul>
      <div class="confidence-meter">
        <span class="label">Confidence</span>
        <div class="confidence-bar"><span style="width: ${rc.confidence}%"></span></div>
        <span class="value">${rc.confidence}%</span>
      </div>
    </div>
  `;
}

function immediateActionsCard(analysis) {
  return `
    <div class="analysis-card">
      <div class="analysis-card-header">
        <h3><span class="section-icon">⚡</span> Immediate Actions</h3>
        <span class="status-pill">${analysis.immediate_actions.length} actions</span>
      </div>
      <div class="actions-list">
        ${analysis.immediate_actions.map((action, i) => `
          <div class="action-item">
            <span class="action-number">${i + 1}</span>
            <span class="action-text">${action.action}</span>
            <span class="action-assignee">${action.assignee}</span>
            <span class="action-eta">${action.eta_minutes}m</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function volunteerInstructionsCard(analysis) {
  return `
    <div class="analysis-card full-width">
      <div class="analysis-card-header">
        <h3><span class="section-icon">🤝</span> Volunteer Instructions</h3>
        <span class="status-pill">${analysis.volunteer_instructions.length} teams</span>
      </div>
      <div class="volunteer-grid">
        ${analysis.volunteer_instructions.map((v) => `
          <div class="volunteer-card">
            <h4>${v.team}</h4>
            <span class="role-tag">${v.role}</span>
            <p>${v.instructions}</p>
            <span class="zone-tag">📍 ${v.zone}</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function publicAnnouncementCard(analysis) {
  return `
    <div class="analysis-card">
      <div class="analysis-card-header">
        <h3><span class="section-icon">📢</span> Public Announcement</h3>
        <span class="status-pill">PA Ready</span>
      </div>
      <div class="announcement-box">
        <p class="announcement-text">${analysis.public_announcement}</p>
      </div>
    </div>
  `;
}

function multilingualCard(analysis) {
  const messages = analysis.multilingual_messages;
  return `
    <div class="analysis-card">
      <div class="analysis-card-header">
        <h3><span class="section-icon">🌐</span> Multilingual Messages</h3>
        <span class="status-pill">${supportedLanguages.length} languages</span>
      </div>
      <div class="language-tabs" id="language-tabs">
        ${supportedLanguages.map((lang, i) => `
          <button
            type="button"
            class="language-tab ${i === 0 ? "is-active" : ""}"
            data-lang="${lang.code}"
          >${lang.flag} ${lang.label}</button>
        `).join("")}
      </div>
      ${supportedLanguages.map((lang, i) => `
        <div class="language-message ${i === 0 ? "is-visible" : ""}" data-lang-content="${lang.code}">
          <p>${messages[lang.code] || "Translation not available."}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function recoveryPlanCard(analysis) {
  const rp = analysis.recovery_plan;
  return `
    <div class="analysis-card">
      <div class="analysis-card-header">
        <h3><span class="section-icon">🔄</span> Recovery Plan</h3>
      </div>
      <div class="recovery-phases">
        <div class="recovery-phase phase-immediate">
          <h4>🔴 Immediate (0–30 min)</h4>
          <ul>${rp.immediate.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
        <div class="recovery-phase phase-short-term">
          <h4>🟡 Short-term (30 min–2 hr)</h4>
          <ul>${rp.short_term.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
        <div class="recovery-phase phase-long-term">
          <h4>🟢 Long-term (2 hr+)</h4>
          <ul>${rp.long_term.map((s) => `<li>${s}</li>`).join("")}</ul>
        </div>
      </div>
    </div>
  `;
}

function timelineCard(analysis) {
  return `
    <div class="analysis-card">
      <div class="analysis-card-header">
        <h3><span class="section-icon">⏱️</span> Projected Timeline</h3>
      </div>
      <div class="incident-timeline">
        ${analysis.timeline.map((entry) => `
          <div class="timeline-entry status-${entry.status}">
            <span class="timeline-time">T+${entry.time_offset_minutes}m · ${entry.status.replace("_", " ")}</span>
            <p class="timeline-event">${entry.event}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function riskGaugeColor(score) {
  if (score >= 80) return "#ff5b76";
  if (score >= 60) return "#ff8d5c";
  if (score >= 40) return "#ffca5f";
  return "#55d58a";
}

function riskAssessmentCard(analysis) {
  const ra = analysis.risk_assessment;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (ra.overall_risk_score / 100) * circumference;
  const color = riskGaugeColor(ra.overall_risk_score);

  return `
    <div class="analysis-card full-width">
      <div class="analysis-card-header">
        <h3><span class="section-icon">⚠️</span> Risk Assessment</h3>
        <span class="severity-badge severity-${analysis.severity}">${ra.overall_risk_score}/100</span>
      </div>
      <div class="risk-score-display">
        <div class="risk-gauge">
          <svg viewBox="0 0 100 100">
            <circle class="risk-gauge-track" cx="50" cy="50" r="42" />
            <circle
              class="risk-gauge-fill"
              cx="50" cy="50" r="42"
              stroke="${color}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${offset}"
            />
          </svg>
          <span class="risk-gauge-label">${ra.overall_risk_score}</span>
        </div>
        <div class="risk-details">
          <div class="risk-detail-row">
            <span class="label">Likelihood</span>
            <span class="value">${ra.likelihood}</span>
          </div>
          <div class="risk-detail-row">
            <span class="label">Impact</span>
            <span class="value">${ra.impact}</span>
          </div>
        </div>
      </div>
      <p class="risk-list-header">Cascading Risks</p>
      <ul class="risk-list">
        ${ra.cascading_risks.map((r) => `<li>${r}</li>`).join("")}
      </ul>
      <p class="risk-list-header">Mitigations</p>
      <ul class="risk-list">
        ${ra.mitigations.map((m) => `<li>${m}</li>`).join("")}
      </ul>
    </div>
  `;
}

export function analysisResultsDashboard(analysis) {
  const type = incidentTypes.find((t) => t.id === analysis.incident_type);

  return `
    <section class="incident-analysis-section" aria-label="AI Incident Analysis Results">
      <article class="glass-card widget-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">AI Incident Commander</p>
            <h2>${type ? type.icon : "🚨"} ${type ? type.label : "Incident"} — AI Response Package</h2>
          </div>
          <div class="incident-header-left">
            <span class="incident-id-badge">${analysis.incident_id}</span>
            <span class="incident-type-badge">${type ? type.icon : ""} ${type ? type.label : analysis.incident_type}</span>
            <span class="severity-badge severity-${analysis.severity}">${analysis.severity}</span>
          </div>
        </div>
        ${workflowBar(analysis.workflow_stage || "responded")}
      </article>

      <div class="analysis-grid">
        ${executiveSummaryCard(analysis)}
        ${rootCauseCard(analysis)}
        ${immediateActionsCard(analysis)}
        ${volunteerInstructionsCard(analysis)}
        ${publicAnnouncementCard(analysis)}
        ${multilingualCard(analysis)}
        ${recoveryPlanCard(analysis)}
        ${timelineCard(analysis)}
        ${riskAssessmentCard(analysis)}
      </div>

      <div class="form-actions" style="margin-top: var(--space-5);">
        <button type="button" class="btn-secondary" id="btn-new-incident">📋 New Incident</button>
        <button type="button" class="btn-analyze" id="btn-escalate-incident">🚨 Escalate to Commander</button>
      </div>
    </section>
  `;
}

/* ---- Full Incident Panel (state machine) ---- */
export function incidentCommanderPanel(state) {
  if (state.status === "loading") {
    return incidentLoadingPanel();
  }

  if (state.status === "results" && state.analysis) {
    return analysisResultsDashboard(state.analysis);
  }

  if (state.status === "form" && state.selectedType) {
    return `
      ${incidentTypeSelector(state.selectedType)}
      ${incidentReportForm(state.selectedType, state.formData)}
    `;
  }

  // Default: type selection
  return incidentTypeSelector(state.selectedType);
}
