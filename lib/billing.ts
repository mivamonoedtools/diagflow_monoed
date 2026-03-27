import { mongoDb } from "@/lib/mongodb";
import {
  CREDIT_PACKAGE_PAYMENT_SLUG,
  FREE_STARTER_CREDITS,
  getCreditPackageById,
  type CreditPackage,
} from "@/lib/billing-config";

type CreditLedgerEntry = {
  userId: string;
  delta: number;
  reason: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
};

type ConsumeCreditOptions = {
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
};

type UserCreditsDoc = {
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
};

let indexesReadyPromise: Promise<void> | null = null;

function userCreditsCollection() {
  return mongoDb.collection<UserCreditsDoc>("user_credits");
}

function creditLedgerCollection() {
  return mongoDb.collection<CreditLedgerEntry>("credit_ledger");
}

function paymentCollection() {
  return mongoDb.collection("payment_transactions");
}

async function ensureIndexes() {
  if (!indexesReadyPromise) {
    indexesReadyPromise = (async () => {
      await userCreditsCollection().createIndex({ userId: 1 }, { unique: true });
      await creditLedgerCollection().createIndex(
        { userId: 1, idempotencyKey: 1 },
        {
          unique: true,
          partialFilterExpression: { idempotencyKey: { $type: "string" } },
        },
      );
      await paymentCollection().createIndex({ reference: 1 }, { unique: true });
    })();
  }
  await indexesReadyPromise;
}

async function ensureCreditDoc(userId: string) {
  await ensureIndexes();
  const now = new Date();
  await userCreditsCollection().updateOne(
    { userId },
    {
      $setOnInsert: {
        userId,
        balance: FREE_STARTER_CREDITS,
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );
}

export async function getUserCredits(userId: string): Promise<number> {
  await ensureCreditDoc(userId);
  const doc = await userCreditsCollection().findOne(
    { userId },
    { projection: { balance: 1 } },
  );
  return doc?.balance ?? FREE_STARTER_CREDITS;
}

async function appendLedger(entry: CreditLedgerEntry) {
  await creditLedgerCollection().insertOne(entry);
}

export async function consumeGenerationCredit(
  userId: string,
  opts?: ConsumeCreditOptions,
): Promise<{ ok: true; balance: number } | { ok: false; balance: number }> {
  await ensureCreditDoc(userId);
  const ledger = creditLedgerCollection();

  if (opts?.idempotencyKey) {
    const existing = await ledger.findOne(
      { userId, idempotencyKey: opts.idempotencyKey },
      { projection: { _id: 1 } },
    );
    if (existing) {
      return { ok: true, balance: await getUserCredits(userId) };
    }
  }

  const updated = await userCreditsCollection().findOneAndUpdate(
    { userId, balance: { $gt: 0 } },
    { $inc: { balance: -1 }, $set: { updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!updated) {
    return { ok: false, balance: await getUserCredits(userId) };
  }

  try {
    await appendLedger({
      userId,
      delta: -1,
      reason: "diagram-generate",
      idempotencyKey: opts?.idempotencyKey,
      metadata: opts?.metadata,
      createdAt: new Date(),
    });
    return { ok: true, balance: updated.balance };
  } catch {
    if (opts?.idempotencyKey) {
      await userCreditsCollection().updateOne(
        { userId },
        { $inc: { balance: 1 }, $set: { updatedAt: new Date() } },
      );
      return { ok: true, balance: await getUserCredits(userId) };
    }
    return { ok: false, balance: await getUserCredits(userId) };
  }
}

export async function addCredits(
  userId: string,
  amount: number,
  reason: string,
  opts?: ConsumeCreditOptions,
): Promise<number> {
  await ensureCreditDoc(userId);
  const ledger = creditLedgerCollection();

  if (opts?.idempotencyKey) {
    const existing = await ledger.findOne(
      { userId, idempotencyKey: opts.idempotencyKey },
      { projection: { _id: 1 } },
    );
    if (existing) {
      return getUserCredits(userId);
    }
  }

  const updated = await userCreditsCollection().findOneAndUpdate(
    { userId },
    { $inc: { balance: amount }, $set: { updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  try {
    await appendLedger({
      userId,
      delta: amount,
      reason,
      idempotencyKey: opts?.idempotencyKey,
      metadata: opts?.metadata,
      createdAt: new Date(),
    });
  } catch {
    if (opts?.idempotencyKey) {
      return getUserCredits(userId);
    }
  }

  return updated?.balance ?? getUserCredits(userId);
}

export async function createPendingPayment(
  userId: string,
  pkg: CreditPackage,
  email: string,
) {
  await ensureIndexes();
  const tier = CREDIT_PACKAGE_PAYMENT_SLUG[pkg.id];
  const suffix = Math.random().toString(36).slice(2, 10);
  const reference = `diagflow-${tier}-${Date.now()}-${suffix}`;
  const now = new Date();

  await paymentCollection().insertOne({
    userId,
    email,
    reference,
    packageId: pkg.id,
    amountNaira: pkg.amountNaira,
    credits: pkg.credits,
    status: "initialized",
    createdAt: now,
    updatedAt: now,
  });

  return reference;
}

export async function getPaymentForUser(reference: string, userId: string) {
  await ensureIndexes();
  return paymentCollection().findOne({ reference, userId });
}

export async function markPaymentStatus(
  reference: string,
  userId: string,
  status: "verified" | "credited" | "failed",
  gatewayPayload?: unknown,
) {
  await ensureIndexes();
  await paymentCollection().updateOne(
    { reference, userId },
    {
      $set: {
        status,
        gatewayPayload: gatewayPayload ?? null,
        updatedAt: new Date(),
      },
    },
  );
}

export async function creditVerifiedPayment(reference: string, userId: string) {
  const payment = await getPaymentForUser(reference, userId);
  if (!payment) {
    return { ok: false as const, error: "Payment record not found" };
  }

  const pkg = getCreditPackageById(String(payment.packageId));
  if (!pkg) {
    return { ok: false as const, error: "Unknown payment package" };
  }

  const balance = await addCredits(userId, pkg.credits, "payment-credit", {
    idempotencyKey: `payment:${reference}`,
    metadata: { reference, packageId: pkg.id },
  });
  await markPaymentStatus(reference, userId, "credited");

  return { ok: true as const, balance, pkg };
}
