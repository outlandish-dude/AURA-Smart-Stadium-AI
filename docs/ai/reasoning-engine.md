# AURA AI Reasoning Engine

## Purpose

AURA does not use Gemini as a chatbot. Gemini acts as a stadium operations reasoning engine that transforms live operational context into structured, explainable recommendations for human operators.

The engine must always follow this loop:

1. Observe current stadium conditions.
2. Reason across multiple operational domains.
3. Predict likely near-term outcomes.
4. Recommend operational actions.
5. Explain the recommendation with evidence, confidence, impact, risk, and follow-up actions.

The model should think like a FIFA Stadium Operations Director: safety-first, venue-aware, calm under pressure, specific about actions, and careful about operational tradeoffs.

## Gemini 2.5 Flash Optimization Rules

- Use concise context blocks with explicit labels.
- Prefer structured JSON output over prose.
- Keep reasoning instructions procedural and bounded.
- Require evidence citations by source ID.
- Ask for calibrated confidence, not certainty.
- Separate prediction from recommendation.
- Use short few-shot examples that teach the response shape.
- Include hard safety limits in the system prompt.
- Set temperature low for incident response and moderate for planning.
- Never expose hidden chain-of-thought. Use concise operational rationale instead.

Recommended generation settings:

```json
{
  "model": "gemini-2.5-flash",
  "temperature": 0.2,
  "topP": 0.85,
  "topK": 32,
  "maxOutputTokens": 4096,
  "responseMimeType": "application/json"
}
```

## System Prompt

```text
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

For every recommendation, produce:
- Problem
- Evidence
- Prediction
- Recommendation
- Confidence Score
- Expected Impact
- Potential Risks
- Follow-up Actions

Do not reveal private chain-of-thought. Provide a concise operational rationale suitable for audit logs and command-center display.
```

## Developer Prompt

```text
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
```

## Context Template

```json
{
  "request_id": "{{request_id}}",
  "generated_at": "{{iso_timestamp}}",
  "analysis_window_minutes": {{analysis_window_minutes}},
  "event": {
    "event_id": "{{event_id}}",
    "name": "{{event_name}}",
    "phase": "{{pre_match|ingress|first_half|halftime|second_half|egress|post_event}}",
    "kickoff_at": "{{iso_timestamp}}",
    "expected_attendance": {{expected_attendance}},
    "current_attendance": {{current_attendance}}
  },
  "stadium": {
    "stadium_id": "{{stadium_id}}",
    "name": "{{stadium_name}}",
    "city": "{{city}}",
    "timezone": "{{timezone}}",
    "capacity": {{capacity}},
    "operational_policies": [
      {
        "policy_id": "{{policy_id}}",
        "name": "{{policy_name}}",
        "rule": "{{policy_rule}}"
      }
    ]
  },
  "live_signals": {
    "crowd": [
      {
        "source_id": "{{source_id}}",
        "zone_name": "{{zone_name}}",
        "gate_code": "{{gate_code}}",
        "density_percent": {{density_percent}},
        "flow_rate_per_minute": {{flow_rate_per_minute}},
        "wait_time_seconds": {{wait_time_seconds}},
        "confidence": "{{low|medium|high}}",
        "observed_at": "{{iso_timestamp}}"
      }
    ],
    "transportation": [
      {
        "source_id": "{{source_id}}",
        "route_name": "{{route_name}}",
        "mode": "{{rail|bus|shuttle|rideshare|parking|walk}}",
        "status": "{{normal|delayed|surge|suspended|closed}}",
        "delay_minutes": {{delay_minutes}},
        "capacity_utilization": {{capacity_utilization}},
        "last_reported_at": "{{iso_timestamp}}"
      }
    ],
    "accessibility": [
      {
        "source_id": "{{source_id}}",
        "zone_name": "{{zone_name}}",
        "request_type": "{{request_type}}",
        "priority": "{{low|medium|high|critical}}",
        "status": "{{requested|assigned|in_progress|completed|cancelled}}",
        "sla_due_at": "{{iso_timestamp}}"
      }
    ],
    "volunteers": [
      {
        "source_id": "{{source_id}}",
        "team": "{{team_name}}",
        "available_count": {{available_count}},
        "nearest_zone": "{{zone_name}}",
        "skills": ["{{skill}}"]
      }
    ],
    "incidents": [
      {
        "source_id": "{{source_id}}",
        "incident_id": "{{incident_id}}",
        "title": "{{title}}",
        "category": "{{category}}",
        "severity": "{{low|medium|high|critical}}",
        "status": "{{new|triaged|assigned|mitigating|resolved|dismissed}}",
        "zone_name": "{{zone_name}}",
        "detected_at": "{{iso_timestamp}}"
      }
    ],
    "weather": [
      {
        "source_id": "{{source_id}}",
        "temperature_c": {{temperature_c}},
        "humidity_percent": {{humidity_percent}},
        "wind_speed_kph": {{wind_speed_kph}},
        "precipitation_mm": {{precipitation_mm}},
        "condition": "{{condition}}",
        "alert_level": "{{low|medium|high|critical}}"
      }
    ],
    "energy": [
      {
        "source_id": "{{source_id}}",
        "system_name": "{{system_name}}",
        "usage_kw": {{usage_kw}},
        "renewable_percent": {{renewable_percent}},
        "load_state": "{{normal|elevated|peak|reduced}}"
      }
    ],
    "waste": [
      {
        "source_id": "{{source_id}}",
        "zone_name": "{{zone_name}}",
        "unit_code": "{{unit_code}}",
        "fill_percent": {{fill_percent}},
        "contamination_percent": {{contamination_percent}},
        "service_required": {{service_required}}
      }
    ]
  },
  "operator_constraints": {
    "available_actions": [
      "{{open_gate}}",
      "{{restrict_gate}}",
      "{{deploy_volunteers}}",
      "{{reroute_crowd}}",
      "{{notify_transport_liaison}}",
      "{{request_cleaning_team}}",
      "{{adjust_energy_load}}",
      "{{send_accessibility_team}}",
      "{{create_incident}}",
      "{{escalate_to_security}}"
    ],
    "approval_required_for": [
      "{{public_announcement}}",
      "{{gate_closure}}",
      "{{security_escalation}}",
      "{{emergency_response}}"
    ]
  }
}
```

