/* ============================================================
   Audit Intelligence Center — Configuration & Data Model
   ============================================================ */

export const auditDecisions = [
  {
    id: "dec-001",
    timestamp: "12:15",
    date: "2026-07-19",
    zone: "North Concourse",
    category: "crowd",
    severity: "critical",
    problem: "Crowd density in North Concourse exceeded 92% of safe capacity threshold.",
    evidence: [
      "Sensor array 7A–7F: 4,620 persons detected (capacity: 5,000)",
      "Egress velocity dropped from 1.4 m/s to 0.3 m/s over 8 minutes",
      "Gate C scan rate: 1,840 entries/min (historical peak: 1,200)",
      "Two Meadowlands Rail trains arrived simultaneously at 12:09"
    ],
    reasoning: "The concurrent arrival of two overloaded rail trains at 12:09 generated a burst inflow of 2,200 guests within 4 minutes. North Concourse absorbed 68% of this surge due to its proximity to the rail link. At the observed egress velocity of 0.3 m/s, the 95% threshold breach was mathematically certain within 11 minutes.",
    prediction: "North Concourse to breach 95% capacity at 12:26 unless Gate D or East Concourse absorbs overflow. Food Court A queue will extend into main corridor within 18 minutes.",
    confidence_score: 94,
    recommendation: "Immediately deploy Team Delta to redirect Gate C overflow to Gate D. Activate variable message boards for East Concourse bypass route. Dispatch 8 stewards to North Concourse corridors.",
    expected_impact: "Reduce North Concourse density to 78% within 12 minutes. Queue times at Gate C reduced from 18min to 7min.",
    human_decision: "Approved with modification — Team Delta deployed but VMS activation delayed 4 minutes pending supervisor sign-off.",
    actual_outcome: "Crowd density reduced from 92% to 74% within 14 minutes. Minor congestion persisted at Food Court A entrance for 6 additional minutes.",
    response_time_sec: 180,
    resolution_time_min: 14,
    ai_version: "Gemini-2.0-flash",
    operator: "M. Rodrigues",
    volunteer: "Team Delta — V. Chen",
    status: "successful",
    cascade: [
      { time: "12:15", event: "Crowd exceeded threshold in North Concourse (92% capacity)." },
      { time: "12:16", event: "Gemini predicted congestion breach at 12:26 without intervention." },
      { time: "12:17", event: "Recommended opening Gate D overflow and deploying Team Delta." },
      { time: "12:18", event: "Organizer M. Rodrigues approved with VMS delay modification." },
      { time: "12:22", event: "Crowd density reduced 27% — zone recovered to 74%." }
    ]
  },
  {
    id: "dec-002",
    timestamp: "12:31",
    date: "2026-07-19",
    zone: "Gate C",
    category: "crowd",
    severity: "high",
    problem: "Gate C queue depth reached 940 persons with 18-minute average wait time.",
    evidence: [
      "Queue sensor chain C1–C8: 940 persons in queue",
      "Average scan rate: 52 persons/min (designed capacity: 90/min)",
      "3 of 6 scanner lanes reported technical fault signals",
      "External temperature: 34°C — heat stress risk elevated"
    ],
    reasoning: "Three malfunctioning scanner lanes reduced Gate C throughput by 43%. Combined with continued inbound flow from Meadowlands Rail, queue depth grew at 180 persons per minute. At this rate, the queue would breach the outer perimeter safety zone in 8 minutes. Heat stress conditions elevated the risk priority to High.",
    prediction: "Queue to reach 1,400 persons within 8 minutes unless scanner capacity is restored or overflow redirected. Heat exhaustion risk for 120+ guests standing in direct sunlight.",
    confidence_score: 91,
    recommendation: "Emergency dispatch of technical team to restore scanner lanes. Open Gate B as temporary overflow. Distribute water and cooling resources to Gate C queue.",
    expected_impact: "Queue reduction to 600 persons within 15 minutes upon scanner restoration. Heat risk mitigated.",
    human_decision: "Approved in full. Technical team dispatched immediately. Gate B opened.",
    actual_outcome: "Scanners restored within 9 minutes. Queue cleared to 380 persons by 12:54. Zero heat-related incidents recorded.",
    response_time_sec: 95,
    resolution_time_min: 23,
    ai_version: "Gemini-2.0-flash",
    operator: "S. Okonkwo",
    volunteer: "Tech Unit — R. Alvarez",
    status: "successful",
    cascade: [
      { time: "12:31", event: "Gate C queue depth hit 940 persons — 18-minute wait." },
      { time: "12:32", event: "Gemini linked scanner faults to heat-stress risk elevation." },
      { time: "12:33", event: "Recommended restore scanners and open Gate B overflow." },
      { time: "12:33", event: "Organizer S. Okonkwo approved in full." },
      { time: "12:54", event: "Queue cleared to 380 — zero heat incidents." }
    ]
  },
  {
    id: "dec-003",
    timestamp: "13:02",
    date: "2026-07-19",
    zone: "Metro Station",
    category: "transport",
    severity: "high",
    problem: "Metro station platform exceeded 78% capacity 40 minutes before kick-off surge.",
    evidence: [
      "Platform occupancy sensors: 4,290 persons (capacity: 5,500)",
      "Rail service: 3 trains delayed 12–15 minutes due to signaling fault",
      "Parking lot B approaching 88% full — taxi and rideshare demand rising",
      "Historical pre-match metro demand increases 220% in final 30 minutes"
    ],
    reasoning: "A signaling fault caused three consecutive train delays, creating platform backfill. Historical analysis shows 220% demand increase in the 30 minutes before kick-off. At the current accumulation rate and with delays compounding, platform capacity breach was 94% probable within 18 minutes.",
    prediction: "Metro station to reach 95% capacity within 18 minutes. Spillover into connecting concourses estimated to affect 800+ persons.",
    confidence_score: 88,
    recommendation: "Activate metro crowd control barriers. Deploy 6 stewards to platform queue management. Issue guidance via stadium app for guests to use park-and-ride shuttle instead.",
    expected_impact: "Prevent platform breach. Divert 400+ guests to shuttle service.",
    human_decision: "Partially approved — barriers activated but shuttle guidance not issued due to communication system lag.",
    actual_outcome: "Platform peaked at 89% (below critical threshold). 340 guests redirected to shuttle. Minor spillover into West Concourse for 11 minutes.",
    response_time_sec: 240,
    resolution_time_min: 22,
    ai_version: "Gemini-2.0-flash",
    operator: "J. Patel",
    volunteer: "Platform Stewards — K. Singh",
    status: "partial",
    cascade: [
      { time: "13:02", event: "Metro platform exceeded 78% capacity pre-kickoff." },
      { time: "13:03", event: "Gemini predicted 95% breach within 18 minutes." },
      { time: "13:04", event: "Recommended barriers + shuttle app guidance." },
      { time: "13:06", event: "Organizer J. Patel partially approved (barriers only)." },
      { time: "13:24", event: "Platform peaked at 89% — partial recovery." }
    ]
  },
  {
    id: "dec-004",
    timestamp: "14:18",
    date: "2026-07-19",
    zone: "Food Court A",
    category: "crowd",
    severity: "medium",
    problem: "Halftime crowd surge created Food Court A queue extending 12 metres into main concourse.",
    evidence: [
      "Queue length: 12.4 metres measured by floor sensors",
      "Average wait time: 14.2 minutes (SLA threshold: 10 minutes)",
      "7 of 12 kiosk stations operational (5 offline for maintenance)",
      "Historical halftime demand: 340% above match-play average"
    ],
    reasoning: "Routine halftime surge amplified by 5 offline kiosks reduced throughput capacity by 42%. Queue overflowed into the main concourse access corridor, creating secondary friction for pedestrian flow. The 10-minute SLA was breached by 4.2 minutes.",
    prediction: "Queue to extend to 18 metres if kiosk capacity not restored. Secondary bottleneck at concourse junction forming within 6 minutes.",
    confidence_score: 86,
    recommendation: "Emergency kiosk restart (estimate 3-minute restoration). Deploy 3 mobile vendor carts to queue as temporary capacity relief. Queue management barriers to contain overflow.",
    expected_impact: "Queue reduction to 6 metres within 12 minutes. SLA restored within 15 minutes.",
    human_decision: "Approved. Kiosks restarted. Mobile carts deployed.",
    actual_outcome: "Queue reduced to 5.2 metres within 14 minutes. SLA restored. No secondary concourse friction observed.",
    response_time_sec: 145,
    resolution_time_min: 14,
    ai_version: "Gemini-2.0-flash",
    operator: "M. Rodrigues",
    volunteer: "Vendor Ops — L. Brooks",
    status: "successful",
    cascade: [
      { time: "14:18", event: "Food Court A queue spilled 12m into concourse." },
      { time: "14:19", event: "Gemini flagged SLA breach and offline kiosks." },
      { time: "14:19", event: "Recommended kiosk restart + mobile carts." },
      { time: "14:20", event: "Organizer M. Rodrigues approved." },
      { time: "14:32", event: "Queue reduced to 5.2m — SLA restored." }
    ]
  },
  {
    id: "dec-005",
    timestamp: "16:44",
    date: "2026-07-19",
    zone: "Exit Gates West",
    category: "crowd",
    severity: "high",
    problem: "Post-match exit surge created dangerous compression at West Exit gates.",
    evidence: [
      "Exit density: 87% capacity with 0.2 m/s average egress speed",
      "4,100 persons queued across West Exit corridor (100m stretch)",
      "Gate malfunction reported on Exit W-3 — throughput reduced 20%",
      "Rain started at 16:39 — guests accelerating toward covered exits"
    ],
    reasoning: "The combination of post-match egress surge, rain-driven acceleration toward covered exits, and a gate malfunction created critical compression in a 100m corridor. At 0.2 m/s egress speed with 4,100 persons, crowd density entered the safety-critical zone where emergency crowd management protocols apply.",
    prediction: "Exit corridor compression to reach critical level within 5 minutes without intervention. Risk of crowd crush at Gate W-3 chokepoint.",
    confidence_score: 96,
    recommendation: "IMMEDIATE: Halt further ingress to West Exit corridor. Repair or bypass Gate W-3. Open auxiliary Exit E-5 and E-6. Deploy 15 stewards for emergency crowd dispersal.",
    expected_impact: "Prevent crush incident. Reduce density to safe levels within 8 minutes.",
    human_decision: "Approved immediately. Emergency protocols activated.",
    actual_outcome: "Compression dissipated within 9 minutes. No injuries reported. Gate W-3 bypassed successfully. Steward response commended in post-event review.",
    response_time_sec: 62,
    resolution_time_min: 9,
    ai_version: "Gemini-2.0-flash",
    operator: "S. Okonkwo",
    volunteer: "Egress Unit — A. Novak",
    status: "successful",
    cascade: [
      { time: "16:44", event: "West Exit compression entered safety-critical zone." },
      { time: "16:44", event: "Gemini predicted crush risk at Gate W-3 within 5 minutes." },
      { time: "16:45", event: "Recommended emergency halt + open auxiliary exits." },
      { time: "16:45", event: "Organizer S. Okonkwo approved immediately." },
      { time: "16:53", event: "Compression cleared — zero injuries." }
    ]
  },
  {
    id: "dec-006",
    timestamp: "15:10",
    date: "2026-07-19",
    zone: "East Concourse",
    category: "accessibility",
    severity: "medium",
    problem: "ADA sensory corridor blocked by temporary media scaffold during halftime reset.",
    evidence: [
      "Accessibility beacon network: East Ramp Lower reported path obstruction",
      "Two wheelchair guests queued for 11 minutes at alternate ramp",
      "Scaffold permit expired at 14:55 — still occupying corridor"
    ],
    reasoning: "Expired media scaffold placement violated the pre-cleared ADA route. Alternate ramp capacity is half of East Ramp Lower, creating unacceptable wait times for mobility-assisted guests.",
    prediction: "Without clearance, accessibility SLA breach continues through second half; complaint risk elevated.",
    confidence_score: 90,
    recommendation: "Immediate scaffold removal. Escort guests via Service Tunnel B. Notify accessibility steward lead.",
    expected_impact: "Restore primary ADA path within 8 minutes. Clear backlog of waiting guests.",
    human_decision: "Approved. Scaffold removed. Escort deployed.",
    actual_outcome: "Path restored in 7 minutes. Two guests escorted without further delay.",
    response_time_sec: 110,
    resolution_time_min: 7,
    ai_version: "Gemini-2.0-flash",
    operator: "J. Patel",
    volunteer: "Access Lead — N. Okada",
    status: "successful",
    cascade: [
      { time: "15:10", event: "ADA corridor obstruction detected on East Ramp Lower." },
      { time: "15:11", event: "Gemini flagged expired scaffold permit and SLA risk." },
      { time: "15:11", event: "Recommended immediate removal and Tunnel B escort." },
      { time: "15:12", event: "Organizer J. Patel approved." },
      { time: "15:17", event: "ADA path restored — backlog cleared." }
    ]
  },
  {
    id: "dec-007",
    timestamp: "15:40",
    date: "2026-07-19",
    zone: "South Concourse",
    category: "waste",
    severity: "low",
    problem: "Compactor station South-2 approached overflow during second-half refresh surge.",
    evidence: [
      "Fill sensor: 91% at South-2",
      "Predicted overflow in 22 minutes at current discard rate",
      "Recycling diversion rate dipped 6% vs target"
    ],
    reasoning: "Halftime packaging waste exceeded modeled volume. Without a pull, South-2 overflow would spill into pedestrian flow near Exit East feeders.",
    prediction: "Overflow within 22 minutes; secondary litter friction along Exit East approach.",
    confidence_score: 84,
    recommendation: "Dispatch waste crew for emergency pull. Open South-3 overflow bay. Push recycling reminder on concourse boards.",
    expected_impact: "Prevent overflow. Restore diversion rate within 30 minutes.",
    human_decision: "Approved. Crew dispatched. South-3 opened.",
    actual_outcome: "Pull completed in 18 minutes. No overflow. Diversion rate recovered.",
    response_time_sec: 160,
    resolution_time_min: 18,
    ai_version: "Gemini-2.0-flash",
    operator: "M. Rodrigues",
    volunteer: "Waste Ops — T. Meier",
    status: "successful",
    cascade: [
      { time: "15:40", event: "South-2 compactor reached 91% fill." },
      { time: "15:41", event: "Gemini predicted overflow in 22 minutes." },
      { time: "15:41", event: "Recommended emergency pull + South-3 bay." },
      { time: "15:42", event: "Organizer M. Rodrigues approved." },
      { time: "15:58", event: "Pull complete — overflow prevented." }
    ]
  }
];

