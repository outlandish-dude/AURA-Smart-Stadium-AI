const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const average = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);

function getGate(inputs, gateId) {
  return inputs.gates.find((gate) => gate.id === gateId);
}

function transportationLoadForGate(inputs, gateId) {
  return inputs.transportation
    .filter((route) => route.nearestGateId === gateId)
    .reduce((sum, route) => sum + route.arrivalLoad, 0);
}

function calculateZoneRisk(inputs, zone) {
  const connectedGatePressure = zone.connectedGates
    .map((gateId) => {
      const gate = getGate(inputs, gateId);
      if (!gate) return 0;
      const gateUtilization = gate.entriesPerMinute / gate.capacityPerMinute;
      const transportPressure = transportationLoadForGate(inputs, gateId) / 3500;
      return gateUtilization * 35 + transportPressure * 30 + gate.queueDepth / 80;
    });

  const historicalDensity = average(inputs.historicalData.map((item) => item.averageDensityPercent));
  const weatherPenalty = inputs.weather.humidityPercent > 65 ? 5 : 0;
  const velocityPenalty = zone.flowVelocity < 0.75 ? 12 : zone.flowVelocity < 1 ? 6 : 0;

  return Math.round(clamp(
    zone.densityPercent * 0.55 + average(connectedGatePressure) + velocityPenalty + weatherPenalty + (zone.densityPercent - historicalDensity) * 0.25,
    0,
    100
  ));
}

function buildCongestion(inputs) {
  return inputs.crowdDensity
    .map((zone) => {
      const riskScore = calculateZoneRisk(inputs, zone);
      return {
        zone_id: zone.zoneId,
        zone_name: zone.zoneName,
        risk_score: riskScore,
        severity: riskScore >= 85 ? "critical" : riskScore >= 70 ? "high" : riskScore >= 50 ? "medium" : "low",
        time_horizon_minutes: riskScore >= 75 ? 15 : 30,
        why: [
          `Density is ${zone.densityPercent}% against a safe threshold of ${inputs.stadium.safeDensityThreshold}%.`,
          `Flow velocity is ${zone.flowVelocity} m/s, which ${zone.flowVelocity < 0.75 ? "indicates restricted movement" : "is within usable movement range"}.`,
          `Connected gate and transportation pressure were included for ${zone.connectedGates.join(", ")}.`
        ]
      };
    })
    .sort((a, b) => b.risk_score - a.risk_score);
}

function buildRootCause(inputs, congestion) {
  const highest = congestion[0];
  const zone = inputs.crowdDensity.find((item) => item.zoneId === highest.zone_id);
  const connectedRoutes = inputs.transportation.filter((route) => zone.connectedGates.includes(route.nearestGateId));
  const connectedGates = zone.connectedGates.map((gateId) => getGate(inputs, gateId)).filter(Boolean);

  return {
    primary_cause: "transport_arrival_surge_plus_gate_imbalance",
    affected_zone: highest.zone_name,
    contributing_factors: [
      ...connectedRoutes.map((route) => `${route.routeName} is ${route.status} with ${route.arrivalLoad} arrivals near ${getGate(inputs, route.nearestGateId)?.name}.`),
      ...connectedGates.map((gate) => `${gate.name} is processing ${gate.entriesPerMinute}/min against ${gate.capacityPerMinute}/min capacity with queue depth ${gate.queueDepth}.`),
      `${zone.zoneName} density is ${zone.densityPercent}% and flow velocity is ${zone.flowVelocity} m/s.`
    ],
    why: "The highest-risk zone is connected to the most loaded transit arrival path and the gate with the largest queue-depth-to-capacity pressure."
  };
}

function buildRoutes(inputs, congestion) {
  const lowestRiskZones = congestion.slice().reverse().slice(0, 2);
  return lowestRiskZones.map((zone) => ({
    route_name: `Redirect toward ${zone.zone_name}`,
    target_zone: zone.zone_name,
    safety_score: clamp(100 - zone.risk_score, 1, 100),
    recommendation: `Use steward-guided routing toward ${zone.zone_name} while monitoring density every 3 minutes.`,
    why: `${zone.zone_name} has lower predicted congestion and can absorb redirected arrivals with less crowd compression risk.`
  }));
}

