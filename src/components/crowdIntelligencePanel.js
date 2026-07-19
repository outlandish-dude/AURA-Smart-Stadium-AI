import { whatIfScenarios, mockSafeRoutes } from "../config/crowdIntelligenceRedesign.js";

/* ============================================================
   Reusable Primitives
   ============================================================ */

function riskBadge(level) {
  const map = {
    critical: { label: "CRITICAL", cls: "risk-critical" },
    high:     { label: "HIGH",     cls: "risk-high" },
    moderate: { label: "MODERATE", cls: "risk-moderate" },
    normal:   { label: "NORMAL",   cls: "risk-normal" }
  };
  const r = map[level] || map["normal"];
  return `<span class="ci-risk-badge ${r.cls}">${r.label}</span>`;
}

function occupancyBar(pct, color = "cyan") {
  const w = Math.min(100, Math.max(0, pct));
  const cls = pct >= 90 ? "bar-critical" : pct >= 75 ? "bar-high" : pct >= 50 ? "bar-moderate" : "bar-normal";
  return `
    <div class="ci-occ-bar">
      <div class="ci-occ-fill ${cls}" style="width:${w}%"></div>
    </div>`;
}

function severityIcon(s) {
  if (s === "critical") return "🔴";
  if (s === "high") return "🟠";
  if (s === "medium") return "🟡";
  if (s === "low") return "🟢";
  return "🔵";
}

/* ============================================================
   1. Topbar KPI Strip
   ============================================================ */
function crowdKpiStrip(predictions) {
  const total = predictions.reduce((s, p) => s + p.current_occupancy, 0);
  const totalCap = predictions.reduce((s, p) => s + p.capacity, 0);
  const critical = predictions.filter(p => p.risk_level === "critical").length;
  const avgConf = Math.round(predictions.reduce((s, p) => s + p.confidence_score, 0) / predictions.length);
  const bottlenecks = predictions.filter(p => p.fill_percent >= 78).length;

  return `
    <div class="ci-kpi-strip">
      <div class="ci-kpi-card">
        <span class="ci-kpi-label">Total Occupancy</span>
        <strong class="ci-kpi-value">${(total / 1000).toFixed(1)}<span class="ci-kpi-unit">k</span></strong>
        <span class="ci-kpi-sub">of ${(totalCap / 1000).toFixed(0)}k capacity</span>
      </div>
      <div class="ci-kpi-card ${critical > 0 ? "kpi-alert" : ""}">
        <span class="ci-kpi-label">Critical Zones</span>
        <strong class="ci-kpi-value" style="color:${critical > 0 ? "var(--red)" : "var(--green)"}">${critical}</strong>
        <span class="ci-kpi-sub">zones above 90% capacity</span>
      </div>
      <div class="ci-kpi-card ${bottlenecks > 0 ? "kpi-warn" : ""}">
        <span class="ci-kpi-label">Bottlenecks</span>
        <strong class="ci-kpi-value" style="color:${bottlenecks > 0 ? "var(--orange)" : "var(--green)"}">${bottlenecks}</strong>
        <span class="ci-kpi-sub">active friction points</span>
      </div>
      <div class="ci-kpi-card">
        <span class="ci-kpi-label">AI Confidence</span>
        <strong class="ci-kpi-value" style="color:var(--cyan)">${avgConf}<span class="ci-kpi-unit">%</span></strong>
        <span class="ci-kpi-sub">prediction accuracy</span>
      </div>
      <div class="ci-kpi-card">
        <span class="ci-kpi-label">Active Routes</span>
        <strong class="ci-kpi-value" style="color:var(--green)">${mockSafeRoutes.length}</strong>
        <span class="ci-kpi-sub">safe route alternatives</span>
      </div>
    </div>`;
}

/* ============================================================
   2. Interactive Heatmap SVG
   ============================================================ */
function colorClass(pct) {
  if (pct >= 90) return "fill-critical";
  if (pct >= 75) return "fill-high";
  if (pct >= 50) return "fill-moderate";
  return "fill-normal";
}

