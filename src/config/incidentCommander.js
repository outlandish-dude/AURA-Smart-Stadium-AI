export const incidentTypes = [
  {
    id: "medical",
    label: "Medical",
    icon: "🏥",
    color: "#ff5b76",
    defaultSeverity: "high",
    description: "Medical emergencies including injuries, cardiac events, heat-related illness, and allergic reactions.",
    fields: ["affected_count", "symptoms", "medical_resources_needed"]
  },
  {
    id: "fire",
    label: "Fire",
    icon: "🔥",
    color: "#ff8d5c",
    defaultSeverity: "critical",
    description: "Fire incidents including smoke detection, electrical fires, kitchen fires, and structural fires.",
    fields: ["fire_type", "spread_risk", "evacuation_zones"]
  },
  {
    id: "power_failure",
    label: "Power Failure",
    icon: "⚡",
    color: "#ffca5f",
    defaultSeverity: "high",
    description: "Electrical failures affecting lighting, HVAC, displays, communications, or security systems.",
    fields: ["affected_systems", "backup_status", "estimated_restoration"]
  },
  {
    id: "security",
    label: "Security",
    icon: "🔒",
    color: "#a98bff",
    defaultSeverity: "high",
    description: "Security threats including unauthorized access, suspicious packages, altercations, and perimeter breaches.",
    fields: ["threat_type", "suspect_description", "perimeter_status"]
  },
  {
    id: "lost_child",
    label: "Lost Child",
    icon: "👶",
    color: "#57a8ff",
    defaultSeverity: "high",
    description: "Missing or separated children requiring immediate coordination with security, PA systems, and volunteer teams.",
    fields: ["child_description", "last_seen_location", "guardian_contact"]
  },
  {
    id: "crowd_surge",
    label: "Crowd Surge",
    icon: "🌊",
    color: "#50e3f2",
    defaultSeverity: "critical",
    description: "Dangerous crowd density, stampede risk, crush incidents, or uncontrolled crowd movement.",
    fields: ["crowd_density", "movement_direction", "exit_status"]
  },
  {
    id: "weather",
    label: "Weather",
    icon: "⛈️",
    color: "#55d58a",
    defaultSeverity: "medium",
    description: "Severe weather including lightning, heavy rain, extreme heat, high winds, or tornado warnings.",
    fields: ["weather_type", "forecast_duration", "shelter_capacity"]
  }
];

export const severityLevels = [
  { id: "critical", label: "Critical", color: "#ff5b76", order: 0 },
  { id: "high", label: "High", color: "#ff8d5c", order: 1 },
  { id: "medium", label: "Medium", color: "#ffca5f", order: 2 },
  { id: "low", label: "Low", color: "#55d58a", order: 3 }
];

export const workflowStages = [
  { id: "reported", label: "Reported", icon: "📋" },
  { id: "analyzing", label: "Analyzing", icon: "🧠" },
  { id: "responded", label: "Responded", icon: "✅" },
  { id: "monitoring", label: "Monitoring", icon: "📡" },
  { id: "resolved", label: "Resolved", icon: "🏁" }
];

export const stadiumLocations = [
  "Gate A", "Gate B", "Gate C", "Gate D", "Gate E", "Gate F",
  "North Concourse", "South Concourse", "East Concourse", "West Concourse",
  "Lower Bowl Section 100-120", "Lower Bowl Section 121-140",
  "Upper Deck Section 200-220", "Upper Deck Section 221-240",
  "East Food Court", "West Food Court",
  "Main Plaza", "South Plaza", "VIP Lounge", "Press Box",
  "Parking Lot A", "Parking Lot B", "Parking Lot C",
  "Player Tunnel", "Medical Bay", "Operations Center"
];

export const supportedLanguages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "pt", label: "Português", flag: "🇧🇷" }
];

