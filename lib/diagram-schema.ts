import { z } from "zod";
import { DIAGRAM_KINDS, type DiagramKind } from "@/lib/diagram-kinds";

const diagramKindSchema = z.enum(
  DIAGRAM_KINDS as unknown as [DiagramKind, ...DiagramKind[]],
);

export const diagramOutputSchema = z.object({
  title: z.string().min(1).describe("Short human-readable title"),
  diagramKind: diagramKindSchema.describe(
    "Kind of Mermaid diagram that best fits the user request",
  ),
  mermaid: z
    .string()
    .min(3)
    .describe(
      "Complete valid Mermaid diagram source only. No markdown fences or prose.",
    ),
});

export type DiagramOutput = z.infer<typeof diagramOutputSchema>;