## JSON Response Schema

```json
{
  "type": "object",
  "required": [
    "request_id",
    "generated_at",
    "operational_summary",
    "overall_risk_score",
    "recommendations"
  ],
  "additionalProperties": false,
  "properties": {
    "request_id": {
      "type": "string"
    },
    "generated_at": {
      "type": "string",
      "format": "date-time"
    },
    "operational_summary": {
      "type": "string",
      "description": "Concise command-center summary. No hidden chain-of-thought."
    },
    "overall_risk_score": {
      "type": "integer",
      "minimum": 0,
      "maximum": 100
    },
    "recommendations": {
      "type": "array",
      "maxItems": 5,
      "items": {
        "type": "object",
        "required": [
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
        "additionalProperties": false,
        "properties": {
          "recommendation_id": {
            "type": "string"
          },
          "priority": {
            "type": "string",
            "enum": ["low", "medium", "high", "critical"]
          },
          "requires_human_approval": {
            "type": "boolean"
          },
          "problem": {
            "type": "object",
            "required": ["title", "description", "affected_domains", "affected_zones"],
            "additionalProperties": false,
            "properties": {
              "title": { "type": "string" },
              "description": { "type": "string" },
              "affected_domains": {
                "type": "array",
                "items": {
                  "type": "string",
                  "enum": [
                    "crowd",
                    "transportation",
                    "accessibility",
                    "volunteers",
                    "incident",
                    "waste",
                    "energy",
                    "weather"
                  ]
                }
              },
              "affected_zones": {
                "type": "array",
                "items": { "type": "string" }
              }
            }
          },
          "evidence": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "object",
              "required": ["source_id", "signal", "observation", "relevance"],
              "additionalProperties": false,
              "properties": {
                "source_id": { "type": "string" },
                "signal": { "type": "string" },
                "observation": { "type": "string" },
                "relevance": {
                  "type": "string",
                  "enum": ["supporting", "contradicting", "missing"]
                }
              }
            }
          },
          "prediction": {
            "type": "object",
            "required": ["time_horizon_minutes", "if_no_action", "likelihood", "leading_indicators"],
            "additionalProperties": false,
            "properties": {
              "time_horizon_minutes": { "type": "integer", "minimum": 1, "maximum": 60 },
              "if_no_action": { "type": "string" },
              "likelihood": {
                "type": "string",
                "enum": ["unlikely", "possible", "likely", "very_likely"]
              },
              "leading_indicators": {
                "type": "array",
                "items": { "type": "string" }
              }
            }
          },
          "recommendation": {
            "type": "object",
            "required": ["action", "owner_role", "target_zones", "execution_window_minutes", "approval_reason"],
            "additionalProperties": false,
            "properties": {
              "action": { "type": "string" },
              "owner_role": { "type": "string" },
              "target_zones": {
                "type": "array",
                "items": { "type": "string" }
              },
              "execution_window_minutes": { "type": "integer", "minimum": 1, "maximum": 60 },
              "approval_reason": { "type": "string" }
            }
          },
          "confidence_score": {
            "type": "integer",
            "minimum": 0,
            "maximum": 100
          },
          "expected_impact": {
            "type": "object",
            "required": ["summary", "metrics"],
            "additionalProperties": false,
            "properties": {
              "summary": { "type": "string" },
              "metrics": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": ["metric", "expected_change", "timeframe_minutes"],
                  "additionalProperties": false,
                  "properties": {
                    "metric": { "type": "string" },
                    "expected_change": { "type": "string" },
                    "timeframe_minutes": { "type": "integer", "minimum": 1, "maximum": 60 }
                  }
                }
              }
            }
          },
          "potential_risks": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["risk", "mitigation"],
              "additionalProperties": false,
              "properties": {
                "risk": { "type": "string" },
                "mitigation": { "type": "string" }
              }
            }
          },
          "follow_up_actions": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["action", "owner_role", "due_in_minutes"],
              "additionalProperties": false,
              "properties": {
                "action": { "type": "string" },
                "owner_role": { "type": "string" },
                "due_in_minutes": { "type": "integer", "minimum": 1, "maximum": 120 }
              }
            }
          }
        }
      }
    }
  }
}
```

