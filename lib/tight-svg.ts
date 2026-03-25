/**
 * Rewrites root <svg> viewBox and dimensions to the tight bounding box of
 * rendered content (plus margin). Reduces empty space in exports.
 * Browser-only; returns input unchanged on failure or during SSR.
 */

import type { DiagramKind } from "@/lib/diagram-kinds";

export type TightenSvgOptions = {
  diagramKind?: DiagramKind | null;
};

/**
 * Mermaid Gantt draws full-width section bands and axis grid paths that span
 * the whole allocated width. Those strokes dominate a naive union/getBBox and
 * can collapse vertical extent (thin horizontal lines), producing an extremely
 * wide, short PNG. We strip non-ink overlays and grid strokes (not tick text)
 * before measuring.
 */
function stripGanttOverlaysForCrop(clone: SVGSVGElement) {
  clone.querySelectorAll("rect").forEach((rect) => {
    const cls = rect.getAttribute("class") || "";
    if (/\bsection\b/.test(cls) && !/\btask\b/.test(cls)) rect.remove();
    if (/\bexclude-range\b/.test(cls)) rect.remove();
  });
  clone.querySelectorAll("g.grid path, g.grid line").forEach((el) => el.remove());
}

export function tightenSvgToContent(
  svgMarkup: string,
  margin = 12,
  options?: TightenSvgOptions,
): string {
  if (typeof document === "undefined") return svgMarkup;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgMarkup, "image/svg+xml");
  const svg = doc.documentElement;
  if (!(svg instanceof SVGSVGElement)) return svgMarkup;

  const holder = document.createElement("div");
  holder.setAttribute("aria-hidden", "true");
  holder.style.cssText =
    "position:fixed;left:-10000px;top:0;width:1px;height:1px;overflow:visible;opacity:0;pointer-events:none";

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute("style");
  const vb = clone.getAttribute("viewBox");
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4) {
      const [, , vw, vh] = parts;
      if (vw > 0 && vh > 0) {
        clone.setAttribute("width", String(vw));
        clone.setAttribute("height", String(vh));
      }
    }
  } else {
    clone.setAttribute("width", "1200");
    clone.setAttribute("height", "900");
  }

  const forGantt = options?.diagramKind === "gantt";

  document.body.appendChild(holder);
  holder.appendChild(clone);

  let box: DOMRect;
  try {
    if (forGantt) {
      stripGanttOverlaysForCrop(clone);
    }
    box = clone.getBBox();
  } catch {
    document.body.removeChild(holder);
    return svgMarkup;
  }
  document.body.removeChild(holder);

  if (
    !Number.isFinite(box.width) ||
    !Number.isFinite(box.height) ||
    box.width <= 0 ||
    box.height <= 0
  ) {
    return svgMarkup;
  }

  /** If measurement still looks broken, bail out to original SVG. */
  if (forGantt && box.width > box.height * 25 && box.height < 64) {
    return svgMarkup;
  }

  const x = box.x - margin;
  const y = box.y - margin;
  const w = box.width + margin * 2;
  const h = box.height + margin * 2;

  svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
  svg.setAttribute("width", String(Math.max(1, Math.ceil(w))));
  svg.setAttribute("height", String(Math.max(1, Math.ceil(h))));
  if (!svg.getAttribute("xmlns")) {
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }

  return new XMLSerializer().serializeToString(svg);
}
