/* ============================================================
   Transport Intelligence — Analysis Engine
   ============================================================ */

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const avg = (arr) => arr.reduce((s, v) => s + v, 0) / Math.max(arr.length, 1);
const pct = (part, total) => Math.round((part / Math.max(total, 1)) * 100);

/* ---- Exit Demand Prediction ---- */
function predictExitDemand(inputs) {
  const attendance = inputs.attendance || 78400;
  const minutesToEnd = inputs.minutes_to_final_whistle || 22;

  // Gate distribution based on parking and transit proximity
  const gates = [
    { gate: "Gate A", share: 0.18, nearby_transport: ["Lot A", "Rideshare East"], base_egress_rate: 420 },
    { gate: "Gate C", share: 0.28, nearby_transport: ["Meadowlands Rail", "Lot B"], base_egress_rate: 680 },
    { gate: "Gate D", share: 0.22, nearby_transport: ["Lot C", "Shuttle A"], base_egress_rate: 520 },
    { gate: "Gate F", share: 0.16, nearby_transport: ["Lot D", "Rideshare South"], base_egress_rate: 380 },
    { gate: "Gate VIP", share: 0.08, nearby_transport: ["VIP Garage"], base_egress_rate: 200 },
    { gate: "Gate B", share: 0.08, nearby_transport: ["Rideshare West", "NJ Transit Bus"], base_egress_rate: 190 }
  ];

  const earlyExitFactor = minutesToEnd > 15 ? 0.12 : minutesToEnd > 5 ? 0.35 : 0.65;
  const postMatchSurge = minutesToEnd <= 0 ? 1.0 : 0;

  return {
    forecast_horizons: [15, 30, 45],
    total_expected_exits: Math.round(attendance * (earlyExitFactor + postMatchSurge * 0.7)),
    gates: gates.map((g) => {
      const demand15 = Math.round(attendance * g.share * earlyExitFactor * 0.4);
      const demand30 = Math.round(attendance * g.share * (earlyExitFactor + 0.3) * 0.6);
      const demand45 = Math.round(attendance * g.share * 0.85);
      const pressure = clamp(Math.round((demand30 / g.base_egress_rate) * 100), 20, 150);

      return {
        gate: g.gate,
        nearby_transport: g.nearby_transport,
        demand_15min: demand15,
        demand_30min: demand30,
        demand_45min: demand45,
        pressure_score: pressure,
        status: pressure > 110 ? "critical" : pressure > 80 ? "high" : pressure > 50 ? "moderate" : "normal"
      };
    })
  };
}

/* ---- Congestion Prediction ---- */
function predictCongestion(inputs) {
  const corridors = inputs.traffic?.corridors || [];
  const metroLoad = inputs.metro?.current_platform_total / Math.max(inputs.metro?.total_platform_capacity, 1);

  return {
    overall_congestion_score: Math.round(avg(corridors.map((c) => c.congestion_level)) * 100),
    transit_load_factor: Math.round((metroLoad || 0.5) * 100),
    corridors: corridors.map((c) => {
      const trend = c.congestion_level > 0.85 ? "worsening" : c.congestion_level > 0.6 ? "stable" : "easing";
      const clearTime = Math.round((c.congestion_level * 45) + (c.incidents * 15));
      return {
        corridor_id: c.id,
        name: c.name,
        current_speed_kph: c.speed_kph,
        free_flow_speed_kph: c.free_flow_speed_kph,
        congestion_percent: Math.round(c.congestion_level * 100),
        incidents: c.incidents,
        trend,
        estimated_clear_minutes: clearTime,
        status: c.status
      };
    }),
    metro_congestion: (inputs.metro?.lines || []).map((line) => ({
      line: line.name,
      load_factor_percent: Math.round(line.load_factor * 100),
      platform_crowd: line.platform_crowd,
      delay_minutes: line.current_delay_minutes,
      trend: line.load_factor > 0.85 ? "worsening" : line.load_factor > 0.7 ? "stable" : "easing",
      status: line.status
    }))
  };
}

