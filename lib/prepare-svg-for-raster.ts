/**
 * Prepare Mermaid SVG for drawImage + canvas.toBlob. Locks fonts and drops
 * embedded bitmaps that reference absolute cross-origin URLs (common taint source).
 */

import { DIAGRAM_RASTER_FONT_FAMILY } from "@/lib/diagram-export-font";

const XLINK_NS = "http://www.w3.org/1999/xlink";
const EXTERNAL_REF_RE = /^(https?:)?\/\//i;
const EXTERNAL_CSS_URL_RE = /url\(\s*(['"]?)(.*?)\1\s*\)/gi;

function isExternalRef(value: string): boolean {
  return EXTERNAL_REF_RE.test(value.trim());
}

function scrubExternalCssUrls(input: string): string {
  return input.replace(EXTERNAL_CSS_URL_RE, (full, _quote, rawUrl: string) => {
    return isExternalRef(rawUrl) ? "none" : full;
  });
}

function scrubStyleBlockCss(input: string): string {
  return scrubExternalCssUrls(input).replace(/@import\s+[^;]+;?/gi, "");
}

function stripExternalSvgResources(root: SVGSVGElement) {
  root.querySelectorAll("*").forEach((el) => {
    const href = el.getAttribute("href") || el.getAttributeNS(XLINK_NS, "href") || "";
    const src = el.getAttribute("src") || "";
    if ((href && isExternalRef(href)) || (src && isExternalRef(src))) {
      el.remove();
      return;
    }

    const styleAttr = el.getAttribute("style");
    if (styleAttr) {
      const scrubbed = scrubExternalCssUrls(styleAttr);
      if (scrubbed.trim()) {
        el.setAttribute("style", scrubbed);
      } else {
        el.removeAttribute("style");
      }
    }

    // Keep local defs (`url(#id)`) but remove cross-origin URL refs.
    [
      "fill",
      "stroke",
      "filter",
      "clip-path",
      "mask",
      "marker-start",
      "marker-mid",
      "marker-end",
    ].forEach((attr) => {
      const value = el.getAttribute(attr);
      if (!value) return;
      const scrubbed = scrubExternalCssUrls(value);
      if (scrubbed !== value) {
        if (scrubbed.trim()) {
          el.setAttribute(attr, scrubbed);
        } else {
          el.removeAttribute(attr);
        }
      }
    });
  });

  root.querySelectorAll("style").forEach((styleEl) => {
    styleEl.textContent = scrubStyleBlockCss(styleEl.textContent ?? "");
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

  stripExternalSvgResources(root);
  appendFontLockStyle(doc, root);

  return new XMLSerializer().serializeToString(root);
}
