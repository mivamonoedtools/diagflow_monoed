const SEQUENCE_BRANCH_KEYWORDS = ["alt", "else", "end", "opt", "loop", "par", "and", "break", "critical"];

function normalizeNewlines(input: string): string {
  return input.replace(/\r\n/g, "\n").trim();
}

function stripCodeFences(input: string): string {
  return input.replace(/^```(?:mermaid)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function normalizeSequenceBranchBreaks(input: string): string {
  let out = input;

  // Very common LLM formatting glitch:
  // "... Created (order ID)else Token Invalid" => "... Created (order ID)\nelse Token Invalid"
  out = out.replace(
    /([)\]}"'）A-Za-z0-9])[\s\u200B\uFEFF]*(else|end|and)\b/gi,
    "$1\n$2",
  );

  // If branch keywords are attached to arrows/messages on the same line,
  // split them into proper Mermaid control lines.
  const lines = out.split("\n");
  const normalizedLines: string[] = [];

  for (const line of lines) {
    if (/(->>|-->>|->|-->|-x|--x)/.test(line)) {
      let next = line;
      for (const kw of SEQUENCE_BRANCH_KEYWORDS) {
        const re = new RegExp(`\\s+(${kw}\\b)`, "i");
        if (re.test(next)) {
          const idx = next.search(re);
          if (idx > 0) {
            normalizedLines.push(next.slice(0, idx).trimEnd());
            next = next.slice(idx).trimStart();
          }
        }
      }
      normalizedLines.push(next);
      continue;
    }
    normalizedLines.push(line);
  }

  return normalizedLines.join("\n");
}

type SequenceControlBlock = {
  kind: "alt" | "opt" | "loop" | "par" | "critical" | "break";
  lineIndex: number;
  hasElse: boolean;
};

function startsWithControlKeyword(line: string, keyword: string): boolean {
  return new RegExp(`^\\s*${keyword}\\b`, "i").test(line);
}

function normalizeSequenceOptElseToAlt(input: string): string {
  const lines = input.split("\n");
  const stack: SequenceControlBlock[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (startsWithControlKeyword(line, "alt")) {
      stack.push({ kind: "alt", lineIndex: i, hasElse: false });
      continue;
    }
    if (startsWithControlKeyword(line, "opt")) {
      stack.push({ kind: "opt", lineIndex: i, hasElse: false });
      continue;
    }
    if (startsWithControlKeyword(line, "loop")) {
      stack.push({ kind: "loop", lineIndex: i, hasElse: false });
      continue;
    }
    if (startsWithControlKeyword(line, "par")) {
      stack.push({ kind: "par", lineIndex: i, hasElse: false });
      continue;
    }
    if (startsWithControlKeyword(line, "critical")) {
      stack.push({ kind: "critical", lineIndex: i, hasElse: false });
      continue;
    }
    if (startsWithControlKeyword(line, "break")) {
      stack.push({ kind: "break", lineIndex: i, hasElse: false });
      continue;
    }

    if (startsWithControlKeyword(line, "else")) {
      const last = stack[stack.length - 1];
      if (last) {
        last.hasElse = true;
      }
      continue;
    }

    if (startsWithControlKeyword(line, "end")) {
      const closed = stack.pop();
      if (closed?.kind === "opt" && closed.hasElse) {
        lines[closed.lineIndex] = lines[closed.lineIndex].replace(/^(\s*)opt\b/i, "$1alt");
      }
    }
  }

  return lines.join("\n");
}

export function normalizeMermaidForCommonSyntaxIssues(
  mermaid: string,
  diagramKind: string,
): string {
  let out = normalizeNewlines(mermaid);
  out = stripCodeFences(out);

  const isSequence = diagramKind === "sequence" || /^sequenceDiagram\b/m.test(out);
  if (isSequence) {
    out = normalizeSequenceBranchBreaks(out);
    out = normalizeSequenceOptElseToAlt(out);
  }

  return out;
}

export function forceNormalizeSequenceControlLines(mermaid: string): string {
  return normalizeNewlines(mermaid).replace(
    /([^\n])[\s\u200B\uFEFF]*(else|end|and|opt|alt|loop|par|break|critical)\b/gi,
    "$1\n$2",
  );
}
