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
    const resvg = new Resvg(svg, {
      background: backgroundColor,
      fitTo: {
        mode: "zoom",
        value: scale,
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
