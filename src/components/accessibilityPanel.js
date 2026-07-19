/* ============================================================
   Accessibility Intelligence — UI Dashboard Components
   ============================================================ */

export function accessibilityLoadingPanel() {
  return `
    <div class="transport-loading">
      <p>♿ AURA is collecting accessibility sensor logs, elevator status reports, and caption accuracy metrics...</p>
    </div>
  `;
}

export function accessibilityModeCards(inputs) {
  return `
    <div class="transport-modes-grid">
      <article class="transport-mode-card" style="--mode-color: #57a8ff; --mode-glow: #57a8ff22">
        <span class="transport-mode-icon">♿</span>
        <h3>Wheelchair</h3>
        <div class="mode-stat">
          <b>${inputs.wheelchair_queues?.[1]?.wait_minutes ?? 0}m</b>
          <span>max wait time</span>
        </div>
      </article>

      <article class="transport-mode-card" style="--mode-color: #a98bff; --mode-glow: #a98bff22">
        <span class="transport-mode-icon">🗣️</span>
        <h3>Voice Assistant</h3>
        <div class="mode-stat">
          <b>${inputs.voice_assistant?.active_sessions ?? 0}</b>
          <span>active sessions</span>
        </div>
      </article>

      <article class="transport-mode-card" style="--mode-color: #55d58a; --mode-glow: #55d58a22">
        <span class="transport-mode-icon">💬</span>
        <h3>Live Captions</h3>
        <div class="mode-stat">
          <b>${Math.round((inputs.live_captioning?.accuracy_rate ?? 0) * 100)}%</b>
          <span>accuracy rate</span>
        </div>
      </article>

      <article class="transport-mode-card" style="--mode-color: #50e3f2; --mode-glow: #50e3f222">
        <span class="transport-mode-icon">🤫</span>
        <h3>Sensory Rooms</h3>
        <div class="mode-stat">
          <b>${inputs.quiet_lounges?.[0]?.current_occupancy ?? 0}</b>
          <span>current guests</span>
        </div>
      </article>

      <article class="transport-mode-card" style="--mode-color: #ff8d5c; --mode-glow: #ff8d5c22">
        <span class="transport-mode-icon">🛗</span>
        <h3>Elevators</h3>
        <div class="mode-stat">
          <b>${inputs.elevators?.filter(e => e.status === "operational")?.length ?? 0}/${inputs.elevators?.length ?? 0}</b>
          <span>operational</span>
        </div>
      </article>
    </div>
  `;
}

