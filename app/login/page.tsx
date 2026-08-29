import { signIn } from "@/auth";

const errorMessages: Record<string, string> = {
  OAuthSignin: "No se pudo iniciar sesion con Google.",
  OAuthCallback: "Google devolvio un error al iniciar sesion.",
  OAuthAccountNotLinked: "Esta cuenta ya esta vinculada a otro usuario.",
  Configuration: "La autenticacion no esta configurada correctamente.",
  AccessDenied: "No tienes permiso para acceder.",
  Default: "No se pudo iniciar sesion. Intentalo de nuevo.",
};

function sanitizeCallbackUrl(value: string | undefined) {
  if (value?.startsWith("/") && !value.startsWith("//")) {
    return value;
  }

  return "/";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo = sanitizeCallbackUrl(callbackUrl);
  const errorMessage = error ? (errorMessages[error] ?? errorMessages.Default) : null;

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black sm:px-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
          Nuestro Menusito
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Iniciar sesion
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Usa tu cuenta de Google para acceder a tus menus y recetas.
        </p>

        {errorMessage && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          >
            {errorMessage}
          </p>
        )}

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo });
          }}
          className="mt-8"
        >
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-zinc-950 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-white"
          >
            Continuar con Google
          </button>
        </form>
      </div>
    </main>
  );
}
