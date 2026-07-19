/* ============================================================
   Sustainability Intelligence — UI Dashboard Components
   ============================================================ */

export function sustainabilityLoadingPanel() {
  return `
    <div class="transport-loading">
      <p>🌱 AURA is evaluating solar arrays, grid consumption indexes, water flows, and smart bin fill rates...</p>
    </div>
  `;
}

export function sustainabilityModeCards(inputs) {
  const bins = inputs.waste_bins || [];
  const avgFill = Math.round(bins.reduce((s, b) => s + b.fill_pct, 0) / bins.length);
  const totalWater = inputs.water_flow?.reduce((s, w) => s + w.daily_gallons, 0) || 0;

  return `
    <div class="transport-modes-grid">
      <article class="transport-mode-card" style="--mode-color: #55d58a; --mode-glow: #55d58a22">
        <span class="transport-mode-icon">🗑️</span>
        <h3>Smart Bins</h3>
        <div class="mode-stat">
          <b>${avgFill}%</b>
          <span>avg fill index</span>
        </div>
      </article>

      <article class="transport-mode-card" style="--mode-color: #ffca5f; --mode-glow: #ffca5f22">
        <span class="transport-mode-icon">🧹</span>
        <h3>Janitorial Teams</h3>
        <div class="mode-stat">
          <b>${bins.filter(b => b.fill_pct > 80).length}</b>
          <span>active dispatches</span>
        </div>
      </article>

      <article class="transport-mode-card" style="--mode-color: #57a8ff; --mode-glow: #57a8ff22">
        <span class="transport-mode-icon">🚰</span>
        <h3>Water Flow</h3>
        <div class="mode-stat">
          <b>${(totalWater / 1000).toFixed(1)}k</b>
          <span>daily gallons</span>
        </div>
      </article>

      <article class="transport-mode-card" style="--mode-color: #a98bff; --mode-glow: #a98bff22">
        <span class="transport-mode-icon">⚡</span>
        <h3>Solar Energy</h3>
        <div class="mode-stat">
          <b>${inputs.energy_grid?.solar_generation_kw ?? 0} kW</b>
          <span>live output</span>
        </div>
      </article>

      <article class="transport-mode-card" style="--mode-color: #50e3f2; --mode-glow: #50e3f222">
        <span class="transport-mode-icon">🌱</span>
        <h3>Offset Total</h3>
        <div class="mode-stat">
          <b>${((inputs.carbon_offsets?.daily_offset_kg_co2 ?? 0) / 1000).toFixed(1)}t</b>
          <span>carbon saved</span>
        </div>
      </article>
    </div>
  `;
}

