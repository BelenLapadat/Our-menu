import Link from "next/link";
import { getActiveMenu } from "@/lib/active-menu";
import { getMenus } from "@/lib/menus";
import MenuSwitcher from "./menu-switcher";
import UserMenu from "./user-menu";

export default async function Navbar() {
  const [menus, activeMenu] = await Promise.all([getMenus(), getActiveMenu()]);

  return (
    <nav
      aria-label="Navegacion principal"
      className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800"
    >
      <div className="flex gap-2">
        <Link
          href="/"
          className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
        >
          Inicio
        </Link>
        <Link
          href="/calendario"
          className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
        >
          Calendario
        </Link>
        <Link
          href="/recetas"
          className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
        >
          Recetas
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <MenuSwitcher menus={menus} activeMenuId={activeMenu.id} />
        <UserMenu />
      </div>
    </nav>
  );
}
