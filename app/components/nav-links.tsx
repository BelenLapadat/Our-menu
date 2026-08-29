"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Inicio", isActive: (pathname: string) => pathname === "/" },
  {
    href: "/calendario",
    label: "Calendario",
    isActive: (pathname: string) => pathname.startsWith("/calendario"),
  },
  {
    href: "/recetas",
    label: "Recetas",
    isActive: (pathname: string) => pathname.startsWith("/recetas"),
  },
] as const;

function navLinkClassName(isActive: boolean) {
  const base =
    "rounded-sm px-4 py-2 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-950 dark:focus-visible:outline-zinc-50";

  if (isActive) {
    return `${base} font-semibold text-zinc-950 underline decoration-2 underline-offset-[6px] dark:text-zinc-50`;
  }

  return `${base} text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50`;
}

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap justify-center gap-1 sm:gap-3">
      {links.map(({ href, label, isActive }) => {
        const active = isActive(pathname);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={navLinkClassName(active)}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
