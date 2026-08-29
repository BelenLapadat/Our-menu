import { getSessionUser } from "@/lib/session";
import UserMenuDropdown from "./user-menu-dropdown";

export default async function UserMenu() {
  const user = await getSessionUser();

  if (!user) {
    return null;
  }

  return <UserMenuDropdown user={user} />;
}
