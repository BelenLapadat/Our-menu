"use client";

import { useSearchParams } from "next/navigation";
import DeletionNotice from "./deletion-notice";

export default function MenuDeletionNotice() {
  const searchParams = useSearchParams();

  if (searchParams.get("menuDeleted") !== "1") {
    return null;
  }

  return <DeletionNotice message="El menu ha sido borrado" />;
}
