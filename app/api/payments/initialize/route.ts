import { z } from "zod";
import { createPendingPayment } from "@/lib/billing";
import { getCreditPackageById } from "@/lib/billing-config";
import { getServerSessionResult } from "@/lib/server-session";

const initSchema = z.object({
  packageId: z.string().min(1),
});

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { session, error } = await getServerSessionResult();
  if (error === "AUTH_STORE_UNAVAILABLE") {
    return Response.json(
      { error: "Authentication store is unavailable. Please retry shortly." },
      { status: 503 },
    );
  }
  if (!session?.user?.id || !session.user.email) {
    return Response.json(
      { error: "Please sign in before starting payment." },
      { status: 401 },
    );
  }

  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  if (!publicKey) {
    return Response.json(
      { error: "Missing NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY on the server." },
      { status: 500 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = initSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Invalid package payload" }, { status: 400 });
  }

  const pkg = getCreditPackageById(parsed.data.packageId);
  if (!pkg) {
    return Response.json({ error: "Unknown credit package" }, { status: 400 });
  }

  const reference = await createPendingPayment(session.user.id, pkg, session.user.email);
  return Response.json({
    publicKey,
    reference,
    email: session.user.email,
    amountKobo: pkg.amountNaira * 100,
    packageId: pkg.id,
    credits: pkg.credits,
    amountNaira: pkg.amountNaira,
  });
}