## Primary Prompt Template

```text
{{SYSTEM_PROMPT}}

{{DEVELOPER_PROMPT}}

STADIUM OPERATIONS CONTEXT:
{{CONTEXT_JSON}}

Return only valid JSON matching the schema.
```

## Domain-Specific Prompt Fragments

### Crowd Management

```text
Prioritize crowd safety, density reduction, and reversible routing changes.
Look for:
- rising density
- falling pedestrian velocity
- gate throughput bottlenecks
- transport arrivals that may create delayed pressure
- conflicts with accessibility routes
Do not recommend closing a gate unless there is a clear safety or security reason.
```

### Transportation

```text
Treat transportation as an upstream driver of crowd pressure.
Look for:
- route delays
- surge arrivals
- shuttle gaps
- parking saturation
- rideshare queue spillover
Recommendations should coordinate venue operations with transport liaisons.
```

### Accessibility

```text
Accessibility is an operational priority, not an edge case.
Look for:
- assistance requests near SLA breach
- blocked accessible routes
- volunteer skill mismatch
- crowd reroutes that may harm accessible movement
Recommendations must preserve accessible paths and include owner roles.
```

### Sustainability

```text
Optimize energy and waste only when it does not conflict with safety, accessibility, or incident response.
Look for:
- peak energy load
- renewable mix drop
- waste overflow near high-traffic zones
- service timing before halftime or egress
```

### Incident Operations

```text
Incidents require clear status, severity, owner, and next action.
Escalate only when evidence supports it.
Prefer creating or updating an incident record over vague warnings.
```

## Few-Shot Example 1: Crowd Surge

### Input Context

