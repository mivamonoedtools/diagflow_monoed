import { ArrowRight, Download, FileText, PenLine } from "lucide-react";

const DOC_TOOL_CHIPS = ["MS Word", "Google Docs", "Notion", "Slides"] as const;

function HeroDecorNodes() {
  return (
    <>
      <div
        className="animate-landing-hero-float pointer-events-none absolute -right-8 top-6 sm:-right-16 sm:top-2"
        aria-hidden
      >
        <svg
          className="h-[min(52vw,280px)] w-[min(90vw,380px)] rotate-[11deg] text-primary/8 sm:h-[320px] sm:w-[420px] dark:text-primary/7"
          viewBox="0 0 420 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
        <circle cx="48" cy="52" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M48 62v36" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <rect
          x="18"
          y="118"
          width="60"
          height="28"
          rx="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M48 146v34" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path
          d="M48 180 82 214"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M48 180 14 214"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="320" cy="240" r="12" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M320 228v-40M300 202h40"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <rect
          x="286"
          y="78"
          width="88"
          height="36"
          rx="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M330 114v32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path
          d="M330 146 300 178M330 146 360 178"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        </svg>
      </div>
      <div
        className="animate-landing-hero-float-slow pointer-events-none absolute bottom-0 -left-28 sm:-left-24 sm:bottom-2 [mask-image:linear-gradient(to_top_right,black_20%,black_40%,transparent_50%)] [-webkit-mask-image:linear-gradient(to_top_right,black_20%,black_40%,transparent_78%)]"
        aria-hidden
      >
        <svg
          className="h-[min(48vw,260px)] w-[min(85vw,360px)] -rotate-[13deg] text-chart-2/10 dark:text-chart-2/7"
          viewBox="0 0 380 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
        <path
          d="M32 56c48-18 96-6 132 28M200 92c36 42 92 52 146 24"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <polygon
          points="290,48 310,68 290,88 270,68"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <rect
          x="48"
          y="200"
          width="72"
          height="32"
          rx="7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path
          d="M84 232v36M64 262h40"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="260" cy="210" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>
    </>
  );
}

function HeroFlowPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none lg:justify-self-end">
      <div className="relative rotate-[2deg] rounded-2xl border border-border/80 bg-card/85 p-5 shadow-[0_22px_60px_-18px_color-mix(in_oklch,var(--foreground)_18%,transparent)] backdrop-blur-sm ring-1 ring-foreground/[0.04] sm:p-6 md:rotate-[2.5deg]">
        <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-primary/[0.06] via-transparent to-chart-2/[0.05] pointer-events-none" />
        <p className="relative z-[1] mb-3 font-mono text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground">
          Preview
        </p>
        <svg
          className="relative z-[1] w-full text-foreground"
          viewBox="0 0 340 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <defs>
            <linearGradient id="hero-flow-edge" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--muted-foreground)" stopOpacity="0.35" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.65" />
            </linearGradient>
          </defs>
          <rect
            x="128"
            y="8"
            width="84"
            height="32"
            rx="8"
            className="stroke-primary/70"
            strokeWidth="1.6"
            fill="color-mix(in oklch, var(--primary) 12%, transparent)"
          />
          <text
            x="170"
            y="28"
            textAnchor="middle"
            className="fill-foreground text-[11px] font-medium"
            style={{ fontSize: "11px" }}
          >
            Start
          </text>
          <path d="M170 40v24" stroke="url(#hero-flow-edge)" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M166 60h8" stroke="url(#hero-flow-edge)" strokeWidth="1.8" strokeLinecap="round" />

          <rect
            x="112"
            y="68"
            width="116"
            height="36"
            rx="8"
            strokeWidth="1.4"
            className="stroke-border"
            fill="var(--card)"
          />
          <text
            x="170"
            y="90"
            textAnchor="middle"
            className="fill-muted-foreground text-[10px]"
            style={{ fontSize: "10px" }}
          >
            Describe process
          </text>

          <path d="M170 104v18" className="stroke-muted-foreground/45" strokeWidth="1.6" strokeLinecap="round" />

          <path
            d="M170 122 200 154 170 186 140 154Z"
            strokeWidth="1.45"
            className="stroke-primary/55"
            fill="color-mix(in oklch, var(--primary) 8%, transparent)"
          />
          <text
            x="170"
            y="158"
            textAnchor="middle"
            className="fill-foreground text-[9px] font-medium"
            style={{ fontSize: "9px" }}
          >
            OK?
          </text>

          <path
            d="M140 154H82v34"
            className="stroke-muted-foreground/40"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M200 154h62v34"
            className="stroke-muted-foreground/40"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          <rect
            x="50"
            y="188"
            width="64"
            height="30"
            rx="7"
            strokeWidth="1.35"
            className="stroke-border"
            fill="var(--muted)"
          />
          <text x="82" y="206" textAnchor="middle" className="fill-muted-foreground text-[9px]" style={{ fontSize: "9px" }}>
            Revise
          </text>

          <rect
            x="226"
            y="188"
            width="72"
            height="30"
            rx="7"
            strokeWidth="1.35"
            className="stroke-primary/50"
            fill="color-mix(in oklch, var(--primary) 14%, transparent)"
          />
          <text x="262" y="206" textAnchor="middle" className="fill-foreground text-[9px] font-medium" style={{ fontSize: "9px" }}>
            Export SVG
          </text>

          <text x="112" y="172" className="fill-muted-foreground text-[8px]" style={{ fontSize: "8px" }}>
            No
          </text>
          <text x="234" y="172" className="fill-muted-foreground text-[8px]" style={{ fontSize: "8px" }}>
            Yes
          </text>
        </svg>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b bg-linear-to-b from-primary/6 via-muted/35 to-background px-4 py-4 sm:py-6 ">
      <HeroDecorNodes />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,color-mix(in_oklch,var(--primary)_14%,transparent),transparent_58%)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-8%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_55%)]" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-6xl  pb-12 pt-10  sm:pb-16 sm:pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div className="relative text-center lg:text-left">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <FileText className="size-3.5 text-primary" aria-hidden />
              For reports, projects, and work docs
            </p>
            <h1 className="font-heading text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.12]">
              No more dragging shapes around in your{" "}
              <span className="bg-linear-to-r from-chart-2 via-primary to-chart-4 bg-clip-text text-transparent">
                documents
              </span>
            </h1>
            <div className="mt-4 flex flex-col items-center gap-2 sm:gap-2.5 lg:items-start">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Works with
              </p>
              <ul className="flex max-w-xl list-none flex-wrap justify-center gap-2 lg:justify-start">
                {DOC_TOOL_CHIPS.map((name) => (
                  <li key={name}>
                    <span className="inline-flex rounded-full border border-border/90 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-foreground/85 shadow-sm backdrop-blur-sm sm:px-3 sm:text-xs">
                      {name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-sm text-muted-foreground sm:text-base lg:mx-0">
              Explain your process in plain English and get a clean{" "}
              <span className="font-medium text-foreground/90">flowchart or diagram</span> in
              seconds. Export PNG or SVG and drop it anywhere images go—reports, decks, LMS, or
              internal wikis.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start">
              <a
                href="#diagram-tool"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-95"
              >
                Try it free
                <ArrowRight className="size-4" aria-hidden />
              </a>
            </div>
            <ul className="mx-auto mt-10 flex max-w-lg flex-col gap-3 text-left text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-8 sm:text-center lg:mx-0 lg:justify-start lg:text-left">
              <li className="flex items-start gap-2 sm:flex-col sm:items-center lg:flex-row lg:items-start">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
                  <PenLine className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="font-medium text-foreground">Describe once</span> — get a
                  diagram you can reuse instantly
                </span>
              </li>
              <li className="flex items-start gap-2 sm:flex-col sm:items-center lg:flex-row lg:items-start">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
                  <Download className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="font-medium text-foreground">Export-ready images</span> — crisp
                  SVG and 2× PNG
                </span>
              </li>
            </ul>
          </div>

          <HeroFlowPreview />
        </div>
      </div>
    </section>
  );
}
