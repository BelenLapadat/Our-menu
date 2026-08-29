import { signOut } from "@/auth";
import { getSessionUser } from "@/lib/session";

export default async function UserMenu() {
  const user = await getSessionUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {user.image ? (
        <img
          src={user.image}
          alt=""
          className="size-8 rounded-full border border-zinc-200 object-cover dark:border-zinc-700"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          {(user.name ?? user.email).charAt(0).toUpperCase()}
        </span>
      )}

      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {user.name ?? user.email}
        </p>
      </div>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          type="submit"
          className="rounded-full px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:focus-visible:outline-zinc-50"
        >
          Salir
        </button>
      </form>
    </div>
  );
}