export const incidentCommanderSystemPrompt = `
You are AURA Incident Commander for FIFA World Cup 2026 stadium operations.

You are not a chatbot. You are an AI-powered incident response system that generates structured operational responses for stadium incident commanders and operations leaders.

When an incident is reported, you must produce 9 response sections:

1. EXECUTIVE SUMMARY: One-paragraph operational summary of the incident including type, severity, location, time, estimated impact, and recommended posture.

2. ROOT CAUSE: Analyze probable root cause with contributing factors. Be specific but honest about uncertainty.

3. IMMEDIATE ACTIONS: Ordered list of actions with assignee, priority, and ETA. Safety-critical actions first.

4. VOLUNTEER INSTRUCTIONS: Role-based instructions for volunteer teams. Clear, actionable, no jargon.

5. PUBLIC ANNOUNCEMENT: PA-system-ready message that is calm, clear, and avoids panic. Include specific guidance for attendees.

6. MULTILINGUAL MESSAGES: Translate the public announcement into English, Spanish, French, Arabic, Chinese, and Portuguese.

7. RECOVERY PLAN: Three-phase recovery plan (Immediate 0-30min, Short-term 30min-2hr, Long-term 2hr+).

8. TIMELINE: Projected incident timeline from detection through resolution with key milestones.

9. RISK ASSESSMENT: Risk matrix with likelihood, impact, cascading risks, and mitigation strategies.

Rules:
- Protect human safety above all.
- Be specific about who does what, where, and when.
- Never invent sensor readings, people, or capabilities.
- Lower confidence when evidence is incomplete.
- Return only valid JSON matching the response schema.
`.trim();

export const incidentResponseSchema = {
  type: "object",
  required: [
    "incident_id", "generated_at", "incident_type", "severity",
    "executive_summary", "root_cause", "immediate_actions",
    "volunteer_instructions", "public_announcement",
    "multilingual_messages", "recovery_plan", "timeline", "risk_assessment"
  ],
  properties: {
    incident_id: { type: "string" },
    generated_at: { type: "string" },
    incident_type: { type: "string" },
    severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
    executive_summary: { type: "string" },
    root_cause: {
      type: "object",
      properties: {
        probable_cause: { type: "string" },
        contributing_factors: { type: "array", items: { type: "string" } },
        confidence: { type: "integer", minimum: 0, maximum: 100 }
      }
    },
    immediate_actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          action: { type: "string" },
          assignee: { type: "string" },
          priority: { type: "string" },
          eta_minutes: { type: "integer" }
        }
      }
    },
    volunteer_instructions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          team: { type: "string" },
          role: { type: "string" },
          instructions: { type: "string" },
          zone: { type: "string" }
        }
      }
    },
    public_announcement: { type: "string" },
    multilingual_messages: {
      type: "object",
      properties: {
        en: { type: "string" },
        es: { type: "string" },
        fr: { type: "string" },
        ar: { type: "string" },
        zh: { type: "string" },
        pt: { type: "string" }
      }
    },
    recovery_plan: {
      type: "object",
      properties: {
        immediate: { type: "array", items: { type: "string" } },
        short_term: { type: "array", items: { type: "string" } },
        long_term: { type: "array", items: { type: "string" } }
      }
    },
    timeline: {
      type: "array",
      items: {
        type: "object",
        properties: {
          time_offset_minutes: { type: "integer" },
          event: { type: "string" },
          status: { type: "string" }
        }
      }
    },
    risk_assessment: {
      type: "object",
      properties: {
        overall_risk_score: { type: "integer", minimum: 0, maximum: 100 },
        likelihood: { type: "string" },
        impact: { type: "string" },
        cascading_risks: { type: "array", items: { type: "string" } },
        mitigations: { type: "array", items: { type: "string" } }
      }
    }
  }
};

export function buildIncidentPrompt(incident) {
  return [
    incidentCommanderSystemPrompt,
    "INCIDENT REPORT:",
    JSON.stringify(incident, null, 2),
    "Return only valid JSON matching the incident response schema."
  ].join("\n\n");
}
