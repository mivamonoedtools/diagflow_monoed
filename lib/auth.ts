import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { mongoClient, mongoDb } from "./mongodb";

/** Strip trailing slash so origins match `Origin` / `Referer` headers. */
function normalizeOrigin(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * CSRF / origin allowlist (see Better Auth `trustedOrigins`).
 * In dev, allow both loopback hostnames so switching between them does not break OAuth or POSTs.
 */
function buildTrustedOrigins(): string[] {
  const primary =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const set = new Set<string>(
    [process.env.BETTER_AUTH_URL, process.env.NEXT_PUBLIC_APP_URL, primary]
      .filter((x): x is string => Boolean(x))
      .map(normalizeOrigin),
  );

  if (process.env.NODE_ENV !== "production") {
    set.add("http://localhost:3000");
    set.add("http://127.0.0.1:3000");
  }

  return [...set];
}

/**
 * Server OAuth `redirect_uri` uses this. Keep it aligned with the browser tab:
 * e.g. set `BETTER_AUTH_URL=http://127.0.0.1:3000` when using that origin, and register the
 * same URL in Google Cloud Console. Prefer env (`BETTER_AUTH_URL` per docs) over hardcoding.
 */
const baseURL = normalizeOrigin(
  process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
);

const googleConfigured =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

/** Enable only if MongoDB supports transactions (e.g. replica set). */
const useTransactions = process.env.MONGODB_USE_TRANSACTIONS === "true";

export const auth = betterAuth({
  appName: "Diagflow",
  baseURL,
  trustedOrigins: buildTrustedOrigins(),
  database: mongodbAdapter(mongoDb, {
    client: mongoClient,
    transaction: useTransactions,
  }),
  plugins: [nextCookies()],
  ...(googleConfigured
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        },
      }
    : {}),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});
