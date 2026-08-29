"use server";

import { redirect } from "next/navigation";
import { createHouseholdInvite, acceptHouseholdInvite } from "@/lib/invites";
import { requireHouseholdAccess, requireUser, requireUserWithHousehold } from "@/lib/session";

export type CreateInviteState =
  | { status: "idle" }
  | { status: "success"; invitePath: string; email: string }
  | { status: "error"; message: string };

export async function createInvite(
  _prevState: CreateInviteState,
  formData: FormData,
): Promise<CreateInviteState> {
  try {
    const { user, household } = await requireUserWithHousehold();
    await requireHouseholdAccess(user.id, household.id);

    const email = String(formData.get("email") ?? "").trim();
    const invite = await createHouseholdInvite(user.id, household.id, email);

    return {
      status: "success",
      invitePath: invite.invitePath,
      email: invite.email,
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "No se pudo crear la invitacion.",
    };
  }
}

export async function acceptInvite(formData: FormData) {
  const user = await requireUser();
  const token = String(formData.get("token") ?? "").trim();

  if (!token) {
    throw new Error("La invitacion no es valida.");
  }

  await acceptHouseholdInvite(token, user.id);
  redirect("/");
}
