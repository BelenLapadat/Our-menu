"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACTIVE_MENU_COOKIE } from "@/lib/active-menu";
import { createMenu, deleteMenu, getMenu } from "@/lib/menus";
import { revalidateAfterMenuChange } from "@/lib/revalidate";
import { requireUserWithHousehold } from "@/lib/session";

function sanitizeReturnPath(value: FormDataEntryValue | null) {
  const path = String(value ?? "").trim();
  if (path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }

  return "/";
}

function appendQueryParam(path: string, key: string, value: string) {
  const [pathname, search = ""] = path.split("?");
  const params = new URLSearchParams(search);
  params.set(key, value);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

async function setActiveMenuCookie(menuId: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_MENU_COOKIE, menuId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function switchMenu(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const menuId = String(formData.get("menuId") ?? "").trim();
  const returnTo = sanitizeReturnPath(formData.get("returnTo"));

  if (!menuId) {
    throw new Error("El menu no es valido.");
  }

  const menu = await getMenu(menuId, household.id);
  if (!menu) {
    throw new Error("El menu no es valido.");
  }

  await setActiveMenuCookie(menuId);
  revalidateAfterMenuChange();
  redirect(returnTo);
}

export async function addMenu(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const name = String(formData.get("name") ?? "").trim();
  const returnTo = sanitizeReturnPath(formData.get("returnTo"));

  if (!name) {
    throw new Error("El nombre del menu es obligatorio.");
  }

  const menu = await createMenu(name, household.id);
  await setActiveMenuCookie(menu.id);
  revalidateAfterMenuChange();
  redirect(returnTo);
}

export async function removeMenu(formData: FormData) {
  const { household } = await requireUserWithHousehold();
  const menuId = String(formData.get("menuId") ?? "").trim();
  const returnTo = sanitizeReturnPath(formData.get("returnTo"));

  if (!menuId) {
    throw new Error("El menu no es valido.");
  }

  await deleteMenu(menuId, household.id);

  const cookieStore = await cookies();
  if (cookieStore.get(ACTIVE_MENU_COOKIE)?.value === menuId) {
    cookieStore.delete(ACTIVE_MENU_COOKIE);
  }

  revalidateAfterMenuChange();
  redirect(appendQueryParam(returnTo, "menuDeleted", "1"));
}
