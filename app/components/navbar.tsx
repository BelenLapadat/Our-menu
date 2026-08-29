import InviteDialog from "./invite-dialog";
import NavLinks from "./nav-links";
import { getActiveMenu } from "@/lib/active-menu";
import { getMenusForHousehold } from "@/lib/menus";
import { requireUserWithHousehold } from "@/lib/session";
import MenuSwitcher from "./menu-switcher";
import UserMenu from "./user-menu";

export default async function Navbar() {
  const { household } = await requireUserWithHousehold();

  const [menus, activeMenu] = await Promise.all([
    getMenusForHousehold(household.id),
    getActiveMenu(household.id),
  ]);

  return (
    <nav
      aria-label="Navegacion principal"
      className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800"
    >
      <div aria-hidden="true" />

      <NavLinks />

      <div className="flex items-center justify-end gap-2 sm:gap-3">
        <InviteDialog />
        <MenuSwitcher menus={menus} activeMenuId={activeMenu.id} />
        <UserMenu />
      </div>
    </nav>
  );
}