export function sustainabilityMap(predictions) {
  const bins = predictions.waste_prediction;
  
  const binColors = (fill) => {
    if (fill >= 90) return "#ff5b76";
    if (fill >= 75) return "#ff8d5c";
    return "#55d58a";
  };

  return `
    <article class="glass-card widget-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Green Venue Spatial Layout</p>
          <h2>Interactive Sustainability & Resource Map</h2>
        </div>
        <span class="status-pill">Active Sensors</span>
      </div>
      <div class="sustainability-map-container">
        <svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
          <!-- Stadium Perimeter -->
          <circle cx="400" cy="225" r="140" fill="none" stroke="rgba(85, 213, 138, 0.15)" stroke-width="2" />
          <circle cx="400" cy="225" r="100" fill="rgba(85, 213, 138, 0.03)" stroke="rgba(85, 213, 138, 0.3)" stroke-width="3" />
          <text x="400" y="230" fill="#eef6ff" font-size="12" font-weight="bold" text-anchor="middle">MetLife Bowl</text>

          <!-- Waste Bins -->
          <!-- North -->
          <circle cx="400" cy="90" r="14" fill="${binColors(bins[0]?.current_fill_percent)}" stroke="#05080c" stroke-width="2" />
          <text x="400" y="94" fill="#05080c" font-size="10" font-weight="bold" text-anchor="middle">🗑️</text>
          <text x="400" y="66" fill="#eef6ff" font-size="9" text-anchor="middle">North Bin (${bins[0]?.current_fill_percent}%)</text>

          <!-- South -->
          <circle cx="400" cy="360" r="14" fill="${binColors(bins[2]?.current_fill_percent)}" stroke="#05080c" stroke-width="2" />
          <text x="400" y="364" fill="#05080c" font-size="10" font-weight="bold" text-anchor="middle">🗑️</text>
          <text x="400" y="390" fill="#eef6ff" font-size="9" text-anchor="middle">South Bin (${bins[2]?.current_fill_percent}%)</text>

          <!-- East -->
          <circle cx="580" cy="225" r="14" fill="${binColors(bins[1]?.current_fill_percent)}" stroke="#05080c" stroke-width="2" />
          <text x="580" y="229" fill="#05080c" font-size="10" font-weight="bold" text-anchor="middle">🗑️</text>
          <text x="635" y="229" fill="#eef6ff" font-size="9">East Bin (${bins[1]?.current_fill_percent}%)</text>

          <!-- West -->
          <circle cx="220" cy="225" r="14" fill="${binColors(bins[3]?.current_fill_percent)}" stroke="#05080c" stroke-width="2" />
          <text x="220" y="229" fill="#05080c" font-size="10" font-weight="bold" text-anchor="middle">🗑️</text>
          <text x="160" y="229" fill="#eef6ff" font-size="9">West Bin (${bins[3]?.current_fill_percent}%)</text>

          <!-- Solar Array (Roof Section) -->
          <path d="M 320,180 L 480,180 L 450,210 L 350,210 Z" fill="#a98bff" opacity="0.4" stroke="#a98bff" stroke-width="1" />
          <text x="400" y="200" fill="#eef6ff" font-size="8" text-anchor="middle">Solar Array</text>
        </svg>
      </div>
      <div class="map-legend">
        <div class="legend-item"><span class="legend-swatch" style="background: #55d58a"></span> <span>Bin Fill Standard (&lt;75%)</span></div>
        <div class="legend-item"><span class="legend-swatch" style="background: #ff8d5c"></span> <span>Bin Near Limit (75%-89%)</span></div>
        <div class="legend-item"><span class="legend-swatch" style="background: #ff5b76"></span> <span>Bin Full (&gt;90% / Contaminated)</span></div>
        <div class="legend-item"><span class="legend-swatch" style="background: #a98bff"></span> <span>Solar Photovoltaic Grid</span></div>
      </div>
    </article>
  `;
}

