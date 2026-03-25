"use client";

import { signIn } from "@/lib/auth-client";

let oauthRedirectInProgress = false;

/**
 * Starts Google OAuth at most once until the browser navigates away.
 * Double submissions (double-clicks, two visible "Sign in" buttons) can produce two
 * callback GETs with the same `state`; the second fails with Better Auth
 * `state_mismatch` / verification not found.
 */
export function signInWithGoogle(callbackPath: string = "/"): void {
  if (typeof window === "undefined") return;
  if (oauthRedirectInProgress) return;
  oauthRedirectInProgress = true;

  const path = callbackPath.startsWith("/") ? callbackPath : `/${callbackPath}`;

  void signIn
    .social({
      provider: "google",
      callbackURL: path,
    })
    .catch(() => {
      oauthRedirectInProgress = false;
    });

  window.setTimeout(() => {
    oauthRedirectInProgress = false;
  }, 120_000);
}
