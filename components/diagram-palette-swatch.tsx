import { cn } from "@/lib/utils";

type DiagramPaletteSwatchStripProps = {
  colors: readonly [string, string, string];
  className?: string;
};

/** Small 3-column preview matching diagram canvas / accent / line colors. */
export function DiagramPaletteSwatchStrip({
  colors,
  className,
}: DiagramPaletteSwatchStripProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-5 w-9.5 shrink-0 overflow-hidden rounded-md border border-border/70 shadow-xs",
        className,
      )}
    >
      {colors.map((c, i) => (
        <span
          key={i}
          className="h-full min-h-5 min-w-0 flex-1"
          style={{ backgroundColor: c }}
        />
      ))}
    </span>
  );
}
