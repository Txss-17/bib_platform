import { ReactNode } from "react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export interface StandaloneMenuItem {
  label: string;
  href: string;
  icon?:
    | "layers"
    | "workflow"
    | "truck"
    | "boxes"
    | "mail"
    | "shield"
    | "sparkles"
    | "file"
    | "clipboard";
}

interface StandaloneLayoutProps {
  children: ReactNode;

  /**
   * Label identifying the standalone portal.
   * Example: "Suppliers", "Ops", etc.
   */
  portal: string;

  /**
   * Accent used for the portal identifier.
   */
  accent?: "primary" | "accent" | "secondary";

  /**
   * Kept for backward compatibility with existing pages.
   * StandaloneLayout no longer renders a secondary navigation.
   */
  menuItems?: StandaloneMenuItem[];
}

/**
 * Minimal layout for standalone BIB portals.
 *
 * The main BIB Header and Footer remain shared with the rest of the
 * ecosystem. Standalone portals only display a lightweight portal
 * identifier and do not create a second navigation bar.
 */
export function StandaloneLayout({
  children,
  portal,
  accent = "primary",
}: StandaloneLayoutProps) {
  const accentClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      {/* Spacer for the fixed main header */}
      <div className="h-16 lg:h-20" aria-hidden="true" />

      {/* Lightweight portal identifier */}
      {portal && (
        <div
          className="border-b border-border/50 bg-background"
          aria-label={`Portail ${portal}`}
        >
          <div className="container mx-auto flex h-10 items-center px-4 sm:px-6 lg:px-8">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${accentClasses[accent]}`}
            >
              {portal}
            </span>
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
