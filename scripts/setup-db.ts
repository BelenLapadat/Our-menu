import { loadEnvConfig } from "@next/env";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

loadEnvConfig(process.cwd());

const scriptDir = dirname(fileURLToPath(import.meta.url));

async function main() {
  const { db, getDatabaseUrl } = await import("../lib/db");
  const { seedIfEmpty } = await import("../lib/seed");
  const url = getDatabaseUrl();
  const isRemote = !url.startsWith("file:");

  if (isRemote && !process.env.TURSO_AUTH_TOKEN) {
    throw new Error(
      "TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL is set.",
    );
  }

  console.log(`Setting up database: ${isRemote ? url : "local file (data/menu.db)"}`);

  if (url.startsWith("file:")) {
    mkdirSync(dirname(url.replace(/^file:/, "")), { recursive: true });
  }

  const schema = readFileSync(join(scriptDir, "schema.sql"), "utf8");
  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const sql of statements) {
    await db.execute(sql);
  }

  const before = await db.execute(
    "SELECT COUNT(*) AS count FROM recipes",
  );
  const countBefore = Number(before.rows[0]?.count ?? 0);

  await seedIfEmpty();

  const after = await db.execute("SELECT COUNT(*) AS count FROM recipes");
  const countAfter = Number(after.rows[0]?.count ?? 0);
  const seeded = countAfter - countBefore;

  console.log(
    seeded > 0
      ? `Database ready. Seeded ${seeded} sample recipes.`
      : `Database ready. ${countAfter} recipes already present.`,
  );
}

main().catch((error) => {
  console.error("Database setup failed.");
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
});