export function crowdHeatmapWidget(predictions, selectedZone) {
  const g = (id) => predictions.find(p => p.zone_id === id) || { fill_percent: 25, current_occupancy: 0, name: id };

  const zA  = g("gate-a");
  const zB  = g("gate-b");
  const zC  = g("gate-c");
  const zD  = g("gate-d");
  const zN  = g("north-concourse");
  const zS  = g("south-concourse");
  const zE  = g("east-concourse");
  const zW  = g("west-concourse");
  const zFA = g("food-court-a");
  const zFB = g("food-court-b");
  const zWN = g("washrooms-north");
  const zWS = g("washrooms-south");
  const zM  = g("metro-station");
  const zP  = g("parking-lot-b");
  const zXW = g("exit-west");
  const zXE = g("exit-east");

  const sel = (id) => selectedZone === id ? "is-selected" : "";

  return `
    <div class="ci-map-shell">
      <div class="ci-map-legend">
        <span class="legend-dot dot-normal"></span>Normal
        <span class="legend-dot dot-moderate"></span>Moderate
        <span class="legend-dot dot-high"></span>High
        <span class="legend-dot dot-critical"></span>Critical
        <span class="legend-sep">|</span>
        <span style="color:var(--text-muted);font-size:0.72rem">Click zone for analytics</span>
      </div>

      <div class="ci-map-card">
        <svg viewBox="0 0 900 540" class="ci-map-svg" role="img" aria-label="Interactive stadium crowd heatmap">
          <defs>
            <!-- Flow arrow markers -->
            <marker id="arrow-main" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(80,227,242,0.8)" />
            </marker>
            <marker id="arrow-dim" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(80,227,242,0.35)" />
            </marker>
            <!-- Glow filter for pitch -->
            <filter id="pitch-glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <!-- Stadium outer boundary -->
          <rect x="60" y="40" width="780" height="460" rx="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="2"/>

          <!-- Playing pitch -->
          <rect x="280" y="160" width="340" height="220" rx="8" fill="none" stroke="rgba(85,213,138,0.35)" stroke-width="1.5" filter="url(#pitch-glow)"/>
          <rect x="330" y="195" width="100" height="75" rx="3" fill="none" stroke="rgba(85,213,138,0.2)" stroke-width="1"/>
          <rect x="470" y="195" width="100" height="75" rx="3" fill="none" stroke="rgba(85,213,138,0.2)" stroke-width="1"/>
          <circle cx="450" cy="270" r="30" fill="none" stroke="rgba(85,213,138,0.2)" stroke-width="1"/>
          <circle cx="450" cy="270" r="2" fill="rgba(85,213,138,0.4)"/>
          <line x1="450" y1="160" x2="450" y2="380" stroke="rgba(85,213,138,0.15)" stroke-width="1"/>
          <text x="450" y="280" fill="rgba(255,255,255,0.12)" font-size="9" text-anchor="middle" font-family="Inter,sans-serif">PITCH</text>

          <!-- === CROWD FLOW ARROWS === -->
          <!-- Gate C → North Concourse -->
          <path d="M 450,112 L 450,155" fill="none" stroke="rgba(80,227,242,0.5)" stroke-width="3" marker-end="url(#arrow-main)" class="ci-flow-path"/>
          <!-- Gate A → East Concourse -->
          <path d="M 738,225 L 645,235" fill="none" stroke="rgba(80,227,242,0.45)" stroke-width="2.5" marker-end="url(#arrow-main)" class="ci-flow-path"/>
          <!-- Gate B → West Concourse -->
          <path d="M 162,225 L 238,235" fill="none" stroke="rgba(80,227,242,0.4)" stroke-width="2" marker-end="url(#arrow-dim)" class="ci-flow-path"/>
          <!-- Gate D → South Concourse -->
          <path d="M 450,428 L 450,395" fill="none" stroke="rgba(80,227,242,0.35)" stroke-width="2" marker-end="url(#arrow-dim)" class="ci-flow-path"/>
          <!-- North Concourse → Food Court A -->
          <path d="M 390,172 L 330,155" fill="none" stroke="rgba(255,202,95,0.3)" stroke-width="1.5" marker-end="url(#arrow-dim)" class="ci-flow-path" style="--dash-speed:18s"/>
          <!-- East Concourse → Food Court B -->
          <path d="M 655,285 L 655,320" fill="none" stroke="rgba(255,202,95,0.3)" stroke-width="1.5" marker-end="url(#arrow-dim)" class="ci-flow-path" style="--dash-speed:20s"/>
          <!-- North Concourse → Metro -->
          <path d="M 390,168 C 280,100 200,120 130,170" fill="none" stroke="rgba(169,139,255,0.4)" stroke-width="2" marker-end="url(#arrow-dim)" class="ci-flow-path" style="--dash-speed:15s"/>
          <!-- West → Parking -->
          <path d="M 248,270 C 160,310 140,380 138,420" fill="none" stroke="rgba(255,141,92,0.3)" stroke-width="1.5" marker-end="url(#arrow-dim)" class="ci-flow-path" style="--dash-speed:22s"/>
          <!-- South → Exit West -->
          <path d="M 400,405 L 310,460" fill="none" stroke="rgba(80,227,242,0.35)" stroke-width="2" marker-end="url(#arrow-dim)" class="ci-flow-path"/>
          <!-- East → Exit East -->
          <path d="M 650,300 L 780,440" fill="none" stroke="rgba(80,227,242,0.3)" stroke-width="1.5" marker-end="url(#arrow-dim)" class="ci-flow-path"/>

          <!-- === ZONE PATHS === -->

          <!-- Gate A (East side) -->
          <rect x="700" y="175" width="80" height="105" rx="8" class="ci-map-zone ${colorClass(zA.fill_percent)} ${sel("gate-a")}" data-zone-id="gate-a"/>
          <text x="740" y="222" fill="#eef6ff" font-size="8" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">Gate A</text>
          <text x="740" y="233" fill="rgba(238,246,255,0.7)" font-size="7" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zA.fill_percent}%</text>

          <!-- Gate B (West side) -->
          <rect x="120" y="175" width="80" height="105" rx="8" class="ci-map-zone ${colorClass(zB.fill_percent)} ${sel("gate-b")}" data-zone-id="gate-b"/>
          <text x="160" y="222" fill="#eef6ff" font-size="8" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">Gate B</text>
          <text x="160" y="233" fill="rgba(238,246,255,0.7)" font-size="7" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zB.fill_percent}%</text>

          <!-- Gate C (North) -->
          <rect x="355" y="55" width="190" height="65" rx="8" class="ci-map-zone ${colorClass(zC.fill_percent)} ${sel("gate-c")}" data-zone-id="gate-c"/>
          <text x="450" y="84" fill="#eef6ff" font-size="8.5" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">Gate C</text>
          <text x="450" y="96" fill="rgba(238,246,255,0.7)" font-size="7.5" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zC.fill_percent}%</text>

          <!-- Gate D (South) -->
          <rect x="355" y="420" width="190" height="65" rx="8" class="ci-map-zone ${colorClass(zD.fill_percent)} ${sel("gate-d")}" data-zone-id="gate-d"/>
          <text x="450" y="449" fill="#eef6ff" font-size="8.5" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">Gate D</text>
          <text x="450" y="461" fill="rgba(238,246,255,0.7)" font-size="7.5" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zD.fill_percent}%</text>

          <!-- North Concourse -->
          <path d="M 310,135 L 590,135 L 570,165 L 330,165 Z" class="ci-map-zone ${colorClass(zN.fill_percent)} ${sel("north-concourse")}" data-zone-id="north-concourse"/>
          <text x="450" y="155" fill="#eef6ff" font-size="8" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">North Concourse ${zN.fill_percent}%</text>

          <!-- South Concourse -->
          <path d="M 330,375 L 570,375 L 590,405 L 310,405 Z" class="ci-map-zone ${colorClass(zS.fill_percent)} ${sel("south-concourse")}" data-zone-id="south-concourse"/>
          <text x="450" y="394" fill="#eef6ff" font-size="8" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">South Concourse ${zS.fill_percent}%</text>

          <!-- East Concourse -->
          <path d="M 625,160 L 700,175 L 700,370 L 625,380 Z" class="ci-map-zone ${colorClass(zE.fill_percent)} ${sel("east-concourse")}" data-zone-id="east-concourse"/>
          <text x="662" y="272" fill="#eef6ff" font-size="8" font-weight="700" text-anchor="middle" pointer-events="none" transform="rotate(-90,662,272)" font-family="Inter,sans-serif">East Conc ${zE.fill_percent}%</text>

          <!-- West Concourse -->
          <path d="M 200,160 L 275,175 L 275,380 L 200,370 Z" class="ci-map-zone ${colorClass(zW.fill_percent)} ${sel("west-concourse")}" data-zone-id="west-concourse"/>
          <text x="237" y="272" fill="#eef6ff" font-size="8" font-weight="700" text-anchor="middle" pointer-events="none" transform="rotate(-90,237,272)" font-family="Inter,sans-serif">West Conc ${zW.fill_percent}%</text>

          <!-- Food Court A (upper left) -->
          <rect x="230" y="85" width="90" height="55" rx="6" class="ci-map-zone ${colorClass(zFA.fill_percent)} ${sel("food-court-a")}" data-zone-id="food-court-a"/>
          <text x="275" y="109" fill="#eef6ff" font-size="7" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">Food Ct A</text>
          <text x="275" y="120" fill="rgba(238,246,255,0.7)" font-size="7" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zFA.fill_percent}%</text>

          <!-- Food Court B (upper right) -->
          <rect x="580" y="85" width="90" height="55" rx="6" class="ci-map-zone ${colorClass(zFB.fill_percent)} ${sel("food-court-b")}" data-zone-id="food-court-b"/>
          <text x="625" y="109" fill="#eef6ff" font-size="7" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">Food Ct B</text>
          <text x="625" y="120" fill="rgba(238,246,255,0.7)" font-size="7" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zFB.fill_percent}%</text>

          <!-- Washrooms North -->
          <rect x="395" y="55" width="60" height="35" rx="4" class="ci-map-zone ${colorClass(zWN.fill_percent)} ${sel("washrooms-north")}" data-zone-id="washrooms-north" style="opacity:0.0;pointer-events:none"/>
          <!-- overlaps with Gate C, show separately in bottom area -->
          <rect x="200" y="430" width="70" height="38" rx="5" class="ci-map-zone ${colorClass(zWN.fill_percent)} ${sel("washrooms-north")}" data-zone-id="washrooms-north"/>
          <text x="235" y="448" fill="#eef6ff" font-size="7" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">WC North</text>
          <text x="235" y="459" fill="rgba(238,246,255,0.7)" font-size="6.5" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zWN.fill_percent}%</text>

          <!-- Washrooms South -->
          <rect x="630" y="430" width="70" height="38" rx="5" class="ci-map-zone ${colorClass(zWS.fill_percent)} ${sel("washrooms-south")}" data-zone-id="washrooms-south"/>
          <text x="665" y="448" fill="#eef6ff" font-size="7" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">WC South</text>
          <text x="665" y="459" fill="rgba(238,246,255,0.7)" font-size="6.5" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zWS.fill_percent}%</text>

          <!-- Metro Station (far left) -->
          <rect x="65" y="135" width="65" height="55" rx="6" class="ci-map-zone ${colorClass(zM.fill_percent)} ${sel("metro-station")}" data-zone-id="metro-station"/>
          <text x="97" y="158" fill="#eef6ff" font-size="7" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">Metro</text>
          <text x="97" y="169" fill="rgba(238,246,255,0.7)" font-size="7" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zM.fill_percent}%</text>

          <!-- Parking Lot B (far left bottom) -->
          <rect x="65" y="400" width="65" height="55" rx="6" class="ci-map-zone ${colorClass(zP.fill_percent)} ${sel("parking-lot-b")}" data-zone-id="parking-lot-b"/>
          <text x="97" y="423" fill="#eef6ff" font-size="7" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">Parking B</text>
          <text x="97" y="434" fill="rgba(238,246,255,0.7)" font-size="7" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zP.fill_percent}%</text>

          <!-- Exit West -->
          <rect x="270" y="455" width="75" height="38" rx="5" class="ci-map-zone ${colorClass(zXW.fill_percent)} ${sel("exit-west")}" data-zone-id="exit-west"/>
          <text x="307" y="472" fill="#eef6ff" font-size="7" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">Exit West</text>
          <text x="307" y="483" fill="rgba(238,246,255,0.7)" font-size="6.5" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zXW.fill_percent}%</text>

          <!-- Exit East -->
          <rect x="755" y="400" width="75" height="55" rx="5" class="ci-map-zone ${colorClass(zXE.fill_percent)} ${sel("exit-east")}" data-zone-id="exit-east"/>
          <text x="792" y="425" fill="#eef6ff" font-size="7" font-weight="700" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">Exit East</text>
          <text x="792" y="436" fill="rgba(238,246,255,0.7)" font-size="6.5" text-anchor="middle" pointer-events="none" font-family="Inter,sans-serif">${zXE.fill_percent}%</text>
        </svg>

        ${selectedZone ? zoneDrawerWidget(predictions.find(p => p.zone_id === selectedZone)) : ""}
      </div>
    </div>`;
}

