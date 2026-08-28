"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function DeletionNotice({
  message = "La receta ha sido borrada",
}: {
  message?: string;
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsVisible(false), 3000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed inset-x-4 top-4 z-50 flex items-center justify-between gap-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 shadow-lg sm:left-auto sm:right-4 sm:max-w-sm dark:border-green-900 dark:bg-green-950 dark:text-green-200"
    >
      <span>{message}</span>
      <button
        type="button"
        aria-label="Cerrar notificacion"
        title="Cerrar notificacion"
        onClick={() => setIsVisible(false)}
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-green-700 transition-colors hover:bg-green-200 hover:text-green-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800 dark:text-green-300 dark:hover:bg-green-900 dark:hover:text-green-100 dark:focus-visible:outline-green-200"
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
