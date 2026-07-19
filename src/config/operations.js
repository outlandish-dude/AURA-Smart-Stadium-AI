export const environment = {
  appName: "AURA",
  fullName: "AI Unified Reasoning & Operations Assistant",
  tagline: "The AI Operating System for Smart Stadiums",
  eventName: "FIFA World Cup 2026",
  venue: "MetLife Stadium",
  mode: "Event-day production",
  refreshIntervalMs: 2400
};

export const navigationItems = [
  { label: "Command", icon: "C", active: true },
  { label: "Incident", icon: "!", active: false },
  { label: "Crowd", icon: "O", active: false },
  { label: "Transport", icon: "T", active: false },
  { label: "Access", icon: "A", active: false },
  { label: "Sustainability", icon: "S", active: false },
  { label: "Audit", icon: "V", active: false }
];

export const initialDashboardState = {
  tick: 0,
  loadingCharts: true,
  emptyChartKey: null,
  kpis: [
    { id: "risk", label: "Venue Risk", value: 72, suffix: "/100", tone: "warning", trend: "+8 in 12m" },
    { id: "occupancy", label: "Live Occupancy", value: 81, suffix: "%", tone: "stable", trend: "64,420 scanned" },
    { id: "throughput", label: "Gate Throughput", value: 4800, suffix: "/min", tone: "positive", trend: "+12%" },
    { id: "confidence", label: "AI Confidence", value: 91, suffix: "%", tone: "positive", trend: "multi-source" }
  ],
  heatmap: [
    42, 48, 55, 67, 71, 82, 88, 76, 50, 44, 38, 52,
    47, 58, 73, 90, 94, 87, 69, 57, 41, 36, 44, 61,
    39, 46, 62, 79, 85, 92, 96, 84, 63, 49, 37, 33,
    28, 34, 45, 58, 66, 71, 78, 72, 59, 46, 35, 29
  ],
  crowdFlow: [
    { zone: "Gate A", inbound: 1160, outbound: 240, density: 58 },
    { zone: "Gate C", inbound: 1840, outbound: 410, density: 88 },
    { zone: "Gate D", inbound: 980, outbound: 360, density: 62 },
    { zone: "North Concourse", inbound: 1260, outbound: 790, density: 84 }
  ],
  alerts: [
    {
      severity: "Critical",
      title: "North concourse pressure building",
      body: "Projected breach of comfort density unless Gate C ingress is redistributed.",
      eta: 11,
      owner: "Crowd Manager"
    },
    {
      severity: "High",
      title: "Accessible shuttle delay",
      body: "Three mobility requests are close to breaching assistance SLA.",
      eta: 7,
      owner: "Accessibility Coordinator"
    },
    {
      severity: "Medium",
      title: "Waste compactor nearing threshold",
      body: "East food court compactor should be serviced before halftime.",
      eta: 24,
      owner: "Sustainability Manager"
    }
  ],
  weather: {
    temperatureC: 27,
    humidity: 68,
    windKph: 18,
    condition: "Humid, light wind",
    risk: "Medium"
  },
  transportation: [
    { route: "Rail Meadowlands", status: "Surge", delay: 6, capacity: 92 },
    { route: "Lot B Shuttle", status: "Gap", delay: 9, capacity: 78 },
    { route: "Rideshare East", status: "Stable", delay: 2, capacity: 54 }
  ],
  waste: [
    { zone: "East Food Court", fill: 87, contamination: 12, service: "Dispatch" },
    { zone: "North Concourse", fill: 71, contamination: 8, service: "Watch" },
    { zone: "Lower Bowl", fill: 48, contamination: 5, service: "Normal" }
  ],
  accessibility: [
    { area: "Gate A", requests: 7, sla: 96, state: "Healthy" },
    { area: "Gate C", requests: 11, sla: 84, state: "Watch" },
    { area: "Section 220", requests: 4, sla: 98, state: "Healthy" }
  ],
  energy: [
    { system: "HVAC", usage: 1260, load: 74, state: "Elevated" },
    { system: "Lighting", usage: 680, load: 52, state: "Normal" },
    { system: "Concessions", usage: 420, load: 66, state: "Normal" }
  ],
  volunteers: [
    { team: "Delta", available: 12, assigned: 18, zone: "Gate D" },
    { team: "Accessibility Bravo", available: 2, assigned: 8, zone: "East Ramp" },
    { team: "Sustainability Green", available: 6, assigned: 10, zone: "East Food Court" }
  ],
  recommendations: [
    {
      title: "Redistribute Gate C arrivals",
      confidence: 94,
      impact: "Reduce north density below 80% in 15 minutes",
      action: "Deploy Team Delta and route overflow to Gate D."
    },
    {
      title: "Protect accessibility path",
      confidence: 89,
      impact: "Avoid high-priority SLA breach",
      action: "Assign Accessibility Bravo before rerouting crowd flow."
    },
    {
      title: "Service East compactor",
      confidence: 82,
      impact: "Prevent halftime overflow",
      action: "Dispatch Sustainability Green during current low-flow window."
    }
  ],
  timeline: [
    { time: "18:42", title: "Rail arrival spike detected", detail: "Two trains arrived within 4 minutes." },
    { time: "18:45", title: "Density anomaly confirmed", detail: "North concourse exceeded baseline by 23%." },
    { time: "18:47", title: "AURA generated recommendation", detail: "Crowd, transport, and staffing evidence linked." },
    { time: "18:49", title: "Awaiting approval", detail: "Venue operations lead notified." }
  ],
  charts: {
    risk: {
      title: "Risk Trend",
      unit: "/100",
      values: [48, 52, 59, 66, 72, 78, 74, 72]
    },
    flow: {
      title: "Crowd Flow",
      unit: "/min",
      values: [2800, 3300, 4100, 4600, 4800, 4520, 4380, 4210]
    },
    sustainability: {
      title: "Energy Load",
      unit: "%",
      values: [62, 64, 68, 71, 74, 73, 70, 69]
    }
  }
};