export const complianceLog = [
  { id: "LOG-0091", timestamp: "16:44:02", user: "AURA v2.0", action: "Generated critical crowd alert — Exit West compression", ai_version: "Gemini-2.0-flash", reason: "Density threshold breach detected", prev_state: "High", new_state: "Critical" },
  { id: "LOG-0090", timestamp: "16:44:18", user: "S. Okonkwo", action: "Approved emergency crowd protocol — Exit West", ai_version: "Gemini-2.0-flash", reason: "AI recommendation accepted", prev_state: "Pending", new_state: "Active" },
  { id: "LOG-0089", timestamp: "16:39:11", user: "AURA v2.0", action: "Weather alert issued — Rain detected, exit surge predicted", ai_version: "Gemini-2.0-flash", reason: "Environmental sensor trigger", prev_state: "Normal", new_state: "Watch" },
  { id: "LOG-0088", timestamp: "14:18:33", user: "AURA v2.0", action: "Food Court A SLA breach alert generated", ai_version: "Gemini-2.0-flash", reason: "Queue SLA exceeded by 4.2 minutes", prev_state: "Watch", new_state: "Breach" },
  { id: "LOG-0087", timestamp: "14:19:02", user: "M. Rodrigues", action: "Approved kiosk restart and mobile cart deployment", ai_version: "Gemini-2.0-flash", reason: "AI recommendation accepted", prev_state: "Breach", new_state: "Recovering" },
  { id: "LOG-0086", timestamp: "13:02:14", user: "AURA v2.0", action: "Metro platform capacity alert generated", ai_version: "Gemini-2.0-flash", reason: "78% capacity threshold exceeded", prev_state: "Normal", new_state: "High" },
  { id: "LOG-0085", timestamp: "13:06:44", user: "J. Patel", action: "Partial approval — barriers activated, shuttle guidance deferred", ai_version: "Gemini-2.0-flash", reason: "Communication system lag", prev_state: "Pending", new_state: "Partial" },
  { id: "LOG-0084", timestamp: "12:31:09", user: "AURA v2.0", action: "Gate C scanner fault alert and queue depth alert generated", ai_version: "Gemini-2.0-flash", reason: "3 scanner lanes malfunctioning, queue depth 940", prev_state: "Normal", new_state: "High" },
  { id: "LOG-0083", timestamp: "12:31:55", user: "S. Okonkwo", action: "Full approval — technical team dispatched, Gate B opened", ai_version: "Gemini-2.0-flash", reason: "AI recommendation accepted in full", prev_state: "Pending", new_state: "Active" },
  { id: "LOG-0082", timestamp: "12:15:02", user: "AURA v2.0", action: "Critical crowd density alert — North Concourse 92%", ai_version: "Gemini-2.0-flash", reason: "Sensor array breach + velocity analysis", prev_state: "High", new_state: "Critical" },
  { id: "LOG-0081", timestamp: "12:18:00", user: "M. Rodrigues", action: "Modified approval — Team Delta deployed, VMS delayed", ai_version: "Gemini-2.0-flash", reason: "Supervisor sign-off required for VMS", prev_state: "Pending", new_state: "Modified" },
  { id: "LOG-0080", timestamp: "12:09:30", user: "AURA v2.0", action: "Rail surge prediction issued — two concurrent trains detected", ai_version: "Gemini-2.0-flash", reason: "Transport feed integration alert", prev_state: "Normal", new_state: "Watch" }
];

