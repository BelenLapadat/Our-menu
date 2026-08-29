import { randomUUID } from "node:crypto";
import { asString, db } from "./db";

export type User = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

function mapUser(row: Record<string, unknown>): User {
  return {
    id: asString(row.id),
    email: asString(row.email),
    name: asString(row.name),
    image: row.image == null ? null : asString(row.image),
  };
}

export async function findOrCreateUser(input: {
  googleSub: string;
  email: string;
  name: string;
  image: string | null;
}) {
  const result = await db.execute({
    sql: `
      INSERT INTO users (id, google_sub, email, name, image, last_login_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(google_sub) DO UPDATE SET
        email = excluded.email,
        name = excluded.name,
        image = excluded.image,
        last_login_at = CURRENT_TIMESTAMP
      RETURNING id, email, name, image
    `,
    args: [
      randomUUID(),
      input.googleSub,
      input.email,
      input.name,
      input.image,
    ],
  });

  const row = result.rows[0];
  if (!row) {
    throw new Error("No se pudo crear o actualizar el usuario.");
  }

  return mapUser(row as Record<string, unknown>);
}
