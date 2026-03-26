import { access } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  svg: z.string().min(1).max(1_000_000),
  backgroundColor: z
    .string()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional()
    .default("#ffffff"),
  scale: z.number().min(1).max(4).optional().default(2),
});

function normalizeSvgForServerRaster(svg: string): string {
  const styleTag =
    '<style>svg, text, tspan { font-family: Arial, "Helvetica Neue", Helvetica, sans-serif !important; }</style>';
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

  const { svg, backgroundColor, scale } = parsed.data;

  try {
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
