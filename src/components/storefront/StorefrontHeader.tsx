import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  Package,
  ShoppingCart,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useStorefrontContext } from "@/contexts/StorefrontContext";
import { usePublicBoutiquePages } from "@/hooks/useBoutiquePages";

interface StorefrontHeaderProps {
  boutiqueName: string;
  primaryColor?: string;
  navLinks?: {
    label: string;
    href: string;
  }[];
  boutiqueSlug?: string;
}

export function StorefrontHeader({
  boutiqueName,
  primaryColor,
  navLinks,
  boutiqueSlug,
}: StorefrontHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { totalItems, setIsOpen } = useCart();
  const ctx = useStorefrontContext();

  const { data: customPages = [] } =
    usePublicBoutiquePages(ctx?.boutiqueId);

  const accent = primaryColor || "#0f172a";

  /*
   * --------------------------------------------------------------------------
   * Boutique URLs
   * --------------------------------------------------------------------------
   *
   * /store
   *   → BIB Store / discovery
   *
   * /store/boutique/:slug
   *   → BIB presentation / discovery layer
   *
   * /boutique/:slug
   *   → actual public boutique storefront
   *
   * Checkout and order tracking remain on the boutique storefront.
   */

  const boutiqueRoot = boutiqueSlug
    ? `/boutique/${boutiqueSlug}`
    : "#";

  const orderTrackingUrl = boutiqueSlug
    ? `/boutique/${boutiqueSlug}/order-tracking`
    : "#";

  const homeLink = {
    label: "Accueil",
    href: boutiqueRoot,
  };

  /*
   * --------------------------------------------------------------------------
   * Dynamic boutique pages
   * --------------------------------------------------------------------------
   */

  const dynamicLinks = (customPages as any[])
    .filter((page) => page.show_in_nav)
    .map((page) => ({
      label: page.title as string,
      href: boutiqueSlug
        ? `/boutique/${boutiqueSlug}/p/${page.slug}`
        : `#${page.slug}`,
    }));

  /*
   * Keep a useful navigation when the boutique has not created
   * custom pages yet.
   */

  const fallbackLinks =
    dynamicLinks.length === 0
      ? [
          {
            label: "Boutique",
            href: "#products",
          },
          {
            label: "À propos",
            href: "#about",
          },
          {
            label: "Contact",
            href: "#contact",
          },
        ]
      : [];

  const links =
    navLinks ??
    [
      homeLink,
      ...dynamicLinks,
      ...fallbackLinks,
    ];

  /*
   * --------------------------------------------------------------------------
   * Helpers
   * --------------------------------------------------------------------------
   */

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* ---------------------------------------------------------------- */}
          {/* Brand                                                            */}
          {/* ---------------------------------------------------------------- */}

          <Link
            to={boutiqueRoot}
            className="min-w-0 shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{
              ["--tw-ring-color" as string]: accent,
            }}
            onClick={closeMobileMenu}
            aria-label={`Accueil ${boutiqueName}`}
          >
            <span
              className="block max-w-[220px] truncate text-xl font-semibold tracking-tight md:max-w-none md:text-2xl"
              style={{ color: accent }}
            >
              {boutiqueName}
            </span>
          </Link>

          {/* ---------------------------------------------------------------- */}
          {/* Desktop navigation                                               */}
          {/* ---------------------------------------------------------------- */}

          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-8 md:flex"
          >
            {links.map((link) => (
              <a
                key={`${link.label}-${link.href}`}
                href={link.href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* ---------------------------------------------------------------- */}
          {/* Actions                                                          */}
          {/* ---------------------------------------------------------------- */}

          <div className="flex items-center gap-1 sm:gap-2">
            {boutiqueSlug && (
              <Link
                to={orderTrackingUrl}
                className="hidden sm:block"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
                >
                  <Package
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium">
                    Suivi commande
                  </span>
                </Button>
              </Link>
            )}

            {/* Cart belongs to the boutique storefront */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsOpen(true)}
              aria-label={
                totalItems > 0
                  ? `Panier, ${totalItems} article${totalItems > 1 ? "s" : ""}`
                  : "Panier"
              }
            >
              <ShoppingCart
                className="h-5 w-5 text-gray-600"
                aria-hidden="true"
              />

              {totalItems > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs text-white"
                  style={{
                    backgroundColor: accent,
                  }}
                  aria-hidden="true"
                >
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile menu */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
              aria-label={
                mobileMenuOpen
                  ? "Fermer le menu"
                  : "Ouvrir le menu"
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              ) : (
                <Menu
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              )}
            </Button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Mobile navigation                                                 */}
        {/* ------------------------------------------------------------------ */}

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 py-4 md:hidden">
            <nav
              aria-label="Navigation mobile"
              className="flex flex-col gap-1"
            >
              {links.map((link) => (
                <a
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  className="rounded-md px-2 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </a>
              ))}

              {boutiqueSlug && (
                <Link
                  to={orderTrackingUrl}
                  className="flex items-center gap-2 rounded-md px-2 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  onClick={closeMobileMenu}
                >
                  <Package
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Suivre ma commande
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