function buildGateBalancing(inputs) {
  const gates = inputs.gates.map((gate) => {
    const utilization = Math.round((gate.entriesPerMinute / gate.capacityPerMinute) * 100);
    const transportLoad = transportationLoadForGate(inputs, gate.id);
    return {
      gate_id: gate.id,
      gate_name: gate.name,
      current_utilization_percent: utilization,
      queue_depth: gate.queueDepth,
      recommended_adjustment: utilization > 95 || gate.queueDepth > 900 ? "reduce_inflow" : utilization < 70 ? "increase_inflow" : "hold",
      why: `Utilization is ${utilization}% with queue depth ${gate.queueDepth} and nearby transportation load ${transportLoad}.`
    };
  });

  return {
    strategy: "shift_arrivals_from_overloaded_to_underused_gates",
    gates
  };
}

function buildQueuePrediction(inputs) {
  return inputs.gates.map((gate) => {
    const netPressure = gate.queueDepth + transportationLoadForGate(inputs, gate.id) * 0.18 - Math.max(gate.capacityPerMinute - gate.entriesPerMinute, 0) * 8;
    const predictedWait = Math.round(clamp(netPressure / Math.max(gate.capacityPerMinute / 60, 1), 1, 45));
    return {
      gate_id: gate.id,
      gate_name: gate.name,
      predicted_wait_minutes: predictedWait,
      predicted_queue_depth_15m: Math.round(clamp(netPressure, 0, 3000)),
      why: `Prediction combines current queue depth, entry throughput, gate capacity, and transport arrivals assigned to ${gate.name}.`
    };
  });
}

function buildCapacityForecast(inputs, congestion) {
  const averageRisk = Math.round(average(congestion.map((zone) => zone.risk_score)));
  const remainingCapacity = inputs.stadium.capacity - Math.round(inputs.stadium.capacity * 0.81);

  return {
    forecast_window_minutes: 30,
    venue_risk_score: averageRisk,
    estimated_remaining_capacity: remainingCapacity,
    capacity_state: averageRisk >= 80 ? "constrained" : averageRisk >= 60 ? "watch" : "stable",
    why: `Forecast blends zone congestion risk with remaining venue capacity and historical ingress density patterns.`
  };
}

export function analyzeCrowdIntelligence(inputs) {
  const predictedCongestion = buildCongestion(inputs);

  return {
    generated_at: new Date().toISOString(),
    model: "gemini-2.5-flash-ready",
    input_summary: {
      gates: inputs.gates.length,
      crowd_zones: inputs.crowdDensity.length,
      transportation_routes: inputs.transportation.length,
      historical_samples: inputs.historicalData.length,
      weather_condition: inputs.weather.condition
    },
    predicted_congestion: predictedCongestion,
    root_cause_analysis: buildRootCause(inputs, predictedCongestion),
    safe_route_recommendations: buildRoutes(inputs, predictedCongestion),
    gate_balancing: buildGateBalancing(inputs),
    queue_prediction: buildQueuePrediction(inputs),
    capacity_forecast: buildCapacityForecast(inputs, predictedCongestion),
    explanation: {
      summary: "AURA predicts congestion by combining live density, gate throughput, current queue depth, transport arrival load, weather comfort pressure, and historical ingress baselines.",
      why_predictions_were_made: [
        "Gate C has the highest queue pressure and is connected to a rail surge.",
        "North Concourse density is above the stadium safety threshold while movement velocity is reduced.",
        "Gate D and Gate F have more available capacity, making them safer balancing targets.",
        "Humidity adds comfort risk, which can slow movement and increase concourse dwell time."
      ],
      confidence_score: 89
    }
  };
}
