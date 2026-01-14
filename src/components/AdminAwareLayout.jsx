"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function AdminAwareLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/lighthouse");
  const isResetPin = pathname === "/reset-pin";

  return (
    <>
      {!isAdmin && !isResetPin && <Header />}
      <main className="grow">
        {children}
      </main>
      {!isAdmin && !isResetPin && <Footer />}
    </>
  );
}
