import { cookies } from "next/headers";
import { createMenu, getMenusForHousehold, type Menu } from "./menus";

export const ACTIVE_MENU_COOKIE = "active-menu-id";

export async function getActiveMenu(householdId: string): Promise<Menu> {
  const menus = await getMenusForHousehold(householdId);

  if (menus.length === 0) {
    return createMenu("Mi menú", householdId);
  }

  const cookieStore = await cookies();
  const cookieMenuId = cookieStore.get(ACTIVE_MENU_COOKIE)?.value;

  if (cookieMenuId) {
    const menu = menus.find((item) => item.id === cookieMenuId);
    if (menu) {
      return menu;
    }
  }

  return menus[0];
}
