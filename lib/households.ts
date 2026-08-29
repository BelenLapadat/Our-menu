import { randomUUID } from "node:crypto";
import { asString, db } from "./db";

export type Household = {
  id: string;
  name: string;
};

const DEFAULT_HOUSEHOLD_NAME = "Mi hogar";

function mapHousehold(row: Record<string, unknown>): Household {
  return {
    id: asString(row.id),
    name: asString(row.name),
  };
}

export async function getHousehold(id: string) {
  const result = await db.execute({
    sql: "SELECT id, name FROM households WHERE id = ?",
    args: [id],
  });

  const row = result.rows[0];
  return row ? mapHousehold(row as Record<string, unknown>) : undefined;
}

export async function getHouseholdsForUser(userId: string) {
  const result = await db.execute({
    sql: `
      SELECT households.id, households.name
      FROM households
      JOIN household_members ON household_members.household_id = households.id
      WHERE household_members.user_id = ?
      ORDER BY household_members.joined_at, households.name COLLATE NOCASE
    `,
    args: [userId],
  });

  return result.rows.map((row) => mapHousehold(row as Record<string, unknown>));
}

export async function getDefaultHouseholdForUser(userId: string) {
  const households = await getHouseholdsForUser(userId);
  return households[0];
}

export async function userHasHouseholdAccess(userId: string, householdId: string) {
  const result = await db.execute({
    sql: `
      SELECT 1
      FROM household_members
      WHERE household_id = ? AND user_id = ?
      LIMIT 1
    `,
    args: [householdId, userId],
  });

  return result.rows.length > 0;
}

export async function createHousehold(name: string) {
  const household = {
    id: randomUUID(),
    name: name.trim(),
  };

  await db.execute({
    sql: "INSERT INTO households (id, name) VALUES (?, ?)",
    args: [household.id, household.name],
  });

  return household;
}

async function addHouseholdMemberOrIgnore(householdId: string, userId: string) {
  await joinHousehold(userId, householdId);
}

export async function joinHousehold(userId: string, householdId: string) {
  await db.execute({
    sql: `
      INSERT OR IGNORE INTO household_members (household_id, user_id)
      VALUES (?, ?)
    `,
    args: [householdId, userId],
  });
}

async function claimLegacyHousehold(userId: string) {
  const orphan = await db.execute(`
    SELECT households.id, households.name
    FROM households
    LEFT JOIN household_members ON household_members.household_id = households.id
    GROUP BY households.id
    HAVING COUNT(household_members.user_id) = 0
    ORDER BY households.created_at
    LIMIT 1
  `);

  const row = orphan.rows[0];
  if (!row) {
    return undefined;
  }

  const householdId = asString(row.id);
  const claim = await db.execute({
    sql: `
      INSERT INTO household_members (household_id, user_id)
      SELECT ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM household_members WHERE household_id = ?
      )
    `,
    args: [householdId, userId, householdId],
  });

  if (claim.rowsAffected === 0) {
    return undefined;
  }

  return mapHousehold(row as Record<string, unknown>);
}

export async function ensureUserHousehold(userId: string) {
  const existing = await getDefaultHouseholdForUser(userId);
  if (existing) {
    return existing;
  }

  const claimed = await claimLegacyHousehold(userId);
  if (claimed) {
    return claimed;
  }

  const afterClaim = await getDefaultHouseholdForUser(userId);
  if (afterClaim) {
    return afterClaim;
  }

  const created = await createHousehold(DEFAULT_HOUSEHOLD_NAME);
  await addHouseholdMemberOrIgnore(created.id, userId);

  return (await getDefaultHouseholdForUser(userId)) ?? created;
}

export async function linkUsersWithoutHousehold() {
  const usersWithoutHousehold = await db.execute(`
    SELECT users.id
    FROM users
    LEFT JOIN household_members ON household_members.user_id = users.id
    WHERE household_members.user_id IS NULL
  `);

  if (usersWithoutHousehold.rows.length === 0) {
    return;
  }

  const targetHousehold = await db.execute(`
    SELECT id FROM households ORDER BY created_at LIMIT 1
  `);

  if (targetHousehold.rows.length === 0) {
    return;
  }

  const householdId = asString(targetHousehold.rows[0].id);

  await db.batch(
    usersWithoutHousehold.rows.map((row) => ({
      sql: `
        INSERT OR IGNORE INTO household_members (household_id, user_id)
        VALUES (?, ?)
      `,
      args: [householdId, asString(row.id)],
    })),
    "write",
  );
}