/* ============================================================
   Zone Detail Drawer
   ============================================================ */
function zoneDrawerWidget(zone) {
  if (!zone) return "";
  const riskColors = { critical: "var(--red)", high: "var(--orange)", moderate: "var(--amber)", normal: "var(--green)" };
  const c = riskColors[zone.risk_level] || "var(--text)";
  return `
    <div class="ci-zone-drawer is-active" id="zone-drawer-panel" role="dialog" aria-label="${zone.name} analytics">
      <div class="ci-drawer-header">
        <div>
          <p class="eyebrow">Zone Analytics</p>
          <h3>${zone.icon || "📍"} ${zone.name}</h3>
        </div>
        <button type="button" class="ci-drawer-close" id="btn-close-zone-drawer" aria-label="Close zone details">✕</button>
      </div>

      ${riskBadge(zone.risk_level)}

      <div class="ci-drawer-metrics">
        <div class="ci-drawer-metric">
          <span>Current Occupancy</span>
          <strong>${zone.current_occupancy.toLocaleString()} <em>/ ${zone.capacity.toLocaleString()}</em></strong>
          ${occupancyBar(zone.fill_percent)}
          <small>${zone.fill_percent}% capacity</small>
        </div>
        <div class="ci-drawer-metric">
          <span>Predicted (15 min)</span>
          <strong style="color:var(--cyan)">${zone.predicted_15min.toLocaleString()}</strong>
          ${occupancyBar(zone.predicted_15min_pct)}
          <small>${zone.predicted_15min_pct}% projected</small>
        </div>
        <div class="ci-drawer-metric">
          <span>Predicted (30 min)</span>
          <strong style="color:var(--blue)">${zone.predicted_30min.toLocaleString()}</strong>
          ${occupancyBar(zone.predicted_30min_pct)}
          <small>${zone.predicted_30min_pct}% projected</small>
        </div>
      </div>

      <div class="ci-drawer-grid">
        <div class="ci-drawer-stat">
          <span>Peak Time</span>
          <strong>⏱ ${zone.peak_time}</strong>
        </div>
        <div class="ci-drawer-stat">
          <span>Avg Speed</span>
          <strong>${zone.avg_speed_ms} m/s</strong>
        </div>
        <div class="ci-drawer-stat">
          <span>Queue Depth</span>
          <strong>${zone.queue_depth} persons</strong>
        </div>
        <div class="ci-drawer-stat">
          <span>AI Confidence</span>
          <strong style="color:var(--cyan)">${zone.confidence_score}%</strong>
        </div>
      </div>

      <div class="ci-drawer-reason">
        <p class="eyebrow">Gemini Explanation</p>
        <p>${zone.reason}</p>
      </div>
    </div>`;
}

