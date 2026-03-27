"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DIAGRAM_RASTER_FONT_FAMILY } from "@/lib/diagram-export-font";
import {
  forceNormalizeSequenceControlLines,
  normalizeMermaidForCommonSyntaxIssues,
} from "@/lib/normalize-mermaid";
import {
  DEFAULT_DIAGRAM_PALETTE_ID,
  getDiagramPalette,
  type DiagramPaletteId,
} from "@/lib/diagram-palette";
import { cn } from "@/lib/utils";

export type MermaidRenderResult =
  | { ok: true; svg: string }
  | { ok: false; error: string };

type MermaidPreviewProps = {
  code: string | null;
  onRendered: (result: MermaidRenderResult) => void;
  paletteId?: DiagramPaletteId;
};

export function MermaidPreview({
  code,
  onRendered,
  paletteId = DEFAULT_DIAGRAM_PALETTE_ID,
}: MermaidPreviewProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!code?.trim()) {
      setSvg(null);
      return;
    }

    let cancelled = false;
    setBusy(true);
    setSvg(null);

    void (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        const palette = getDiagramPalette(paletteId);
        const narrow =
          typeof window !== "undefined" &&
          window.matchMedia("(max-width: 640px)").matches;

        const ganttWidth =
          typeof window !== "undefined"
            ? Math.min(920, Math.max(480, window.innerWidth - 32))
            : 800;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: palette.mermaidTheme,
          fontFamily: DIAGRAM_RASTER_FONT_FAMILY,
          themeVariables: {
            fontSize: narrow ? "15px" : "14px",
            ...palette.themeVariables,
          },
          flowchart: {
            useMaxWidth: true,
            // SVG labels follow themeVariables fills; HTML labels inherit page color and break
            // light-on-light with Ocean / contrast + site dark mode.
            htmlLabels: false,
            curve: "basis",
            padding: 10,
            nodeSpacing: 40,
            rankSpacing: 36,
          },
          sequence: {
            useMaxWidth: true,
            boxMargin: 6,
            boxTextMargin: 4,
          },
          gantt: {
            useWidth: ganttWidth,
            useMaxWidth: true,
          },
        });
        const id = `mmd-${crypto.randomUUID()}`;
        const firstPass = normalizeMermaidForCommonSyntaxIssues(code, "auto");
        let out: string;
        try {
          const rendered = await mermaid.render(id, firstPass);
          out = rendered.svg;
        } catch (firstErr) {
          const firstMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
          const likelySequenceControlLineError = /got 'else'|got 'end'|parse error/i.test(
            firstMsg,
          );
          if (!likelySequenceControlLineError) {
            throw firstErr;
          }
          const retryId = `mmd-${crypto.randomUUID()}`;
          const aggressive = normalizeMermaidForCommonSyntaxIssues(
            forceNormalizeSequenceControlLines(code),
            "sequence",
          );
          const retried = await mermaid.render(retryId, aggressive);
          out = retried.svg;
        }
        if (cancelled) return;
        setSvg(out);
        onRendered({ ok: true, svg: out });
      } catch (e) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        setSvg(null);
        onRendered({ ok: false, error: message });
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, onRendered, paletteId]);

  if (!code?.trim()) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Your diagram preview will show here after you generate.
      </div>
    );
  }

  if (busy && !svg) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Rendering diagram...
        </span>
      </div>
    );
  }

  if (!svg) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground lg:hidden">
        Wide diagrams: scroll sideways to see the full width.
      </p>
      <div
        data-diagram-palette={paletteId}
        className={cn(
          "diagram-preview max-h-[min(70vh,900px)] overflow-auto overflow-x-auto overscroll-x-contain rounded-lg border bg-card p-3 touch-manipulation sm:p-4 [&_svg]:max-w-none [&_svg]:min-w-0 [-webkit-overflow-scrolling:touch]",
          paletteId === "midnight"
            ? "scheme-dark text-slate-200"
            : "scheme-light text-slate-900",
        )}
        // Trusted: local Mermaid output only
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
