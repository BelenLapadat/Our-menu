import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { db, getDatabaseUrl } from "../lib/db";
import { seedIfEmpty } from "../lib/seed";

async function main() {
  const url = getDatabaseUrl();

  if (url.startsWith("file:")) {
    mkdirSync(dirname(url.replace(/^file:/, "")), { recursive: true });
  }

  const schema = readFileSync(join(import.meta.dirname, "schema.sql"), "utf8");
  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const sql of statements) {
    await db.execute(sql);
  }

  await seedIfEmpty();
  console.log("Database ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
