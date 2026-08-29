"use client";

import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { addMenu, switchMenu } from "@/app/menus/actions";
import type { Menu } from "@/lib/menus";
import DeleteMenuDialog from "./delete-menu-dialog";

export default function MenuSwitcher({
  menus,
  activeMenuId,
}: {
  menus: Menu[];
  activeMenuId: string;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeMenu =
    menus.find((menu) => menu.id === activeMenuId) ?? menus[0];

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsCreating(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  if (!activeMenu) {
    return null;
  }

  return (
    <>
      <div ref={containerRef} className="relative shrink-0">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => {
            setIsOpen((open) => !open);
            setIsCreating(false);
          }}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50"
        >
          <span className="max-w-[10rem] truncate">{activeMenu.name}</span>
          <ChevronDown aria-hidden="true" size={16} />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Menus
            </p>

            <ul role="listbox" aria-label="Menus" className="flex flex-col gap-1">
              {menus.map((menu) => (
                <li key={menu.id} className="flex items-center gap-1">
                  <form action={switchMenu} className="min-w-0 flex-1">
                    <input type="hidden" name="menuId" value={menu.id} />
                    <input type="hidden" name="returnTo" value={pathname} />
                    <button
                      type="submit"
                      role="option"
                      aria-selected={menu.id === activeMenu.id}
                      className={`w-full truncate rounded-xl px-3 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50 ${
                        menu.id === activeMenu.id
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                          : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                      }`}
                    >
                      {menu.name}
                    </button>
                  </form>

                  {menus.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Eliminar ${menu.name}`}
                      onClick={() => {
                        setMenuToDelete(menu);
                        setIsOpen(false);
                      }}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:hover:bg-red-950/30 dark:hover:text-red-400 dark:focus-visible:outline-zinc-50"
                    >
                      <Trash2 aria-hidden="true" size={15} />
                    </button>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-2 border-t border-zinc-200 pt-2 dark:border-zinc-800">
              {isCreating ? (
                <form action={addMenu} className="flex flex-col gap-2 px-2 pb-1">
                  <input type="hidden" name="returnTo" value={pathname} />
                  <label className="sr-only" htmlFor="new-menu-name">
                    Nombre del menu
                  </label>
                  <input
                    id="new-menu-name"
                    name="name"
                    type="text"
                    required
                    autoFocus
                    placeholder="Nombre del menu"
                    className="rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-50"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >
                      Crear
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50"
                >
                  <Plus aria-hidden="true" size={16} />
                  Crear menu
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {menuToDelete && (
        <DeleteMenuDialog
          menu={menuToDelete}
          returnTo={pathname}
          onCancel={() => setMenuToDelete(null)}
        />
      )}
    </>
  );
}
