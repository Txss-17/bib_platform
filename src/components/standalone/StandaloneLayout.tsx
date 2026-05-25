import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

interface StandaloneLayoutProps {
  children: ReactNode;
  /** Label shown in the eyebrow next to the logo, e.g. "Suppliers" or "Ops" */
  portal: string;
  /** Color accent token: 'primary' (marine) by default, 'accent' (gold) for ops */
  accent?: "primary" | "accent" | "secondary";
}

/**
 * Minimal chrome for standalone portals (suppliers / ops / logistics).
 * Independent of the marketing Header / Dashboard sidebar.
 */
export function StandaloneLayout({ children, portal, accent = "primary" }: StandaloneLayoutProps) {
  const accentClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <Logo iconSize={32} />
            <span
              className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-[0.18em] font-semibold border ${accentClasses[accent]}`}
            >
              {portal}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Accueil</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">Connexion</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50 py-8 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Brand-In-A-Box — {portal} Portal</span>
          <div className="flex items-center gap-4">
            <Link to="/mentions-legales" className="hover:text-foreground">Mentions légales</Link>
            <Link to="/confidentialite" className="hover:text-foreground">Confidentialité</Link>
            <Link to="/a-propos" className="hover:text-foreground">À propos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}