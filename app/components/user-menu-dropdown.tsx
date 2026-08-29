"use client";

import { useEffect, useRef, useState } from "react";
import { signOutUser } from "@/app/auth/actions";
import type { SessionUser } from "@/lib/session";

export default function UserMenuDropdown({ user }: { user: SessionUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const displayName = user.name?.trim() || user.email;

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Cuenta de ${displayName}`}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-300 bg-white transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50"
      >
        {user.image ? (
          <img
            src={user.image}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-zinc-200 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Cuenta"
          className="absolute right-0 z-20 mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        >
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Cuenta
          </p>
          <div className="px-3 pb-2">
            <p className="truncate text-sm font-medium text-zinc-950 dark:text-zinc-50">
              {displayName}
            </p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>

          <div className="border-t border-zinc-200 pt-2 dark:border-zinc-800">
            <form action={signOutUser}>
              <button
                type="submit"
                role="menuitem"
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
