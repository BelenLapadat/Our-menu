import { redirect } from "next/navigation";
import { auth } from "@/auth";

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
