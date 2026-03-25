import { z } from "zod";
import { creditVerifiedPayment, getPaymentForUser, markPaymentStatus } from "@/lib/billing";
import { getServerSessionResult } from "@/lib/server-session";

const verifySchema = z.object({
  reference: z.string().min(1),
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
  if (!session?.user?.id) {
    return Response.json(
      { error: "Please sign in before verifying payment." },
      { status: 401 },
    );
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    return Response.json(
      { error: "Missing PAYSTACK_SECRET_KEY on the server." },
      { status: 500 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = verifySchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: "Missing payment reference" }, { status: 400 });
  }

  const reference = parsed.data.reference;
  const payment = await getPaymentForUser(reference, session.user.id);
  if (!payment) {
    return Response.json({ error: "Payment transaction not found" }, { status: 404 });
  }

  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      cache: "no-store",
    },
  );
  const verifyJson: unknown = await verifyRes.json();

  if (!verifyRes.ok) {
    await markPaymentStatus(reference, session.user.id, "failed", verifyJson);
    return Response.json(
      { error: "Could not verify transaction with Paystack." },
      { status: 502 },
    );
  }

  const data = (verifyJson as { data?: Record<string, unknown> }).data;
  const status = data?.status;
  const amount = Number(data?.amount);
  const expectedKobo = Number(payment.amountNaira) * 100;

  if (status !== "success" || !Number.isFinite(amount) || amount < expectedKobo) {
    await markPaymentStatus(reference, session.user.id, "failed", verifyJson);
    return Response.json(
      { error: "Payment is not successful or amount is invalid." },
      { status: 400 },
    );
  }

  await markPaymentStatus(reference, session.user.id, "verified", verifyJson);
  const creditResult = await creditVerifiedPayment(reference, session.user.id);

  if (!creditResult.ok) {
    return Response.json({ error: creditResult.error }, { status: 500 });
  }

  return Response.json({
    success: true,
    credits: creditResult.balance,
    packageId: creditResult.pkg.id,
    credited: creditResult.pkg.credits,
  });
}
