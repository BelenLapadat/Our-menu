import { createHash, randomBytes, randomUUID } from "node:crypto";
import { asString, db } from "./db";
import { getHousehold, joinHousehold, userHasHouseholdAccess } from "./households";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_INVITES_PER_HOUR = 10;

export type HouseholdInvite = {
  id: string;
  householdId: string;
  householdName: string;
  email: string;
  invitedByUserId: string;
  expiresAt: string;
  usedAt: string | null;
};

export type InvitePreview = {
  householdName: string;
  email: string;
  expiresAt: string;
  isExpired: boolean;
  isUsed: boolean;
};

function hashInviteToken(rawToken: string) {
  return createHash("sha256").update(rawToken).digest("hex");
}

function mapInvite(row: Record<string, unknown>): HouseholdInvite {
  return {
    id: asString(row.id),
    householdId: asString(row.household_id),
    householdName: asString(row.household_name),
    email: asString(row.email),
    invitedByUserId: asString(row.invited_by_user_id),
    expiresAt: asString(row.expires_at),
    usedAt: row.used_at == null ? null : asString(row.used_at),
  };
}

function isInviteExpired(expiresAt: string) {
  return new Date(expiresAt).getTime() <= Date.now();
}

async function getInviteByTokenHash(tokenHash: string) {
  const result = await db.execute({
    sql: `
      SELECT
        household_invites.id,
        household_invites.household_id,
        household_invites.email,
        household_invites.invited_by_user_id,
        household_invites.expires_at,
        household_invites.used_at,
        households.name AS household_name
      FROM household_invites
      JOIN households ON households.id = household_invites.household_id
      WHERE household_invites.token_hash = ?
      LIMIT 1
    `,
    args: [tokenHash],
  });

  const row = result.rows[0];
  return row ? mapInvite(row as Record<string, unknown>) : undefined;
}

async function countRecentInvites(userId: string, householdId: string) {
  const result = await db.execute({
    sql: `
      SELECT COUNT(*) AS count
      FROM household_invites
      WHERE invited_by_user_id = ?
        AND household_id = ?
        AND created_at >= datetime('now', '-1 hour')
    `,
    args: [userId, householdId],
  });

  return Number(result.rows[0]?.count ?? 0);
}

export async function createHouseholdInvite(
  userId: string,
  householdId: string,
  email: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !normalizedEmail.includes("@")) {
    throw new Error("El correo no es valido.");
  }

  const recentInvites = await countRecentInvites(userId, householdId);
  if (recentInvites >= MAX_INVITES_PER_HOUR) {
    throw new Error("Has creado demasiadas invitaciones. Intentalo mas tarde.");
  }

  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = hashInviteToken(rawToken);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();

  await db.execute({
    sql: `
      INSERT INTO household_invites (
        id,
        token_hash,
        household_id,
        email,
        invited_by_user_id,
        expires_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    args: [
      randomUUID(),
      tokenHash,
      householdId,
      normalizedEmail,
      userId,
      expiresAt,
    ],
  });

  return {
    token: rawToken,
    invitePath: `/invite/${rawToken}`,
    email: normalizedEmail,
    expiresAt,
  };
}

export async function getInviteHouseholdId(rawToken: string) {
  const token = rawToken.trim();
  if (!token) {
    return null;
  }

  const invite = await getInviteByTokenHash(hashInviteToken(token));
  return invite?.householdId;
}

export async function getInvitePreview(rawToken: string): Promise<InvitePreview | null> {
  const token = rawToken.trim();
  if (!token) {
    return null;
  }

  const invite = await getInviteByTokenHash(hashInviteToken(token));
  if (!invite) {
    return null;
  }

  return {
    householdName: invite.householdName,
    email: invite.email,
    expiresAt: invite.expiresAt,
    isExpired: isInviteExpired(invite.expiresAt),
    isUsed: invite.usedAt != null,
  };
}

export async function acceptHouseholdInvite(rawToken: string, userId: string) {
  const token = rawToken.trim();
  if (!token) {
    throw new Error("La invitacion no es valida.");
  }

  const invite = await getInviteByTokenHash(hashInviteToken(token));
  if (!invite) {
    throw new Error("La invitacion no es valida.");
  }

  if (invite.usedAt) {
    throw new Error("Esta invitacion ya fue utilizada.");
  }

  if (isInviteExpired(invite.expiresAt)) {
    throw new Error("Esta invitacion ha expirado.");
  }

  const household = await getHousehold(invite.householdId);
  if (!household) {
    throw new Error("La invitacion no es valida.");
  }

  const alreadyMember = await userHasHouseholdAccess(userId, invite.householdId);
  if (alreadyMember) {
    await db.execute({
      sql: `
        UPDATE household_invites
        SET used_at = COALESCE(used_at, CURRENT_TIMESTAMP)
        WHERE id = ?
      `,
      args: [invite.id],
    });
    return household;
  }

  const claim = await db.execute({
    sql: `
      UPDATE household_invites
      SET used_at = CURRENT_TIMESTAMP
      WHERE id = ? AND used_at IS NULL
    `,
    args: [invite.id],
  });

  if (claim.rowsAffected === 0) {
    throw new Error("Esta invitacion ya fue utilizada.");
  }

  await joinHousehold(userId, invite.householdId);

  return household;
}
