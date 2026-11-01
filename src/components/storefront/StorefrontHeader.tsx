import LanguageSwitcher from "@/components/LanguageSwitcher";
import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Package, ShoppingCart, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StorefrontNavigationSettings } from "@/lib/boutiqueTemplates";
import { useCart } from "@/contexts/CartContext";
import { useStorefrontContext } from "@/contexts/StorefrontContext";
import { usePublicBoutiquePages } from "@/hooks/useBoutiquePages";

interface StorefrontHeaderProps {
  boutiqueName: string;
  logoUrl?: string | null;
  navigation?: StorefrontNavigationSettings;
  primaryColor?: string;
  navLinks?: {
    label: string;
    href: string;
  }[];
  boutiqueSlug?: string;
}

export function StorefrontHeader({
  boutiqueName,
  logoUrl,
  navigation,
  primaryColor,
  navLinks,
  boutiqueSlug,
}: StorefrontHeaderProps) {
  useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { totalItems, setIsOpen } = useCart();
  const ctx = useStorefrontContext();

  const { data: customPages = [] } = usePublicBoutiquePages(ctx?.boutiqueId);

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

  const boutiqueRoot = boutiqueSlug ? `/boutique/${boutiqueSlug}` : "#";

  const orderTrackingUrl = boutiqueSlug
    ? `/boutique/${boutiqueSlug}/order-tracking`
    : "#";

  const homeLink = {
    label: translateUi("Accueil"),
    href: boutiqueRoot,
  };

  /*
   * --------------------------------------------------------------------------
   * Dynamic boutique pages
   * --------------------------------------------------------------------------
   */

  const orderedPages = [...(customPages as any[])]
    .filter((page) => page.show_in_nav && page.slug !== "__product__")
    .sort((a, b) => {
      const order = navigation?.pageOrder ?? [];
      const ia = order.indexOf(a.id);
      const ib = order.indexOf(b.id);
      return (ia < 0 ? order.length + a.position : ia) - (ib < 0 ? order.length + b.position : ib);
    });
  const dynamicLinks = orderedPages
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
            label: translateUi("À propos"),
            href: "#about",
          },
          {
            label: "Contact",
            href: "#contact",
          },
        ]
      : [];

  const links = navLinks ?? [
    ...(navigation?.showHomeLink === false ? [] : [homeLink]),
    ...dynamicLinks,
    ...fallbackLinks,
  ];
  const layout = navigation?.layout ?? "classic";
  const logoPosition = navigation?.logoPosition ?? "left";
  const centeredBrand = logoPosition === "center" || layout === "centered";
  const menuAlignment = navigation?.menuAlignment ?? "center";
  const showStoreName = navigation?.showStoreName !== false || !logoUrl;
  const brand = (
    <Link to={boutiqueRoot}
      className="inline-flex min-w-0 shrink-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{ ["--tw-ring-color" as string]: accent }}
      onClick={() => setMobileMenuOpen(false)}
      aria-label={translateUi("Accueil {v0}", { v0: boutiqueName })}>
      {logoUrl && <img src={logoUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg object-contain sm:h-11 sm:w-11" />}
      {showStoreName && <span className="max-w-[140px] truncate text-lg font-semibold tracking-tight sm:max-w-[220px] md:max-w-none md:text-2xl" style={{ color: accent }}>{boutiqueName}</span>}
    </Link>
  );
  const menu = (
    <nav aria-label={translateUi("Navigation principale")}
      className={`${layout === "minimal" ? "hidden" : "hidden md:flex"} min-w-0 flex-wrap items-center gap-x-6 gap-y-2 ${menuAlignment === "left" ? "justify-start" : menuAlignment === "right" ? "justify-end" : "justify-center"}`}>
      {links.map(link => (
        <a key={`${link.label}-${link.href}`} href={link.href}
          className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900">{link.label}</a>
      ))}
    </nav>
  );

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
        <div className={`relative flex min-h-16 min-w-0 items-center gap-3 py-2 ${layout === "stacked" ? "flex-wrap justify-center md:flex-col md:py-4" : centeredBrand ? "justify-between md:grid md:grid-cols-[1fr_auto_1fr]" : "justify-between"}`}>
          {layout === "stacked" ? (
            <div className={`min-w-0 flex-1 md:flex-none ${logoPosition === "right" ? "md:self-end" : logoPosition === "left" ? "md:self-start" : "md:self-center"}`}>{brand}</div>
          ) : centeredBrand ? (
            <>
              <div className="hidden md:block">{menu}</div>
              <div className="min-w-0">{brand}</div>
            </>
          ) : logoPosition === "right" ? (
            <>
              <div className="hidden min-w-0 flex-1 md:block">{menu}</div>
              <div className="min-w-0">{brand}</div>
            </>
          ) : (
            <>
              <div className="min-w-0">{brand}</div>
              <div className="hidden min-w-0 flex-1 md:block">{menu}</div>
            </>
          )}
          {layout === "stacked" && <div className="hidden w-full justify-center md:flex">{menu}</div>}
          {/* ---------------------------------------------------------------- */}
          {/* Actions                                                          */}
          {/* ---------------------------------------------------------------- */}

          <div className={`flex shrink-0 items-center gap-1 sm:gap-2 ${centeredBrand ? "md:justify-self-end" : ""} ${layout === "stacked" ? "md:absolute md:right-0 md:top-2" : ""}`}>
            <LanguageSwitcher className="text-gray-700" />
            {boutiqueSlug && navigation?.showTracking !== false && (
              <Link to={orderTrackingUrl} className="hidden sm:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
                >
                  <Package className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-medium">
                    {translateUi("Suivi commande")}
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
                  ? translateUi("Panier, {v0} article{v1}", {
                      v0: totalItems,
                      v1: totalItems > 1 ? "s" : "",
                    })
                  : translateUi("Panier")
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
              className={layout === "minimal" ? "" : "md:hidden"}
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={
                mobileMenuOpen
                  ? translateUi("Fermer le menu")
                  : translateUi("Ouvrir le menu")
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Mobile navigation                                                 */}
        {/* ------------------------------------------------------------------ */}

        {mobileMenuOpen && (
          <div className={`border-t border-gray-100 py-4 ${layout === "minimal" ? "" : "md:hidden"}`}>
            <nav
              aria-label={translateUi("Navigation mobile")}
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

              {boutiqueSlug && navigation?.showTracking !== false && (
                <Link
                  to={orderTrackingUrl}
                  className="flex items-center gap-2 rounded-md px-2 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  onClick={closeMobileMenu}
                >
                  <Package className="h-4 w-4" aria-hidden="true" />
                  {translateUi("Suivre ma commande")}
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
