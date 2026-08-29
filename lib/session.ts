import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  ensureUserHousehold,
  getDefaultHouseholdForUser,
  userHasHouseholdAccess,
  type Household,
} from "./households";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
};

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  return session.user as SessionUser;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function getUserHousehold(): Promise<Household | null> {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }

  let household = await getDefaultHouseholdForUser(user.id);
  if (!household) {
    household = await ensureUserHousehold(user.id);
  }

  return household;
}

export async function requireUserWithHousehold() {
  const user = await requireUser();
  const household = await getUserHousehold();
  if (!household) {
    redirect("/login");
  }

  return { user, household };
}

export async function requireHouseholdAccess(userId: string, householdId: string) {
  const hasAccess = await userHasHouseholdAccess(userId, householdId);
  if (!hasAccess) {
    throw new Error("No tienes acceso a este hogar.");
  }
}