export function smartBinsPanel(bins) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>🗑️</span> Smart Bin Levels & Contamination</h3>
      </div>
      <div class="smart-bin-bars">
        ${bins.map((b) => `
          <div class="smart-bin-row">
            <span class="exit-bar-label" style="font-size: 0.78rem">${b.location}</span>
            <div class="smart-bin-track">
              <div class="smart-bin-fill priority-${b.cleaning_priority}" style="width: ${b.current_fill_percent}%"></div>
            </div>
            <span class="exit-bar-value" style="font-size: 0.78rem; display: flex; gap: var(--space-2)">
              <span>${b.current_fill_percent}% fill</span>
              ${b.contamination_warning ? `<span style="color: var(--red); font-weight: bold">⚠️ CONTAM (${b.contamination_percent}%)</span>` : ""}
            </span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

export function energyPerformancePanel(energy) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>⚡</span> Energy Consumption & Storage</h3>
        <span class="status-pill">Solar: ${energy.solar_generation_kw} kW</span>
      </div>
      <div class="green-solar-grid">
        <div class="green-battery-card">
          <h4 style="font-size: 0.8rem; margin:0">Tesla Powerpack Charge</h4>
          <div class="battery-display-bar">
            <div class="battery-charge-fill" style="width: ${energy.battery_bank_pct}%"></div>
            <span class="battery-charge-label">${energy.battery_bank_pct}%</span>
          </div>
          <div style="font-size: 0.7rem; color: var(--text-muted)">
            Solar Yield offset: ${energy.solar_share_pct}% of total stadium load.
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap: var(--space-2); justify-content:center">
          <div style="display:flex; justify-content:space-between; font-size: 0.8rem">
            <span>Grid Power consumption:</span>
            <strong>${energy.total_grid_consumption_kw} kW</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size: 0.8rem">
            <span>HVAC Climate control:</span>
            <strong>${energy.hvac_load_pct}% load</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size: 0.8rem">
            <span>Stadium lighting array:</span>
            <strong>${energy.lighting_load_pct}% load</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function carbonFootprintPanel(carbon) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>🌱</span> Carbon Footprint offsets</h3>
        <span class="status-pill">${carbon.performance_pct}% of goal</span>
      </div>
      <div style="display: flex; gap: var(--space-4); align-items:center; margin-bottom: var(--space-3)">
        <div style="font-size: 2.2rem; font-weight:800; color:var(--cyan)">
          ${(carbon.daily_offset_kg_co2 / 1000).toFixed(1)}t
        </div>
        <div style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.4">
          Carbon Dioxide emissions mitigated today. Target: ${(carbon.daily_offset_goal_kg_co2 / 1000).toFixed(1)}t.<br/>
          Status: <strong style="color:var(--green)">${carbon.offset_status.toUpperCase()}</strong>
        </div>
      </div>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-2); border-top:1px solid var(--stroke); padding-top: var(--space-3)">
        <div style="font-size:0.75rem">Solar PV Offsets: <strong style="color:var(--cyan)">${(carbon.solar_offset_co2 / 1000).toFixed(1)}t CO2</strong></div>
        <div style="font-size:0.75rem">Recycling Offsets: <strong style="color:var(--green)">${(carbon.recycling_offset_co2 / 1000).toFixed(1)}t CO2</strong></div>
      </div>
    </div>
  `;
}

export function waterConservationPanel(water) {
  return `
    <div class="prediction-panel">
      <div class="prediction-panel-header">
        <h3><span>🚰</span> Water Usage & Leak Detection</h3>
      </div>
      <table class="travel-time-table">
        <thead>
          <tr>
            <th>Line Sensor</th>
            <th>Flow Rate</th>
            <th>Consumption</th>
            <th>Pressure</th>
            <th>Leak Risk</th>
          </tr>
        </thead>
        <tbody>
          ${water.map((w) => `
            <tr>
              <td><strong>${w.sensor_id}</strong></td>
              <td>${w.flow_rate_gpm} GPM</td>
              <td>${(w.daily_gallons_total / 1000).toFixed(1)}k gal</td>
              <td>${w.pressure_psi} PSI</td>
              <td style="color: ${w.leak_hazard ? "var(--red)" : "var(--green)"}; font-weight: 700;">
                ${w.leak_hazard ? `LEAK WARNING (${w.leak_probability}%)` : "HEALHY"}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function sustainabilityCommanderPanel(state) {
  if (state.status === "loading") {
    return sustainabilityLoadingPanel();
  }

  const data = state.analysis;
  if (!data) return sustainabilityLoadingPanel();

  return `
    ${sustainabilityModeCards(state.inputs)}
    
    ${sustainabilityMap(data.predictions)}

    <div class="predictions-grid">
      ${smartBinsPanel(data.predictions.waste_prediction)}
      ${energyPerformancePanel(data.predictions.energy_performance)}
      ${carbonFootprintPanel(data.predictions.carbon_offsets)}
      ${waterConservationPanel(data.predictions.water_flows)}
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
          <h2>Green Venue Recommendations</h2>
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
              <span>🌱 Eco Focus: <strong>${rec.category.toUpperCase()}</strong></span>
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
          <p class="eyebrow">Eco Auditor Logs</p>
          <h2>AURA Sustainability Reasoning Logs</h2>
        </div>
        <span class="status-pill">Confidence: ${reasoning.confidence_score}%</span>
      </div>
      <div class="reasoning-chain">
        <div class="reasoning-section section-observe">
          <h4><span>👁️</span> Observe (Eco Sensors Telemetry Logs)</h4>
          <ul>
            ${reasoning.observations.map((obs) => `<li>${obs}</li>`).join("")}
          </ul>
        </div>

        <div class="reasoning-section section-infer">
          <h4><span>🧠</span> Infer (Resource Impact Estimation Models)</h4>
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
