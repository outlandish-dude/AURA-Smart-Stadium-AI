/* ============================================================
   Sustainability Intelligence — Configuration & Data Model
   ============================================================ */

export const sustainabilityFeatures = [
  { id: "waste", label: "Waste Prediction", icon: "🗑️", color: "#55d58a" },
  { id: "cleaning", label: "Cleaning Optimization", icon: "🧹", color: "#ffca5f" },
  { id: "water", label: "Water Usage", icon: "🚰", color: "#57a8ff" },
  { id: "energy", label: "Energy Consumption", icon: "⚡", color: "#a98bff" },
  { id: "carbon", label: "Carbon Footprint", icon: "🌱", color: "#50e3f2" }
];

export const sustainabilityInputs = {
  generated_at: new Date().toISOString(),
  waste_bins: [
    { id: "bin-concourse-north", location: "North Concourse", fill_pct: 88, compostable_kg: 42, recyclable_kg: 28, landfill_kg: 12, contamination_rate_pct: 18 },
    { id: "bin-concourse-east", location: "East Concourse", fill_pct: 64, compostable_kg: 24, recyclable_kg: 18, landfill_kg: 8, contamination_rate_pct: 12 },
    { id: "bin-concourse-south", location: "South Concourse", fill_pct: 42, compostable_kg: 15, recyclable_kg: 12, landfill_kg: 5, contamination_rate_pct: 8 },
    { id: "bin-concourse-west", location: "West Concourse", fill_pct: 92, compostable_kg: 52, recyclable_kg: 34, landfill_kg: 18, contamination_rate_pct: 28 }
  ],
  water_flow: [
    { sensor: "main-inlet-1", flow_rate_gpm: 480, daily_gallons: 284000, pressure_psi: 62 },
    { sensor: "restrooms-quad-a", flow_rate_gpm: 120, daily_gallons: 92000, pressure_psi: 55 },
    { sensor: "concessions-east", flow_rate_gpm: 45, daily_gallons: 38000, pressure_psi: 58 }
  ],
  energy_grid: {
    solar_generation_kw: 320,
    battery_charge_pct: 78,
    grid_consumption_kw: 1450,
    hvac_load_kw: 680,
    lighting_load_kw: 420,
    concessions_load_kw: 350
  },
  carbon_offsets: {
    daily_offset_kg_co2: 48200,
    offset_target_kg_co2: 50000,
    solar_offset_kg_co2: 12400,
    recycled_offset_kg_co2: 35800
  }
};
