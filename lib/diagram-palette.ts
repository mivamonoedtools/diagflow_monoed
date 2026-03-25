/**
 * Mermaid diagram color presets (theme + themeVariables).
 * @see https://mermaid.js.org/config/theming.html
 *
 * Custom palettes must set **state diagram** tokens explicitly: `primaryTextColor` is often
 * chosen for high-contrast flow nodes, but state nodes use light `mainBkg` — without
 * `stateLabelColor` / `stateBkg`, labels can disappear. Built-in themes (neutral, forest)
 * already bundle safe defaults.
 */

export const DIAGRAM_PALETTE_IDS = [
  "neutral",
  "paper",
  "ocean",
  "forest",
  "midnight",
  "contrast",
] as const;

export type DiagramPaletteId = (typeof DIAGRAM_PALETTE_IDS)[number];

export type DiagramPalette = {
  id: DiagramPaletteId;
  label: string;
  description: string;
  /** Mermaid built-in theme base */
  mermaidTheme: "default" | "base" | "dark" | "forest" | "neutral";
  themeVariables: Record<string, string>;
  /** Solid fill behind rasterized PNG export */
  pngBackground: string;
};

export const DIAGRAM_PALETTES: readonly DiagramPalette[] = [
  {
    id: "neutral",
    label: "Neutral",
    description: "Default soft grays (current look).",
    mermaidTheme: "neutral",
    themeVariables: {},
    pngBackground: "#ffffff",
  },
  {
    id: "paper",
    label: "Warm paper",
    description: "Cream background with terracotta accents.",
    mermaidTheme: "base",
    themeVariables: {
      mainBkg: "#faf7f2",
      primaryColor: "#e85d4c",
      primaryTextColor: "#1c1917",
      primaryBorderColor: "#c24133",
      secondaryColor: "#f5ebe0",
      secondaryTextColor: "#292524",
      secondaryBorderColor: "#d6cfc4",
      tertiaryColor: "#fff7ed",
      tertiaryTextColor: "#44403c",
      tertiaryBorderColor: "#c4b8a8",
      lineColor: "#78716c",
      textColor: "#1c1917",
      nodeBorder: "#a8a29e",
      clusterBkg: "#f5f0e8",
      clusterBorder: "#c4b8a8",
      edgeLabelBackground: "#faf7f2",
      actorBkg: "#faf7f2",
      actorBorder: "#a8a29e",
      actorTextColor: "#1c1917",
      signalColor: "#57534e",
      labelBoxBkgColor: "#fff7ed",
      labelBoxBorderColor: "#c24133",
      labelTextColor: "#1c1917",
      loopTextColor: "#44403c",
      noteBkgColor: "#fffbeb",
      noteTextColor: "#422006",
      noteBorderColor: "#ca8a04",
      sequenceNumberColor: "#faf7f2",
      stateBkg: "#f5f0e8",
      stateLabelColor: "#1c1917",
      transitionColor: "#78716c",
      transitionLabelColor: "#44403c",
      labelBackgroundColor: "#faf7f2",
    },
    pngBackground: "#faf7f2",
  },
  {
    id: "ocean",
    label: "Ocean",
    description: "Cool blues for slides and docs.",
    mermaidTheme: "base",
    themeVariables: {
      mainBkg: "#f0f9ff",
      primaryColor: "#0284c7",
      primaryTextColor: "#f8fafc",
      primaryBorderColor: "#0369a1",
      secondaryColor: "#e0f2fe",
      secondaryTextColor: "#0c4a6e",
      secondaryBorderColor: "#7dd3fc",
      tertiaryColor: "#f0f9ff",
      tertiaryTextColor: "#075985",
      tertiaryBorderColor: "#38bdf8",
      lineColor: "#0369a1",
      textColor: "#0c4a6e",
      nodeBorder: "#0ea5e9",
      clusterBkg: "#dbeafe",
      clusterBorder: "#3b82f6",
      edgeLabelBackground: "#f0f9ff",
      actorBkg: "#e0f2fe",
      actorBorder: "#0284c7",
      actorTextColor: "#0c4a6e",
      signalColor: "#0369a1",
      labelBoxBkgColor: "#bae6fd",
      labelBoxBorderColor: "#0369a1",
      labelTextColor: "#0c4a6e",
      loopTextColor: "#075985",
      noteBkgColor: "#ecfeff",
      noteTextColor: "#164e63",
      noteBorderColor: "#0891b2",
      sequenceNumberColor: "#f8fafc",
      stateBkg: "#e0f2fe",
      stateLabelColor: "#0c4a6e",
      transitionColor: "#0369a1",
      transitionLabelColor: "#075985",
      labelBackgroundColor: "#f0f9ff",
    },
    pngBackground: "#f0f9ff",
  },
  {
    id: "forest",
    label: "Forest",
    description: "Mermaid forest theme, nature tones.",
    mermaidTheme: "forest",
    themeVariables: {},
    pngBackground: "#f7fcf8",
  },
  {
    id: "midnight",
    label: "Midnight",
    description: "Dark surfaces; PNG uses the same background.",
    mermaidTheme: "dark",
    themeVariables: {
      mainBkg: "#0f172a",
      background: "#0f172a",
      primaryColor: "#38bdf8",
      primaryTextColor: "#0f172a",
      primaryBorderColor: "#7dd3fc",
      secondaryColor: "#1e293b",
      secondaryTextColor: "#e2e8f0",
      secondaryBorderColor: "#475569",
      tertiaryColor: "#334155",
      tertiaryTextColor: "#f1f5f9",
      tertiaryBorderColor: "#64748b",
      lineColor: "#94a3b8",
      textColor: "#e2e8f0",
      nodeBorder: "#64748b",
      clusterBkg: "#1e293b",
      clusterBorder: "#475569",
      edgeLabelBackground: "#1e293b",
      actorBkg: "#1e293b",
      actorBorder: "#64748b",
      actorTextColor: "#e2e8f0",
      signalColor: "#94a3b8",
      labelBoxBkgColor: "#334155",
      labelBoxBorderColor: "#38bdf8",
      labelTextColor: "#f8fafc",
      loopTextColor: "#cbd5e1",
      noteBkgColor: "#422006",
      noteTextColor: "#fed7aa",
      noteBorderColor: "#ea580c",
      sequenceNumberColor: "#0f172a",
      stateBkg: "#1e293b",
      stateLabelColor: "#e2e8f0",
      transitionColor: "#94a3b8",
      transitionLabelColor: "#cbd5e1",
      labelBackgroundColor: "#0f172a",
    },
    pngBackground: "#0f172a",
  },
  {
    id: "contrast",
    label: "High contrast",
    description: "Bold black borders, readable text.",
    mermaidTheme: "base",
    themeVariables: {
      mainBkg: "#ffffff",
      primaryColor: "#171717",
      primaryTextColor: "#ffffff",
      primaryBorderColor: "#000000",
      secondaryColor: "#f5f5f5",
      secondaryTextColor: "#171717",
      secondaryBorderColor: "#404040",
      tertiaryColor: "#ffffff",
      tertiaryTextColor: "#262626",
      tertiaryBorderColor: "#525252",
      lineColor: "#171717",
      textColor: "#171717",
      nodeBorder: "#000000",
      clusterBkg: "#fafafa",
      clusterBorder: "#171717",
      edgeLabelBackground: "#ffffff",
      actorBkg: "#ffffff",
      actorBorder: "#000000",
      actorTextColor: "#171717",
      signalColor: "#171717",
      labelBoxBkgColor: "#f5f5f5",
      labelBoxBorderColor: "#000000",
      labelTextColor: "#171717",
      loopTextColor: "#404040",
      noteBkgColor: "#fef9c3",
      noteTextColor: "#422006",
      noteBorderColor: "#a16207",
      sequenceNumberColor: "#ffffff",
      stateBkg: "#f5f5f5",
      stateLabelColor: "#171717",
      transitionColor: "#171717",
      transitionLabelColor: "#262626",
      labelBackgroundColor: "#ffffff",
    },
    pngBackground: "#ffffff",
  },
] as const;

