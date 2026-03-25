/** Set after the user's first successful anonymous diagram generation. */
export const ANON_GENERATE_USED_COOKIE = "diagflow_anon_gen_used";

export const ANON_TRIAL_EXHAUSTED_ERROR =
  "Your free diagram is used. Sign in with Google to keep generating — new accounts get free starter credits.";

export function anonGenerateUsedCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  };
}

export function isAnonymousGenerateUsed(value: string | undefined): boolean {
  return value === "1";
}
