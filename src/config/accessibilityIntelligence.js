/* ============================================================
   Accessibility Intelligence — Configuration & Data Model
   ============================================================ */

export const accessibilityFeatures = [
  { id: "wheelchair", label: "Wheelchair Routing", icon: "♿", color: "#57a8ff" },
  { id: "voice", label: "Voice Navigation", icon: "🗣️", color: "#a98bff" },
  { id: "captioning", label: "Captioning Accuracy", icon: "💬", color: "#55d58a" },
  { id: "quiet", label: "Quiet Lounge Routes", icon: "🤫", color: "#50e3f2" },
  { id: "elevator", label: "Elevator Monitoring", icon: "🛗", color: "#ff8d5c" }
];

export const accessibilityInputs = {
  generated_at: new Date().toISOString(),
  elevators: [
    { id: "el-north-1", name: "North Elevator 1", location: "North Gate C", status: "operational", wait_time_sec: 25, load_pct: 45, cycle_count: 320, temperature_c: 28 },
    { id: "el-north-2", name: "North Elevator 2", location: "North Gate C", status: "degraded", wait_time_sec: 110, load_pct: 95, cycle_count: 480, temperature_c: 42 },
    { id: "el-south-1", name: "South Elevator 1", location: "South Gate D", status: "operational", wait_time_sec: 15, load_pct: 20, cycle_count: 210, temperature_c: 26 },
    { id: "el-east-1", name: "East Elevator 1", location: "East Gate A", status: "offline", wait_time_sec: 0, load_pct: 0, cycle_count: 140, temperature_c: 0 }
  ],
  wheelchair_queues: [
    { zone: "Gate A Ingress", wait_minutes: 8, queue_count: 12, shuttle_available: true },
    { zone: "Gate C Ingress", wait_minutes: 24, queue_count: 38, shuttle_available: false },
    { zone: "Gate D Ingress", wait_minutes: 11, queue_count: 19, shuttle_available: true }
  ],
  live_captioning: {
    system_latency_sec: 1.4,
    accuracy_rate: 0.985,
    active_screens: 124,
    transcription_source: "stadium_main_feed"
  },
  voice_assistant: {
    active_sessions: 340,
    average_response_ms: 180,
    intent_accuracy_rate: 0.94,
    top_request: "nearest_accessible_restroom"
  },
  quiet_lounges: [
    { id: "lounge-east", name: "East Sensory Room", capacity: 25, current_occupancy: 22, avg_ambient_db: 52 },
    { id: "lounge-west", name: "West Sensory Room", capacity: 40, current_occupancy: 18, avg_ambient_db: 48 }
  ]
};