export function accessibilityMap(predictions) {
  const elevators = predictions.elevator_monitoring;
  
  const statusColors = {
    operational: "#55d58a",
    degraded: "#ffca5f",
    offline: "#ff5b76"
  };

  return `
    <article class="glass-card widget-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Accessibility Spatial Status</p>
          <h2>Interactive Accessibility Map</h2>
        </div>
        <span class="status-pill">Interactive Sensors</span>
      </div>
      <div class="accessibility-map-container">
        <svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
          <!-- Stadium Perimeter -->
          <circle cx="400" cy="225" r="140" fill="none" stroke="rgba(87, 168, 255, 0.15)" stroke-width="2" />
          <circle cx="400" cy="225" r="100" fill="rgba(87, 168, 255, 0.03)" stroke="rgba(87, 168, 255, 0.3)" stroke-width="3" />
          <text x="400" y="230" fill="#eef6ff" font-size="12" font-weight="bold" text-anchor="middle">MetLife Bowl</text>

          <!-- North Gate Elevators -->
          <circle cx="400" cy="90" r="18" fill="${statusColors[elevators[0]?.status] || "#6f8297"}" stroke="#05080c" stroke-width="2" />
          <text x="400" y="94" fill="#05080c" font-size="11" font-weight="bold" text-anchor="middle">🛗</text>
          <text x="400" y="66" fill="#eef6ff" font-size="9" text-anchor="middle">North Elevators</text>

          <!-- South Gate Elevator -->
          <circle cx="400" cy="360" r="18" fill="${statusColors[elevators[2]?.status] || "#6f8297"}" stroke="#05080c" stroke-width="2" />
          <text x="400" y="364" fill="#05080c" font-size="11" font-weight="bold" text-anchor="middle">🛗</text>
          <text x="400" y="394" fill="#eef6ff" font-size="9" text-anchor="middle">South Elevator</text>

          <!-- East Gate Elevator -->
          <circle cx="580" cy="225" r="18" fill="${statusColors[elevators[3]?.status] || "#6f8297"}" stroke="#05080c" stroke-width="2" />
          <text x="580" y="229" fill="#05080c" font-size="11" font-weight="bold" text-anchor="middle">🛗</text>
          <text x="635" y="229" fill="#eef6ff" font-size="9">East Elevator</text>

          <!-- Sensory Rooms -->
          <!-- East Sensory Room -->
          <rect x="520" y="110" width="30" height="30" rx="4" fill="#50e3f2" />
          <text x="535" y="129" fill="#05080c" font-size="12" text-anchor="middle">🤫</text>
          <text x="535" y="152" fill="#9fb0c3" font-size="8" text-anchor="middle">East Lounge</text>

          <!-- West Sensory Room -->
          <rect x="250" y="110" width="30" height="30" rx="4" fill="#50e3f2" />
          <text x="265" y="129" fill="#05080c" font-size="12" text-anchor="middle">🤫</text>
          <text x="265" y="152" fill="#9fb0c3" font-size="8" text-anchor="middle">West Lounge</text>

          <!-- Wheelchair Shuttle pick up points -->
          <rect x="220" y="210" width="40" height="20" rx="4" fill="#57a8ff" />
          <text x="240" y="223" fill="#05080c" font-size="9" font-weight="bold" text-anchor="middle">♿ Gate A</text>
        </svg>
      </div>
      <div class="map-legend">
        <div class="legend-item"><span class="legend-swatch" style="background: #55d58a"></span> <span>Fully Operational</span></div>
        <div class="legend-item"><span class="legend-swatch" style="background: #ffca5f"></span> <span>Degraded Mode</span></div>
        <div class="legend-item"><span class="legend-swatch" style="background: #ff5b76"></span> <span>Offline / Out of Service</span></div>
        <div class="legend-item"><span class="legend-swatch" style="background: #50e3f2"></span> <span>Quiet Lounge Sensory Room</span></div>
      </div>
    </article>
  `;
}

