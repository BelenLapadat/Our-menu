import { Suspense } from "react";
import Footer from "@/app/components/footer";
import MenuDeletionNotice from "@/app/components/menu-deletion-notice";
import Navbar from "@/app/components/navbar";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <Suspense>
        <MenuDeletionNotice />
      </Suspense>
      {children}
      <Footer />
    </>
  );
}
