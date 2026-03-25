"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, Network } from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { signInWithGoogle } from "@/lib/google-sign-in";
import { DIAGFLOW_CREDITS_UPDATED_EVENT } from "@/lib/credits-broadcast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CreditsResponse = {
  credits: number;
};

export function SiteHeader() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const avatarUrl = session?.user?.image;
  const avatarLabel = session?.user?.name || session?.user?.email || "User";
  const avatarInitial = avatarLabel.slice(0, 1).toUpperCase();

  const reloadCredits = useCallback(async () => {
    if (!session?.user?.id) {
      setCredits(null);
      return;
    }
    const res = await fetch("/api/credits", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as CreditsResponse;
    setCredits(data.credits);
  }, [session?.user?.id]);

  useEffect(() => {
    void reloadCredits();
  }, [reloadCredits]);

  useEffect(() => {
    const onCreditsUpdated = () => {
      void reloadCredits();
    };
    window.addEventListener(DIAGFLOW_CREDITS_UPDATED_EVENT, onCreditsUpdated);
    return () =>
      window.removeEventListener(DIAGFLOW_CREDITS_UPDATED_EVENT, onCreditsUpdated);
  }, [reloadCredits]);

  return (
    <header className="sticky top-0 z-40  bg-white shadow-xs">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary border border-primary/30 text-primary-foreground ">
            <Network className="size-4 text-white" aria-hidden />
          </span>
          <span className="min-w-0 leading-none">
            <span className="block truncate text-lg font-semibold tracking-tight sm:text-xl">
              <span className="text-foreground">Diag</span>
              <span className="text-primary pr-0.5">flow</span>
            </span>
            <span className="block pt-0 text-right text-[11px] font-medium text-muted-foreground sm:text-xs">
              by MonoEd
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border bg-background px-2 py-1 text-xs font-medium hover:bg-muted"
                  aria-label="Open account menu"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={avatarLabel}
                      className="size-6 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                      {avatarInitial}
                    </span>
                  )}
                  {credits ?? "..."} credits
                  <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">{avatarLabel}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => {
                    void signOut();
                  }}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              onClick={() => signInWithGoogle("/")}
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
