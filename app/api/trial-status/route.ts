import { cookies } from "next/headers";
import {
  ANON_GENERATE_USED_COOKIE,
  isAnonymousGenerateUsed,
} from "@/lib/anonymous-trial";
import { getServerSessionResult } from "@/lib/server-session";

export const runtime = "nodejs";

export async function GET() {
  const { session, error } = await getServerSessionResult();
  if (error === "AUTH_STORE_UNAVAILABLE") {
    return Response.json(
      { error: "Authentication store is unavailable." },
      { status: 503 },
    );
  }

  if (session?.user?.id) {
    return Response.json({
      signedIn: true,
      anonymousGenerateAvailable: false,
    });
  }

  const jar = await cookies();
  const used = isAnonymousGenerateUsed(jar.get(ANON_GENERATE_USED_COOKIE)?.value);

  return Response.json({
    signedIn: false,
    anonymousGenerateAvailable: !used,
  });
}
