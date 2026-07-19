/* ============================================================
   Transport Intelligence — Configuration & Data Model
   ============================================================ */

export const transportModes = [
  {
    id: "metro",
    label: "Metro",
    icon: "🚇",
    color: "#57a8ff",
    description: "Rail and subway lines serving the stadium with real-time capacity and delay tracking."
  },
  {
    id: "parking",
    label: "Parking",
    icon: "🅿️",
    color: "#a98bff",
    description: "Stadium parking lots with live occupancy, fill rates, and overflow predictions."
  },
  {
    id: "rideshare",
    label: "Ride Share",
    icon: "🚗",
    color: "#50e3f2",
    description: "Rideshare pickup and dropoff zones with surge pricing, wait times, and demand."
  },
  {
    id: "bus",
    label: "Bus",
    icon: "🚌",
    color: "#55d58a",
    description: "Shuttle and bus routes with frequency, load factors, and demand forecasting."
  },
  {
    id: "traffic",
    label: "Traffic",
    icon: "🚦",
    color: "#ffca5f",
    description: "Road traffic corridors with speed, congestion levels, and incident detection."
  }
];

export const predictionTypes = [
  { id: "exit_demand", label: "Exit Demand", icon: "🚪", description: "Per-gate egress pressure forecast" },
  { id: "congestion", label: "Congestion", icon: "🔴", description: "Road and transit congestion scores" },
  { id: "travel_time", label: "Travel Time", icon: "⏱️", description: "Mode-by-mode travel estimates" },
  { id: "parking_overflow", label: "Parking Overflow", icon: "🅿️", description: "Lot fill prediction and redirects" },
  { id: "bus_demand", label: "Bus Demand", icon: "🚌", description: "Ridership vs. capacity forecast" }
];

