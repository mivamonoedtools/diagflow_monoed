import Link from "next/link";

export function DiagramToolGuide() {
  return (
    <section
      className="border-t bg-muted/15"
      aria-labelledby="how-diagflow-works-heading"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:py-16">
        <div className="max-w-3xl space-y-3">
          <h2
            id="how-diagflow-works-heading"
            className="font-heading text-2xl font-semibold tracking-tight text-foreground"
          >
            How to use Diagflow
          </h2>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Diagflow turns a short description into a diagram you can paste into Word, Google Docs,
            Notion, or slides. The editor below is the full tool —{" "}
            <a
              href="#diagram-tool"
              className="font-medium text-foreground underline underline-offset-2 decoration-primary"
            >
              jump to the generator
            </a>
            .
          </p>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">1. Describe what you need</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Type your process, timeline, or system in plain language in the prompt box. Try the
              example prompt cards for a one-click start, then edit the text to match your topic.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">2. Pick a diagram kind (optional)</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Leave <span className="font-medium text-foreground/90">Diagram kind</span> on auto, or
              choose flowchart, sequence, class, state, entity–relationship, Gantt, or pie — so the
              model matches the right Mermaid diagram type.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">3. Generate and fix</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Press <span className="font-medium text-foreground/90">Generate</span> to build the
              diagram. If something looks wrong, use <span className="font-medium text-foreground/90">Regenerate</span>{" "}
              with the same prompt, or <span className="font-medium text-foreground/90">Repair</span> when
              the preview reports a parse error (sign-in may be required for repair). Use the{" "}
              <span className="font-medium text-foreground/90">Mermaid</span> tab to view or edit the
              raw diagram code; the preview re-renders from your edits.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">4. Colors and export</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground/90">Diagram colors</span> presets affect
              both preview and export. Download <span className="font-medium text-foreground/90">PNG</span>{" "}
              for documents and presentations (2× resolution, background matches the preset), or{" "}
              <span className="font-medium text-foreground/90">SVG</span> for scalable, editable
              vector output. Exports are trimmed to the diagram with a small margin.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-xl border border-border/80 bg-background/60 px-4 py-5 sm:px-5">
          <h3 className="text-sm font-semibold text-foreground">Credits and account</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Generations use credits. You can try the tool with starter access; for ongoing use, pick a
            credit pack on{" "}
            <Link
              href="/pricing"
              className="font-medium text-foreground underline underline-offset-2 decoration-primary"
            >
              Pricing
            </Link>
            . Sign in with Google when you want to save progress across sessions and use repair.
          </p>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          Diagrams render with{" "}
          <a
            href="https://mermaid.js.org/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 decoration-primary hover:text-foreground"
          >
            Mermaid
          </a>
          , so the output stays standard and portable.
        </p>
      </div>
    </section>
  );
}
