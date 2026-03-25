import { createAuthClient } from "better-auth/react";

/**
 * Omit absolute `baseURL` so the client resolves the API host from the current page origin
 * (`window.location.origin` in the browser). Forcing `http://localhost:3000` while the user
 * opens `http://127.0.0.1:3000` splits cookies/state across hosts and breaks OAuth.
 */
export const authClient = createAuthClient({
  basePath: "/api/auth",
});

export const { signIn, signOut, useSession } = authClient;
