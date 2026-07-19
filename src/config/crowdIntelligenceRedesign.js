/* ============================================================
   Crowd Intelligence Redesign — Configuration & Data Model
   ============================================================ */

export const crowdZones = [
  { id: "gate-a", name: "Gate A Ingress", base_occupancy: 2800, capacity: 5000, risk_threshold: 4000, peak_time: "18:45", icon: "🚪" },
  { id: "gate-b", name: "Gate B Ingress", base_occupancy: 1900, capacity: 4000, risk_threshold: 3400, peak_time: "18:55", icon: "🚪" },
  { id: "gate-c", name: "Gate C Ingress", base_occupancy: 4200, capacity: 6000, risk_threshold: 5000, peak_time: "19:15", icon: "🚪" },
  { id: "gate-d", name: "Gate D Ingress", base_occupancy: 1800, capacity: 4500, risk_threshold: 3800, peak_time: "19:00", icon: "🚪" },
  { id: "north-concourse", name: "North Concourse", base_occupancy: 3800, capacity: 5000, risk_threshold: 4500, peak_time: "19:30", icon: "🏟️" },
  { id: "south-concourse", name: "South Concourse", base_occupancy: 2200, capacity: 4500, risk_threshold: 4000, peak_time: "19:10", icon: "🏟️" },
  { id: "east-concourse", name: "East Concourse", base_occupancy: 1400, capacity: 4000, risk_threshold: 3500, peak_time: "18:50", icon: "🏟️" },
  { id: "west-concourse", name: "West Concourse", base_occupancy: 2600, capacity: 4800, risk_threshold: 4200, peak_time: "19:05", icon: "🏟️" },
  { id: "food-court-a", name: "Food Court A", base_occupancy: 1100, capacity: 2000, risk_threshold: 1700, peak_time: "18:40", icon: "🍔" },
  { id: "food-court-b", name: "Food Court B", base_occupancy: 900, capacity: 1800, risk_threshold: 1500, peak_time: "18:35", icon: "🍔" },
  { id: "washrooms-north", name: "Washrooms North", base_occupancy: 280, capacity: 400, risk_threshold: 340, peak_time: "18:30", icon: "🚻" },
  { id: "washrooms-south", name: "Washrooms South", base_occupancy: 220, capacity: 400, risk_threshold: 340, peak_time: "18:38", icon: "🚻" },
  { id: "metro-station", name: "Metro Station", base_occupancy: 3200, capacity: 5500, risk_threshold: 4800, peak_time: "19:45", icon: "🚇" },
  { id: "parking-lot-b", name: "Parking Lot B", base_occupancy: 4100, capacity: 6000, risk_threshold: 5200, peak_time: "18:20", icon: "🅿️" },
  { id: "exit-west", name: "Exit Gates West", base_occupancy: 1600, capacity: 3000, risk_threshold: 2600, peak_time: "20:00", icon: "🚶" },
  { id: "exit-east", name: "Exit Gates East", base_occupancy: 1200, capacity: 3000, risk_threshold: 2600, peak_time: "20:05", icon: "🚶" }
];

export const whatIfScenarios = [
  { id: "default", label: "Normal Operations", description: "Standard telemetry feed without active incidents. All gates operating at baseline capacity." },
  { id: "close-gate-c", label: "Close Gate C", description: "Emergency closure of Gate C. Egress redirects to North/East concourses (+65%/+35% load respectively)." },
  { id: "open-gate-d", label: "Open Gate D Boost", description: "Deploy extra stewards to double throughput at Gate D. Reduces adjacent zone density by ~30%." },
  { id: "heavy-rain", label: "Heavy Rain Event", description: "Reduce pedestrian transit speed by 40%. Covered concourses swell as guests seek shelter." },
  { id: "metro-delay", label: "Metro 15m Delay", description: "Meadowlands Rail halted. Metro station crowds surge; Gate C and Parking Lot B rapidly fill." },
  { id: "medical-emergency", label: "Medical Event at Gate C", description: "Local cordon narrows Gate C corridor by 50%. Emergency teams deploy, creating a 12-min delay ripple." },
  { id: "vip-arrival", label: "VIP Motorcade Arrival", description: "Rolling blockade on West Concourse routes for 8 minutes. West Zone experiences temporary compression." }
];

export const mockSafeRoutes = [
  {
    id: "route-1",
    name: "Gate A → East Concourse Bypass",
    transit_time_min: 6,
    density_pct: 35,
    accessibility_score: 95,
    safety_score: 98,
    reason: "Utilizes ADA sensory corridors and avoids main concourse bottleneck points. Recommended for all mobility-assisted guests.",
    steps: ["Gate A Exit", "Service Tunnel B", "East Ramp Lower", "East Concourse"]
  },
  {
    id: "route-2",
    name: "Gate C → Outer Perimeter Path",
    transit_time_min: 9,
    density_pct: 22,
    accessibility_score: 88,
    safety_score: 94,
    reason: "Redirects guests along outer service roadway, bypassing ticket gate congestion. 24% faster than current main route.",
    steps: ["Gate C", "North Perimeter Walk", "Service Road West", "Metro Link"]
  },
  {
    id: "route-3",
    name: "North Concourse → Metro Express Lane",
    transit_time_min: 4,
    density_pct: 18,
    accessibility_score: 92,
    safety_score: 97,
    reason: "Dedicated express lane through Food Court B underpass. Avoids Washroom North queue spillover. Currently at 18% density.",
    steps: ["North Concourse", "Food Court B Underpass", "Metro Entrance B"]
  }
];

export const flowConnections = [
  { from: "gate-c", to: "north-concourse", strength: 0.9 },
  { from: "gate-a", to: "east-concourse", strength: 0.7 },
  { from: "gate-b", to: "west-concourse", strength: 0.6 },
  { from: "gate-d", to: "south-concourse", strength: 0.5 },
  { from: "north-concourse", to: "food-court-a", strength: 0.4 },
  { from: "east-concourse", to: "food-court-b", strength: 0.3 },
  { from: "food-court-a", to: "washrooms-north", strength: 0.5 },
  { from: "food-court-b", to: "washrooms-south", strength: 0.4 },
  { from: "north-concourse", to: "metro-station", strength: 0.8 },
  { from: "west-concourse", to: "parking-lot-b", strength: 0.6 },
  { from: "south-concourse", to: "exit-west", strength: 0.7 },
  { from: "east-concourse", to: "exit-east", strength: 0.6 }
];