/* ============================================================
   3. AI Crowd Prediction — Zone Cards
   ============================================================ */
function zonePredictionCard(zone) {
  return `
    <article class="ci-pred-card severity-${zone.risk_level}" aria-label="${zone.name} prediction">
      <div class="ci-pred-header">
        <div>
          <span class="ci-pred-icon">${zone.icon || "📍"}</span>
          <strong class="ci-pred-name">${zone.name}</strong>
        </div>
        ${riskBadge(zone.risk_level)}
      </div>
      <div class="ci-pred-body">
        <div class="ci-pred-occ">
          <span>Current</span>
          <strong>${zone.current_occupancy.toLocaleString()} <em>(${zone.fill_percent}%)</em></strong>
          ${occupancyBar(zone.fill_percent)}
        </div>
        <div class="ci-pred-occ">
          <span>Predicted 15 min</span>
          <strong style="color:var(--cyan)">${zone.predicted_15min.toLocaleString()} <em>(${zone.predicted_15min_pct}%)</em></strong>
          ${occupancyBar(zone.predicted_15min_pct)}
        </div>
        <div class="ci-pred-occ">
          <span>Predicted 30 min</span>
          <strong style="color:var(--blue)">${zone.predicted_30min.toLocaleString()} <em>(${zone.predicted_30min_pct}%)</em></strong>
          ${occupancyBar(zone.predicted_30min_pct)}
        </div>
      </div>
      <div class="ci-pred-footer">
        <span>Peak: <b>${zone.peak_time}</b></span>
        <span>Confidence: <b style="color:var(--cyan)">${zone.confidence_score}%</b></span>
      </div>
      <div class="ci-pred-reason">
        <p class="eyebrow">Gemini Reasoning</p>
        <p>${zone.reason}</p>
      </div>
    </article>`;
}

