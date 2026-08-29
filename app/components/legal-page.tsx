import Link from "next/link";
import Footer from "./footer";

export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="flex-1 bg-zinc-50 px-6 py-16 dark:bg-black sm:px-16">
        <article className="mx-auto w-full max-w-2xl">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            &larr; Volver al inicio
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            {title}
          </h1>
          <div className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