```json
{
  "request_id": "req-crowd-001",
  "generated_at": "2026-06-14T18:47:00Z",
  "analysis_window_minutes": 15,
  "event": {
    "event_id": "evt-usa-arg",
    "name": "USA vs Argentina",
    "phase": "ingress",
    "kickoff_at": "2026-06-14T19:00:00Z",
    "expected_attendance": 82000,
    "current_attendance": 66420
  },
  "stadium": {
    "stadium_id": "stad-metlife",
    "name": "MetLife Stadium",
    "city": "East Rutherford",
    "timezone": "America/New_York",
    "capacity": 82500,
    "operational_policies": [
      {
        "policy_id": "pol-density-01",
        "name": "Comfort Density",
        "rule": "Concourse density above 85 percent for more than 10 minutes requires mitigation."
      }
    ]
  },
  "live_signals": {
    "crowd": [
      {
        "source_id": "crowd-north-001",
        "zone_name": "North Concourse",
        "gate_code": "C",
        "density_percent": 88,
        "flow_rate_per_minute": 1800,
        "wait_time_seconds": 420,
        "confidence": "high",
        "observed_at": "2026-06-14T18:46:30Z"
      }
    ],
    "transportation": [
      {
        "source_id": "rail-017",
        "route_name": "Meadowlands Rail",
        "mode": "rail",
        "status": "surge",
        "delay_minutes": 4,
        "capacity_utilization": 94,
        "last_reported_at": "2026-06-14T18:45:00Z"
      }
    ],
    "accessibility": [],
    "volunteers": [
      {
        "source_id": "vol-delta",
        "team": "Delta",
        "available_count": 12,
        "nearest_zone": "Gate D",
        "skills": ["crowd_direction", "accessibility_support"]
      }
    ],
    "incidents": [],
    "weather": [],
    "energy": [],
    "waste": []
  },
  "operator_constraints": {
    "available_actions": ["reroute_crowd", "deploy_volunteers", "notify_transport_liaison", "create_incident"],
    "approval_required_for": ["public_announcement", "gate_closure", "security_escalation", "emergency_response"]
  }
}
```

### Expected Output

```json
{
  "request_id": "req-crowd-001",
  "generated_at": "2026-06-14T18:47:00Z",
  "operational_summary": "North Concourse crowd density is above the comfort threshold and is likely being amplified by a rail arrival surge. A reversible reroute and volunteer deployment should reduce pressure before kickoff.",
  "overall_risk_score": 78,
  "recommendations": [
    {
      "recommendation_id": "rec-crowd-001",
      "priority": "high",
      "requires_human_approval": true,
      "problem": {
        "title": "North Concourse crowd compression risk",
        "description": "Crowd density at Gate C is above the mitigation threshold while rail arrivals are adding upstream pressure.",
        "affected_domains": ["crowd", "transportation", "volunteers"],
        "affected_zones": ["North Concourse", "Gate C", "Gate D"]
      },
      "evidence": [
        {
          "source_id": "crowd-north-001",
          "signal": "crowd_density",
          "observation": "North Concourse density is 88 percent with 420 second wait time.",
          "relevance": "supporting"
        },
        {
          "source_id": "rail-017",
          "signal": "transport_surge",
          "observation": "Meadowlands Rail is in surge state at 94 percent capacity utilization.",
          "relevance": "supporting"
        },
        {
          "source_id": "vol-delta",
          "signal": "available_staff",
          "observation": "Team Delta has 12 available volunteers near Gate D.",
          "relevance": "supporting"
        }
      ],
      "prediction": {
        "time_horizon_minutes": 15,
        "if_no_action": "North Concourse density is likely to remain above comfort threshold and may delay ingress near kickoff.",
        "likelihood": "likely",
        "leading_indicators": ["density above 85 percent", "wait time above 6 minutes", "rail surge arrival"]
      },
      "recommendation": {
        "action": "Deploy Team Delta to redirect a portion of Gate C arrivals toward Gate D and notify the transport liaison to stagger shuttle unloading for 15 minutes.",
        "owner_role": "Crowd Manager",
        "target_zones": ["Gate C", "Gate D", "North Concourse"],
        "execution_window_minutes": 5,
        "approval_reason": "Human approval is required because the action changes live crowd routing."
      },
      "confidence_score": 91,
      "expected_impact": {
        "summary": "Expected to reduce North Concourse density below the comfort threshold before kickoff.",
        "metrics": [
          {
            "metric": "North Concourse density",
            "expected_change": "decrease from 88 percent to below 80 percent",
            "timeframe_minutes": 15
          },
          {
            "metric": "Gate C wait time",
            "expected_change": "decrease by 90 to 150 seconds",
            "timeframe_minutes": 15
          }
        ]
      },
      "potential_risks": [
        {
          "risk": "Gate D may become overloaded if too many arrivals are redirected.",
          "mitigation": "Monitor Gate D flow every 3 minutes and stop reroute if density exceeds 80 percent."
        }
      ],
      "follow_up_actions": [
        {
          "action": "Check Gate D density after reroute begins.",
          "owner_role": "Crowd Manager",
          "due_in_minutes": 3
        },
        {
          "action": "Confirm rail surge has cleared.",
          "owner_role": "Transport Coordinator",
          "due_in_minutes": 10
        }
      ]
    }
  ]
}
```

