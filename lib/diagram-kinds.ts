export const DIAGRAM_KINDS = [
  "flowchart",
  "sequence",
  "class",
  "state",
  "er",
  "gantt",
  "pie",
] as const;

export type DiagramKind = (typeof DIAGRAM_KINDS)[number];

export const DIAGRAM_KIND_LABELS: Record<DiagramKind, string> = {
  flowchart: "Flowchart",
  sequence: "Sequence",
  class: "Class",
  state: "State",
  er: "Entity–relationship",
  gantt: "Gantt",
  pie: "Pie",
};

const RULES: Record<DiagramKind, string> = {
  flowchart: `flowchart (pick TD, LR, TB, or RL as needed).
First line example: flowchart TD
Node IDs must be alphanumeric/underscore only (no spaces in IDs). Rectangle labels: A[Read input].
Decisions use curly braces. CRITICAL: never put raw square brackets inside a diamond without quoting the whole label—the [ token starts a nested shape and causes a parse error. Use quoted text instead, e.g. B{"Sign in: guest or account"} or B{Simple one-line?} without [ ] inside.
Use --> for links. Use subgraph id [Title] ... end for groups.`,

  sequence: `sequenceDiagram
Declare participants: participant A as Alice (optional alias), or actor User.
Messages: A->>B: text, dashed: A-->>B, activation: activate/deactivate after a line if needed.
Use autonumber to number steps. Notes: Note over A: text or Note right of A: text.
Conditionals MUST use full multiline blocks:
alt Token valid
  A->>B: request
else Token invalid
  B-->>A: 401 Unauthorized
end
Use alt when you need an else branch. Do not use opt with else (opt has no else clause).
Never place branch keywords (alt/else/end/opt/loop/par/and/break/critical) on the same line as a message.`,

  class: `classDiagram
Define classes: class Animal or with members using +public -private #protected.
Relations: ClassA <|-- ClassB (inheritance), *-- composition, o-- aggregation, --> association.
Labels on arrows: A --> B : label`,

  state: `stateDiagram-v2
States: [*] --> Idle (start). Composite: state Active { [*] --> One }
Transitions: Idle --> Active : event. Choice: state if_entry <<choice>>`,

  er: `erDiagram
Entities: ENTITY { type field_name PK "optional_quoted" }
Relationships: ONE ||--o{ MANY : "label"
Use PK, FK in strings where helpful. Keep names single tokens or quoted.`,

  gantt: `gantt
Put dateFormat on an early line (e.g. dateFormat YYYY-MM-DD). Every task date MUST use the same format—mixed or invalid dates break parsing or stretch the timeline with empty space.
Pick one coherent date window for the whole chart; align all tasks inside it. Avoid year typos (e.g. 22025).
Sections: section Name
Tasks: task id :status, Task label, YYYY-MM-DD, YYYY-MM-DD OR task id :status, label, after other_id, duration 3d
Statuses: done, active, crit, milestone`,

  pie: `pie showData (optional second line)
title chart title (optional)
"Slices" : value (numeric; labels in quotes if spaces).`,
};

export function getKindRules(kind: DiagramKind): string {
  return RULES[kind];
}

export function buildAllKindRules(): string {
  return DIAGRAM_KINDS.map(
    (k) => `**${DIAGRAM_KIND_LABELS[k]} (${k})**\n${RULES[k]}`,
  ).join("\n\n");
}
