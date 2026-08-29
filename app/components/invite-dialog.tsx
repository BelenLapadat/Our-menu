"use client";

import { UserPlus } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { createInvite, type CreateInviteState } from "@/app/invites/actions";

const initialState: CreateInviteState = { status: "idle" };

function InviteFormContent({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [state, formAction, pending] = useActionState(createInvite, initialState);

  async function copyInviteLink(invitePath: string) {
    const inviteUrl = `${window.location.origin}${invitePath}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
  }

  if (state.status === "success") {
    return (
      <div className="mt-3 flex flex-col gap-3">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Enlace creado para{" "}
          <span className="font-medium text-zinc-950 dark:text-zinc-50">
            {state.email}
          </span>
          . Compartelo para que se una con su cuenta de Google.
        </p>
        <button
          type="button"
          onClick={() => copyInviteLink(state.invitePath)}
          className="rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {copied ? "Enlace copiado" : "Copiar enlace"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-sm font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
        >
          Cerrar
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3">
      <label className="flex flex-col gap-2 text-sm font-medium text-zinc-950 dark:text-zinc-50">
        Correo
        <input
          name="email"
          type="email"
          required
          autoFocus
          placeholder="persona@ejemplo.com"
          className="rounded-lg border border-zinc-300 px-3 py-2 font-normal outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-50"
        />
      </label>

      {state.status === "error" && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {state.message}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {pending ? "Creando..." : "Crear enlace"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default function InviteDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [formInstance, setFormInstance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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

  function openDialog() {
    setFormInstance((value) => value + 1);
    setIsOpen(true);
  }

  function closeDialog() {
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closeDialog() : openDialog())}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:focus-visible:outline-zinc-50"
      >
        <UserPlus aria-hidden="true" size={16} />
        <span className="hidden sm:inline">Invitar</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-labelledby="invite-dialog-title"
          className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950"
        >
          <p
            id="invite-dialog-title"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
          >
            Invitar al hogar
          </p>
          <InviteFormContent key={formInstance} onClose={closeDialog} />
        </div>
      )}
    </div>
  );
}