/* ============================================================
   4. Crowd Flow Animation Panel
   ============================================================ */
function crowdFlowPanel(predictions) {
  const pctFor = (id, fallback) => {
    const z = predictions.find((p) => p.zone_id === id);
    return z ? Math.min(98, Math.round(z.fill_percent * 0.92)) : fallback;
  };
  const flowPairs = [
    { from: "Entry Gate C", to: "North Concourse", pct: pctFor("gate-c", 85), type: "main" },
    { from: "Entry Gate A", to: "East Concourse", pct: pctFor("gate-a", 68), type: "main" },
    { from: "Entry Gate B", to: "West Concourse", pct: pctFor("gate-b", 54), type: "secondary" },
    { from: "North Concourse", to: "Food Court A", pct: pctFor("food-court-a", 48), type: "secondary" },
    { from: "East Concourse", to: "Food Court B", pct: pctFor("food-court-b", 42), type: "secondary" },
    { from: "Food Court A", to: "Washrooms North", pct: pctFor("washrooms-north", 55), type: "secondary" },
    { from: "North Concourse", to: "Metro Station", pct: pctFor("metro-station", 72), type: "main" },
    { from: "West Concourse", to: "Parking Lot B", pct: pctFor("parking-lot-b", 62), type: "secondary" },
    { from: "South Concourse", to: "Exit Gates West", pct: pctFor("exit-west", 75), type: "exit" },
    { from: "East Concourse", to: "Exit Gates East", pct: pctFor("exit-east", 58), type: "exit" }
  ];

  return `
    <article class="glass-card widget-card ci-flow-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Real-Time Pedestrian Vectors</p>
          <h2>Crowd Flow Animation</h2>
        </div>
        <span class="status-pill">Live</span>
      </div>
      <div class="ci-flow-list">
        ${flowPairs.map(f => `
          <div class="ci-flow-row ci-flow-${f.type}">
            <div class="ci-flow-nodes">
              <span class="ci-flow-node">${f.from}</span>
              <div class="ci-flow-arrow-track">
                <div class="ci-flow-arrow-fill" style="width:${f.pct}%">
                  <div class="ci-flow-pulse"></div>
                </div>
                <span class="ci-flow-arrow-icon">›</span>
              </div>
              <span class="ci-flow-node">${f.to}</span>
            </div>
            <span class="ci-flow-pct" style="color:${f.pct > 75 ? "var(--orange)" : f.pct > 50 ? "var(--amber)" : "var(--green)"}">${f.pct}%</span>
          </div>
        `).join("")}
      </div>
    </article>`;
}

/* ============================================================
   5. Bottleneck Detection
   ============================================================ */
