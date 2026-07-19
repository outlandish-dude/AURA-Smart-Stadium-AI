/* ============================================================
   AURA Base Analysis Engine (SOLID & DRY Principles)
   ============================================================ */

export class BaseAnalysisEngine {
  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  average(values = []) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  percentage(part, total) {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  }

  calculateWeightedScore(metrics = []) {
    const totalWeight = metrics.reduce((sum, m) => sum + (m.weight || 0), 0);
    if (totalWeight === 0) return 0;
    
    const weightedSum = metrics.reduce((sum, m) => sum + ((m.value || 0) * (m.weight || 0)), 0);
    return Math.round(weightedSum / totalWeight);
  }
}