export const transportInputs = {
  generated_at: new Date().toISOString(),
  event_phase: "second_half",
  minutes_to_final_whistle: 22,
  attendance: 78400,
  venue: "MetLife Stadium",

  metro: {
    lines: [
      { id: "meadowlands-rail", name: "Meadowlands Rail", direction: "outbound", capacity_per_train: 1200, frequency_minutes: 8, current_delay_minutes: 3, load_factor: 0.88, platform_crowd: 640, next_train_minutes: 5, status: "surge" },
      { id: "nj-transit-a", name: "NJ Transit Line A", direction: "outbound", capacity_per_train: 900, frequency_minutes: 12, current_delay_minutes: 0, load_factor: 0.62, platform_crowd: 280, next_train_minutes: 7, status: "normal" },
      { id: "nj-transit-b", name: "NJ Transit Line B", direction: "outbound", capacity_per_train: 900, frequency_minutes: 15, current_delay_minutes: 6, load_factor: 0.74, platform_crowd: 420, next_train_minutes: 11, status: "delayed" }
    ],
    total_platform_capacity: 2800,
    current_platform_total: 1340
  },

  parking: {
    lots: [
      { id: "lot-a", name: "Lot A (Premium)", total_spaces: 2800, occupied: 2650, reserved_exits: 4, avg_exit_rate_per_min: 42, status: "near_full", distance_to_highway_km: 0.8 },
      { id: "lot-b", name: "Lot B (General)", total_spaces: 4200, occupied: 3920, reserved_exits: 6, avg_exit_rate_per_min: 55, status: "near_full", distance_to_highway_km: 1.2 },
      { id: "lot-c", name: "Lot C (Economy)", total_spaces: 3600, occupied: 2880, reserved_exits: 3, avg_exit_rate_per_min: 38, status: "filling", distance_to_highway_km: 1.8 },
      { id: "lot-d", name: "Lot D (Overflow)", total_spaces: 2400, occupied: 960, reserved_exits: 2, avg_exit_rate_per_min: 28, status: "open", distance_to_highway_km: 2.4 },
      { id: "lot-vip", name: "VIP Garage", total_spaces: 600, occupied: 580, reserved_exits: 2, avg_exit_rate_per_min: 25, status: "near_full", distance_to_highway_km: 0.4 }
    ],
    total_capacity: 13600,
    total_occupied: 10990
  },

  rideshare: {
    zones: [
      { id: "rs-east", name: "East Pickup", active_drivers: 85, avg_wait_minutes: 8, surge_multiplier: 2.4, demand_queue: 320, capacity_per_hour: 480, status: "surge" },
      { id: "rs-west", name: "West Pickup", active_drivers: 42, avg_wait_minutes: 14, surge_multiplier: 3.1, demand_queue: 210, capacity_per_hour: 280, status: "high_demand" },
      { id: "rs-south", name: "South Pickup", active_drivers: 28, avg_wait_minutes: 18, surge_multiplier: 2.8, demand_queue: 140, capacity_per_hour: 180, status: "high_demand" }
    ],
    total_active_drivers: 155,
    total_queue: 670
  },

  bus: {
    routes: [
      { id: "shuttle-a", name: "Stadium Shuttle A", destination: "Secaucus Junction", capacity: 55, frequency_minutes: 10, current_load: 48, buses_available: 8, delay_minutes: 2, status: "active" },
      { id: "shuttle-b", name: "Stadium Shuttle B", destination: "Newark Penn", capacity: 55, frequency_minutes: 12, current_load: 52, buses_available: 6, delay_minutes: 5, status: "delayed" },
      { id: "nj-transit-bus", name: "NJ Transit 160", destination: "Port Authority", capacity: 45, frequency_minutes: 20, current_load: 38, buses_available: 4, delay_minutes: 0, status: "active" },
      { id: "charter-express", name: "Charter Express", destination: "Newark Airport", capacity: 50, frequency_minutes: 30, current_load: 44, buses_available: 3, delay_minutes: 8, status: "delayed" }
    ],
    total_bus_capacity_per_hour: 820,
    estimated_bus_demand_per_hour: 1240
  },

  traffic: {
    corridors: [
      { id: "rt-3-east", name: "Route 3 Eastbound", speed_kph: 18, free_flow_speed_kph: 88, congestion_level: 0.92, incidents: 1, lanes: 3, volume_per_hour: 4200, status: "severe" },
      { id: "rt-3-west", name: "Route 3 Westbound", speed_kph: 52, free_flow_speed_kph: 88, congestion_level: 0.41, incidents: 0, lanes: 3, volume_per_hour: 2800, status: "moderate" },
      { id: "tpk-south", name: "NJ Turnpike South", speed_kph: 35, free_flow_speed_kph: 105, congestion_level: 0.72, incidents: 0, lanes: 4, volume_per_hour: 5600, status: "heavy" },
      { id: "tpk-north", name: "NJ Turnpike North", speed_kph: 44, free_flow_speed_kph: 105, congestion_level: 0.58, incidents: 0, lanes: 4, volume_per_hour: 4800, status: "moderate" },
      { id: "local-berry", name: "Berry's Creek Rd", speed_kph: 12, free_flow_speed_kph: 48, congestion_level: 0.95, incidents: 2, lanes: 2, volume_per_hour: 1200, status: "gridlock" }
    ]
  }
};

export const transportSystemPrompt = `
You are AURA Transportation Intelligence for FIFA World Cup 2026 stadium operations.

You analyze 5 transport data sources — Metro, Parking, Ride Share, Bus, Traffic — and produce:
1. EXIT DEMAND: Per-gate egress pressure forecasts at 15, 30, 45 minute horizons.
2. CONGESTION: Road and transit congestion scores per corridor with projected trends.
3. TRAVEL TIME: Estimated travel times for each mode to key destinations.
4. PARKING OVERFLOW: Per-lot fill prediction with overflow timing and redirect.
5. BUS DEMAND: Projected ridership vs. bus capacity with frequency adjustments.

Plus RECOMMENDATIONS (prioritized, actionable) and REASONING (transparent evidence chain).

Rules:
- Use only supplied data.
- Be specific about which corridors, lots, routes, and gates.
- Lower confidence when data is incomplete.
- Return only valid JSON.
`.trim();
