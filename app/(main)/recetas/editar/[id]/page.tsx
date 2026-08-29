import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecipe } from "@/lib/recipes";
import { requireUserWithHousehold } from "@/lib/session";
import { updateRecipe } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { household } = await requireUserWithHousehold();

  const recipe = await getRecipe(id, household.id);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="flex-1 bg-zinc-50 px-6 py-16 dark:bg-black sm:px-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header>
          <Link
            href="/recetas"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            &lt; Volver a recetas
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Editar receta
          </h1>
        </header>

        <form
          action={updateRecipe}
          className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        >
          <input type="hidden" name="id" value={recipe.id} />
          <input type="hidden" name="rating" value={recipe.rating} />
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">
            Titulo
            <input
              name="title"
              type="text"
              required
              defaultValue={recipe.title}
              className="rounded-lg border border-zinc-300 px-3 py-2 font-normal outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-50"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">
            Descripcion
            <textarea
              name="description"
              required
              rows={4}
              defaultValue={recipe.description}
              className="resize-y rounded-lg border border-zinc-300 px-3 py-2 font-normal outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-50"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">
            Notas
            <textarea
              name="notes"
              rows={3}
              defaultValue={recipe.notes}
              className="resize-y rounded-lg border border-zinc-300 px-3 py-2 font-normal outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-50"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-zinc-950 px-4 py-3 font-medium text-white transition-colors hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus-visible:outline-white"
          >
            Guardar cambios
          </button>
        </form>
      </div>
    </main>
  );
}