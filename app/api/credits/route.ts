import { CREDIT_PACKAGES, FREE_STARTER_CREDITS } from "@/lib/billing-config";
import { getUserCredits } from "@/lib/billing";
import { getServerSessionResult } from "@/lib/server-session";

export const runtime = "nodejs";

export async function GET() {
  const { session, error } = await getServerSessionResult();
  if (error === "AUTH_STORE_UNAVAILABLE") {
    return Response.json(
      { error: "Authentication store is unavailable. Please retry shortly." },
      { status: 503 },
    );
  }
  if (!session?.user?.id) {
    return Response.json(
      { error: "Please sign in to see your credits." },
      { status: 401 },
    );
  }

  const credits = await getUserCredits(session.user.id);
  return Response.json({
    credits,
    freeStarterCredits: FREE_STARTER_CREDITS,
    packages: CREDIT_PACKAGES,
  });
}
