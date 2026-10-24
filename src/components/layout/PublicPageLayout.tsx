import type { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Shared chrome for public marketing pages: fixed Header, main content slot,
 * and Footer. Keeps individual pages free of duplicated layout markup.
 */
export default function PublicPageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
