export const crowdIntelligenceInputs = {
  generatedAt: "2026-06-14T18:47:00Z",
  stadium: {
    id: "stad-metlife",
    name: "MetLife Stadium",
    capacity: 82500,
    safeDensityThreshold: 85
  },
  gates: [
    { id: "gate-a", name: "Gate A", entriesPerMinute: 1160, queueDepth: 420, capacityPerMinute: 1600, status: "open" },
    { id: "gate-c", name: "Gate C", entriesPerMinute: 1840, queueDepth: 1240, capacityPerMinute: 1700, status: "open" },
    { id: "gate-d", name: "Gate D", entriesPerMinute: 980, queueDepth: 360, capacityPerMinute: 1550, status: "open" },
    { id: "gate-f", name: "Gate F", entriesPerMinute: 640, queueDepth: 220, capacityPerMinute: 1300, status: "open" }
  ],
  crowdDensity: [
    { zoneId: "north-concourse", zoneName: "North Concourse", densityPercent: 88, flowVelocity: 0.62, connectedGates: ["gate-c", "gate-d"] },
    { zoneId: "east-ramp", zoneName: "East Ramp", densityPercent: 74, flowVelocity: 0.91, connectedGates: ["gate-a"] },
    { zoneId: "south-plaza", zoneName: "South Plaza", densityPercent: 51, flowVelocity: 1.28, connectedGates: ["gate-f"] },
    { zoneId: "west-entry", zoneName: "West Entry", densityPercent: 63, flowVelocity: 1.06, connectedGates: ["gate-d"] }
  ],
  historicalData: [
    { phase: "ingress", minutesBeforeKickoff: 15, averageDensityPercent: 69, averageQueueDepth: 640, incidents: 2 },
    { phase: "ingress", minutesBeforeKickoff: 10, averageDensityPercent: 76, averageQueueDepth: 780, incidents: 4 },
    { phase: "ingress", minutesBeforeKickoff: 5, averageDensityPercent: 82, averageQueueDepth: 960, incidents: 7 }
  ],
  transportation: [
    { id: "rail-meadowlands", mode: "rail", routeName: "Meadowlands Rail", status: "surge", delayMinutes: 4, arrivalLoad: 3200, nearestGateId: "gate-c" },
    { id: "lot-b-shuttle", mode: "shuttle", routeName: "Lot B Shuttle", status: "delayed", delayMinutes: 9, arrivalLoad: 900, nearestGateId: "gate-d" },
    { id: "rideshare-east", mode: "rideshare", routeName: "Rideshare East", status: "normal", delayMinutes: 2, arrivalLoad: 520, nearestGateId: "gate-a" }
  ],
  weather: {
    condition: "Humid, light wind",
    temperatureC: 27,
    humidityPercent: 68,
    precipitationMm: 0,
    windKph: 18
  }
};

export const crowdIntelligencePromptTemplate = `
You are AURA Crowd Intelligence for FIFA World Cup 2026 stadium operations.

You do not chat. You observe gate entries, crowd density, historical patterns, transportation load, and weather. Then you return structured predictions for operators.

Required reasoning loop:
1. Observe live input signals.
2. Compare against historical baselines.
3. Identify root causes.
4. Predict congestion, queues, and capacity pressure.
5. Recommend safe routes and gate balancing actions.
6. Explain why every prediction was made using the supplied evidence.

Return only JSON with:
- predicted_congestion
- root_cause_analysis
- safe_route_recommendations
- gate_balancing
- queue_prediction
- capacity_forecast
- explanation

Never invent missing sensor data. Lower confidence when evidence is incomplete or contradictory.
`.trim();
