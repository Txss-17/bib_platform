import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Mail, Layers, Workflow, Truck, Boxes, ShieldCheck, Sparkles, FileText, ClipboardCheck } from "lucide-react";

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {menuItems.length > 0 && (
                <>
                  <DropdownMenuLabel>{portal}</DropdownMenuLabel>
                  {menuItems.map((item) => {
                    const Icon = item.icon ? iconMap[item.icon] : null;
                    const isAnchor = item.href.startsWith("#");
                    const content = (
                      <span className="flex items-center gap-2">
                        {Icon && <Icon className="w-4 h-4" />}
                        {item.label}
                      </span>
                    );
                    return (
                      <DropdownMenuItem key={item.href} asChild>
                        {isAnchor ? (
                          <a href={item.href}>{content}</a>
                        ) : (
                          <Link to={item.href}>{content}</Link>
                        )}
                  </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}