export const DEFAULT_DIAGRAM_PALETTE_ID: DiagramPaletteId = "neutral";

/** Three colors for compact UI previews: canvas, accent (nodes), lines. */
export function getPalettePreviewSwatches(
  p: DiagramPalette,
): readonly [string, string, string] {
  const tv = p.themeVariables;
  const canvas = tv.mainBkg ?? p.pngBackground;

  if (p.id === "neutral") {
    return ["#ffffff", "#eceff4", "#5c6f7c"];
  }

  if (p.id === "forest") {
    return [p.pngBackground, "#43a047", "#1b5e20"];
  }

  const accent = tv.primaryColor ?? "#737373";
  const line = tv.lineColor ?? tv.nodeBorder ?? "#525252";
  return [canvas, accent, line];
}

export function getDiagramPalette(id: string | null | undefined): DiagramPalette {
  if (id && DIAGRAM_PALETTE_IDS.includes(id as DiagramPaletteId)) {
    const found = DIAGRAM_PALETTES.find((p) => p.id === id);
    if (found) return found;
  }
  return DIAGRAM_PALETTES[0];
}

const STORAGE_KEY = "diagflow-diagram-palette";

export function readStoredDiagramPaletteId(): DiagramPaletteId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && DIAGRAM_PALETTE_IDS.includes(raw as DiagramPaletteId)) {
      return raw as DiagramPaletteId;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStoredDiagramPaletteId(id: DiagramPaletteId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}