export const widgetDecisions = [
  {
    widget: "Live KPIs",
    decision: "Surface the four fastest signals organizers need before drilling into details: risk, occupancy, gate throughput, and AI confidence."
  },
  {
    widget: "Heatmap",
    decision: "Turns abstract density readings into a spatial view so leaders can see where pressure is forming."
  },
  {
    widget: "Crowd Flow",
    decision: "Compares inbound, outbound, and density by zone to reveal whether a crowd issue is caused by arrivals, blocked exits, or slow movement."
  },
  {
    widget: "Alerts",
    decision: "Ranks urgent operational risks by severity and ETA so organizers know what must be handled first."
  },
  {
    widget: "Weather",
    decision: "Shows environmental risk that can affect crowd comfort, transport, and energy demand."
  },
  {
    widget: "Transportation",
    decision: "Connects upstream rail, shuttle, and rideshare pressure to future ingress and egress demand."
  },
  {
    widget: "Waste",
    decision: "Helps sustainability teams dispatch service before overflowing units affect guest movement or cleanliness."
  },
  {
    widget: "Accessibility",
    decision: "Keeps accessibility SLAs visible alongside crowd decisions so rerouting does not degrade inclusive operations."
  },
  {
    widget: "Energy",
    decision: "Tracks system load so operators can reduce peaks without compromising comfort or safety."
  },
  {
    widget: "Volunteer Status",
    decision: "Shows whether the right teams are available near the right zones before a recommendation is approved."
  },
  {
    widget: "Recent AI Recommendations",
    decision: "Presents explainable, confidence-scored actions for human approval instead of conversational AI output."
  },
  {
    widget: "Timeline",
    decision: "Creates an audit-friendly sequence of what happened, what AURA inferred, and what operators reviewed."
  },
  {
    widget: "Charts",
    decision: "Reveals trends and velocity of change so organizers can distinguish a spike from a sustained problem."
  }
];
