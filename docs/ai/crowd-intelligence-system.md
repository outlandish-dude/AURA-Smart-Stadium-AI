# AI Crowd Intelligence System

## Goal

The AURA Crowd Intelligence system predicts stadium congestion before it becomes operationally unsafe. It uses gate entries, crowd density, historical baselines, transportation pressure, and weather to explain what is likely to happen and what organizers should do next.

## Inputs

- Gate Entries: throughput, queue depth, gate capacity, and gate status.
- Crowd Density: zone density, movement velocity, and connected gates.
- Historical Data: previous ingress density, queues, and incident rates.
- Transportation: rail, shuttle, rideshare, delay, arrival load, and nearest gate.
- Weather: heat, humidity, wind, precipitation, and crowd comfort risk.

## Outputs

- Predicted Congestion
- Root Cause Analysis
- Safe Route Recommendations
- Gate Balancing
- Queue Prediction
- Capacity Forecast
- Gemini-style Explanation

Every output includes a `why` explanation so organizers understand the evidence behind the prediction.

## Backend APIs

### `GET /api/crowd-intelligence/inputs`

Returns the current input payload used by the system.

### `GET /api/crowd-intelligence/prediction`

Returns the current crowd intelligence analysis.

### `POST /api/crowd-intelligence/analyze`

Accepts a custom input payload and returns the same structured analysis.

This is the production seam where live Supabase data and Gemini 2.5 Flash can be connected. The current implementation is deterministic so it is demoable without external services.

## Frontend Components

- `crowdIntelligencePanel`: composed command-center panel.
- `predictionCard`: congestion forecast by zone.
- `routeCard`: safe route recommendation.
- `compactTable`: reusable table for gate balancing and queue predictions.
- `statePanel`: reusable loading, empty, and error state.

## Gemini Prompt Contract

Gemini should not answer conversationally. It should return structured JSON:

```json
{
  "predicted_congestion": [],
  "root_cause_analysis": {},
  "safe_route_recommendations": [],
  "gate_balancing": {},
  "queue_prediction": [],
  "capacity_forecast": {},
  "explanation": {
    "summary": "",
    "why_predictions_were_made": [],
    "confidence_score": 0
  }
}
```

## Widget Decision Value

Predicted Congestion helps organizers see which zones need intervention first.

Root Cause Analysis prevents teams from treating symptoms, such as crowd density, without addressing causes, such as rail surges or gate imbalance.

Safe Route Recommendations give operators reversible, lower-risk routing options.

Gate Balancing shows where arrivals should be reduced, increased, or held.

Queue Prediction estimates wait time and queue depth so staffing and signage can be adjusted before delays become visible to guests.

Capacity Forecast tells leaders whether the venue is stable, under watch, or constrained over the next operational window.

Explanations make each prediction auditable and suitable for human approval workflows.
