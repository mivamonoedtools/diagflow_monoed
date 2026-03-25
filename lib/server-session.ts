import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type ServerSessionResult =
  | {
      session: Awaited<ReturnType<typeof auth.api.getSession>>;
      error: null;
    }
  | {
      session: null;
      error: "AUTH_STORE_UNAVAILABLE";
    };

function isAuthStoreUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    /FAILED_TO_GET_SESSION/i.test(message) ||
    /MongoTopologyClosedError/i.test(message) ||
    /MongoServerSelectionError/i.test(message) ||
    /ECONNREFUSED/i.test(message)
  );
}

export async function getServerSessionResult(): Promise<ServerSessionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return { session, error: null };
  } catch (error) {
    if (isAuthStoreUnavailable(error)) {
      return { session: null, error: "AUTH_STORE_UNAVAILABLE" };
    }
    throw error;
  }
}
