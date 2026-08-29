"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function DeletionNotice({
  message = "La receta ha sido borrada",
  variant = "success",
}: {
  message?: string;
  variant?: "success" | "warning";
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsVisible(false), 3000);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!isVisible) {
    return null;
  }

  const styles =
    variant === "warning"
      ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
      : "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200";

  const buttonStyles =
    variant === "warning"
      ? "text-amber-800 hover:bg-amber-200 hover:text-amber-950 focus-visible:outline-amber-800 dark:text-amber-300 dark:hover:bg-amber-900 dark:hover:text-amber-100 dark:focus-visible:outline-amber-200"
      : "text-green-700 hover:bg-green-200 hover:text-green-950 focus-visible:outline-green-800 dark:text-green-300 dark:hover:bg-green-900 dark:hover:text-green-100 dark:focus-visible:outline-green-200";

  return (
    <div
      role="status"
      className={`fixed inset-x-4 top-4 z-50 flex items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm shadow-lg sm:left-auto sm:right-4 sm:max-w-sm ${styles}`}
    >
      <span>{message}</span>
      <button
        type="button"
        aria-label="Cerrar notificacion"
        title="Cerrar notificacion"
        onClick={() => setIsVisible(false)}
        className={`flex size-7 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${buttonStyles}`}
      >
        <X aria-hidden="true" size={16} />
      </button>
    </div>
  );
}
