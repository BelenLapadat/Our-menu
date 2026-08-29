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
  const existing = await db.execute({
    sql: "SELECT id, email, name, image FROM users WHERE google_sub = ?",
    args: [input.googleSub],
  });

  const row = existing.rows[0];
  if (row) {
    await db.execute({
      sql: `
        UPDATE users
        SET email = ?, name = ?, image = ?, last_login_at = CURRENT_TIMESTAMP
        WHERE google_sub = ?
      `,
      args: [input.email, input.name, input.image, input.googleSub],
    });

    return mapUser(row as Record<string, unknown>);
  }

  const user = {
    id: randomUUID(),
    email: input.email,
    name: input.name,
    image: input.image,
  };

  await db.execute({
    sql: `
      INSERT INTO users (id, google_sub, email, name, image, last_login_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    args: [user.id, input.googleSub, user.email, user.name, user.image],
  });

  return user;
}

export async function getUserById(id: string) {
  const result = await db.execute({
    sql: "SELECT id, email, name, image FROM users WHERE id = ?",
    args: [id],
  });

  const row = result.rows[0];
  return row ? mapUser(row as Record<string, unknown>) : undefined;
}
