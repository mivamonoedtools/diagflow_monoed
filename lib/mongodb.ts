import { MongoClient, type MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "Missing MONGODB_URI. Add it to .env.local (see .env.example).",
  );
}
const mongoUri = uri;

/** Default DB name can be set here or via the path in MONGODB_URI. */
const dbName = process.env.MONGODB_DB;

/** Cap connections per Node process (Atlas counts every process × pool). */
const maxPoolSize = (() => {
  const raw = process.env.MONGODB_MAX_POOL_SIZE;
  if (raw === undefined || raw === "") {
    return 10;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) {
    return 10;
  }
  return Math.min(100, Math.floor(n));
})();

const clientOptions: MongoClientOptions = {
  maxPoolSize,
  minPoolSize: 0,
  maxIdleTimeMS: 30_000,
  serverSelectionTimeoutMS: 5_000,
};

declare global {
  var __diagflowMongoClient: MongoClient | undefined;
  var __diagflowMongoClientPromise: Promise<MongoClient> | undefined;
}

function getClient(): MongoClient {
  if (!globalThis.__diagflowMongoClient) {
    const client = new MongoClient(mongoUri, clientOptions);
    globalThis.__diagflowMongoClient = client;
    globalThis.__diagflowMongoClientPromise = client.connect();
  }
  return globalThis.__diagflowMongoClient;
}

/**
 * Resolves once the shared client has finished connecting. Optional: the
 * driver also connects on first operation if you only use `mongoDb` directly.
 */
export async function getMongoClient(): Promise<MongoClient> {
  getClient();
  await globalThis.__diagflowMongoClientPromise;
  return globalThis.__diagflowMongoClient!;
}

export const mongoClient = getClient();
export const mongoDb = mongoClient.db(dbName || undefined);