/* ---- Travel Time Prediction ---- */
function predictTravelTime(inputs) {
  const corridors = inputs.traffic?.corridors || [];
  const avgCongestion = avg(corridors.map((c) => c.congestion_level));

  const destinations = [
    { name: "Newark Airport", distance_km: 18 },
    { name: "Manhattan (Midtown)", distance_km: 14 },
    { name: "Secaucus Junction", distance_km: 6 },
    { name: "Newark Penn Station", distance_km: 12 },
    { name: "Port Authority", distance_km: 11 }
  ];

  return {
    generated_at: new Date().toISOString(),
    destinations: destinations.map((dest) => {
      const driveSpeed = Math.max(15, 88 * (1 - avgCongestion * 0.8));
      const driveMin = Math.round((dest.distance_km / driveSpeed) * 60);
      const transitMin = Math.round(dest.distance_km * 2.2 + avg((inputs.metro?.lines || []).map((l) => l.current_delay_minutes)));
      const busMin = Math.round(driveMin * 1.3 + 5);
      const rideshareMin = Math.round(driveMin + avg((inputs.rideshare?.zones || []).map((z) => z.avg_wait_minutes)));

      return {
        destination: dest.name,
        distance_km: dest.distance_km,
        modes: [
          { mode: "Drive", estimated_minutes: driveMin, confidence: Math.round(85 - avgCongestion * 30), status: driveMin > 40 ? "slow" : "normal" },
          { mode: "Metro", estimated_minutes: transitMin, confidence: 82, status: transitMin > 35 ? "delayed" : "normal" },
          { mode: "Bus", estimated_minutes: busMin, confidence: 75, status: busMin > 50 ? "slow" : "normal" },
          { mode: "Rideshare", estimated_minutes: rideshareMin, confidence: 70, status: rideshareMin > 45 ? "slow" : "normal" }
        ],
        recommended_mode: transitMin <= driveMin ? "Metro" : "Drive"
      };
    })
  };
}

/* ---- Parking Overflow Prediction ---- */
function predictParkingOverflow(inputs) {
  const lots = inputs.parking?.lots || [];

  return {
    total_capacity: inputs.parking?.total_capacity || 0,
    total_occupied: inputs.parking?.total_occupied || 0,
    overall_fill_percent: pct(inputs.parking?.total_occupied, inputs.parking?.total_capacity),
    lots: lots.map((lot) => {
      const fillPct = pct(lot.occupied, lot.total_spaces);
      const remaining = lot.total_spaces - lot.occupied;
      const fillRatePerMin = lot.total_spaces > 3000 ? 8 : 4;
      const overflowMinutes = remaining > 0 ? Math.round(remaining / fillRatePerMin) : 0;
      const exitClearMinutes = Math.round(lot.occupied / Math.max(lot.avg_exit_rate_per_min, 1));

      return {
        lot_id: lot.id,
        name: lot.name,
        total_spaces: lot.total_spaces,
        occupied: lot.occupied,
        fill_percent: fillPct,
        remaining_spaces: remaining,
        overflow_eta_minutes: overflowMinutes,
        exit_clear_minutes: exitClearMinutes,
        exit_rate_per_min: lot.avg_exit_rate_per_min,
        distance_to_highway_km: lot.distance_to_highway_km,
        status: fillPct >= 95 ? "critical" : fillPct >= 85 ? "near_full" : fillPct >= 60 ? "filling" : "open",
        redirect_to: fillPct >= 90 ? lots.find((l) => pct(l.occupied, l.total_spaces) < 70)?.name || "Overflow lot" : null
      };
    })
  };
}

