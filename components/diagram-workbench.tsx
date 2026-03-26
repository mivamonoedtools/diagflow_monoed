"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MermaidPreview, type MermaidRenderResult } from "@/components/mermaid-preview";
import { DIAGRAM_EXAMPLES } from "@/lib/diagram-examples";
import { fetchWithRetry } from "@/lib/fetch-retry";
import { FREE_STARTER_CREDITS } from "@/lib/billing-config";
import { useSession } from "@/lib/auth-client";
import { signInWithGoogle } from "@/lib/google-sign-in";
import {
  DIAGRAM_KIND_LABELS,
  DIAGRAM_KINDS,
  type DiagramKind,
} from "@/lib/diagram-kinds";
import type { DiagramOutput } from "@/lib/diagram-schema";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DiagramFeedback } from "@/components/diagram-feedback";
import { DiagramPaletteSwatchStrip } from "@/components/diagram-palette-swatch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_DIAGRAM_PALETTE_ID,
  DIAGRAM_PALETTES,
  getDiagramPalette,
  getPalettePreviewSwatches,
  readStoredDiagramPaletteId,
  writeStoredDiagramPaletteId,
  type DiagramPaletteId,
} from "@/lib/diagram-palette";
import { broadcastCreditsUpdated } from "@/lib/credits-broadcast";
import { isOutOfCreditsMessage } from "@/lib/mermaid-error-hints";
import { prepareSvgForRasterExport } from "@/lib/prepare-svg-for-raster";
import { tightenSvgToContent } from "@/lib/tight-svg";
import { cn } from "@/lib/utils";
import { ChevronDown, Code2, Copy, Download, Eye, Loader2, PenLine } from "lucide-react";
import { toast } from "sonner";

const EXPORT_MARGIN = 12;

/** Avoid "Canvas is already in error state" from huge bitmaps or invalid dimensions. */
const MAX_CANVAS_EDGE_PX = 8192;

const KIND_BADGE_CLASSES: Record<DiagramKind, string> = {
  flowchart: "border-sky-500/35 bg-sky-500/10 text-sky-800 dark:text-sky-200",
  sequence: "border-violet-500/35 bg-violet-500/10 text-violet-800 dark:text-violet-200",
  class: "border-indigo-500/35 bg-indigo-500/10 text-indigo-800 dark:text-indigo-200",
  state: "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  er: "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-200",
  gantt: "border-pink-500/35 bg-pink-500/10 text-pink-800 dark:text-pink-200",
  pie: "border-cyan-500/35 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200",
};

const KIND_CARD_ACCENT_CLASSES: Record<DiagramKind, string> = {
  flowchart: "hover:border-sky-500/35",
  sequence: "hover:border-violet-500/35",
  class: "hover:border-indigo-500/35",
  state: "hover:border-emerald-500/35",
  er: "hover:border-amber-500/35",
  gantt: "hover:border-pink-500/35",
  pie: "hover:border-cyan-500/35",
};

function parseSvgElementSize(el: Element): { w: number; h: number } {
  const rawW = el.getAttribute("width") ?? "";
  const rawH = el.getAttribute("height") ?? "";
  let w = Number.parseFloat(String(rawW).replace(/px$/i, ""));
  let h = Number.parseFloat(String(rawH).replace(/px$/i, ""));
  const vb = el.getAttribute("viewBox");
  if (
    (!Number.isFinite(w) || w <= 0 || !Number.isFinite(h) || h <= 0) &&
    vb
  ) {
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      const vw = parts[2];
      const vh = parts[3];
      if (Number.isFinite(vw) && vw > 0 && Number.isFinite(vh) && vh > 0) {
        if (!Number.isFinite(w) || w <= 0) w = vw;
        if (!Number.isFinite(h) || h <= 0) h = vh;
      }
    }
  }
  if (!Number.isFinite(w) || w <= 0) w = 960;
  if (!Number.isFinite(h) || h <= 0) h = 540;
  return { w, h };
}

