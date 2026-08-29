import Link from "next/link";
import { redirect } from "next/navigation";
import { acceptInvite } from "@/app/invites/actions";
import { getInvitePreview } from "@/lib/invites";
import { userHasHouseholdAccess } from "@/lib/households";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const user = await requireUser();

  const preview = await getInvitePreview(token);
  if (!preview) {
    return (
      <InviteShell title="Invitacion no valida">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Este enlace no es valido o ya no existe.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Ir al inicio
        </Link>
      </InviteShell>
    );
  }

  if (preview.isUsed) {
    return (
      <InviteShell title="Invitacion ya utilizada">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Esta invitacion ya fue aceptada.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Ir al inicio
        </Link>
      </InviteShell>
    );
  }

  if (preview.isExpired) {
    return (
      <InviteShell title="Invitacion expirada">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Pide a quien te invito que genere un enlace nuevo.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Ir al inicio
        </Link>
      </InviteShell>
    );
  }

  if (await userHasHouseholdAccess(user.id, preview.householdId)) {
    redirect("/");
  }

  return (
    <InviteShell title={`Unirse a ${preview.householdName}`}>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Te invitaron a colaborar en{" "}
        <span className="font-medium text-zinc-950 dark:text-zinc-50">
          {preview.householdName}
        </span>
        . Al aceptar podras ver y editar sus menus y recetas.
      </p>
      <form action={acceptInvite} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className="w-full rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-white"
        >
          Aceptar invitacion
        </button>
      </form>
      <Link
        href="/"
        className="mt-4 inline-flex text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
      >
        Cancelar
      </Link>
    </InviteShell>
  );
}

function InviteShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black sm:px-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
          Nuestro Menusito
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {title}
        </h1>
        <div className="mt-4">{children}</div>
      </div>
    </main>
  );
}
