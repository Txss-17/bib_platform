import { ShoppingCart, Menu, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useStorefrontContext } from "@/contexts/StorefrontContext";
import { usePublicBoutiquePages } from "@/hooks/useBoutiquePages";

interface StorefrontHeaderProps {
  boutiqueName: string;
  primaryColor?: string;
  navLinks?: { label: string; href: string }[];
  boutiqueSlug?: string;
}

export function StorefrontHeader({ boutiqueName, primaryColor, navLinks, boutiqueSlug }: StorefrontHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, setIsOpen } = useCart();
  const ctx = useStorefrontContext();
  const { data: customPages = [] } = usePublicBoutiquePages(ctx?.boutiqueId);
  const accent = primaryColor || "#0f172a";

  const defaultLinks = [
    { label: "Accueil", href: "#" },
    { label: "Boutique", href: "#products" },
    { label: "À Propos", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const baseLinks = navLinks || defaultLinks;
  const dynamicLinks = (customPages as any[])
    .filter((p) => p.show_in_nav)
    .map((p) => ({
      label: p.title as string,
      href: boutiqueSlug ? `/boutique/${boutiqueSlug}/p/${p.slug}` : `#${p.slug}`,
    }));
  const links = [...baseLinks, ...dynamicLinks];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1
              className="text-xl md:text-2xl font-semibold tracking-tight"
              style={{ color: accent }}
            >
              {boutiqueName}
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            {boutiqueSlug && (
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
                onClick={() => window.location.href = `/boutique/${boutiqueSlug}/order-tracking`}
              >
                <Package className="w-4 h-4" />
                <span className="text-xs font-medium">Suivi commande</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(true)}>
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
                  style={{ backgroundColor: accent }}
                >
                  {totalItems}
                </span>
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {boutiqueSlug && (
                <a
                  href={`/boutique/${boutiqueSlug}/order-tracking`}
                  className="px-2 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Package className="w-4 h-4" />
                  Suivre ma commande
                </a>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
