import { z } from "zod";
import { DIAGRAM_KINDS, type DiagramKind } from "@/lib/diagram-kinds";

const kindNullable = z
  .enum(DIAGRAM_KINDS as unknown as [DiagramKind, ...DiagramKind[]])
  .optional()
  .nullable();

export const diagramRequestSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("generate"),
    prompt: z.string().min(1, "Prompt is required"),
    diagramKind: kindNullable,
    idempotencyKey: z.string().min(8).max(128).optional(),
  }),
  z.object({
    mode: z.literal("repair"),
    brokenMermaid: z.string().min(1),
    parseError: z.string().min(1),
    diagramKind: kindNullable,
  }),
]);

export type DiagramRequest = z.infer<typeof diagramRequestSchema>;
