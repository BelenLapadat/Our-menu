import { createClient, type Client } from "@libsql/client";
import { join } from "node:path";

const globalForDb = globalThis as typeof globalThis & {
  libsql?: Client;
};

export function getDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    return process.env.TURSO_DATABASE_URL;
  }

  return `file:${join(process.cwd(), "data", "menu.db")}`;
}

function createDbClient(): Client {
  const url = getDatabaseUrl();

  return createClient({
    url,
    authToken: url.startsWith("file:") ? undefined : process.env.TURSO_AUTH_TOKEN,
  });
}

export const db = globalForDb.libsql ?? createDbClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.libsql = db;
}

export function asString(value: unknown): string {
  return value == null ? "" : String(value);
}

export function asNumber(value: unknown): number {
  return value == null ? 0 : Number(value);
}
