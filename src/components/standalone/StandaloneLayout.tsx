import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Mail, Layers, Workflow, Truck, Boxes, ShieldCheck, Sparkles, FileText, ClipboardCheck } from "lucide-react";

export interface StandaloneMenuItem {
  label: string;
  href: string;
  icon?: "layers" | "workflow" | "truck" | "boxes" | "mail" | "shield" | "sparkles" | "file" | "clipboard";
}

interface StandaloneLayoutProps {
  children: ReactNode;
  /** Label shown in the eyebrow next to the logo, e.g. "Suppliers" or "Ops" */
  portal: string;
  /** Color accent token: 'primary' (marine) by default, 'accent' (gold) for ops */
  accent?: "primary" | "accent" | "secondary";
  /** Items shown in the page menu dropdown (in-page anchors or external links). */
  menuItems?: StandaloneMenuItem[];
}

const iconMap = {
  layers: Layers,
  workflow: Workflow,
  truck: Truck,
  boxes: Boxes,
  mail: Mail,
  shield: ShieldCheck,
  sparkles: Sparkles,
  file: FileText,
  clipboard: ClipboardCheck,
};

/**
 * Minimal chrome for standalone portals (suppliers / ops / logistics).
 * Independent header, but shares the marketing Footer so partners can navigate
 * back to the broader Brand-In-A-Box ecosystem.
 */
export function StandaloneLayout({ children, portal, accent = "primary", menuItems = [] }: StandaloneLayoutProps) {
  const accentClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    accent: "bg-accent/10 text-accent border-accent/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Spacer for fixed Header (h-16 mobile / h-20 desktop) */}
      <div className="h-16 lg:h-20" aria-hidden />
      {/* Portal sub-nav: badge + in-page anchors so partners keep quick access to sections */}
      {(portal || menuItems.length > 0) && (
        <div className="sticky top-16 lg:top-20 z-30 border-b border-border/50 bg-background/85 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center gap-3 overflow-x-auto">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] uppercase tracking-[0.18em] font-semibold border shrink-0 ${accentClasses[accent]}`}
            >
              {portal}
            </span>
            {menuItems.length > 0 && (
              <nav className="flex items-center gap-1 text-sm">
                {menuItems.map((item) => {
                  const Icon = item.icon ? iconMap[item.icon] : null;
                  const isAnchor = item.href.startsWith("#");
                  const content = (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 whitespace-nowrap">
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {item.label}
                    </span>
                  );
                  return isAnchor ? (
                    <a key={item.href} href={item.href}>{content}</a>
                  ) : (
                    <Link key={item.href} to={item.href}>{content}</Link>
                  );
                })}
              </nav>
            )}
          </div>
        </div>
      )}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}