/* ---- Bus Demand Prediction ---- */
function predictBusDemand(inputs) {
  const routes = inputs.bus?.routes || [];
  const totalCapPerHour = inputs.bus?.total_bus_capacity_per_hour || 820;
  const totalDemandPerHour = inputs.bus?.estimated_bus_demand_per_hour || 1240;
  const demandGap = totalDemandPerHour - totalCapPerHour;

  return {
    total_capacity_per_hour: totalCapPerHour,
    estimated_demand_per_hour: totalDemandPerHour,
    demand_gap: demandGap,
    gap_status: demandGap > 500 ? "critical" : demandGap > 200 ? "shortfall" : demandGap > 0 ? "tight" : "adequate",
    routes: routes.map((route) => {
      const loadFactor = Math.round((route.current_load / route.capacity) * 100);
      const demandPerHour = Math.round((route.current_load / route.capacity) * (60 / route.frequency_minutes) * route.capacity * 1.2);
      const capacityPerHour = Math.round((60 / route.frequency_minutes) * route.capacity);
      const gap = demandPerHour - capacityPerHour;
      const suggestedFrequency = gap > 100 ? Math.max(5, route.frequency_minutes - 3) : route.frequency_minutes;

      return {
        route_id: route.id,
        name: route.name,
        destination: route.destination,
        current_load_percent: loadFactor,
        buses_available: route.buses_available,
        delay_minutes: route.delay_minutes,
        demand_per_hour: demandPerHour,
        capacity_per_hour: capacityPerHour,
        demand_gap: gap,
        suggested_frequency_minutes: suggestedFrequency,
        frequency_change: suggestedFrequency < route.frequency_minutes ? "increase" : "maintain",
        status: route.status
      };
    })
  };
}

