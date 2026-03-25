/**
 * Prepare Mermaid SVG for drawImage + canvas.toBlob. Locks fonts and drops
 * embedded bitmaps that reference absolute cross-origin URLs (common taint source).
 */

import { DIAGRAM_RASTER_FONT_FAMILY } from "@/lib/diagram-export-font";

function stripExternalSvgImages(root: SVGSVGElement) {
  root.querySelectorAll("image").forEach((el) => {
    const href =
      el.getAttribute("href") ||
      el.getAttributeNS("http://www.w3.org/1999/xlink", "href") ||
      "";
    const t = href.trim();
    if (!t || t.startsWith("data:") || t.startsWith("#")) return;
    if (/^https?:\/\//i.test(t) || t.startsWith("//")) el.remove();
  });
}

/**
 * Appends a final &lt;style&gt; so it wins the cascade over Mermaid's rules.
 */
function appendFontLockStyle(doc: Document, root: SVGSVGElement) {
  const styleEl = doc.createElementNS("http://www.w3.org/2000/svg", "style");
  styleEl.setAttribute("type", "text/css");
  styleEl.textContent = `svg, text, tspan { font-family: ${DIAGRAM_RASTER_FONT_FAMILY} !important; }`;
  root.appendChild(styleEl);
}

export function prepareSvgForRasterExport(svg: string): string {
  if (typeof document === "undefined") return svg;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, "image/svg+xml");
  const root = doc.documentElement;
  if (!(root instanceof SVGSVGElement)) return svg;

  stripExternalSvgImages(root);
  appendFontLockStyle(doc, root);

  return new XMLSerializer().serializeToString(root);
}
