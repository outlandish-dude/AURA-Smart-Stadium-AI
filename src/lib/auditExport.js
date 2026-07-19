/* ============================================================
   Audit Export Helpers — CSV / JSON / Report downloads
   ============================================================ */

import {
  auditDecisions,
  complianceLog,
  performanceMetrics,
  executiveSummary
} from "../config/auditIntelligence.js";

function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows, headers) {
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((h) => csvEscape(row[h])).join(","));
  });
  return lines.join("\n");
}

function findDecision(id) {
  if (!id || id === "all" || id === "summary") return null;
  return auditDecisions.find((d) => d.id === id) || null;
}

function incidentReportText(dec) {
  return [
    `AURA INCIDENT REPORT — ${dec.id}`,
    `Zone: ${dec.zone}`,
    `Timestamp: ${dec.timestamp}`,
    `Category: ${dec.category}`,
    `Severity: ${dec.severity}`,
    `Status: ${dec.status}`,
    "",
    "TIMELINE",
    ...(dec.cascade || []).map((s) => `  ${s.time}  ${s.event}`),
    "",
    "PROBLEM",
    dec.problem,
    "",
    "ACTIONS TAKEN",
    dec.human_decision,
    "",
    "RECOMMENDATIONS",
    dec.recommendation,
    "",
    `Response Time: ${dec.response_time_sec}s`,
    `Recovery / Resolution Time: ${dec.resolution_time_min}m`,
    "",
    "LESSONS LEARNED",
    dec.actual_outcome,
    "",
    `AI Version: ${dec.ai_version}`,
    `Operator: ${dec.operator}`,
    `Confidence: ${dec.confidence_score}%`
  ].join("\n");
}

export function exportAuditPackage(type, decisionId) {
  const dec = findDecision(decisionId);
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");

  if (type === "json") {
    const payload = dec
      ? dec
      : decisionId === "summary"
        ? executiveSummary
        : { decisions: auditDecisions, complianceLog, performanceMetrics, executiveSummary };
    downloadBlob(`aura-audit-${decisionId || "all"}-${stamp}.json`, JSON.stringify(payload, null, 2), "application/json");
    return;
  }

  if (type === "csv") {
    if (dec) {
      const rows = [{
        id: dec.id,
        timestamp: dec.timestamp,
        zone: dec.zone,
        severity: dec.severity,
        problem: dec.problem,
        recommendation: dec.recommendation,
        human_decision: dec.human_decision,
        outcome: dec.actual_outcome,
        response_sec: dec.response_time_sec,
        resolution_min: dec.resolution_time_min,
        confidence: dec.confidence_score,
        operator: dec.operator,
        status: dec.status
      }];
      downloadBlob(`aura-incident-${dec.id}.csv`, toCsv(rows, Object.keys(rows[0])), "text/csv");
      return;
    }
    if (decisionId === "summary") {
      const rows = [
        { section: "operational_summary", content: executiveSummary.operational_summary },
        ...executiveSummary.major_risks.map((r, i) => ({ section: `major_risk_${i + 1}`, content: r })),
        ...executiveSummary.key_decisions.map((r, i) => ({ section: `key_decision_${i + 1}`, content: r })),
        { section: "response_effectiveness", content: executiveSummary.response_effectiveness }
      ];
      downloadBlob(`aura-executive-summary-${stamp}.csv`, toCsv(rows, ["section", "content"]), "text/csv");
      return;
    }
    const rows = auditDecisions.map((d) => ({
      id: d.id,
      timestamp: d.timestamp,
      zone: d.zone,
      category: d.category,
      severity: d.severity,
      problem: d.problem,
      recommendation: d.recommendation,
      human_decision: d.human_decision,
      actual_outcome: d.actual_outcome,
      response_sec: d.response_time_sec,
      resolution_min: d.resolution_time_min,
      confidence: d.confidence_score,
      operator: d.operator,
      status: d.status
    }));
    downloadBlob(`aura-audit-decisions-${stamp}.csv`, toCsv(rows, Object.keys(rows[0])), "text/csv");
    return;
  }

  if (type === "timeline") {
    const events = (dec?.cascade || auditDecisions.flatMap((d) =>
      (d.cascade || []).map((c) => ({ ...c, zone: d.zone, id: d.id }))
    ));
    const text = events.map((e) => `${e.time}\t${e.zone || dec?.zone || ""}\t${e.event}`).join("\n");
    downloadBlob(`aura-timeline-${decisionId || "all"}-${stamp}.txt`, text, "text/plain");
    return;
  }

  // pdf / incident / ai — text report download (browser-printable)
  if (type === "pdf" || type === "incident" || type === "ai") {
    let body;
    if (dec) {
      body = incidentReportText(dec);
    } else if (type === "ai") {
      body = [
        "AURA AI ANALYSIS REPORT",
        "",
        executiveSummary.operational_summary,
        "",
        "MAJOR RISKS",
        ...executiveSummary.major_risks.map((r) => `- ${r}`),
        "",
        "KEY DECISIONS",
        ...executiveSummary.key_decisions.map((r) => `- ${r}`),
        "",
        "RESPONSE EFFECTIVENESS",
        executiveSummary.response_effectiveness,
        "",
        "LESSONS LEARNED",
        ...executiveSummary.lessons_learned.map((r) => `- ${r}`),
        "",
        "FUTURE SUGGESTIONS",
        ...executiveSummary.future_suggestions.map((r) => `- ${r}`),
        "",
        `Generated by ${executiveSummary.generated_by} at ${executiveSummary.generated_at}`
      ].join("\n");
    } else {
      body = [
        "AURA FULL AUDIT REPORT",
        "",
        ...auditDecisions.map((d) => incidentReportText(d) + "\n" + "-".repeat(48) + "\n"),
        "",
        "COMPLIANCE LOG",
        ...complianceLog.map((l) => `${l.timestamp} | ${l.user} | ${l.action} | ${l.prev_state} → ${l.new_state}`)
      ].join("\n");
    }
    downloadBlob(`aura-report-${decisionId || "full"}-${stamp}.txt`, body, "text/plain");
  }
}