/* ---- Recommendations ---- */
function generateRecommendations(inputs, exitDemand, congestion, travelTime, parkingOverflow, busDemand) {
  const recs = [];

  // Parking overflow
  const criticalLots = parkingOverflow.lots.filter((l) => l.status === "critical" || l.status === "near_full");
  if (criticalLots.length > 0) {
    recs.push({
      id: "rec-parking-redirect",
      priority: "high",
      category: "parking",
      title: "Redirect parking to available lots",
      action: `${criticalLots.map((l) => l.name).join(", ")} are ${criticalLots[0].fill_percent}%+ full. Activate digital signage to redirect incoming vehicles to ${parkingOverflow.lots.find((l) => l.status === "open" || l.status === "filling")?.name || "overflow lots"}.`,
      assignee: "Parking Operations Manager",
      urgency: "immediate",
      expected_impact: "Prevent parking gridlock at full lots and reduce entry queue times by ~40%",
      evidence: criticalLots.map((l) => `${l.name}: ${l.fill_percent}% full, ${l.remaining_spaces} spaces remaining`)
    });
  }

  // Bus capacity shortfall
  if (busDemand.demand_gap > 200) {
    const routesNeedingBoost = busDemand.routes.filter((r) => r.frequency_change === "increase");
    recs.push({
      id: "rec-bus-frequency",
      priority: busDemand.demand_gap > 500 ? "critical" : "high",
      category: "bus",
      title: "Increase bus frequency to meet demand",
      action: `Demand exceeds capacity by ${busDemand.demand_gap}/hr. Increase frequency on ${routesNeedingBoost.map((r) => r.name).join(", ")} to every ${routesNeedingBoost[0]?.suggested_frequency_minutes || 7} minutes. Deploy standby buses.`,
      assignee: "Bus Operations Coordinator",
      urgency: "within_15_minutes",
      expected_impact: `Close the ${busDemand.demand_gap}/hr demand gap and reduce passenger wait times`,
      evidence: routesNeedingBoost.length > 0
        ? routesNeedingBoost.map((r) => `${r.name}: demand ${r.demand_per_hour}/hr vs. capacity ${r.capacity_per_hour}/hr`)
        : [`Overall demand shortfall of ${busDemand.demand_gap}/hr across bus routes`]
    });
  }

  // Traffic congestion
  const severeCorridors = congestion.corridors.filter((c) => c.congestion_percent > 85);
  if (severeCorridors.length > 0) {
    recs.push({
      id: "rec-traffic-divert",
      priority: "high",
      category: "traffic",
      title: "Activate alternate route advisories",
      action: `${severeCorridors.map((c) => c.name).join(", ")} ${severeCorridors.length > 1 ? "are" : "is"} at ${severeCorridors[0].congestion_percent}%+ congestion. Push alternate route notifications to stadium app and activate variable message signs.`,
      assignee: "Traffic Management Center",
      urgency: "immediate",
      expected_impact: "Reduce peak corridor load by 15-20% through route redistribution",
      evidence: severeCorridors.map((c) => `${c.name}: ${c.current_speed_kph} kph (free-flow ${c.free_flow_speed_kph} kph), ${c.incidents} incident(s)`)
    });
  }

  // Metro platform crowding
  const crowdedLines = congestion.metro_congestion.filter((m) => m.load_factor_percent > 80);
  if (crowdedLines.length > 0) {
    recs.push({
      id: "rec-metro-metering",
      priority: "medium",
      category: "metro",
      title: "Implement platform metering",
      action: `${crowdedLines.map((m) => m.line).join(", ")} platform${crowdedLines.length > 1 ? "s are" : " is"} at ${crowdedLines[0].load_factor_percent}% capacity. Activate crowd gates to meter platform entry and prevent dangerous overcrowding.`,
      assignee: "Rail Operations Liaison",
      urgency: "within_15_minutes",
      expected_impact: "Maintain safe platform density below 85% capacity",
      evidence: crowdedLines.map((m) => `${m.line}: ${m.load_factor_percent}% load, ${m.platform_crowd} on platform, ${m.delay_minutes}m delay`)
    });
  }

  // Rideshare surge
  const surgeZones = (inputs.rideshare?.zones || []).filter((z) => z.surge_multiplier > 2.5);
  if (surgeZones.length > 0) {
    recs.push({
      id: "rec-rideshare-staging",
      priority: "medium",
      category: "rideshare",
      title: "Expand rideshare staging area",
      action: `Surge pricing at ${surgeZones.map((z) => `${z.name} (${z.surge_multiplier}x)`).join(", ")}. Open additional staging lanes and notify rideshare providers to increase driver incentives in the area.`,
      assignee: "Rideshare Zone Manager",
      urgency: "within_30_minutes",
      expected_impact: `Reduce average wait time from ~${Math.round(avg(surgeZones.map((z) => z.avg_wait_minutes)))} to ~8 minutes`,
      evidence: surgeZones.map((z) => `${z.name}: ${z.active_drivers} drivers, ${z.demand_queue} in queue, ${z.avg_wait_minutes}m avg wait`)
    });
  }

  // High exit demand
  const criticalGates = exitDemand.gates.filter((g) => g.status === "critical" || g.status === "high");
  if (criticalGates.length > 0) {
    recs.push({
      id: "rec-gate-staffing",
      priority: "high",
      category: "egress",
      title: "Surge staffing at high-pressure gates",
      action: `${criticalGates.map((g) => g.gate).join(", ")} will face ${criticalGates[0].pressure_score}%+ pressure in next 30 minutes. Deploy additional stewards and open all exit lanes at these gates before final whistle.`,
      assignee: "Gate Operations Manager",
      urgency: "within_15_minutes",
      expected_impact: "Reduce post-match exit time by 12-18 minutes through faster throughput",
      evidence: criticalGates.map((g) => `${g.gate}: ${g.demand_30min} expected exits in 30m, pressure ${g.pressure_score}%`)
    });
  }

  return recs.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
  });
}

