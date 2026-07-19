/* ============================================================
   AURA AI Operations Copilot — UI Component
   ============================================================ */

export const suggestedPrompts = [
  "What concerns you today?",
  "Which gate is at highest risk?",
  "How many volunteers should be reassigned?",
  "Predict the next bottleneck.",
  "Summarize operations.",
  "Should Gate C remain open?"
];

export function copilotWidget(chatHistory, isTyping) {
  return `
    <article class="glass-card widget-card copilot-card" style="grid-column: 1 / -1; margin-top: var(--space-4);">
      <div class="section-heading" style="margin-bottom: var(--space-3)">
        <div>
          <p class="eyebrow">AI Operations Assistant</p>
          <h2>AURA Operations Copilot</h2>
        </div>
        <span class="status-pill">Interactive Reasoning</span>
      </div>

      <!-- Suggested Prompts Grid -->
      <div class="copilot-suggestions" aria-label="Suggested prompts">
        ${suggestedPrompts.map((p) => `
          <button type="button" class="suggestion-chip" data-copilot-prompt="${p}">${p}</button>
        `).join("")}
      </div>

      <!-- Chat Conversation History -->
      <div class="copilot-chat-history" id="copilot-chat-history" aria-live="polite">
        ${chatHistory.map((msg) => `
          <div class="chat-bubble-wrapper ${msg.sender === "user" ? "from-user" : "from-ai"}">
            <div class="chat-bubble">
              <span class="bubble-sender">${msg.sender === "user" ? "👤 Operator" : "🧠 AURA"}</span>
              <div class="bubble-content">${msg.text}</div>
            </div>
            
            ${msg.reasoning ? `
              <div class="chat-reasoning-dropdown">
                <details>
                  <summary>Observe & Infer Log (Confidence: ${msg.reasoning.confidence}%)</summary>
                  <div class="reasoning-detail-box">
                    <p style="color:var(--cyan); margin:0 0 var(--space-1); font-size:0.75rem; text-transform:uppercase; font-weight:700">Observations</p>
                    <ul>${msg.reasoning.observations.map(o => `<li>${o}</li>`).join("")}</ul>
                    
                    <p style="color:var(--violet); margin:var(--space-2) 0 var(--space-1); font-size:0.75rem; text-transform:uppercase; font-weight:700">Inferences</p>
                    <ul>${msg.reasoning.inferences.map(i => `<li>${i}</li>`).join("")}</ul>
                  </div>
                </details>
              </div>
            ` : ""}

            ${msg.actions && msg.actions.length > 0 ? `
              <div class="chat-action-row" style="margin-top: var(--space-2); display: flex; gap: var(--space-2)">
                ${msg.actions.map(act => `
                  <button type="button" class="btn-chat-action" data-action-view="${act.action}">${act.label}</button>
                `).join("")}
              </div>
            ` : ""}
          </div>
        `).join("")}
        
        ${isTyping ? `
          <div class="chat-bubble-wrapper from-ai">
            <div class="chat-bubble loading-bubble">
              <span class="bubble-sender">🧠 AURA thinking</span>
              <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
          </div>
        ` : ""}
      </div>

      <!-- Chat input form -->
      <form class="copilot-input-form" id="copilot-input-form">
        <input
          type="text"
          id="copilot-query-input"
          placeholder="Ask AURA a natural language question (e.g., 'What concerns you today?')"
          aria-label="Ask operations copilot"
          autocomplete="off"
        />
        <button type="submit" class="btn-copilot-submit" ${isTyping ? "disabled" : ""}>Ask Copilot</button>
      </form>
    </article>
  `;
}
