import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Store,
  ChevronDown,
  Truck,
  Package,
  LifeBuoy,
  Info,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { BoutiqueSearchBar } from "@/components/search/BoutiqueSearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const networkItems = [
    {
      to: "/suppliers",
      label: "Fournisseurs",
      desc: "Rejoindre le catalogue BIB",
      icon: Package,
    },
    {
      to: "/ops",
      label: "Logistique",
      desc: "Opérer pour le réseau BIB",
      icon: Truck,
    },
  ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/85 backdrop-blur-xl"
      style={{
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-[76px]">
          {/* Logo */}
          <Link
            to="/"
            className="flex shrink-0 items-center"
            aria-label="BIB — Accueil"
          >
            <span className="lg:hidden">
              <Logo iconSize={36} />
            </span>

            <span className="hidden lg:inline-flex">
              <Logo iconSize={42} />
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-7 lg:flex">
            <Link
              to="/store"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              Boutiques
            </Link>

            <Link
              to="/tarifs"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              Tarifs
            </Link>

            <Link
              to="/a-propos"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              À propos
            </Link>

            <Link
              to="/bib-talent"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              BIB Talent
            </Link>

            {/* Réseau BIB */}
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground focus:outline-none">
                Réseau BIB
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                className="w-[320px] rounded-2xl border-border/60 bg-background/95 p-2 shadow-xl backdrop-blur-xl"
              >
                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Infrastructure BIB
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {networkItems.map(
                  ({ to, label, desc, icon: Icon }) => (
                    <DropdownMenuItem
                      key={to}
                      asChild
                      className="rounded-xl"
                    >
                      <Link
                        to={to}
                        className="flex cursor-pointer items-center gap-3 px-3 py-3"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bib-marine/5 text-bib-marine">
                          <Icon className="h-4 w-4" />
                        </span>

                        <span className="flex min-w-0 flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {label}
                          </span>

                          <span className="text-xs text-muted-foreground">
                            {desc}
                          </span>
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  )
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2.5 lg:flex">
            <BoutiqueSearchBar
              compact
              className="w-56 xl:w-64"
              placeholder="Boutique ou produit…"
            />

            <LanguageSwitcher />

            <Button
              variant="ghost"
              size="sm"
              className="px-3"
              asChild
            >
              <Link to="/login">{t("nav.signin")}</Link>
            </Button>

            <Button
              variant="coral"
              size="default"
              className="px-5 shadow-sm"
              asChild
            >
              <Link to="/signup">Créer ma boutique</Link>
            </Button>
          </div>

          {/* Mobile button */}
          <button
            type="button"
            className="lg:hidden -mr-2 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted/60"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={
              mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"
            }
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="animate-fade-in border-t border-border/40 py-4 lg:hidden">
            <div className="flex max-h-[calc(100vh-5rem)] flex-col overflow-y-auto">
              <div className="pb-4">
                <BoutiqueSearchBar
                  compact
                  placeholder="Rechercher une boutique ou un produit…"
                />
              </div>

              <div className="flex flex-col">
                <Link
                  to="/store"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 border-b border-border/40 py-3.5 text-[15px] font-medium text-foreground"
                >
                  <Store className="h-4 w-4 text-bib-marine" />
                  Boutiques
                </Link>

                <Link
                  to="/tarifs"
                  onClick={closeMobileMenu}
                  className="flex items-center border-b border-border/40 py-3.5 text-[15px] font-medium text-foreground"
                >
                  Tarifs
                </Link>

                <Link
                  to="/a-propos"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 border-b border-border/40 py-3.5 text-[15px] font-medium text-foreground"
                >
                  <Info className="h-4 w-4 text-bib-marine" />
                  À propos
                </Link>

                <Link
                  to="/bib-talent"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 border-b border-border/40 py-3.5 text-[15px] font-medium text-foreground"
                >
                  <Users className="h-4 w-4 text-bib-marine" />
                  BIB Talent
                </Link>

                {/* Réseau BIB */}
                <div className="border-b border-border/40">
                  <div className="flex items-center gap-3 py-3.5 text-[15px] font-medium text-foreground">
                    <span>Réseau BIB</span>
                  </div>

                  <div className="pb-3 pl-3">
                    {networkItems.map(
                      ({ to, label, desc, icon: Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={closeMobileMenu}
                          className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-muted/60"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bib-marine/5 text-bib-marine">
                            <Icon className="h-4 w-4" />
                          </span>

                          <span className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {label}
                            </span>

                            <span className="text-xs text-muted-foreground">
                              {desc}
                            </span>
                          </span>
                        </Link>
                      )
                    )}
                  </div>
                </div>

                <Link
                  to="/centre-aide"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 border-b border-border/40 py-3.5 text-[15px] font-medium text-foreground"
                >
                  <LifeBuoy className="h-4 w-4 text-bib-marine" />
                  Centre d'aide
                </Link>
              </div>

              <div className="flex flex-col gap-2 pt-5">
                <LanguageSwitcher />

                <Button
                  variant="ghost"
                  size="default"
                  className="w-full justify-center"
                  asChild
                >
                  <Link to="/login" onClick={closeMobileMenu}>
                    {t("nav.signin")}
                  </Link>
                </Button>

                <Button
                  variant="coral"
                  size="default"
                  className="w-full"
                  asChild
                >
                  <Link to="/signup" onClick={closeMobileMenu}>
                    Créer ma boutique
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
