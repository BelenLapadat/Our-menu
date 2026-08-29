"use server";

import { signIn } from "@/auth";
import { sanitizeInternalPath } from "@/lib/safe-path";

export async function signInWithGoogle(formData: FormData) {
  const redirectTo = sanitizeInternalPath(
    String(formData.get("redirectTo") ?? "").trim() || undefined,
  );

  await signIn("google", { redirectTo });
}