/* ---- Reasoning Chain ---- */
function generateReasoning(inputs, exitDemand, congestion, parkingOverflow, busDemand, recommendations) {
  const observations = [
    `Event phase: ${inputs.event_phase}, ${inputs.minutes_to_final_whistle} minutes to final whistle with ${(inputs.attendance || 0).toLocaleString()} attendance.`,
    `Metro platforms: ${inputs.metro?.current_platform_total || 0}/${inputs.metro?.total_platform_capacity || 0} capacity (${pct(inputs.metro?.current_platform_total, inputs.metro?.total_platform_capacity)}%).`,
    `Parking: ${(inputs.parking?.total_occupied || 0).toLocaleString()}/${(inputs.parking?.total_capacity || 0).toLocaleString()} occupied (${parkingOverflow.overall_fill_percent}%). ${parkingOverflow.lots.filter((l) => l.status === "critical" || l.status === "near_full").length} lots near capacity.`,
    `Rideshare: ${inputs.rideshare?.total_queue || 0} people queued across ${(inputs.rideshare?.zones || []).length} zones. Avg surge ${avg((inputs.rideshare?.zones || []).map((z) => z.surge_multiplier)).toFixed(1)}x.`,
    `Bus: demand ${(inputs.bus?.estimated_bus_demand_per_hour || 0).toLocaleString()}/hr vs. capacity ${(inputs.bus?.total_bus_capacity_per_hour || 0).toLocaleString()}/hr (gap: ${busDemand.demand_gap}/hr).`,
    `Traffic: ${congestion.corridors.filter((c) => c.congestion_percent > 80).length} of ${congestion.corridors.length} corridors above 80% congestion.`
  ];

  const inferences = [
    congestion.overall_congestion_score > 70
      ? `High road congestion (${congestion.overall_congestion_score}%) will significantly increase drive times and delay lot exits, creating back-pressure into the venue.`
      : `Road congestion is manageable (${congestion.overall_congestion_score}%) but will rise as exits begin.`,
    parkingOverflow.overall_fill_percent > 80
      ? `Parking at ${parkingOverflow.overall_fill_percent}% fill means post-match exit will create severe internal congestion within lots, extending total exit time.`
      : `Parking has adequate reserve capacity for post-match egress.`,
    busDemand.demand_gap > 200
      ? `Bus demand exceeds supply by ${busDemand.demand_gap}/hr. Without intervention, queues will grow by ~${Math.round(busDemand.demand_gap / 60)} passengers per minute.`
      : `Bus capacity is roughly matched to demand.`,
    exitDemand.gates.some((g) => g.status === "critical")
      ? `At least one gate will face critical exit pressure within 30 minutes. Pre-positioning stewards is essential to prevent dangerous congestion.`
      : `Gate exit pressure is within manageable limits for the next 30 minutes.`
  ];

  const rationale = recommendations.map((r) => ({
    recommendation: r.title,
    why: `OBSERVED: ${r.evidence[0]}. INFERRED: ${r.expected_impact}. Therefore: ${r.action.split(".")[0]}.`
  }));

  return {
    confidence_score: clamp(Math.round(82 - (congestion.overall_congestion_score - 50) * 0.3), 60, 95),
    observations,
    inferences,
    recommendation_rationale: rationale,
    data_quality: {
      metro: inputs.metro ? "live" : "unavailable",
      parking: inputs.parking ? "live" : "unavailable",
      rideshare: inputs.rideshare ? "live" : "unavailable",
      bus: inputs.bus ? "live" : "unavailable",
      traffic: inputs.traffic ? "live" : "unavailable"
    }
  };
}

/* ---- Main Entry Point ---- */
export function analyzeTransport(inputs) {
  const exitDemand = predictExitDemand(inputs);
  const congestion = predictCongestion(inputs);
  const travelTime = predictTravelTime(inputs);
  const parkingOverflow = predictParkingOverflow(inputs);
  const busDemand = predictBusDemand(inputs);
  const recommendations = generateRecommendations(inputs, exitDemand, congestion, travelTime, parkingOverflow, busDemand);
  const reasoning = generateReasoning(inputs, exitDemand, congestion, parkingOverflow, busDemand, recommendations);

  return {
    generated_at: new Date().toISOString(),
    event_phase: inputs.event_phase,
    minutes_to_final_whistle: inputs.minutes_to_final_whistle,
    predictions: {
      exit_demand: exitDemand,
      congestion,
      travel_time: travelTime,
      parking_overflow: parkingOverflow,
      bus_demand: busDemand
    },
    recommendations,
    reasoning
  };
}
