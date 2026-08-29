import { cookies } from "next/headers";
import { createMenu, getMenu, getMenus, type Menu } from "./menus";

export const ACTIVE_MENU_COOKIE = "active-menu-id";

export async function getActiveMenu(): Promise<Menu> {
  const menus = await getMenus();

  if (menus.length === 0) {
    return createMenu("Mi menú");
  }

  const cookieStore = await cookies();
  const cookieMenuId = cookieStore.get(ACTIVE_MENU_COOKIE)?.value;

  if (cookieMenuId) {
    const menu = menus.find((item) => item.id === cookieMenuId);
    if (menu) {
      return menu;
    }

    const menuById = await getMenu(cookieMenuId);
    if (menuById) {
      return menuById;
    }
  }

  return menus[0];
}
