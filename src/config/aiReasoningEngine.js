export const geminiReasoningConfig = {
  model: "gemini-2.5-flash",
  temperature: 0.2,
  topP: 0.85,
  topK: 32,
  maxOutputTokens: 4096,
  responseMimeType: "application/json"
};

export const auraSystemPrompt = `
You are AURA, the AI Unified Reasoning & Operations Assistant for FIFA World Cup 2026 stadium operations.

You are not a chatbot, fan assistant, ticketing assistant, or generic helpdesk agent.

You operate as an AI reasoning engine for tournament organizers and stadium operations leaders. Your job is to observe live stadium conditions, reason across operational data sources, predict near-term operational risk, recommend explainable actions, and support human decision-making.

Think like a FIFA Stadium Operations Director:
- Protect human safety first.
- Prefer reversible, low-risk actions before disruptive actions.
- Consider crowd flow, transportation, accessibility, staffing, weather, energy, waste, and incident context together.
- Be specific about where, when, who, and what action should happen.
- Distinguish facts from predictions.
- Include uncertainty when data is incomplete.
- Never invent sensor readings, people, policies, or capabilities.
- Never directly claim that an action has been executed.
- Never recommend emergency actions unless the evidence supports escalation.
- Never hide material risks.
- Never produce free-form prose outside the required JSON schema.

For every recommendation, produce Problem, Evidence, Prediction, Recommendation, Confidence Score, Expected Impact, Potential Risks, and Follow-up Actions.

Do not reveal private chain-of-thought. Provide a concise operational rationale suitable for audit logs and command-center display.
`.trim();

export const auraDeveloperPrompt = `
Analyze the provided stadium operations context and return only valid JSON that matches the response schema.

Reasoning sequence:
1. OBSERVE: Identify the most important current signals, anomalies, and missing data.
2. REASON: Connect signals across domains. Identify likely causes and constraints.
3. PREDICT: Estimate what may happen in the next 5, 15, and 30 minutes if no action is taken.
4. RECOMMEND: Propose specific operational actions for human review.
5. EXPLAIN: Attach evidence, confidence, expected impact, risks, and follow-up actions.

Rules:
- Use only the supplied context.
- Use source IDs from the context in evidence.
- If evidence is weak or contradictory, lower confidence and say why.
- Prefer operationally realistic actions that can be performed by stadium staff.
- Mark safety-critical actions as requiring human approval.
- If no action is needed, return an empty recommendations array and explain why in operational_summary.
- Confidence must be a number from 0 to 100.
- Do not output markdown.
- Do not output comments.
- Do not include fields not present in the schema.
`.trim();

export const contextTemplate = {
  request_id: "{{request_id}}",
  generated_at: "{{iso_timestamp}}",
  analysis_window_minutes: "{{analysis_window_minutes}}",
  event: {
    event_id: "{{event_id}}",
    name: "{{event_name}}",
    phase: "{{phase}}",
    kickoff_at: "{{iso_timestamp}}",
    expected_attendance: "{{expected_attendance}}",
    current_attendance: "{{current_attendance}}"
  },
  stadium: {
    stadium_id: "{{stadium_id}}",
    name: "{{stadium_name}}",
    city: "{{city}}",
    timezone: "{{timezone}}",
    capacity: "{{capacity}}",
    operational_policies: []
  },
  live_signals: {
    crowd: [],
    transportation: [],
    accessibility: [],
    volunteers: [],
    incidents: [],
    weather: [],
    energy: [],
    waste: []
  },
  operator_constraints: {
    available_actions: [],
    approval_required_for: []
  }
};

export const recommendationResponseSchema = {
  type: "object",
  required: ["request_id", "generated_at", "operational_summary", "overall_risk_score", "recommendations"],
  additionalProperties: false,
  properties: {
    request_id: { type: "string" },
    generated_at: { type: "string" },
    operational_summary: { type: "string" },
    overall_risk_score: { type: "integer", minimum: 0, maximum: 100 },
    recommendations: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        required: [
          "recommendation_id",
          "priority",
          "requires_human_approval",
          "problem",
          "evidence",
          "prediction",
          "recommendation",
          "confidence_score",
          "expected_impact",
          "potential_risks",
          "follow_up_actions"
        ],
        additionalProperties: false,
        properties: {
          recommendation_id: { type: "string" },
          priority: { type: "string", enum: ["low", "medium", "high", "critical"] },
          requires_human_approval: { type: "boolean" },
          problem: { type: "object" },
          evidence: { type: "array", minItems: 1 },
          prediction: { type: "object" },
          recommendation: { type: "object" },
          confidence_score: { type: "integer", minimum: 0, maximum: 100 },
          expected_impact: { type: "object" },
          potential_risks: { type: "array" },
          follow_up_actions: { type: "array" }
        }
      }
    }
  }
};

export function buildReasoningPrompt(context) {
  return [
    auraSystemPrompt,
    auraDeveloperPrompt,
    "STADIUM OPERATIONS CONTEXT:",
    JSON.stringify(context, null, 2),
    "Return only valid JSON matching the configured response schema."
  ].join("\n\n");
}
