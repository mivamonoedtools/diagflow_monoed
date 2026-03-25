import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "Missing MONGODB_URI. Add it to .env.local (see .env.example).",
  );
}
const mongoUri = uri;

/** Default DB name can be set here or via the path in MONGODB_URI. */
const dbName = process.env.MONGODB_DB;

declare global {
  // eslint-disable-next-line no-var
  var __diagflowMongoClient: MongoClient | undefined;
}

function getClient(): MongoClient {
  if (!globalThis.__diagflowMongoClient) {
    globalThis.__diagflowMongoClient = new MongoClient(mongoUri);
  }
  return globalThis.__diagflowMongoClient;
}

export const mongoClient = getClient();
export const mongoDb = mongoClient.db(dbName || undefined);