async function svgStringToPngBlob(
  svg: string,
  scale = 2,
  backgroundColor = "#ffffff",
): Promise<Blob> {
  const safeSvg = prepareSvgForRasterExport(svg);
  const parser = new DOMParser();
  const doc = parser.parseFromString(safeSvg, "image/svg+xml");
  const el = doc.documentElement;
  const attr = parseSvgElementSize(el);

  const blob = new Blob([safeSvg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = "anonymous";
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Could not rasterize SVG"));
      img.src = url;
    });
    try {
      await img.decode();
    } catch {
      /* SVG decode can fail in some browsers; onload is enough to try draw */
    }

    let iw =
      img.naturalWidth > 0 ? img.naturalWidth : attr.w;
    let ih =
      img.naturalHeight > 0 ? img.naturalHeight : attr.h;
    if (!Number.isFinite(iw) || iw <= 0) iw = attr.w;
    if (!Number.isFinite(ih) || ih <= 0) ih = attr.h;

    let canvasW = Math.max(1, Math.ceil(iw * scale));
    let canvasH = Math.max(1, Math.ceil(ih * scale));

    if (canvasW > MAX_CANVAS_EDGE_PX || canvasH > MAX_CANVAS_EDGE_PX) {
      const r = Math.min(
        MAX_CANVAS_EDGE_PX / canvasW,
        MAX_CANVAS_EDGE_PX / canvasH,
      );
      canvasW = Math.max(1, Math.floor(canvasW * r));
      canvasH = Math.max(1, Math.floor(canvasH * r));
    }

    if (!Number.isFinite(canvasW) || !Number.isFinite(canvasH)) {
      canvasW = Math.max(1, Math.ceil(960 * scale));
      canvasH = Math.max(1, Math.ceil(540 * scale));
    }

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas not supported");
    }

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasW, canvasH);
    try {
      ctx.drawImage(img, 0, 0, canvasW, canvasH);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Could not draw diagram to PNG canvas";
      throw new Error(
        `${msg}. Try SVG download, or a smaller diagram.`,
      );
    }

    const out = await new Promise<Blob>((resolve, reject) => {
      try {
        canvas.toBlob(
          (b) => {
            if (b) {
              resolve(b);
              return;
            }
            reject(new Error("PNG export failed"));
          },
          "image/png",
          1,
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (/tainted canvases|securityerror/i.test(msg)) {
          reject(
            new Error(
              "Browser blocked PNG export for this diagram. Try SVG download, Regenerate/Fix with AI, or a simpler diagram.",
            ),
          );
          return;
        }
        reject(new Error(`PNG export failed: ${msg}`));
      }
    });
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}

type DiagramWorkbenchProps = {
  hidePageHeader?: boolean;
};

