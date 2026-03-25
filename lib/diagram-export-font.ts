/**
 * Font stack for Mermaid + PNG raster export. Avoids `inherit`, which can make
 * WebKit resolve the site's webfonts when an SVG is loaded into an Image and
 * drawn to a canvas — leading to tainted canvases and failing `toBlob`.
 */
export const DIAGRAM_RASTER_FONT_FAMILY =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