## Few-Shot Example 2: Accessibility SLA Risk

### Input Context

```json
{
  "request_id": "req-access-001",
  "generated_at": "2026-06-20T20:08:00Z",
  "analysis_window_minutes": 10,
  "event": {
    "event_id": "evt-final",
    "name": "Final",
    "phase": "halftime",
    "kickoff_at": "2026-06-20T19:00:00Z",
    "expected_attendance": 82000,
    "current_attendance": 82000
  },
  "stadium": {
    "stadium_id": "stad-metlife",
    "name": "MetLife Stadium",
    "city": "East Rutherford",
    "timezone": "America/New_York",
    "capacity": 82500,
    "operational_policies": [
      {
        "policy_id": "pol-access-01",
        "name": "Accessibility SLA",
        "rule": "High priority accessibility requests must be assigned within 5 minutes."
      }
    ]
  },
  "live_signals": {
    "crowd": [
      {
        "source_id": "crowd-east-220",
        "zone_name": "East Ramp Section 220",
        "gate_code": "A",
        "density_percent": 79,
        "flow_rate_per_minute": 620,
        "wait_time_seconds": 210,
        "confidence": "medium",
        "observed_at": "2026-06-20T20:07:20Z"
      }
    ],
    "transportation": [],
    "accessibility": [
      {
        "source_id": "access-442",
        "zone_name": "East Ramp Section 220",
        "request_type": "mobility_assistance",
        "priority": "high",
        "status": "requested",
        "sla_due_at": "2026-06-20T20:11:00Z"
      }
    ],
    "volunteers": [
      {
        "source_id": "vol-access-bravo",
        "team": "Accessibility Bravo",
        "available_count": 2,
        "nearest_zone": "East Ramp Section 220",
        "skills": ["mobility_assistance"]
      }
    ],
    "incidents": [],
    "weather": [],
    "energy": [],
    "waste": []
  },
  "operator_constraints": {
    "available_actions": ["send_accessibility_team", "deploy_volunteers", "create_incident"],
    "approval_required_for": ["public_announcement", "gate_closure", "security_escalation", "emergency_response"]
  }
}
```

### Expected Output

```json
{
  "request_id": "req-access-001",
  "generated_at": "2026-06-20T20:08:00Z",
  "operational_summary": "A high-priority mobility assistance request near East Ramp Section 220 is approaching SLA breach, with a qualified accessibility team nearby.",
  "overall_risk_score": 56,
  "recommendations": [
    {
      "recommendation_id": "rec-access-001",
      "priority": "high",
      "requires_human_approval": false,
      "problem": {
        "title": "High-priority accessibility request approaching SLA breach",
        "description": "A mobility assistance request is unassigned and due within 3 minutes.",
        "affected_domains": ["accessibility", "volunteers", "crowd"],
        "affected_zones": ["East Ramp Section 220"]
      },
      "evidence": [
        {
          "source_id": "access-442",
          "signal": "accessibility_request",
          "observation": "High-priority mobility assistance request remains in requested status.",
          "relevance": "supporting"
        },
        {
          "source_id": "vol-access-bravo",
          "signal": "available_staff",
          "observation": "Accessibility Bravo has 2 qualified volunteers near the affected zone.",
          "relevance": "supporting"
        },
        {
          "source_id": "crowd-east-220",
          "signal": "crowd_density",
          "observation": "East Ramp Section 220 density is 79 percent, which may slow assisted movement.",
          "relevance": "supporting"
        }
      ],
      "prediction": {
        "time_horizon_minutes": 5,
        "if_no_action": "The request may breach SLA and become harder to serve as halftime movement increases.",
        "likelihood": "very_likely",
        "leading_indicators": ["SLA due in 3 minutes", "request unassigned", "moderate crowd density"]
      },
      "recommendation": {
        "action": "Assign Accessibility Bravo to the request and route them through the least congested east ramp path.",
        "owner_role": "Accessibility Coordinator",
        "target_zones": ["East Ramp Section 220"],
        "execution_window_minutes": 2,
        "approval_reason": "No elevated approval is required because this is a standard accessibility service action."
      },
      "confidence_score": 88,
      "expected_impact": {
        "summary": "Expected to prevent SLA breach and reduce guest wait time.",
        "metrics": [
          {
            "metric": "Accessibility assignment time",
            "expected_change": "complete assignment before SLA due time",
            "timeframe_minutes": 3
          }
        ]
      },
      "potential_risks": [
        {
          "risk": "Volunteers may be delayed by halftime crowd flow.",
          "mitigation": "Use the east ramp route and monitor progress after 2 minutes."
        }
      ],
      "follow_up_actions": [
        {
          "action": "Confirm volunteer arrival at requester location.",
          "owner_role": "Accessibility Coordinator",
          "due_in_minutes": 4
        }
      ]
    }
  ]
}
```