export function wheelchairPanel(routes) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>♿</span> Wheelchair Transit Times</h3>
        <span class="status-pill">Egress Routing</span>
      </div>
      <div class="exit-demand-bars">
        ${routes.map((r) => `
          <div class="exit-bar-row">
            <span class="exit-bar-label" style="font-size: 0.78rem">${r.zone}</span>
            <div class="exit-bar-track">
              <div class="exit-bar-fill status-${r.wait_time_status === "severe" ? "critical" : r.wait_time_status === "elevated" ? "high" : "normal"}" style="width: ${clamp(r.estimated_transit_minutes * 3.5, 15, 100)}%"></div>
            </div>
            <span class="exit-bar-value" style="font-size: 0.78rem">${r.estimated_transit_minutes} min (${r.wait_time_status})</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

export function elevatorPanel(elevators) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>🛗</span> Elevator Health & Cycle Strain</h3>
      </div>
      <div class="access-elevators-list">
        ${elevators.map((e) => {
          const circumference = 2 * Math.PI * 20;
          const strokeOffset = circumference - (e.mechanical_strain / 100) * circumference;
          const colors = { operational: "#55d58a", degraded: "#ff8d5c", offline: "#ff5b76" };
          const color = colors[e.status] || "#6f8297";
          return `
            <div class="access-elevator-card">
              <h4 style="font-size: 0.8rem; margin: 0 0 var(--space-2)">${e.name}</h4>
              <div class="elevator-status-ring">
                <svg viewBox="0 0 46 46">
                  <circle class="elevator-ring-track" cx="23" cy="23" r="20" />
                  <circle class="elevator-ring-fill" cx="23" cy="23" r="20" stroke="${color}" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeOffset}" />
                </svg>
                <span class="elevator-ring-label" style="color: ${color}; font-size: 0.8rem">${e.mechanical_strain}%</span>
              </div>
              <div class="elevator-status-text status-${e.status}">
                ${e.status}
              </div>
              <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: var(--space-2)">
                Wait: ${e.current_wait_sec}s · Cycles: ${e.mechanical_strain * 4}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

export function quietSensoryPanel(lounges) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>🤫</span> Sensory Quiet Rooms</h3>
      </div>
      <table class="travel-time-table">
        <thead>
          <tr>
            <th>Lounge Name</th>
            <th>Occupancy</th>
            <th>Noise Level</th>
            <th>Sensory Risk</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${lounges.map((l) => `
            <tr>
              <td><strong>${l.lounge_name}</strong></td>
              <td>${l.occupancy_percent}%</td>
              <td>${l.noise_level_db} dB</td>
              <td style="color: ${l.sensory_risk === "high" ? "var(--red)" : l.sensory_risk === "moderate" ? "var(--orange)" : "var(--green)"}; font-weight: 700;">
                ${l.sensory_risk.toUpperCase()}
              </td>
              <td>${l.suggested_redirect ? `<span style="color: var(--amber)">${l.suggested_redirect}</span>` : `<span style="color: var(--green)">Room Stable</span>`}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function captioningPanel(captioning, voice) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>💬</span> Captioning & Voice Navigation</h3>
      </div>
      <div style="display: grid; gap: var(--space-3)">
        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom: var(--space-1)">
            <strong>Live Captioning Accuracy</strong>
            <span>${captioning.accuracy_percent}%</span>
          </div>
          <div class="captioning-bar-track">
            <div class="captioning-bar-fill" style="width: ${captioning.accuracy_percent}%"></div>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top:var(--space-2)">
            System Latency: ${captioning.latency_seconds}s · Rating: <strong style="color:var(--green)">${captioning.operational_rating.toUpperCase()}</strong>
          </div>
        </div>

        <div style="margin-top: var(--space-2); border-top: 1px solid var(--stroke); padding-top: var(--space-3)">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom: var(--space-1)">
            <strong>Voice UI Intent Recognition</strong>
            <span>${voice.success_rate_percent}%</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">
            Active Sessions: ${voice.active_users} · Latency: ${voice.system_load_pct * 1.5}ms · Top query: <strong>${voice.top_intent.replaceAll("_", " ")}</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function accessibilityCommanderPanel(state) {
  if (state.status === "loading") {
    return accessibilityLoadingPanel();
  }

  const data = state.analysis;
  if (!data) return accessibilityLoadingPanel();

  return `
    ${accessibilityModeCards(state.inputs)}
    
    ${accessibilityMap(data.predictions)}

    <div class="predictions-grid">
      ${wheelchairPanel(data.predictions.wheelchair_routing)}
      ${elevatorPanel(data.predictions.elevator_monitoring)}
      ${quietSensoryPanel(data.predictions.quiet_routes)}
      ${captioningPanel(data.predictions.captioning, data.predictions.voice_navigation)}
    </div>

    ${recommendationsPanel(data.recommendations)}

    ${reasoningPanel(data.reasoning)}
  `;
}

function recommendationsPanel(recs) {
  return `
    <article class="glass-card widget-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AI Decision Support</p>
          <h2>Prioritized Accessibility Actions</h2>
        </div>
        <span class="status-pill">${recs.length} Actions</span>
      </div>
      <div class="transport-rec-list">
        ${recs.map((rec) => `
          <div class="transport-rec-card">
            <div class="rec-header">
              <h4>${rec.title}</h4>
              <span class="urgency-badge urgency-${rec.urgency}">${rec.urgency.replaceAll("_", " ")}</span>
            </div>
            <p class="rec-action">${rec.action}</p>
            <div class="rec-meta">
              <span>👤 Assignee: <strong>${rec.assignee}</strong></span>
              <span>♿ Focus: <strong>${rec.category.toUpperCase()}</strong></span>
            </div>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function reasoningPanel(reasoning) {
  return `
    <article class="glass-card widget-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AI Auditor Logs</p>
          <h2>AURA Accessibility Reasoning Logs</h2>
        </div>
        <span class="status-pill">Confidence: ${reasoning.confidence_score}%</span>
      </div>
      <div class="reasoning-chain">
        <div class="reasoning-section section-observe">
          <h4><span>👁️</span> Observe (Connected Telemetry Logs)</h4>
          <ul>
            ${reasoning.observations.map((obs) => `<li>${obs}</li>`).join("")}
          </ul>
        </div>

        <div class="reasoning-section section-infer">
          <h4><span>🧠</span> Infer (Predictive Friction Models)</h4>
          <ul>
            ${reasoning.inferences.map((inf) => `<li>${inf}</li>`).join("")}
          </ul>
        </div>

        <div class="reasoning-section section-recommend">
          <h4><span>✅</span> Recommended Rationale</h4>
          <ul>
            ${reasoning.recommendation_rationale.map((rat) => `
              <li><strong>${rat.recommendation}:</strong> ${rat.why}</li>
            `).join("")}
          </ul>
        </div>
      </div>
    </article>
  `;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
