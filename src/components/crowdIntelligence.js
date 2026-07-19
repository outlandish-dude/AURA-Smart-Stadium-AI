const formatPercent = (value) => `${Math.round(value)}%`;

export function statePanel({ title, message, type = "loading" }) {
  return `
    <article class="glass-card widget-card crowd-intel-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AI Crowd Intelligence</p>
          <h2>${title}</h2>
        </div>
        <span class="status-pill">${type}</span>
      </div>
      <div class="chart-state ${type === "loading" ? "loading-state" : "empty-state"}">${message}</div>
    </article>
  `;
}

export function predictionCard(item) {
  return `
    <article class="prediction-card severity-${item.severity}">
      <div class="card-header">
        <div>
          <p class="eyebrow">${item.time_horizon_minutes} minute horizon</p>
          <h3>${item.zone_name}</h3>
        </div>
        <span>${item.risk_score}</span>
      </div>
      <p>${item.why.join(" ")}</p>
    </article>
  `;
}

export function routeCard(route) {
  return `
    <article class="route-card">
      <div class="card-header">
        <h3>${route.route_name}</h3>
        <span>${formatPercent(route.safety_score)}</span>
      </div>
      <p>${route.recommendation}</p>
      <small>${route.why}</small>
    </article>
  `;
}

export function compactTable({ columns, rows, keys }) {
  if (rows.length === 0) {
    return `<div class="chart-state empty-state">No data available for this table.</div>`;
  }

  return `
    <table>
      <thead><tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${keys.map((key) => `<td>${row[key]}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  `;
}

export function crowdIntelligencePanel(intelligence) {
  if (!intelligence) {
    return statePanel({
      title: "Crowd Intelligence",
      message: "No crowd intelligence response is available.",
      type: "empty"
    });
  }

  const gateRows = intelligence.gate_balancing.gates.map((gate) => ({
    gate: gate.gate_name,
    utilization: `${gate.current_utilization_percent}%`,
    queue: gate.queue_depth,
    action: gate.recommended_adjustment.replaceAll("_", " ")
  }));

  const queueRows = intelligence.queue_prediction.map((queue) => ({
    gate: queue.gate_name,
    wait: `${queue.predicted_wait_minutes}m`,
    depth: queue.predicted_queue_depth_15m,
    why: queue.why
  }));

  return `
    <section class="crowd-intelligence-grid" aria-label="AI Crowd Intelligence">
      <article class="glass-card widget-card crowd-intel-card crowd-intel-hero">
        <div class="section-heading">
          <div>
            <p class="eyebrow">AI Crowd Intelligence</p>
            <h2>Predicted Congestion</h2>
          </div>
          <span class="status-pill">${intelligence.explanation.confidence_score}% confidence</span>
        </div>
        <div class="prediction-list">
          ${intelligence.predicted_congestion.slice(0, 4).map(predictionCard).join("")}
        </div>
      </article>

      <article class="glass-card widget-card crowd-intel-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Root Cause Analysis</p>
            <h2>${intelligence.root_cause_analysis.affected_zone}</h2>
          </div>
          <span class="status-pill">Explainable</span>
        </div>
        <p class="root-cause">${intelligence.root_cause_analysis.why}</p>
        <ul class="evidence-list">
          ${intelligence.root_cause_analysis.contributing_factors.map((factor) => `<li>${factor}</li>`).join("")}
        </ul>
      </article>

      <article class="glass-card widget-card crowd-intel-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Safe Route Recommendations</p>
            <h2>Route Options</h2>
          </div>
          <span class="status-pill">Human review</span>
        </div>
        <div class="route-list">${intelligence.safe_route_recommendations.map(routeCard).join("")}</div>
      </article>

      <article class="glass-card widget-card crowd-intel-card data-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Gate Balancing</p>
            <h2>${intelligence.gate_balancing.strategy.replaceAll("_", " ")}</h2>
          </div>
        </div>
        ${compactTable({ columns: ["Gate", "Util.", "Queue", "Action"], rows: gateRows, keys: ["gate", "utilization", "queue", "action"] })}
      </article>

      <article class="glass-card widget-card crowd-intel-card data-panel">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Queue Prediction</p>
            <h2>15 Minute Forecast</h2>
          </div>
        </div>
        ${compactTable({ columns: ["Gate", "Wait", "Depth", "Why"], rows: queueRows, keys: ["gate", "wait", "depth", "why"] })}
      </article>

      <article class="glass-card widget-card crowd-intel-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Capacity Forecast</p>
            <h2>${intelligence.capacity_forecast.capacity_state}</h2>
          </div>
          <span class="status-pill">${intelligence.capacity_forecast.venue_risk_score}/100</span>
        </div>
        <div class="forecast-meter">
          <strong>${intelligence.capacity_forecast.estimated_remaining_capacity.toLocaleString()}</strong>
          <span>estimated remaining capacity</span>
        </div>
        <p>${intelligence.capacity_forecast.why}</p>
      </article>
    </section>
  `;
}
