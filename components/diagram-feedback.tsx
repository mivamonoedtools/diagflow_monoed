"use client";

import Link from "next/link";
import type { DiagramKind } from "@/lib/diagram-kinds";
import {
  getHintsForApiError,
  getHintsForMermaidError,
  isOutOfCreditsMessage,
} from "@/lib/mermaid-error-hints";
import { cn } from "@/lib/utils";
import { signInWithGoogle } from "@/lib/google-sign-in";
import {
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Coins,
  Loader2,
  PenLine,
  RefreshCw,
  Wrench,
} from "lucide-react";
import { useState } from "react";

function isAuthGateApiError(message: string): boolean {
  return (
    /please sign in/i.test(message) ||
    /sign in with google/i.test(message) ||
    /sign in to use ai repair/i.test(message) ||
    /sign in to continue/i.test(message) ||
    /free diagram is used/i.test(message) ||
    /free starter credits/i.test(message) ||
    /unauthorized/i.test(message)
  );
}

type DiagramFeedbackProps = {
  apiError: string | null;
  parseError: string | null;
  diagramKind: DiagramKind | null;
  canRegenerate: boolean;
  loading: boolean;
  repairLoading: boolean;
  canRepair: boolean;
  onRegenerate: () => void;
  onRepair: () => void;
};

export function DiagramFeedback({
  apiError,
  parseError,
  diagramKind,
  canRegenerate,
  loading,
  repairLoading,
  canRepair,
  onRegenerate,
  onRepair,
}: DiagramFeedbackProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (apiError) {
    const outOfCredits = isOutOfCreditsMessage(apiError);
    const authGate = isAuthGateApiError(apiError);

    if (outOfCredits) {
      return (
        <div
          role="alert"
          className="rounded-2xl border border-primary/35 bg-primary/5 px-4 py-4 sm:px-5 sm:py-5"
        >
          <div className="flex gap-4">
            <div
              className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              aria-hidden
            >
              <Coins className="size-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-1.5">
                <p className="font-heading text-lg font-semibold tracking-tight text-foreground">
                  You&apos;re out of credits
                </p>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  Grab a credit pack on Pricing and you can keep generating diagrams right away.
                </p>
              </div>
              <Link
                href="/pricing"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-95"
              >
                Buy credits
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (authGate) {
      const title = "Continue with Google";
      return (
        <div
          role="alert"
          className={cn(
            "space-y-3 rounded-xl border px-3 py-3 text-sm sm:px-4",
            "border-primary/25 bg-primary/5 text-foreground",
          )}
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
            <div className="min-w-0 space-y-1">
              <p className="font-semibold leading-tight">{title}</p>
              <p className="wrap-break-word text-muted-foreground">{apiError}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                signInWithGoogle(
                  typeof window !== "undefined" ? window.location.pathname || "/" : "/",
                )
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-95"
            >
              Sign in with Google
            </button>
          </div>
        </div>
      );
    }

    const { hints } = getHintsForApiError(apiError);
    return (
      <div
        role="alert"
        className="space-y-3 rounded-xl border border-destructive/45 bg-destructive/10 px-3 py-3 text-sm text-destructive sm:px-4"
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
          <div className="min-w-0 space-y-1">
            <p className="font-semibold leading-tight">Couldn&apos;t reach the AI</p>
            <p className="wrap-break-word text-destructive/95">{apiError}</p>
            {hints.length > 0 ? (
              <ul className="list-inside list-disc text-xs opacity-95">
                {hints.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRegenerate}
            disabled={!canRegenerate || loading}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-destructive bg-background px-4 text-sm font-semibold text-destructive shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="size-4" aria-hidden />
            )}
            Regenerate
          </button>
        </div>
      </div>
    );
  }

  if (parseError) {
    const { hints } = getHintsForMermaidError(parseError, { diagramKind });
    return (
      <div
        role="alert"
        className="space-y-3 rounded-xl border border-amber-500/50 bg-amber-500/10 px-3 py-3 text-sm text-amber-950 sm:px-4 dark:text-amber-50"
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden />
          <div className="min-w-0 space-y-1">
            <p className="font-semibold leading-tight text-amber-950 dark:text-amber-50">
              This diagram didn&apos;t render
            </p>
            <ul className="list-inside list-disc text-xs opacity-95 sm:text-sm">
              {hints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-1 flex w-full min-h-10 items-center justify-between gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 px-2 py-1.5 text-left text-xs font-medium text-amber-900 dark:border-amber-400/40 dark:text-amber-100 sm:text-sm"
              onClick={() => setDetailsOpen((o) => !o)}
              aria-expanded={detailsOpen}
            >
              <span>{detailsOpen ? "Hide" : "Show"} technical details</span>
              <ChevronDown
                className={cn("size-4 shrink-0 transition-transform", detailsOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            {detailsOpen ? (
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all rounded-md border border-amber-500/30 bg-background/80 p-2 font-mono text-[10px] leading-snug text-foreground sm:text-xs">
                {parseError}
              </pre>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={onRepair}
            disabled={!canRepair || repairLoading}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-amber-700 disabled:opacity-50 sm:flex-initial dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            {repairLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Wrench className="size-4" aria-hidden />
            )}
            Fix with AI
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={!canRegenerate || loading}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-amber-700/40 bg-card px-4 text-sm font-medium text-amber-950 shadow-sm hover:bg-amber-500/10 disabled:opacity-50 sm:flex-initial dark:border-amber-300/40 dark:text-amber-50 dark:hover:bg-amber-950/30"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <PenLine className="size-4" aria-hidden />
            )}
            Regenerate from prompt
          </button>
        </div>
      </div>
    );
  }

  return null;
}
