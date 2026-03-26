import { access } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  svg: z.string().min(1).max(1_000_000),
  mermaidCode: z.string().min(1).max(300_000).optional(),
  mermaidTheme: z
    .enum(["default", "base", "dark", "forest", "neutral"])
    .optional()
    .default("default"),
  backgroundColor: z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional()
    .default("#ffffff"),
  scale: z.number().min(1).max(4).optional().default(2),
});

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function encodeMermaidInkPayload(options: {
  mermaidCode: string;
  mermaidTheme: "default" | "base" | "dark" | "forest" | "neutral";
}): string {
  const state = {
    code: options.mermaidCode,
    mermaid: {
      theme: normalizeMermaidInkTheme(options.mermaidTheme),
    },
  };
  return toBase64Url(Buffer.from(JSON.stringify(state), "utf8"));
}

function normalizeBgColor(color: string): string {
  return color.replace(/^#/, "");
}

function normalizeMermaidInkTheme(
  theme: "default" | "base" | "dark" | "forest" | "neutral",
): "default" | "dark" | "forest" | "neutral" {
  if (theme === "base") return "default";
  if (theme === "dark" || theme === "forest" || theme === "neutral") return theme;
  return "default";
}

async function fetchMermaidInkPng(options: {
  mermaidCode: string;
  backgroundColor: string;
  mermaidTheme: "default" | "base" | "dark" | "forest" | "neutral";
}): Promise<Uint8Array | null> {
  const encoded = encodeMermaidInkPayload({
    mermaidCode: options.mermaidCode,
    mermaidTheme: options.mermaidTheme,
  });
  const url = new URL(`https://mermaid.ink/img/${encoded}`);
  url.searchParams.set("type", "png");
  url.searchParams.set("bgColor", normalizeBgColor(options.backgroundColor));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const ab = await res.arrayBuffer();
    const out = new Uint8Array(ab);
    return out.byteLength > 0 ? out : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeSvgForServerRaster(svg: string): string {
  const styleTag = `<style>
svg, text, tspan {
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important;
  fill: #111827 !important;
}
.label,
.nodeLabel,
.cluster-label text,
.edgeLabel text,
.edgeLabel tspan,
.messageText,
.loopText,
.noteText {
  fill: #111827 !important;
}
</style>`;
  if (/<\/svg>\s*$/i.test(svg)) {
    return svg.replace(/<\/svg>\s*$/i, `${styleTag}</svg>`);
  }
  return svg;
}

async function getServerFontFiles(): Promise<string[]> {
  const candidates = [path.join(process.cwd(), "app", "fonts", "Circular_Std_Book.ttf")];
  const found: string[] = [];
  for (const candidate of candidates) {
    try {
      await access(candidate);
      found.push(candidate);
    } catch {
      /* Optional font file may not exist at runtime */
    }
  }
  return found;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { svg, mermaidCode, mermaidTheme, backgroundColor, scale } = parsed.data;

  try {
    if (mermaidCode) {
      const remotePng = await fetchMermaidInkPng({
        mermaidCode,
        backgroundColor,
        mermaidTheme,
      });
      if (remotePng) {
        const remoteBody = Uint8Array.from(remotePng).buffer;
        return new Response(remoteBody, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "no-store",
          },
        });
      }
    }

    const { Resvg } = await import("@resvg/resvg-js");
    const fontFiles = await getServerFontFiles();
    const safeSvg = normalizeSvgForServerRaster(svg);
    const resvg = new Resvg(safeSvg, {
      background: backgroundColor,
      fitTo: {
        mode: "zoom",
        value: scale,
      },
      font: {
        fontFiles,
        loadSystemFonts: true,
        defaultFontFamily: "Arial",
      },
    });
    const png = resvg.render().asPng();
    const body = new Uint8Array(png);
    return new Response(body, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "PNG render failed";
    return Response.json({ error: message }, { status: 422 });
  }
}