export function bottleneckWidget(bottlenecks) {
  const typeIcon = { blocked: "🔴", congested: "🟠", slow: "🟡", queue: "⏱" };
  return `
    <article class="glass-card widget-card ci-bottleneck-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AI Friction Analysis</p>
          <h2>Bottleneck Detection</h2>
        </div>
        <span class="status-pill ${bottlenecks.length > 0 ? "pill-warn" : ""}">${bottlenecks.length} Active</span>
      </div>
      <div class="ci-bottleneck-list">
        ${bottlenecks.length === 0 ? `
          <div class="ci-empty-state">
            <span>✅</span>
            <p>No bottlenecks detected. All zones flowing within safe parameters.</p>
          </div>
        ` : bottlenecks.map(bn => `
          <div class="ci-bottleneck-card ${bn.type === "blocked" ? "bn-critical" : (bn.type === "congested" || bn.type === "queue") ? "bn-high" : "bn-moderate"}">
            <div class="ci-bn-header">
              <span>${typeIcon[bn.type] || "⚠️"}</span>
              <div>
                <strong class="ci-bn-zone">${bn.name}</strong>
                <span class="ci-bn-type">${bn.type.toUpperCase()}</span>
              </div>
            </div>
            <div class="ci-bn-detail">
              <div class="ci-bn-row">
                <span class="ci-bn-label">Problem</span>
                <p>${bn.problem}</p>
              </div>
              <div class="ci-bn-row">
                <span class="ci-bn-label">Root Cause</span>
                <p>${bn.root_cause}</p>
              </div>
              <div class="ci-bn-row">
                <span class="ci-bn-label">Impact</span>
                <p>${bn.impact}</p>
              </div>
              <div class="ci-bn-row ci-bn-ai">
                <span class="ci-bn-label">💡 AI Recommendation</span>
                <p>${bn.recommendation}</p>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </article>`;
}

/* ============================================================
   6. AI Safe Route Generator
   ============================================================ */
export function safeRouteWidget() {
  return `
    <article class="glass-card widget-card ci-routes-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">AI Path Optimization</p>
          <h2>Safe Route Generator</h2>
        </div>
        <span class="status-pill pill-green">Active Routing</span>
      </div>
      <div class="ci-route-list">
        ${mockSafeRoutes.map((route, i) => `
          <div class="ci-route-card">
            <div class="ci-route-header">
              <div>
                <span class="ci-route-num">Route ${i + 1}</span>
                <strong>${route.name}</strong>
              </div>
              <span class="ci-route-safety" style="color:${route.safety_score >= 95 ? "var(--green)" : "var(--cyan)"}">
                ${route.safety_score}% safe
              </span>
            </div>
            <p class="ci-route-reason">${route.reason}</p>
            <div class="ci-route-steps">
              ${route.steps.map((s, idx) => `
                <span class="ci-route-step">${s}</span>${idx < route.steps.length - 1 ? '<span class="ci-step-arrow">→</span>' : ""}
              `).join("")}
            </div>
            <div class="ci-route-scores">
              <div class="ci-route-score">
                <span>Time</span>
                <strong>${route.transit_time_min} min</strong>
              </div>
              <div class="ci-route-score">
                <span>Density</span>
                <strong style="color:${route.density_pct < 40 ? "var(--green)" : "var(--amber)"}">${route.density_pct}%</strong>
              </div>
              <div class="ci-route-score">
                <span>Access</span>
                <strong style="color:var(--cyan)">${route.accessibility_score}%</strong>
              </div>
              <div class="ci-route-score">
                <span>Safety</span>
                <strong style="color:var(--green)">${route.safety_score}%</strong>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </article>`;
}

/* ============================================================
   7. Crowd Timeline + Playback
   ============================================================ */
export function playbackWidget(timeIndex, isPlaying, intervalName) {
  const intervals = [
    { name: "15m", val: 0.8,  label: "15 Min" },
    { name: "30m", val: 1.1,  label: "30 Min" },
    { name: "1h",  val: 1.4,  label: "1 Hour" },
    { name: "Match", val: 1.7, label: "Full Match" }
  ];
  const pct = ((timeIndex - 0.5) / (2.5 - 0.5)) * 100;

  return `
    <article class="glass-card widget-card ci-timeline-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Crowd Evolution Playback</p>
          <h2>Crowd Timeline</h2>
        </div>
        <span class="status-pill">${isPlaying ? "▶ Playing" : "⏸ Paused"}</span>
      </div>
      <div class="ci-playback-controls">
        <button type="button" class="ci-play-btn" id="btn-crowd-play-toggle" aria-label="${isPlaying ? "Pause" : "Play"} timeline">
          ${isPlaying ? "⏸" : "▶"}
        </button>
        <div class="ci-playback-track">
          <div class="ci-playback-labels">
            <span>Match Start</span>
            <strong>Multiplier ${timeIndex.toFixed(1)}x</strong>
            <span>Post-Match</span>
          </div>
          <input type="range" min="0.5" max="2.5" step="0.1" value="${timeIndex}"
            class="ci-timeline-slider" id="crowd-timeline-range"
            aria-label="Crowd timeline position"/>
          <div class="ci-playback-progress" style="width:${pct}%"></div>
        </div>
      </div>
      <div class="ci-interval-tabs">
        ${intervals.map(int => `
          <button type="button"
            class="ci-interval-btn ${intervalName === int.name ? "is-active" : ""}"
            data-interval-name="${int.name}"
            data-interval-val="${int.val}">
            ${int.label}
          </button>
        `).join("")}
      </div>
    </article>`;
}

/* ============================================================
   8. AI Insights Feed
   ============================================================ */
export function insightsWidget(insights) {
  const severityColors = {
    critical: "var(--red)", high: "var(--orange)", medium: "var(--amber)", low: "var(--green)", info: "var(--cyan)"
  };
  return `
    <article class="glass-card widget-card ci-insights-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Gemini Live Observations</p>
          <h2>AI Insights Feed</h2>
        </div>
        <div style="display:flex;align-items:center;gap:var(--space-2)">
          <span class="live-dot"></span>
          <span class="status-pill">Live</span>
        </div>
      </div>
      <div class="ci-insight-list">
        ${insights.map(ins => `
          <div class="ci-insight-card ci-insight-${ins.severity || "info"}">
            <div class="ci-insight-header">
              <span class="ci-insight-sev" style="color:${severityColors[ins.severity] || severityColors.info}">
                ${severityIcon(ins.severity)}
              </span>
              <p class="ci-insight-text">${ins.text}</p>
              ${ins.time ? `<time class="ci-insight-time">${ins.time}</time>` : ""}
            </div>
            <p class="ci-insight-reason">
              <span>Reasoning:</span> ${ins.reason}
            </p>
          </div>
        `).join("")}
      </div>
    </article>`;
}

/* ============================================================
   9. Crowd Analytics Charts (7 chart types)
   ============================================================ */
function miniBarChart(data, maxOverride) {
  if (!data || !data.values || data.values.length === 0) return `<div class="ci-chart-empty">No data</div>`;
  const max = maxOverride || Math.max(...data.values, 1);
  return `
    <div class="ci-mini-chart">
      <div class="ci-bar-group">
        ${data.values.map((v, i) => `
          <div class="ci-bar-col">
            <div class="ci-bar" style="height:${Math.round((v / max) * 100)}%">
              <span class="ci-bar-val">${v > 999 ? (v/1000).toFixed(1)+"k" : v}</span>
            </div>
            ${data.labels ? `<span class="ci-bar-label">${data.labels[i]}</span>` : ""}
          </div>
        `).join("")}
      </div>
    </div>`;
}

export function chartsWidget(analytics) {
  if (!analytics) return "";
  return `
    <section class="ci-charts-section" aria-label="Crowd Analytics Charts">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Quantitative Analysis</p>
          <h2>Crowd Analytics Charts</h2>
        </div>
        <span class="status-pill">7 Metrics</span>
      </div>
      <div class="ci-charts-grid">

        <article class="ci-chart-card">
          <p class="eyebrow">Density Trend</p>
          <h3>Zone Density Over Time</h3>
          ${miniBarChart(analytics.density_trend)}
        </article>

        <article class="ci-chart-card">
          <p class="eyebrow">Queue Analysis</p>
          <h3>Queue Depth by Zone</h3>
          ${miniBarChart(analytics.queue_length, Math.max(...(analytics.queue_length?.values || [1])) * 1.2)}
        </article>

        <article class="ci-chart-card">
          <p class="eyebrow">Movement Speed</p>
          <h3>Avg Walking Speed (m/s)</h3>
          ${miniBarChart(analytics.avg_walking_speed, 1.6)}
        </article>

        <article class="ci-chart-card">
          <p class="eyebrow">Gate Performance</p>
          <h3>Gate Utilization %</h3>
          ${miniBarChart(analytics.gate_utilization, 100)}
        </article>

        <article class="ci-chart-card">
          <p class="eyebrow">Entry vs Exit</p>
          <h3>Crowd Flow Balance</h3>
          <div class="ci-flow-balance">
            <div class="ci-balance-row">
              <span>Entry</span>
              <div class="ci-balance-bar" style="width:${Math.min(100, Math.round((analytics.entry_vs_exit.entry / 50000) * 100))}%; background:var(--cyan)"></div>
              <strong>${(analytics.entry_vs_exit.entry / 1000).toFixed(1)}k/h</strong>
            </div>
            <div class="ci-balance-row">
              <span>Exit</span>
              <div class="ci-balance-bar" style="width:${Math.min(100, Math.round((analytics.entry_vs_exit.exit / 50000) * 100))}%; background:var(--green)"></div>
              <strong>${(analytics.entry_vs_exit.exit / 1000).toFixed(1)}k/h</strong>
            </div>
            <div class="ci-balance-row">
              <span>Net In</span>
              <div class="ci-balance-bar" style="width:${Math.min(100, Math.round((analytics.entry_vs_exit.net / 50000) * 100))}%; background:var(--amber)"></div>
              <strong>${(analytics.entry_vs_exit.net / 1000).toFixed(1)}k/h</strong>
            </div>
          </div>
        </article>

        <article class="ci-chart-card">
          <p class="eyebrow">Distribution</p>
          <h3>Crowd by Zone</h3>
          ${miniBarChart(analytics.crowd_distribution)}
        </article>

        <article class="ci-chart-card ci-chart-wide">
          <p class="eyebrow">Peak Hour Analysis</p>
          <h3>Hourly Crowd Volume (Full Match)</h3>
          ${miniBarChart(analytics.peak_hour, 10000)}
        </article>

      </div>
    </section>`;
}

/* ============================================================
   10. What-If Simulation
   ============================================================ */
export function whatIfWidget(selectedScenario, impact = null) {
  const current = whatIfScenarios.find(s => s.id === selectedScenario);
  return `
    <article class="glass-card widget-card ci-whatif-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Scenario Simulation Engine</p>
          <h2>What-If Simulation</h2>
        </div>
        <span class="status-pill pill-violet">Gemini Powered</span>
      </div>
      <p class="ci-whatif-desc">Simulate closing a gate, opening capacity, weather, metro delay, medical events, or VIP arrivals — then read predicted crowd impact instantly.</p>
      <div class="ci-whatif-scenarios" role="group" aria-label="What-if scenarios">
        ${whatIfScenarios.map(sc => `
          <button type="button"
            class="ci-scenario-btn ${sc.id === selectedScenario ? "is-active" : ""}"
            data-scenario-id="${sc.id}"
            aria-pressed="${sc.id === selectedScenario ? "true" : "false"}">
            ${sc.label}
          </button>
        `).join("")}
      </div>
      ${current ? `
        <div class="ci-whatif-active">
          <div class="ci-whatif-impact">
            <span class="eyebrow">Active Scenario</span>
            <strong>${current.label}</strong>
            <p>${current.description}</p>
          </div>
          ${impact ? `
            <div class="ci-whatif-metrics">
              <div class="ci-whatif-metric">
                <span>Critical Zones</span>
                <strong style="color:${impact.critical > 0 ? "var(--red)" : "var(--green)"}">${impact.critical}</strong>
              </div>
              <div class="ci-whatif-metric">
                <span>Bottlenecks</span>
                <strong style="color:${impact.bottlenecks > 0 ? "var(--orange)" : "var(--green)"}">${impact.bottlenecks}</strong>
              </div>
              <div class="ci-whatif-metric">
                <span>Peak Fill</span>
                <strong style="color:var(--cyan)">${impact.peakFill}%</strong>
              </div>
              <div class="ci-whatif-metric">
                <span>Avg Confidence</span>
                <strong>${impact.avgConfidence}%</strong>
              </div>
            </div>
          ` : ""}
        </div>
      ` : ""}
    </article>`;
}

/* ============================================================
   11. CSV Upload
   ============================================================ */
export function csvUploadWidget(csvName, csvError, csvLoading = false) {
  return `
    <article class="glass-card widget-card ci-csv-panel">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Data Ingestion</p>
          <h2>CSV Upload</h2>
        </div>
        <span class="status-pill">${csvLoading ? "Parsing…" : csvName ? "Loaded" : "Ready"}</span>
      </div>
      <p class="ci-csv-desc">Upload a real crowd dataset to immediately refresh the heatmap, predictions, bottlenecks, routes, and charts.</p>
      <div class="ci-csv-box ${csvError ? "has-error" : csvLoading ? "is-loading" : csvName ? "has-file" : ""}" id="csv-upload-box" role="button" tabindex="0" aria-label="Upload CSV crowd dataset">
        <span class="ci-csv-icon">${csvLoading ? "⏳" : csvName ? "✅" : "📥"}</span>
        <strong>${csvLoading ? "Parsing crowd dataset…" : csvName ? `Loaded: ${csvName}` : "Click or Drag to Upload CSV"}</strong>
        <span class="ci-csv-hint">Columns: zone_id, occupancy, capacity, peak_time</span>
        <input type="file" id="crowd-csv-file-input" accept=".csv" aria-label="Select CSV file"/>
      </div>
      ${csvError ? `<div class="ci-csv-error" role="alert">⚠️ ${csvError}</div>` : ""}
      ${csvName && !csvError && !csvLoading ? `<div class="ci-csv-success">✓ Dataset loaded. All visualizations updated.</div>` : ""}
    </article>`;
}

/* ============================================================
   Main Crowd Intelligence Panel
   ============================================================ */
function crowdPageHeader() {
  return `
    <header class="ci-page-header glass-card">
      <div>
        <p class="eyebrow">Predictive Crowd Analytics · Not Operational Dashboard</p>
        <h1>AI Crowd Intelligence</h1>
        <p class="ci-page-lede">Understand crowd behavior, forecast congestion before it forms, and act on Gemini-backed movement intelligence — heatmap, flow, bottlenecks, and safe routes in one workspace.</p>
      </div>
      <div class="ci-page-header-meta">
        <span class="status-pill pill-cyan">Live Telemetry</span>
        <span class="status-pill pill-violet">Gemini Reasoning</span>
      </div>
    </header>`;
}

export function redesignedCrowdPanel(state) {
  if (state.status === "error") {
    return `
      <div class="ci-page-shell">
        ${crowdPageHeader()}
        <div class="ci-error-shell glass-card" role="alert">
          <h2>Crowd analysis unavailable</h2>
          <p>${state.error || "Unable to compute crowd predictions. Retry or upload a valid CSV dataset."}</p>
          <button type="button" class="ci-retry-btn" id="btn-crowd-retry">Retry Analysis</button>
        </div>
      </div>`;
  }

  const data = state.analysis;

  if (!data || state.status === "loading") {
    return `
      <div class="ci-page-shell">
        ${crowdPageHeader()}
        <div class="ci-loading-shell">
          <div class="ci-loading-icon" aria-hidden="true">◈</div>
          <h2>AURA Ingress Engine Loading</h2>
          <p>Computing movement vectors, pedestrian flow coefficients, and density predictions across all zones…</p>
          <div class="ci-loading-bar" aria-hidden="true">
            <div class="ci-loading-fill"></div>
          </div>
        </div>
      </div>`;
  }

  const primaryZones = data.predictions;
  const impact = {
    critical: data.predictions.filter((p) => p.risk_level === "critical").length,
    bottlenecks: data.bottlenecks.length,
    peakFill: Math.max(...data.predictions.map((p) => p.fill_percent)),
    avgConfidence: Math.round(data.predictions.reduce((s, p) => s + p.confidence_score, 0) / data.predictions.length)
  };

  return `
    <div class="ci-page-shell">

      ${crowdPageHeader()}
      ${crowdKpiStrip(data.predictions)}

      <div class="ci-workspace-label">
        <span>Spatial Intelligence</span>
        <span>Forecast &amp; Flow</span>
        <span>AI Guidance</span>
      </div>

      <div class="ci-main-grid">

        <div class="ci-col-left">
          ${whatIfWidget(state.scenario, impact)}
          ${crowdHeatmapWidget(data.predictions, state.selectedZone)}
          ${playbackWidget(state.timeIndex, state.isPlaying, state.intervalName)}
          ${csvUploadWidget(state.csvName, state.csvError, state.csvLoading)}
        </div>

        <div class="ci-col-center">
          <article class="glass-card widget-card ci-predictions-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow">AI Crowd Prediction · Gemini Explains Why</p>
                <h2>Zone Occupancy Forecasts</h2>
              </div>
              <span class="status-pill pill-cyan">${primaryZones.length} Zones</span>
            </div>
            <div class="ci-pred-grid">
              ${primaryZones.map(zonePredictionCard).join("")}
            </div>
          </article>

          ${crowdFlowPanel(data.predictions)}
          ${bottleneckWidget(data.bottlenecks)}
        </div>

        <div class="ci-col-right">
          ${insightsWidget(data.insights)}
          ${safeRouteWidget()}
        </div>

      </div>

      ${chartsWidget(data.analytics)}

    </div>`;
}
