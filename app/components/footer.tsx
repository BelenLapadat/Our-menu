import Link from "next/link";

const linkClassName =
  "font-medium text-zinc-700 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-zinc-50";

export default function Footer() {
  return (
    <footer className="shrink-0 border-t border-zinc-200 px-6 py-5 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      <span>&copy; 2026 Nuestro Menusito</span>
      <span className="mx-2" aria-hidden="true">
        ·
      </span>
      <Link href="/terminos" className={linkClassName}>
        Terminos
      </Link>
      <span className="mx-2" aria-hidden="true">
        ·
      </span>
      <Link href="/privacidad" className={linkClassName}>
        Privacidad
      </Link>
      <span className="mx-2" aria-hidden="true">
        ·
      </span>
      <span>
        Made with love by{" "}
        <a
          href="https://github.com/BelenLapadat"
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          Belen
        </a>
      </span>
    </footer>
  );
}
