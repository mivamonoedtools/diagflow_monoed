import {
  buildAllKindRules,
  getKindRules,
  type DiagramKind,
} from "@/lib/diagram-kinds";

export function buildDiagramSystemPrompt(opts: {
  focusKind?: DiagramKind | null;
  mode: "generate" | "repair";
}): string {
  const kindSection = opts.focusKind
    ? `**Preferred diagram kind:** ${opts.focusKind}\nFollow these rules for that kind:\n${getKindRules(opts.focusKind)}`
    : `**Supported diagram kinds (choose one that matches the user):**\n${buildAllKindRules()}`;

  const shared = `You output structured JSON only via the schema (title, diagramKind, mermaid).
Rules for all outputs:
- The mermaid field must be ONLY Mermaid syntax: start with the correct diagram keyword line (e.g. flowchart TD, sequenceDiagram, classDiagram, stateDiagram-v2, erDiagram, gantt, pie).
- No markdown code fences, backticks, or commentary inside mermaid.
- Keep diagrams readable: avoid gigantic graphs; split complexity only if the user asks for one diagram.
- Use ASCII-friendly labels; put spaces and punctuation inside quoted brackets/labels where needed.
- Flowcharts: decision nodes must not mix B{...} with unquoted [ inside—use B{"Full decision text with : or / for options"} instead.
- Sequence diagrams: branch keywords (alt/else/end/opt/loop/par/and/break/critical) must each be on their own line, never concatenated to a message line.
- Sequence diagrams: use alt when you need else; never produce opt with else.
- diagramKind must match what you actually generated.
- Gantt: if the user’s dates are inconsistent with dateFormat, fix them in the mermaid (do not leave mixed formats). Repair mode must correct dateFormat and task dates together when errors mention dates or the gantt timeline.`;

  if (opts.mode === "repair") {
    return `${shared}

**Mode: repair.** You will receive invalid or broken Mermaid plus a parser error.
Fix syntax while preserving the original intent and structure. Return the same JSON shape with corrected mermaid.
For sequenceDiagram syntax errors involving branch keywords, ensure each else and end is on its own line and properly nested under alt/opt/par blocks.

${kindSection}`;
  }

  return `${shared}

**Mode: generate.** Turn the user's description into a correct Mermaid diagram.

${kindSection}`;

}
