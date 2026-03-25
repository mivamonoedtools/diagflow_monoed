import Link from "next/link";
import { Network } from "lucide-react";

const MONOED_ORIGIN = "https://monoed.africa";
const MONOED_PRIVACY = `${MONOED_ORIGIN}/privacy`;
const MONOED_TERMS = `${MONOED_ORIGIN}/terms`;

const SIWES_TOOLS = [
  { href: "https://logbook.monoed.africa", label: "SIWES logbook generator" },
  { href: "https://report.monoed.africa", label: "SIWES report generator" },
  { href: "https://siwesfinder.monoed.africa", label: "SIWES / IT placement finder" },
] as const;

const FYP_TOOLS = [
  { href: "https://fyp.monoed.africa", label: "FYP report generator" },
  { href: "https://topics.monoed.africa", label: "Project topic suggestions" },
  { href: "https://refverify.monoed.africa", label: "Reference Verifier (RefVerify)" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/25">
      <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-10 sm:px-4">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-4 lg:max-w-sm">
            <div className="flex items-start gap-2">
              <Link
                href="/"
                className="flex min-w-0 items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary border border-primary/30 text-primary-foreground ">
                  <Network className="size-4 text-white" aria-hidden />
                </span>
                <span className="min-w-0 truncate text-base font-semibold tracking-tight">
                  <span className="text-foreground">Diag</span>
                  <span className="text-primary pr-0.5">flow</span>
                </span>
              </Link>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Describe a process in plain language — get a clean diagram and export PNG or SVG for
              your documents.
            </p>
          </div>

          <nav
            className="lg:col-span-4"
            aria-labelledby="footer-siwes-heading"
          >
            <h2
              id="footer-siwes-heading"
              className="text-xs font-semibold uppercase tracking-wider text-foreground"
            >
              SIWES tools
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-muted-foreground">
              {SIWES_TOOLS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-2 hover:text-foreground hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="lg:col-span-4" aria-labelledby="footer-fyp-heading">
            <h2
              id="footer-fyp-heading"
              className="text-xs font-semibold uppercase tracking-wider text-foreground"
            >
              Final year project
            </h2>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-muted-foreground">
              {FYP_TOOLS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-2 hover:text-foreground hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-border/60 bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span>© 2026 MonoEd. All rights reserved.</span>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <a
              href={MONOED_PRIVACY}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Privacy
            </a>
            <span className="text-border" aria-hidden>
              ·
            </span>
            <a
              href={MONOED_TERMS}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 hover:text-foreground hover:underline"
            >
              Terms
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