export function DiagramWorkbench({ hidePageHeader = false }: DiagramWorkbenchProps) {
  const { data: session } = useSession();
  const [anonymousGenerateAvailable, setAnonymousGenerateAvailable] = useState<
    boolean | null
  >(null);
  const [prompt, setPrompt] = useState("");
  const [kind, setKind] = useState<DiagramKind | "">("");
  const [mermaidCode, setMermaidCode] = useState<string | null>(null);
  const [meta, setMeta] = useState<Pick<DiagramOutput, "title" | "diagramKind"> | null>(
    null,
  );
  const [lastSvg, setLastSvg] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [repairLoading, setRepairLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [examplesCollapsed, setExamplesCollapsed] = useState(true);
  const [diagramPaletteId, setDiagramPaletteId] = useState<DiagramPaletteId>(
    DEFAULT_DIAGRAM_PALETTE_ID,
  );
  const [outOfCreditsDialogOpen, setOutOfCreditsDialogOpen] = useState(false);
  const [diagramView, setDiagramView] = useState<"preview" | "source">("preview");
  /** Align SSR + first client paint so CTA disabled state cannot diverge (extensions/autofill/DOM drift). */
  const [hasMountedClient, setHasMountedClient] = useState(false);

  useEffect(() => {
    setHasMountedClient(true);
  }, []);

  useEffect(() => {
    const stored = readStoredDiagramPaletteId();
    if (stored) setDiagramPaletteId(stored);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      setExamplesCollapsed(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      setAnonymousGenerateAvailable(null);
      return;
    }
    let ignore = false;
    (async () => {
      const res = await fetch("/api/trial-status", { cache: "no-store" });
      if (!res.ok || ignore) return;
      const data: unknown = await res.json();
      if (
        !ignore &&
        typeof data === "object" &&
        data &&
        "anonymousGenerateAvailable" in data &&
        typeof (data as { anonymousGenerateAvailable: unknown }).anonymousGenerateAvailable ===
          "boolean"
      ) {
        setAnonymousGenerateAvailable(
          (data as { anonymousGenerateAvailable: boolean }).anonymousGenerateAvailable,
        );
      }
    })();
    return () => {
      ignore = true;
    };
  }, [session?.user?.id]);

  const onRendered = useCallback((result: MermaidRenderResult) => {
    if (result.ok) {
      setLastSvg(result.svg);
      setParseError(null);
      setExportError(null);
    } else {
      setLastSvg(null);
      setParseError(result.error);
    }
  }, []);

  async function runGenerate() {
    setApiError(null);
    setOutOfCreditsDialogOpen(false);
    setParseError(null);
    setExportError(null);
    setLoading(true);
    try {
      const res = await fetchWithRetry(
        "/api/diagram",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "generate",
            prompt: prompt.trim(),
            diagramKind: kind || null,
            idempotencyKey:
              typeof crypto !== "undefined" && "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          }),
        },
        { retries: 2, baseDelayMs: 600 },
      );
      const data: unknown = await res.json();
      if (!res.ok) {
        const errMsg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : "Request failed";
        setApiError(errMsg);
        if (isOutOfCreditsMessage(errMsg)) {
          setOutOfCreditsDialogOpen(true);
        }
        return;
      }
      const out = data as DiagramOutput;
      setMeta({ title: out.title, diagramKind: out.diagramKind });
      setMermaidCode(out.mermaid);
      setDiagramView("preview");
      if (!session?.user?.id) {
        setAnonymousGenerateAvailable(false);
      } else {
        broadcastCreditsUpdated();
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Network error";
      setApiError(errMsg);
      if (isOutOfCreditsMessage(errMsg)) {
        setOutOfCreditsDialogOpen(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function runRepair() {
    if (!mermaidCode || !parseError) return;
    setApiError(null);
    setOutOfCreditsDialogOpen(false);
    setExportError(null);
    setRepairLoading(true);
    try {
      const res = await fetchWithRetry(
        "/api/diagram",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "repair",
            brokenMermaid: mermaidCode,
            parseError,
            diagramKind: kind || meta?.diagramKind || null,
          }),
        },
        { retries: 2, baseDelayMs: 600 },
      );
      const data: unknown = await res.json();
      if (!res.ok) {
        const errMsg =
          typeof data === "object" && data && "error" in data
            ? String((data as { error: unknown }).error)
            : "Repair failed";
        setApiError(errMsg);
        if (isOutOfCreditsMessage(errMsg)) {
          setOutOfCreditsDialogOpen(true);
        }
        return;
      }
      const out = data as DiagramOutput;
      setMeta({ title: out.title, diagramKind: out.diagramKind });
      setMermaidCode(out.mermaid);
      setDiagramView("preview");
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Network error";
      setApiError(errMsg);
      if (isOutOfCreditsMessage(errMsg)) {
        setOutOfCreditsDialogOpen(true);
      }
    } finally {
      setRepairLoading(false);
    }
  }

  async function copyMermaidSource() {
    const text = mermaidCode?.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Mermaid copied to clipboard");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  }

  function exportSvgTight(): string {
    if (!lastSvg) return lastSvg ?? "";
    return tightenSvgToContent(lastSvg, EXPORT_MARGIN, {
      diagramKind: meta?.diagramKind ?? null,
    });
  }

  function downloadSvg() {
    if (!lastSvg) return;
    const tight = exportSvgTight();
    const blob = new Blob([tight], { type: "image/svg+xml;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(meta?.title ?? "diagram").replace(/[^\w\-]+/g, "-").slice(0, 48) || "diagram"}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function downloadPng() {
    if (!lastSvg) return;
    try {
      const tight = exportSvgTight();
      const bg = getDiagramPalette(diagramPaletteId).pngBackground;
      const blob = await svgStringToPngBlob(tight, 2, bg);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(meta?.title ?? "diagram").replace(/[^\w\-]+/g, "-").slice(0, 48) || "diagram"}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setExportError(
        e instanceof Error ? e.message : "PNG export failed",
      );
    }
  }

  return (
    <div
      id="diagram-tool"
      className="mx-auto flex w-full max-w-6xl scroll-mt-24 flex-col gap-6 px-4 py-8 sm:gap-8  sm:py-10"
    >
      {!hidePageHeader ? (
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Diagflow
          </p>
          <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            Describe a process. Export a clean flowchart.
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Write what you need, generate instantly, and download trimmed SVG or PNG output.
          </p>
        </header>
      ) : (
        <h2 className="sr-only">Diagram generator</h2>
      )}

      {!session?.user && anonymousGenerateAvailable !== null ? (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-muted-foreground shadow-sm">
          {anonymousGenerateAvailable ? (
            <p>
              Try one diagram free without sign in. Create an account only when you want to keep
              generating and save more work.
            </p>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0">
                You&apos;ve used your free try. Sign in with Google to continue and get{" "}
                <strong className="font-medium text-foreground">
                  {FREE_STARTER_CREDITS} starter credits
                </strong>
                .
              </p>
              <button
                type="button"
                onClick={() =>
                  signInWithGoogle(
                    typeof window !== "undefined" ? window.location.pathname || "/" : "/",
                  )
                }
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-95"
              >
                Sign in with Google
              </button>
            </div>
          )}
        </div>
      ) : null}

      <section className="space-y-3 rounded-2xl  bg-card/60   ">
        <button
          type="button"
          className="flex min-h-11 w-full items-center justify-between rounded-xl border bg-card px-3 py-2 text-left shadow-xs lg:hidden"
          onClick={() => setExamplesCollapsed((c) => !c)}
          aria-expanded={!examplesCollapsed}
        >
          <span className="text-sm font-medium ">Example prompts</span>
          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform",
              !examplesCollapsed && "rotate-180",
            )}
            aria-hidden
          />
        </button>
        <div className="hidden items-end justify-between lg:flex">
          <h2 className="text-sm font-medium text-foreground pb-2">Example prompts</h2>
          <p className="text-xs text-muted-foreground">Pick one to fill the editor instantly</p>
        </div>
        <div
          className={cn(
            "grid gap-3 sm:grid-cols-2 lg:grid-cols-3",
            examplesCollapsed && "hidden lg:grid",
          )}
        >
          {DIAGRAM_EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                setPrompt(ex.samplePrompt);
                setKind(ex.diagramKind);
                setExamplesCollapsed(true);
              }}
              className={cn(
                "min-h-11 rounded-xl border bg-card p-4 text-left text-sm shadow-xs transition-colors",
                "hover:bg-accent/30",
                KIND_CARD_ACCENT_CLASSES[ex.diagramKind],
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                "active:bg-accent/40",
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-medium">{ex.title}</span>
                <span
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-xs font-medium",
                    KIND_BADGE_CLASSES[ex.diagramKind],
                  )}
                >
                  {DIAGRAM_KIND_LABELS[ex.diagramKind]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{ex.description}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-4">
          <div className="space-y-4">
            <label className="text-sm font-medium" htmlFor="prompt">
              What do you want to diagram?
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={8}
              placeholder="Example: Flowchart for user signup with email verification…"
              className="min-h-[180px] w-full resize-y rounded-xl border-2 border-dotted border-muted-foreground/45 bg-background px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:border-muted-foreground/35 sm:text-sm"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-4">
              <label className="text-sm font-medium" htmlFor="kind">
                Diagram kind
              </label>
              <Select
                value={kind || "auto"}
                onValueChange={(value) => setKind(value === "auto" ? "" : (value as DiagramKind))}
              >
                <SelectTrigger
                  id="kind"
                  className="w-full data-[size=default]:h-11 **:data-[slot=select-value]:text-base sm:**:data-[slot=select-value]:text-sm"
                >
                  <SelectValue placeholder="Auto (model chooses)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (model chooses)</SelectItem>
                {DIAGRAM_KINDS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {DIAGRAM_KIND_LABELS[k]}
                  </SelectItem>
                ))}
                </SelectContent>
              </Select>
            </div>
            <button
              type="button"
              onClick={() => void runGenerate()}
              disabled={!hasMountedClient || loading || !prompt.trim()}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-medium text-primary-foreground shadow-sm disabled:pointer-events-none disabled:opacity-50 sm:text-sm"
            >
              {loading ? (
                <Loader2 className="size-5 animate-spin" aria-hidden />
              ) : (
                <PenLine className="size-5" aria-hidden />
              )}
              Generate
            </button>
          </div>

        </div>

        <div className="flex min-w-0 flex-col gap-4">
          {meta ? (
            <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm">
              <span className="font-medium">{meta.title}</span>
              <span className="text-muted-foreground">
                {" "}
                · {DIAGRAM_KIND_LABELS[meta.diagramKind]}
              </span>
            </div>
          ) : null}

          <div className="space-y-4">
            <label className="text-sm font-medium" htmlFor="diagram-palette">
              Diagram colors
            </label>
            <Select
              value={diagramPaletteId}
              onValueChange={(value) => {
                const id = value as DiagramPaletteId;
                setDiagramPaletteId(id);
                writeStoredDiagramPaletteId(id);
                setLastSvg(null);
              }}
            >
              <SelectTrigger
                id="diagram-palette"
                className="w-full data-[size=default]:h-11 **:data-[slot=select-value]:text-base sm:**:data-[slot=select-value]:text-sm"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                  <DiagramPaletteSwatchStrip
                    colors={getPalettePreviewSwatches(getDiagramPalette(diagramPaletteId))}
                  />
                  <SelectValue className="truncate font-medium">
                    {getDiagramPalette(diagramPaletteId).label}
                  </SelectValue>
                </span>
              </SelectTrigger>
              <SelectContent>
                {DIAGRAM_PALETTES.map((p) => (
                  <SelectItem
                    key={p.id}
                    value={p.id}
                    textValue={`${p.label} ${p.description}`}
                  >
                    <span className="flex min-w-0 items-start gap-2.5 pr-1">
                      <DiagramPaletteSwatchStrip
                        className="mt-0.5"
                        colors={getPalettePreviewSwatches(p)}
                      />
                      <span className="min-w-0 flex flex-col gap-0.5 text-left leading-snug">
                        <span className="font-medium">{p.label}</span>
                        <span className="text-xs text-muted-foreground">{p.description}</span>
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div
                className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5"
                role="tablist"
                aria-label="Diagram output"
              >
                <button
                  type="button"
                  role="tab"
                  aria-controls="diagram-preview-panel"
                  aria-selected={diagramView === "preview"}
                  onClick={() => setDiagramView("preview")}
                  className={cn(
                    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    diagramView === "preview"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Eye className="size-3.5 shrink-0 opacity-70" aria-hidden />
                  Preview
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-controls="diagram-source-panel"
                  aria-selected={diagramView === "source"}
                  onClick={() => setDiagramView("source")}
                  className={cn(
                    "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    diagramView === "source"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Code2 className="size-3.5 shrink-0 opacity-70" aria-hidden />
                  Mermaid
                </button>
              </div>
              <button
                type="button"
                onClick={() => void copyMermaidSource()}
                disabled={!hasMountedClient || !mermaidCode?.trim()}
                className="inline-flex min-h-9 shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-50 sm:self-auto"
              >
                <Copy className="size-3.5" aria-hidden />
                Copy
              </button>
            </div>

            <DiagramFeedback
              apiError={apiError}
              parseError={parseError}
              diagramKind={meta?.diagramKind ?? null}
              canRegenerate={Boolean(prompt.trim())}
              loading={loading}
              repairLoading={repairLoading}
              canRepair={Boolean(mermaidCode && parseError)}
              onRegenerate={() => void runGenerate()}
              onRepair={() => void runRepair()}
            />

            <div
              id="diagram-preview-panel"
              role="tabpanel"
              hidden={diagramView !== "preview"}
              className={cn(diagramView !== "preview" && "hidden")}
            >
              <MermaidPreview
                code={mermaidCode}
                onRendered={onRendered}
                paletteId={diagramPaletteId}
              />
            </div>
            <div
              id="diagram-source-panel"
              role="tabpanel"
              hidden={diagramView !== "source"}
              className={cn(diagramView !== "source" && "hidden")}
            >
              <label htmlFor="mermaid-source" className="sr-only">
                Mermaid diagram source
              </label>
              <textarea
                id="mermaid-source"
                value={mermaidCode ?? ""}
                onChange={(e) =>
                  setMermaidCode(e.target.value.length === 0 ? null : e.target.value)
                }
                spellCheck={false}
                placeholder="Generate a diagram, or paste Mermaid syntax here. The preview updates in the background—switch to Preview to see it, or fix errors shown above."
                rows={16}
                className="min-h-[min(70vh,520px)] w-full resize-y rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm leading-relaxed text-foreground shadow-inner focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => void downloadPng()}
              disabled={!hasMountedClient || !lastSvg}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm disabled:pointer-events-none disabled:opacity-50 sm:flex-none"
            >
              <Download className="size-4" aria-hidden />
              Download PNG
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              disabled={!hasMountedClient || !lastSvg}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 text-sm font-medium shadow-xs transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-50 sm:flex-none"
            >
              <Download className="size-4" aria-hidden />
              Download SVG
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            PNG is 2× resolution with a background that matches the color preset—best for
            documents and slides. SVG stays sharp and lightweight for editing.
            Both are trimmed to your diagram with a small margin.
            {meta?.diagramKind === "gantt"
              ? " Gantt exports use a tighter crop (row backgrounds are ignored) and a width matched to your screen."
              : null}
          </p>
          {exportError ? (
            <div
              role="status"
              className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <span className="min-w-0">PNG export: {exportError}</span>
              <button
                type="button"
                className="shrink-0 text-xs font-medium underline-offset-2 hover:underline"
                onClick={() => setExportError(null)}
              >
                Dismiss
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <AlertDialog open={outOfCreditsDialogOpen} onOpenChange={setOutOfCreditsDialogOpen}>
        <AlertDialogContent size="sm" className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>You&apos;re out of credits</AlertDialogTitle>
            <AlertDialogDescription>
              Grab a credit pack on Pricing to keep generating diagrams.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11 sm:min-h-9">Close</AlertDialogCancel>
            <Button asChild size="lg" className="min-h-11 w-full sm:w-auto sm:min-h-9">
              <Link href="/pricing">Buy credits</Link>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
