import { transportModes } from "../config/transportIntelligence.js";

export function transportLoadingPanel() {
  return `
    <div class="transport-loading">
      <p>🧠 AURA is analyzing Metro, Parking, Ride Share, Bus, and Traffic data to generate predictions, map visualizations, and recommendations...</p>
    </div>
  `;
}

export function transportModeCards(inputs) {
  const stats = {
    metro: { value: `${inputs.metro?.current_platform_total ?? 0}`, label: "on platform", status: inputs.metro?.lines?.[0]?.status ?? "normal" },
    parking: { value: `${Math.round(((inputs.parking?.total_occupied ?? 0) / (inputs.parking?.total_capacity ?? 1)) * 100)}%`, label: "filled", status: inputs.parking?.lots?.[0]?.status ?? "normal" },
    rideshare: { value: `${inputs.rideshare?.total_queue ?? 0}`, label: "in queue", status: inputs.rideshare?.zones?.[0]?.status ?? "normal" },
    bus: { value: `${inputs.bus?.estimated_bus_demand_per_hour ?? 0}/h`, label: "demand", status: inputs.bus?.routes?.[0]?.status ?? "normal" },
    traffic: { value: `${Math.round(inputs.traffic?.corridors?.[0]?.congestion_level * 100 ?? 0)}%`, label: "peak congestion", status: inputs.traffic?.corridors?.[0]?.status ?? "normal" }
  };

  return `
    <div class="transport-modes-grid">
      ${transportModes.map((mode) => {
        const stat = stats[mode.id] || { value: "-", label: "", status: "normal" };
        return `
          <article class="transport-mode-card" style="--mode-color: ${mode.color}; --mode-glow: ${mode.color}22">
            <span class="transport-mode-icon">${mode.icon}</span>
            <h3>${mode.label}</h3>
            <div class="mode-stat">
              <b>${stat.value}</b>
              <span>${stat.label}</span>
            </div>
            <div style="margin-top: var(--space-3); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; color: var(--text-muted);">
              <span class="mode-status-dot status-${stat.status}"></span>
              <span>Status: ${stat.status.replaceAll("_", " ")}</span>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

export function transportMap(predictions) {
  const lots = predictions.parking_overflow.lots;
  const corridors = predictions.congestion.corridors;
  const zones = predictions.congestion.metro_congestion;

  const lotColors = {
    critical: "#ff5b76",
    near_full: "#ff8d5c",
    filling: "#ffca5f",
    open: "#55d58a"
  };

  const corridorColors = {
    severe: "#ff5b76",
    gridlock: "#ff5b76",
    heavy: "#ff8d5c",
    moderate: "#ffca5f",
    normal: "#55d58a"
  };

  return `
    <article class="glass-card widget-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Real-Time Spatial Intelligence</p>
          <h2>Interactive Transport & Traffic Map</h2>
        </div>
        <span class="status-pill">Live Predictive Map</span>
      </div>
      <div class="transport-map-container">
        <svg viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
          <!-- Outer highway loop -->
          <path d="M 50,50 L 750,50 L 750,450 L 50,450 Z" fill="none" stroke="${corridorColors[corridors[2]?.status] || "#6f8297"}" stroke-width="12" stroke-linejoin="round" opacity="0.8" />
          <text x="400" y="38" fill="#eef6ff" font-size="10" font-weight="bold" text-anchor="middle">NJ TURNPIKE</text>
          
          <!-- Route 3 Corridor -->
          <path d="M 50,250 L 750,250" fill="none" stroke="${corridorColors[corridors[0]?.status] || "#6f8297"}" stroke-width="10" opacity="0.8" />
          <text x="200" y="240" fill="#eef6ff" font-size="10" font-weight="bold">ROUTE 3 EASTBOUND</text>
          
          <!-- Berry's Creek local road -->
          <path d="M 250,50 L 250,450" fill="none" stroke="${corridorColors[corridors[4]?.status] || "#6f8297"}" stroke-width="6" stroke-dasharray="4 4" opacity="0.6" />
          <text x="260" y="100" fill="#9fb0c3" font-size="8" transform="rotate(90, 260, 100)">Berry's Creek Rd</text>
          
          <!-- Stadium Outer Boundary -->
          <circle cx="400" cy="250" r="120" fill="none" stroke="rgba(80, 227, 242, 0.2)" stroke-width="2" />
          <circle cx="400" cy="250" r="80" fill="rgba(80, 227, 242, 0.05)" stroke="rgba(80, 227, 242, 0.4)" stroke-width="4" />
          <text x="400" y="255" fill="#eef6ff" font-size="14" font-weight="bold" text-anchor="middle">METLIFE STADIUM</text>

          <!-- Parking Lots -->
          <!-- Lot A -->
          <rect x="290" y="100" width="60" height="40" rx="6" fill="${lotColors[lots[0]?.status] || "#6f8297"}" opacity="0.8" />
          <text x="320" y="125" fill="#05070b" font-size="10" font-weight="bold" text-anchor="middle">LOT A</text>
          
          <!-- Lot B -->
          <rect x="450" y="100" width="60" height="40" rx="6" fill="${lotColors[lots[1]?.status] || "#6f8297"}" opacity="0.8" />
          <text x="480" y="125" fill="#05070b" font-size="10" font-weight="bold" text-anchor="middle">LOT B</text>
          
          <!-- Lot C -->
          <rect x="470" y="320" width="60" height="40" rx="6" fill="${lotColors[lots[2]?.status] || "#6f8297"}" opacity="0.8" />
          <text x="500" y="345" fill="#05070b" font-size="10" font-weight="bold" text-anchor="middle">LOT C</text>
          
          <!-- Lot D -->
          <rect x="270" y="320" width="60" height="40" rx="6" fill="${lotColors[lots[3]?.status] || "#6f8297"}" opacity="0.8" />
          <text x="300" y="345" fill="#05070b" font-size="10" font-weight="bold" text-anchor="middle">LOT D</text>

          <!-- Metro Station -->
          <circle cx="580" cy="250" r="16" fill="#57a8ff" stroke="#eef6ff" stroke-width="2" />
          <text x="580" y="280" fill="#eef6ff" font-size="9" font-weight="bold" text-anchor="middle">MEADOWLANDS STATION</text>
          <text x="580" y="254" fill="#05070b" font-size="10" font-weight="bold" text-anchor="middle">🚇</text>

          <!-- Rideshare Zones -->
          <!-- East -->
          <rect x="530" y="180" width="22" height="22" rx="4" fill="#50e3f2" />
          <text x="541" y="195" fill="#05070b" font-size="11" font-weight="bold" text-anchor="middle">🚗</text>
          <text x="560" y="175" fill="#50e3f2" font-size="8">RS East</text>
          
          <!-- West -->
          <rect x="250" y="180" width="22" height="22" rx="4" fill="#50e3f2" />
          <text x="261" y="195" fill="#05070b" font-size="11" font-weight="bold" text-anchor="middle">🚗</text>
          <text x="240" y="175" fill="#50e3f2" font-size="8">RS West</text>

          <!-- Bus Staging -->
          <rect x="380" y="375" width="40" height="20" rx="4" fill="#55d58a" />
          <text x="400" y="389" fill="#05070b" font-size="10" font-weight="bold" text-anchor="middle">🚌 BUS</text>

        </svg>
      </div>
      <div class="map-legend">
        <div class="legend-item"><span class="legend-swatch" style="background: #55d58a"></span> <span>Open / Normal</span></div>
        <div class="legend-item"><span class="legend-swatch" style="background: #ffca5f"></span> <span>Filling / Moderate</span></div>
        <div class="legend-item"><span class="legend-swatch" style="background: #ff8d5c"></span> <span>Near Full / Heavy</span></div>
        <div class="legend-item"><span class="legend-swatch" style="background: #ff5b76"></span> <span>Critical / Severe Gridlock</span></div>
      </div>
    </article>
  `;
}

export function exitDemandPanel(exitDemand) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>🚪</span> Exit Demand Forecast</h3>
        <span class="status-pill">${exitDemand.total_expected_exits.toLocaleString()} predicted exits</span>
      </div>
      <p class="eyebrow" style="margin-bottom: var(--space-4)">Projected Egress Load by Gate at 30-Minute Horizon</p>
      <div class="exit-demand-bars">
        ${exitDemand.gates.map((g) => `
          <div class="exit-bar-row">
            <span class="exit-bar-label">${g.gate}</span>
            <div class="exit-bar-track" title="Egress pressure: ${g.pressure_score}%">
              <div class="exit-bar-fill status-${g.status}" style="width: ${clamp(g.pressure_score, 10, 100)}%"></div>
            </div>
            <span class="exit-bar-value">${g.demand_30min} (${g.pressure_score}%)</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

export function congestionPanel(congestion) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>🚦</span> Traffic & Transit Congestion</h3>
        <span class="status-pill">Overall: ${congestion.overall_congestion_score}%</span>
      </div>
      <p class="eyebrow" style="margin-bottom: var(--space-4)">Live Road Corridors & Platform Crowds</p>
      <div class="congestion-corridors">
        ${congestion.corridors.slice(0, 3).map((c) => `
          <div class="corridor-card">
            <span class="corridor-name">${c.name}</span>
            <span class="corridor-speed">${c.current_speed_kph} kph (limit ${c.free_flow_speed_kph})</span>
            <div class="corridor-congestion-badge level-${c.status}">
              <span>${c.congestion_percent}%</span>
              <span class="trend-arrow trend-${c.trend}">${c.trend === "worsening" ? "▲" : c.trend === "easing" ? "▼" : "▶"}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

export function travelTimePanel(travelTime) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>⏱️</span> Destination Travel Times</h3>
        <span class="status-pill">Real-Time Estimations</span>
      </div>
      <table class="travel-time-table">
        <thead>
          <tr>
            <th>Destination</th>
            <th>Distance</th>
            <th>Metro</th>
            <th>Drive</th>
            <th>Rideshare</th>
            <th>Recommended</th>
          </tr>
        </thead>
        <tbody>
          ${travelTime.destinations.map((d) => {
            const metro = d.modes.find((m) => m.mode === "Metro")?.estimated_minutes ?? "-";
            const drive = d.modes.find((m) => m.mode === "Drive")?.estimated_minutes ?? "-";
            const rideshare = d.modes.find((m) => m.mode === "Rideshare")?.estimated_minutes ?? "-";
            return `
              <tr>
                <td><strong>${d.destination}</strong></td>
                <td>${d.distance_km} km</td>
                <td class="${d.recommended_mode === "Metro" ? "recommended" : ""}">${metro}m</td>
                <td class="${d.recommended_mode === "Drive" ? "recommended" : ""}">${drive}m</td>
                <td>${rideshare}m</td>
                <td class="recommended">${d.recommended_mode}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function parkingOverflowPanel(parking) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>🅿️</span> Parking Occupancy & Overflow</h3>
        <span class="status-pill">${parking.overall_fill_percent}% overall fill</span>
      </div>
      <div class="parking-gauges">
        ${parking.lots.slice(0, 3).map((lot) => {
          const circumference = 2 * Math.PI * 36;
          const strokeOffset = circumference - (lot.fill_percent / 100) * circumference;
          const colors = { critical: "#ff5b76", near_full: "#ff8d5c", filling: "#ffca5f", open: "#55d58a" };
          const color = colors[lot.status] || "#6f8297";
          return `
            <div class="parking-gauge-card">
              <h4>${lot.name}</h4>
              <div class="parking-fill-ring">
                <svg viewBox="0 0 80 80">
                  <circle class="parking-ring-track" cx="40" cy="40" r="36" />
                  <circle class="parking-ring-fill" cx="40" cy="40" r="36" stroke="${color}" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeOffset}" />
                </svg>
                <span class="parking-fill-label" style="color: ${color}">${lot.fill_percent}%</span>
              </div>
              <div class="lot-meta">
                <span>${lot.occupied}/${lot.total_spaces} spaces</span>
                ${lot.redirect_to ? `<span class="lot-redirect">Redirect to ${lot.redirect_to}</span>` : ""}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

export function busDemandPanel(busDemand) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>🚌</span> Bus & Shuttle Demand</h3>
        <span class="status-pill gap-status-${busDemand.gap_status}">Gap: ${busDemand.demand_gap}/h</span>
      </div>
      <div class="bus-demand-list">
        ${busDemand.routes.slice(0, 3).map((r) => {
          const capacityPct = Math.min(100, Math.round((r.capacity_per_hour / Math.max(r.demand_per_hour, 1)) * 100));
          const demandPct = Math.min(100, Math.round((r.demand_gap / Math.max(r.demand_per_hour, 1)) * 100));
          return `
            <div class="bus-route-row">
              <div class="bus-route-header">
                <strong>${r.name} to ${r.destination}</strong>
                <span class="bus-freq-change change-${r.frequency_change}">
                  ${r.frequency_change === "increase" ? `▲ Boost Freq (${r.suggested_frequency_minutes}m)` : "Maintain"}
                </span>
              </div>
              <div class="bus-capacity-bar" title="Demand: ${r.demand_per_hour}/h vs Capacity: ${r.capacity_per_hour}/h">
                <div class="bus-capacity-fill" style="width: ${capacityPct}%"></div>
                ${r.demand_gap > 0 ? `<div class="bus-demand-fill" style="width: ${demandPct}%"></div>` : ""}
              </div>
              <div class="bus-route-meta">
                <span>Capacity: ${r.capacity_per_hour}/h</span>
                <span>Demand: ${r.demand_per_hour}/h</span>
                ${r.demand_gap > 0 ? `<span style="color: var(--orange)">Deficit: ${r.demand_gap}/h</span>` : `<span>Healthy</span>`}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

export function recommendationsPanel(recommendations) {
  return `
    <article class="glass-card widget-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AI Decision Support</p>
          <h2>Targeted Egress & Traffic Recommendations</h2>
        </div>
        <span class="status-pill">${recommendations.length} Recommendations</span>
      </div>
      <div class="transport-rec-list">
        ${recommendations.map((rec) => `
          <div class="transport-rec-card">
            <div class="rec-header">
              <h4>${rec.title}</h4>
              <span class="urgency-badge urgency-${rec.urgency}">${rec.urgency.replaceAll("_", " ")}</span>
            </div>
            <p class="rec-action">${rec.action}</p>
            <div class="rec-meta">
              <span>👤 Assignee: <strong>${rec.assignee}</strong></span>
              <span>🎯 Impact: <strong>${rec.expected_impact}</strong></span>
            </div>
            <div class="rec-evidence" style="margin-top: var(--space-3)">
              <details>
                <summary>Evidence Base</summary>
                <ul>
                  ${rec.evidence.map((ev) => `<li>${ev}</li>`).join("")}
                </ul>
              </details>
            </div>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

export function reasoningPanel(reasoning) {
  return `
    <article class="glass-card widget-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Explainable Artificial Intelligence</p>
          <h2>AURA Transport Reasoning Chain</h2>
        </div>
        <span class="status-pill">Confidence: ${reasoning.confidence_score}%</span>
      </div>
      <div class="reasoning-chain">
        <div class="reasoning-section section-observe">
          <h4><span>👁️</span> Observe (Data Quality & Live Inputs)</h4>
          <ul>
            ${reasoning.observations.map((obs) => `<li>${obs}</li>`).join("")}
          </ul>
          <div class="data-quality-grid">
            ${Object.entries(reasoning.data_quality).map(([source, status]) => `
              <span class="data-quality-tag">
                <span class="dq-dot dq-${status}"></span>
                <span>${source.toUpperCase()}: ${status}</span>
              </span>
            `).join("")}
          </div>
        </div>

        <div class="reasoning-section section-infer">
          <h4><span>🧠</span> Infer (Predictions & Cascading Impacts)</h4>
          <ul>
            ${reasoning.inferences.map((inf) => `<li>${inf}</li>`).join("")}
          </ul>
        </div>

        <div class="reasoning-section section-recommend">
          <h4><span>✅</span> Recommend (Rationale for Action)</h4>
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

export function transportCommanderPanel(state) {
  if (state.status === "loading") {
    return transportLoadingPanel();
  }

  const data = state.analysis;
  if (!data) return transportLoadingPanel();

  return `
    ${transportModeCards(state.inputs)}
    
    ${transportMap(data.predictions)}

    <div class="predictions-grid">
      ${exitDemandPanel(data.predictions.exit_demand)}
      ${congestionPanel(data.predictions.congestion)}
      ${travelTimePanel(data.predictions.travel_time)}
      ${parkingOverflowPanel(data.predictions.parking_overflow)}
      ${busDemandPanel(data.predictions.bus_demand)}
    </div>

    ${recommendationsPanel(data.recommendations)}

    ${reasoningPanel(data.reasoning)}
  `;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
