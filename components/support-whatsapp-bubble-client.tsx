"use client";

import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  url: string;
};

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.688 5.949L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function SupportWhatsAppBubbleClient({ url }: Props) {
  const [messageOpen, setMessageOpen] = useState(true);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      {messageOpen ? (
        <div
          className={cn(
            "pointer-events-auto w-[min(100vw-2rem,18rem)]",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200",
          )}
        >
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/4 dark:border-slate-700/80 dark:bg-slate-900 dark:shadow-black/40 dark:ring-white/6">
            <button
              type="button"
              onClick={() => setMessageOpen(false)}
              className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close message"
            >
              <X className="size-4" strokeWidth={2} aria-hidden />
            </button>
            <div className="px-4 pb-4 pt-10">
              <p className="text-[13px] font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Need help?
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400">
                If something breaks—diagrams, exports, credits—message us and we’ll sort it out.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-[filter] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900"
              >
                <WhatsAppGlyph className="size-4.5 shrink-0 text-white" />
                WhatsApp us
                <ExternalLink className="size-3.5 opacity-80" aria-hidden />
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setMessageOpen(true)}
        className={cn(
          "pointer-events-auto flex size-14 shrink-0 items-center justify-center rounded-full",
          "border border-slate-200/90 bg-white text-[#25D366]",
          "shadow-lg shadow-slate-900/12 ring-1 ring-slate-900/5",
          "transition-transform hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-950",
          "dark:border-slate-600 dark:bg-white dark:shadow-black/25",
        )}
        aria-label={messageOpen ? "Support (message open)" : "Open support message"}
      >
        <WhatsAppGlyph className="size-7" />
      </button>
    </div>
  );
}
