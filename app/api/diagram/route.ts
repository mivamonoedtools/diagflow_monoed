import { google } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { cookies } from "next/headers";
import { diagramOutputSchema } from "@/lib/diagram-schema";
import { diagramRequestSchema } from "@/lib/diagram-api-types";
import { buildDiagramSystemPrompt } from "@/lib/diagram-prompt";
import { normalizeMermaidForCommonSyntaxIssues } from "@/lib/normalize-mermaid";
import {
  ANON_GENERATE_USED_COOKIE,
  ANON_TRIAL_EXHAUSTED_ERROR,
  anonGenerateUsedCookieOptions,
  isAnonymousGenerateUsed,
} from "@/lib/anonymous-trial";
import { consumeGenerationCredit, getUserCredits } from "@/lib/billing";
import { getServerSessionResult } from "@/lib/server-session";

export const runtime = "nodejs";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";

/** Low temperature for more stable Mermaid + JSON across repeated prompts (not bit-identical). */
const DIAGRAM_GENERATION_TEMPERATURE = 0;

export async function POST(req: Request) {
  const { session, error } = await getServerSessionResult();
  if (error === "AUTH_STORE_UNAVAILABLE") {
    return Response.json(
      {
        error:
          "Authentication store is unavailable. Ensure MongoDB is running and reachable.",
      },
      { status: 503 },
    );
  }
  const cookieStore = await cookies();
  const anonGenerateUsed = isAnonymousGenerateUsed(
    cookieStore.get(ANON_GENERATE_USED_COOKIE)?.value,
  );
  const userId = session?.user?.id ?? null;

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      {
        error:
          "Server misconfiguration: set GOOGLE_GENERATIVE_AI_API_KEY for Gemini.",
      },
      { status: 500 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = diagramRequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const body = parsed.data;

  if (!userId) {
    if (body.mode === "generate") {
      if (anonGenerateUsed) {
        return Response.json({ error: ANON_TRIAL_EXHAUSTED_ERROR }, { status: 403 });
      }
    } else {
      if (!anonGenerateUsed) {
        return Response.json(
          {
            error:
              "Sign in to use AI repair, or generate your free diagram first so we know which diagram to fix.",
          },
          { status: 401 },
        );
      }
    }
  } else if (body.mode === "generate") {
    const credits = await getUserCredits(userId);
    if (credits <= 0) {
      return Response.json(
        {
          error: "No credits left. Buy credits to continue generating diagrams.",
        },
        { status: 402 },
      );
    }
  }

  const modelId = process.env.DIAGFLOW_GEMINI_MODEL ?? DEFAULT_MODEL;

  const userPrompt =
    body.mode === "generate"
      ? [
          body.diagramKind
            ? `Use diagram kind: ${body.diagramKind} unless the user clearly needs a different kind.`
            : null,
          "User request:",
          body.prompt,
        ]
          .filter(Boolean)
          .join("\n")
      : [
          body.diagramKind
            ? `The diagram should stay as kind: ${body.diagramKind}.`
            : null,
          "Broken Mermaid source:",
          body.brokenMermaid,
          "",
          "Parser / render error:",
          body.parseError,
          "",
          "Return JSON with title, diagramKind, and fixed mermaid only.",
        ]
          .filter(Boolean)
          .join("\n");

  try {
    const result = await generateText({
      model: google(modelId),
      temperature: DIAGRAM_GENERATION_TEMPERATURE,
      output: Output.object({
        schema: diagramOutputSchema,
      }),
      system: buildDiagramSystemPrompt({
        focusKind:
          body.mode === "generate"
            ? body.diagramKind
            : (body.diagramKind ?? null),
        mode: body.mode,
      }),
      prompt: userPrompt,
    });

    if (!result.output) {
      return Response.json(
        { error: "Model returned no structured output" },
        { status: 502 },
      );
    }

    const output = {
      ...result.output,
      mermaid: normalizeMermaidForCommonSyntaxIssues(
        result.output.mermaid,
        result.output.diagramKind,
      ),
    };

    if (body.mode === "generate") {
      if (userId) {
        const consumeResult = await consumeGenerationCredit(userId, {
          idempotencyKey: body.idempotencyKey,
          metadata: { modelId, diagramKind: body.diagramKind ?? "auto" },
        });
        if (!consumeResult.ok) {
          return Response.json(
            {
              error: "No credits left. Buy credits to continue generating diagrams.",
            },
            { status: 402 },
          );
        }
        return Response.json({ ...output, creditsRemaining: consumeResult.balance });
      }

      cookieStore.set(
        ANON_GENERATE_USED_COOKIE,
        "1",
        anonGenerateUsedCookieOptions(),
      );
      return Response.json(output);
    }

    return Response.json(output);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Generation failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