## Few-Shot Example 3: No Recommendation Needed

### Input Context

```json
{
  "request_id": "req-normal-001",
  "generated_at": "2026-06-18T17:20:00Z",
  "analysis_window_minutes": 15,
  "event": {
    "event_id": "evt-group-12",
    "name": "Group Match",
    "phase": "pre_match",
    "kickoff_at": "2026-06-18T19:00:00Z",
    "expected_attendance": 60000,
    "current_attendance": 18000
  },
  "stadium": {
    "stadium_id": "stad-bmo",
    "name": "BMO Field",
    "city": "Toronto",
    "timezone": "America/Toronto",
    "capacity": 45000,
    "operational_policies": []
  },
  "live_signals": {
    "crowd": [
      {
        "source_id": "crowd-west-001",
        "zone_name": "West Entry",
        "gate_code": "W",
        "density_percent": 43,
        "flow_rate_per_minute": 920,
        "wait_time_seconds": 80,
        "confidence": "high",
        "observed_at": "2026-06-18T17:19:00Z"
      }
    ],
    "transportation": [],
    "accessibility": [],
    "volunteers": [],
    "incidents": [],
    "weather": [],
    "energy": [],
    "waste": []
  },
  "operator_constraints": {
    "available_actions": ["reroute_crowd", "deploy_volunteers", "create_incident"],
    "approval_required_for": ["public_announcement", "gate_closure", "security_escalation", "emergency_response"]
  }
}
```

### Expected Output

```json
{
  "request_id": "req-normal-001",
  "generated_at": "2026-06-18T17:20:00Z",
  "operational_summary": "Current pre-match operations are stable. West Entry density and wait time are within normal range, and no active incident or upstream disruption is present in the supplied context.",
  "overall_risk_score": 22,
  "recommendations": []
}
```

## Runtime Guardrails

Validate every model response before writing it to the database.

Required backend checks:

- JSON parses successfully.
- Schema validation passes.
- `confidence_score` is between 0 and 100.
- Each evidence item references a known `source_id`.
- Recommendation action exists in `operator_constraints.available_actions`.
- Human approval is required for any action listed in `operator_constraints.approval_required_for`.
- Low-confidence recommendations cannot be auto-prioritized as critical.
- Recommendations with no evidence are rejected.
- Output is stored in `ai_analysis` before creating `recommendations`.

## Prompt Versioning

Use semantic prompt versions:

```text
aura-reasoning-v1.0.0
aura-reasoning-v1.1.0
aura-reasoning-v2.0.0
```

Store `prompt_version`, `model_name`, request context hash, and response hash in `ai_analysis` for auditability.

## Production Invocation Pattern

```ts
const response = await gemini.models.generateContent({
  model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  contents: [
    {
      role: "user",
      parts: [
        {
          text: buildReasoningPrompt({
            systemPrompt,
            developerPrompt,
            context
          })
        }
      ]
    }
  ],
  config: {
    temperature: 0.2,
    topP: 0.85,
    topK: 32,
    maxOutputTokens: 4096,
    responseMimeType: "application/json"
  }
});
```

## Why This Design Works

The engine separates observation, reasoning, prediction, recommendation, and explanation so Gemini cannot simply answer conversationally. The output schema forces every recommendation to be evidence-backed and operationally actionable. Human approval fields keep the AI in a decision-support role, which is essential for safety-adjacent stadium operations. Few-shot examples teach Gemini 2.5 Flash the desired compact JSON shape while keeping token use controlled for real-time command-center latency.
