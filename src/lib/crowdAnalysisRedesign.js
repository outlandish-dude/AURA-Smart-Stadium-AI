/* ============================================================
   Crowd Intelligence Redesign — Analytics Engine
   ============================================================ */

import { BaseAnalysisEngine } from "./baseAnalysisEngine.js";
import { crowdZones } from "../config/crowdIntelligenceRedesign.js";

class CrowdAnalysisRedesign extends BaseAnalysisEngine {
  analyze(inputs, whatIfScenario = "default", timeMultiplier = 1.0) {
    let zones = (inputs.zones || crowdZones).map((z) => ({ ...z }));

    // Apply Playback Timeline multiplier
    zones.forEach((z) => {
      z.current_occupancy = Math.round(z.base_occupancy * timeMultiplier);
    });

    // Apply What-If scenario modifications
    if (whatIfScenario === "close-gate-c") {
      const cZone = zones.find((z) => z.id === "gate-c");
      if (cZone) {
        const redirected = cZone.current_occupancy;
        cZone.current_occupancy = 0;
        const nZone = zones.find((z) => z.id === "north-concourse");
        const eZone = zones.find((z) => z.id === "east-concourse");
        if (nZone) nZone.current_occupancy += Math.round(redirected * 0.65);
        if (eZone) eZone.current_occupancy += Math.round(redirected * 0.35);
      }
    } else if (whatIfScenario === "open-gate-d") {
      const dZone = zones.find((z) => z.id === "gate-d");
      if (dZone) {
        dZone.current_occupancy = Math.round(dZone.current_occupancy * 0.5);
      }
      const nZone = zones.find((z) => z.id === "north-concourse");
      const sZone = zones.find((z) => z.id === "south-concourse");
      if (nZone) nZone.current_occupancy = Math.round(nZone.current_occupancy * 0.75);
      if (sZone) sZone.current_occupancy = Math.round(sZone.current_occupancy * 0.82);
    } else if (whatIfScenario === "heavy-rain") {
      zones.forEach((z) => {
        if (z.id.includes("concourse")) z.current_occupancy = Math.round(z.current_occupancy * 1.35);
        if (z.id.includes("food-court")) z.current_occupancy = Math.round(z.current_occupancy * 1.5);
        if (z.id.includes("washroom")) z.current_occupancy = Math.round(z.current_occupancy * 1.4);
      });
    } else if (whatIfScenario === "metro-delay") {
      const metroZone = zones.find((z) => z.id === "metro-station");
      const cZone = zones.find((z) => z.id === "gate-c");
      const parkZone = zones.find((z) => z.id === "parking-lot-b");
      if (metroZone) metroZone.current_occupancy = Math.round(metroZone.current_occupancy * 1.7);
      if (cZone) cZone.current_occupancy = Math.round(cZone.current_occupancy * 1.55);
      if (parkZone) parkZone.current_occupancy = Math.round(parkZone.current_occupancy * 1.3);
    } else if (whatIfScenario === "medical-emergency") {
      const cZone = zones.find((z) => z.id === "gate-c");
      const nZone = zones.find((z) => z.id === "north-concourse");
      if (cZone) cZone.current_occupancy = Math.round(cZone.current_occupancy * 1.25);
      if (nZone) nZone.current_occupancy = Math.round(nZone.current_occupancy * 1.18);
    } else if (whatIfScenario === "vip-arrival") {
      const wZone = zones.find((z) => z.id === "west-concourse");
      const eZone = zones.find((z) => z.id === "exit-west");
      if (wZone) wZone.current_occupancy = Math.round(wZone.current_occupancy * 1.55);
      if (eZone) eZone.current_occupancy = Math.round(eZone.current_occupancy * 1.4);
    }

    // Compute zone predictions
    const predictions = zones.map((z) => {
      const fillPct = this.percentage(z.current_occupancy, z.capacity);
      const pred15 = Math.min(z.capacity, Math.round(z.current_occupancy * 1.12));
      const pred30 = Math.min(z.capacity, Math.round(z.current_occupancy * 1.22));
      const pred15Pct = this.percentage(pred15, z.capacity);
      const pred30Pct = this.percentage(pred30, z.capacity);
      const riskLevel = fillPct >= 90 ? "critical" : fillPct >= 75 ? "high" : fillPct >= 50 ? "moderate" : "normal";
      const confidence = this.clamp(Math.round(96 - Math.max(0, fillPct - 50) * 0.2), 65, 98);

      const scenarioHint = {
        "close-gate-c": "Gate C closure is redistributing load into neighboring zones.",
        "open-gate-d": "Gate D boost is diverting overflow and lowering adjacent density.",
        "heavy-rain": "Rain is pushing guests into covered corridors faster than egress clears them.",
        "metro-delay": "Metro delay is stacking arrivals into Gate C and Parking Lot B feeders.",
        "medical-emergency": "Medical cordon is narrowing Gate C throughput and creating ripple delay.",
        "vip-arrival": "VIP motorcade is compressing West Concourse movement temporarily.",
        "default": "Baseline ingress from rail and parking is the primary load driver."
      };
      const reasons = {
        critical: `Gemini: ${z.name} is at ${fillPct}% capacity with ingress exceeding egress ~3:1. ${scenarioHint[whatIfScenario] || scenarioHint.default} Without intervention, 30-min projection reaches ${pred30Pct}%.`,
        high: `Gemini: Elevated density at ${fillPct}%. ${scenarioHint[whatIfScenario] || scenarioHint.default} 15-min forecast ${pred15Pct}% fill; adjacent overflow is the main accelerator.`,
        moderate: `Gemini: Moderate presence (${fillPct}%). ${scenarioHint[whatIfScenario] || scenarioHint.default} Flow remains manageable; velocity trending down as occupancy rises toward peak (${z.peak_time}).`,
        normal: `Gemini: Zone comfortable at ${fillPct}%. ${scenarioHint[whatIfScenario] || scenarioHint.default} Velocity nominal (1.3–1.5 m/s); peak expected near ${z.peak_time}.`
      };

      return {
        zone_id: z.id,
        name: z.name,
        icon: z.icon || "📍",
        current_occupancy: z.current_occupancy,
        capacity: z.capacity,
        fill_percent: fillPct,
        predicted_15min: pred15,
        predicted_15min_pct: pred15Pct,
        predicted_30min: pred30,
        predicted_30min_pct: pred30Pct,
        peak_time: z.peak_time,
        risk_level: riskLevel,
        confidence_score: confidence,
        reason: reasons[riskLevel],
        avg_speed_ms: parseFloat((1.4 * (1 - (fillPct / 140))).toFixed(2)),
        queue_depth: Math.round(z.current_occupancy / 120)
      };
    });

    // Bottleneck Detection — slow areas, blocked routes, long queues, congested intersections
    const bottlenecks = [];
    const rootCauses = {
      "close-gate-c": "Closure of Gate C redistributed ~3,200 pedestrians into this zone unexpectedly.",
      "heavy-rain": "Heavy precipitation forced guests into covered zones, compressing pedestrian flow corridors.",
      "metro-delay": "Metro platform saturation caused backflow through connecting concourses.",
      "medical-emergency": "Emergency cordon at Gate C narrowed egress corridors by 50%, compressing nearby zones.",
      "vip-arrival": "West Concourse blockade diverted crowds into adjacent zones without prior capacity adjustment.",
      "default": "Concurrent train arrivals and parking lot peak egress created simultaneous inbound surges.",
      "open-gate-d": "Legacy routing algorithms haven't yet adapted to the new Gate D capacity allocation."
    };
    const recFor = (scenario) => {
      if (scenario === "close-gate-c") {
        return "Activate Gate D emergency expansion lanes. Deploy 12 stewards to redirect outflows along Outer Perimeter Path.";
      }
      if (scenario === "heavy-rain") {
        return "Activate variable message boards. Open covered shuttle routes. Increase steward presence at concourse entry points.";
      }
      return "Engage dynamic crowd routing via VMS boards. Open reserve Gate D capacity. Redirect to East Concourse bypass route.";
    };

    predictions.forEach((p) => {
      if (p.fill_percent >= 90) {
        bottlenecks.push({
          zone_id: p.zone_id,
          name: p.name,
          type: "blocked",
          problem: `Blocked route — zone at ${p.fill_percent}% capacity. Pedestrian movement near standstill.`,
          root_cause: rootCauses[whatIfScenario] || rootCauses.default,
          impact: `Walking speed ${p.avg_speed_ms} m/s. Queue depth ${p.queue_depth}. Spillover risk to adjacent corridors.`,
          recommendation: recFor(whatIfScenario)
        });
      } else if (p.fill_percent >= 82) {
        bottlenecks.push({
          zone_id: p.zone_id,
          name: p.name,
          type: "congested",
          problem: `Congested intersection — density compression at ${p.fill_percent}% with crossing pedestrian streams.`,
          root_cause: rootCauses[whatIfScenario] || rootCauses.default,
          impact: `Average walking speed ${p.avg_speed_ms} m/s. ETA to clear: ~${Math.round((p.fill_percent - 70) / 3)} minutes.`,
          recommendation: recFor(whatIfScenario)
        });
      } else if (p.queue_depth >= 18 || (p.fill_percent >= 70 && p.zone_id.includes("food"))) {
        bottlenecks.push({
          zone_id: p.zone_id,
          name: p.name,
          type: "queue",
          problem: `Long queue detected — ${p.queue_depth} persons waiting. SLA risk elevated.`,
          root_cause: rootCauses[whatIfScenario] || rootCauses.default,
          impact: `Estimated wait ${Math.max(8, Math.round(p.queue_depth / 4))} minutes. Corridor spillover likely if sustained.`,
          recommendation: "Deploy mobile capacity (carts / extra lanes). Activate queue barriers and digital wait-time boards."
        });
      } else if (p.avg_speed_ms < 0.85 && p.fill_percent >= 65) {
        bottlenecks.push({
          zone_id: p.zone_id,
          name: p.name,
          type: "slow",
          problem: `Slow-moving area — velocity ${p.avg_speed_ms} m/s at ${p.fill_percent}% fill.`,
          root_cause: rootCauses[whatIfScenario] || rootCauses.default,
          impact: `Throughput degraded. Downstream zones will accumulate within 10–15 minutes.`,
          recommendation: recFor(whatIfScenario)
        });
      }
    });

    // AI Insights Feed
    const insights = [];
    const gateC = predictions.find((p) => p.zone_id === "gate-c");
    const gateD = predictions.find((p) => p.zone_id === "gate-d");
    const north = predictions.find((p) => p.zone_id === "north-concourse");
    const metro = predictions.find((p) => p.zone_id === "metro-station");
    const foodA = predictions.find((p) => p.zone_id === "food-court-a");
    const parking = predictions.find((p) => p.zone_id === "parking-lot-b");
    const washN = predictions.find((p) => p.zone_id === "washrooms-north");

    if (gateC && gateC.fill_percent > 75) {
      insights.push({
        text: `Gate C occupancy has increased ${Math.round(gateC.fill_percent - 60)}% due to metro arrivals and rail platform offloads.`,
        reason: "Meadowlands Rail platform offloads exceed the absorption capacity of ticket scan points. Three concurrent trains increased ingress by 840 persons/minute.",
        severity: gateC.fill_percent > 85 ? "critical" : "high",
        time: "19:14"
      });
    }
    if (gateD && gateD.fill_percent < 45) {
      insights.push({
        text: `Opening Gate D additional lanes will reduce North Concourse congestion by an estimated 24%.`,
        reason: `Gate D currently has ${gateD.capacity - gateD.current_occupancy} available capacity spaces. Activating reserve lanes would absorb North Concourse overflow within 8 minutes.`,
        severity: "info",
        time: "19:16"
      });
    }
    if (north && north.fill_percent > 80) {
      insights.push({
        text: `North Concourse queue times are projected to reach 18 minutes within the next 10 minutes.`,
        reason: "Egress velocity has dropped to 0.3 m/s due to pedestrian compression. At current rate, the 85% safety threshold will be breached in 7 minutes.",
        severity: "high",
        time: "19:17"
      });
    }
    if (foodA && foodA.fill_percent > 60) {
      insights.push({
        text: `Food Court A queue lengths expected to reach 14 minutes. Pre-order digital kiosk activation recommended.`,
        reason: "Halftime arrival surge predictable from historical match data. Food Court A serves 78% of North Stand capacity. Queue model projects 14.2-minute average wait.",
        severity: "medium",
        time: "19:18"
      });
    }
    if (metro && metro.fill_percent > 70) {
      insights.push({
        text: `Metro Station capacity approaching threshold. Activate platform flow control measures.`,
        reason: "Post-match egress will drive metro demand to peak. Station currently at 73% with rapid inflow from North Concourse evacuation routes.",
        severity: "medium",
        time: "19:20"
      });
    }
    if (parking && parking.fill_percent > 75) {
      insights.push({
        text: `Parking Lot B at ${parking.fill_percent}% capacity. Lot C alternative has 1,800+ available spaces.`,
        reason: "Early arrival surge filled Lot B faster than forecast. GPS navigation systems redirecting to Lot B need update to point to Lot C.",
        severity: "info",
        time: "19:12"
      });
    }
    if (washN && washN.fill_percent > 65) {
      insights.push({
        text: `Washrooms North experiencing queue spillover into main concourse corridor.`,
        reason: "Queue spillover detected by sensors 3 and 7. Peak demand at 18:30 was 40% higher than last match due to halftime timing shift.",
        severity: "low",
        time: "19:09"
      });
    }

    if (insights.length === 0) {
      insights.push({
        text: "Stadium pedestrian flow is balanced and operating within safe thresholds across all zones.",
        reason: "Egress velocities across all concourses are stable at 1.3–1.5 m/s. No density anomalies detected.",
        severity: "info",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      });
    }

    // Analytics Charts
    const attendance = inputs.attendance || 78000;
    const analytics = {
      density_trend: {
        labels: ["18:00", "18:15", "18:30", "18:45", "19:00", "19:15", "19:30"],
        values: [28, 38, 52, 67, 78, 82, 75].map(v => Math.round(v * timeMultiplier * 0.9))
      },
      queue_length: {
        labels: predictions.slice(0, 6).map(p => p.name.split(" ")[0]),
        values: predictions.slice(0, 6).map(p => p.queue_depth)
      },
      avg_walking_speed: {
        labels: predictions.slice(0, 6).map(p => p.name.split(" ")[0]),
        values: predictions.slice(0, 6).map(p => p.avg_speed_ms)
      },
      gate_utilization: {
        labels: predictions.filter(p => p.zone_id.includes("gate")).map(p => p.name.replace(" Ingress", "")),
        values: predictions.filter(p => p.zone_id.includes("gate")).map(p => p.fill_percent)
      },
      entry_vs_exit: {
        entry: Math.round(attendance * 0.3 * timeMultiplier),
        exit: Math.round(attendance * 0.1 * timeMultiplier),
        net: Math.round(attendance * 0.2 * timeMultiplier)
      },
      crowd_distribution: {
        labels: predictions.slice(0, 8).map(p => p.name.split(" ")[0]),
        values: predictions.slice(0, 8).map(p => p.current_occupancy)
      },
      peak_hour: {
        labels: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"],
        values: [1200, 2800, 5400, 7800, 8200, 6100, 3400]
      }
    };

    return {
      scenario: whatIfScenario,
      time_multiplier: timeMultiplier,
      predictions,
      bottlenecks,
      insights,
      analytics
    };
  }
}

export const crowdAnalysisRedesign = new CrowdAnalysisRedesign();
export function analyzeCrowdRedesign(inputs, scenario, timeMultiplier) {
  return crowdAnalysisRedesign.analyze(inputs, scenario, timeMultiplier);
}