export const performanceMetrics = {
  avg_response_time_sec: 148,
  decision_accuracy_pct: 94,
  prediction_accuracy_pct: 89,
  volunteer_response_time_min: 3.2,
  avg_resolution_time_min: 16.4,
  false_alerts: 2,
  accepted_recommendations: 18,
  rejected_recommendations: 3,
  total_recommendations: 23,
  successful_outcomes: 19,
  partial_outcomes: 3,
  failed_outcomes: 1,
  avg_confidence_pct: 91,
  model_reliability_pct: 94,
  decision_trends: {
    labels: ["12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "16:00", "16:30", "17:00"],
    values: [1, 2, 3, 1, 2, 1, 0, 1, 3, 2]
  },
  incident_categories: {
    labels: ["Crowd", "Transport", "Accessibility", "Sustainability", "Waste"],
    values: [12, 5, 3, 2, 1]
  },
  recommendation_success: {
    labels: ["Accepted", "Rejected", "Partial", "Pending"],
    values: [18, 3, 3, 1]
  },
  resolution_time_trend: {
    labels: ["Incident 1", "Incident 2", "Incident 3", "Incident 4", "Incident 5"],
    values: [14, 23, 22, 14, 9]
  },
  risk_distribution: {
    labels: ["Critical", "High", "Medium", "Low"],
    values: [3, 8, 7, 5]
  },
  prediction_accuracy_trend: {
    labels: ["Match Day 1", "Match Day 2", "Match Day 3", "Today"],
    values: [82, 86, 88, 94]
  }
};

export const executiveSummary = {
  operational_summary: "FIFA World Cup 2026 Match Day operations at MetLife Stadium completed with zero major safety incidents. AURA generated 23 AI recommendations across 8 operational domains during the 6-hour match-day window. The AI decision system demonstrated 94% prediction accuracy with an average response time of 148 seconds — a 31% improvement over the previous match day.",
  major_risks: [
    "North Concourse crowd compression at 12:15 posed the highest risk of the day. Concurrent rail arrivals created a 92% density scenario. Rapid human approval of AI recommendations prevented breach.",
    "Post-match West Exit compression at 16:44 reached critical levels due to gate malfunction combined with rain-accelerated crowd movement. Emergency protocols were activated within 62 seconds.",
    "Metro station delays created platform congestion risk that was partially mitigated. Communication lag on shuttle guidance reduced effectiveness by an estimated 15%."
  ],
  key_decisions: [
    "Team Delta deployment at North Concourse (12:18) — most impactful single decision of the day.",
    "Gate B emergency opening at 12:31 to relieve Gate C scanner fault.",
    "Emergency crowd protocol activation at Exit West (16:44) — fastest approval of the day at 62 seconds."
  ],
  response_effectiveness: "AI recommendations were accepted in full in 18 of 23 cases (78.3%). Partial approvals occurred in 3 cases, all related to communication or authorization delays rather than disagreement with the recommendation. 3 recommendations were rejected — post-event analysis shows 2 of these rejections resulted in suboptimal outcomes.",
  lessons_learned: [
    "Communication system lag (4–8 minutes) is the primary friction point in the AI → human approval workflow. A dedicated communications lane should be established for time-critical recommendations.",
    "The VMS (Variable Message Sign) activation requires supervisor sign-off that is not automated. Consider pre-authorization for specific scenario types.",
    "Scanner maintenance should be completed 90 minutes before gates open to prevent halftime kiosk capacity issues.",
    "Shuttle guidance should be integrated with stadium app push notifications for instant dissemination during transport events."
  ],
  future_suggestions: [
    "Implement predictive scanner fault detection based on scan rate anomalies — 15-minute advance warning is achievable.",
    "Pre-authorize AURA for direct VMS activation for density-critical alerts above 90% with automatic notification to supervisors.",
    "Integrate weather API for rain-event crowd compression prediction — 20-minute advance warning demonstrated to be achievable.",
    "Add volunteer GPS tracking to provide real-time steward location for faster deployment decisions."
  ],
  generated_at: "2026-07-19 17:15",
  generated_by: "Gemini 2.0 Flash"
};

export const auditFilters = {
  categories: ["All", "Crowd", "Transport", "Accessibility", "Sustainability", "Waste", "Incident"],
  severities: ["All", "Critical", "High", "Medium", "Low"],
  statuses: ["All", "Successful", "Partial", "Failed", "Pending"],
  zones: ["All Zones", "North Concourse", "South Concourse", "East Concourse", "Gate A", "Gate B", "Gate C", "Gate D", "Metro Station", "Food Court A", "Exit Gates West", "Exit East"],
  operators: ["All Operators", "M. Rodrigues", "S. Okonkwo", "J. Patel"],
  volunteers: ["All Volunteers", "Team Delta — V. Chen", "Tech Unit — R. Alvarez", "Platform Stewards — K. Singh", "Vendor Ops — L. Brooks", "Egress Unit — A. Novak", "Access Lead — N. Okada", "Waste Ops — T. Meier"],
  dates: ["All Dates", "2026-07-19"]
};
