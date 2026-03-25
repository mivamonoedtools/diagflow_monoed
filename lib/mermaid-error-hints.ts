import type { DiagramKind } from "@/lib/diagram-kinds";

/** Matches API / client messages when the user must buy credits to continue. */
export function isOutOfCreditsMessage(message: string): boolean {
  return /no credits|out of credits|402|buy credits/i.test(message);
}

export type IssueHints = {
  /** Short tips for the user (no raw stack traces). */
  hints: string[];
};

const DATE_RELATED =
  /date|gantt|dateFormat|Invalid date|NaN|time range|tick interval/i;
const GANTTISH = /gantt|section|task\b|dateFormat/i;

export function getHintsForMermaidError(
  rawMessage: string,
  context?: { diagramKind?: DiagramKind | null },
): IssueHints {
  const msg = rawMessage.slice(0, 2000);
  const hints: string[] = [];

  if (DATE_RELATED.test(msg) || context?.diagramKind === "gantt") {
    hints.push(
      "For Gantt charts, put dateFormat first (e.g. dateFormat YYYY-MM-DD) and use that exact format for every start/end date.",
    );
    hints.push(
      "If dates don’t match the format, Mermaid fails or stretches the timeline—edit the prompt or tap Regenerate for a fresh diagram.",
    );
  }

  if (GANTTISH.test(msg) && context?.diagramKind === "gantt") {
    hints.push(
      "Keep one continuous project window: avoid typos like 22025, and align every task with the same calendar scale.",
    );
  }

  if (/Parse error|Syntax error|Expecting/i.test(msg)) {
    hints.push(
      "You can try “Fix with AI” to repair the Mermaid, or Regenerate to replace the whole diagram from your description.",
    );
  }

  if (/fetch|network|Failed to fetch|HTTP/i.test(msg)) {
    hints.push("Check your connection, then tap Regenerate.");
  }

  if (hints.length === 0) {
    hints.push("Try Regenerate, or use “Fix with AI” if the diagram text looks close but won’t render.");
  }

  return { hints: [...new Set(hints)] };
}

export function getHintsForApiError(message: string): IssueHints {
  const hints: string[] = [];
  if (/API key|GOOGLE_GENERATIVE|misconfiguration/i.test(message)) {
    hints.push("The app needs a valid Gemini API key on the server. After fixing env vars, reload the page.");
  } else if (/sign in|unauthorized|401|free diagram is used/i.test(message)) {
    /* Body copy + CTA live in the alert; avoid repeating “sign in” bullets. */
  } else if (isOutOfCreditsMessage(message)) {
    /* Credits UX is handled in DiagramFeedback; avoid duplicating copy here. */
  } else if (/429|quota|rate|Resource exhausted/i.test(message)) {
    hints.push("The model may be rate-limited. Wait a minute and tap Regenerate.");
  } else {
    hints.push("Tap Regenerate to try again. If it keeps failing, shorten your prompt and retry.");
  }
  return { hints };
}
