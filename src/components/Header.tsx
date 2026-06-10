import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Store, ChevronDown, Truck, Package, Briefcase, LifeBuoy, Handshake, Boxes } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { BoutiqueSearchBar } from "@/components/search/BoutiqueSearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const { t } = useLanguage();

  const networkItems = [
    { to: "/store", label: "Boutiques", desc: "Découvrir les marques", icon: Store },
    { to: "/suppliers", label: "Fournisseurs", desc: "Catalogue & partenaires", icon: Package },
    { to: "/ops", label: "Logistique", desc: "Opérateurs vérifiés", icon: Truck },
    { to: "/carrieres", label: "Carrières", desc: "Rejoindre l'équipe", icon: Briefcase },
  ];

  const partnerItems = [
    { to: "/suppliers/apply", label: "Devenir fournisseur", desc: "Rejoindre le catalogue BIB", icon: Boxes },
    { to: "/ops/apply", label: "Devenir partenaire logistique", desc: "Opérer en marque blanche", icon: Handshake },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50"
      style={{
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16 lg:h-20">
          <Link to="/" className="flex items-center shrink-0" aria-label="Accueil">
            <span className="lg:hidden"><Logo iconSize={36} /></span>
            <span className="hidden lg:inline-flex"><Logo iconSize={44} /></span>
          </Link>

          <div className="hidden lg:flex items-center gap-7">
            <Link to="/vendre" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {t("nav.sell")}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium focus:outline-none">
                {t("nav.discover")}
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80 p-2">
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("nav.ecosystem")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {networkItems.map(({ to, label, desc, icon: Icon }) => (
                  <DropdownMenuItem key={to} asChild>
                    <Link to={to} className="flex items-start gap-3 py-2.5 cursor-pointer">
                      <span className="mt-0.5 w-8 h-8 rounded-lg bg-bib-marine/5 text-bib-marine flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground">{desc}</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t("nav.becomePartner")}
                </DropdownMenuLabel>
                {partnerItems.map(({ to, label, desc, icon: Icon }) => (
                  <DropdownMenuItem key={to} asChild>
                    <Link to={to} className="flex items-start gap-3 py-2.5 cursor-pointer">
                      <span className="mt-0.5 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground">{desc}</span>
                      </span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/tarifs" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {t("nav.pricing")}
            </Link>
            <Link to="/centre-aide" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium inline-flex items-center gap-1">
              <LifeBuoy className="h-3.5 w-3.5" /> {t("nav.help")}
            </Link>
            <Link to="#trust" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
              {t("nav.trust")}
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <BoutiqueSearchBar compact className="w-64" placeholder="Boutique ou produit…" />
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">{t("nav.signin")}</Link>
            </Button>
            <Button variant="coral" size="default" asChild>
              <Link to="/signup">{t("nav.start")}</Link>
            </Button>
          </div>

          <button
            className="lg:hidden -mr-2 p-2 inline-flex items-center justify-center min-w-[44px] min-h-[44px] text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col gap-1">
              <BoutiqueSearchBar compact placeholder="Boutique ou produit…" />

              <Link to="/vendre" onClick={() => setMobileMenuOpen(false)} className="text-foreground font-medium py-3 px-1 border-b border-border/40">
                {t("nav.sell")}
              </Link>

              <button
                type="button"
                onClick={() => setNetworkOpen((v) => !v)}
                className="flex items-center justify-between w-full text-foreground font-medium py-3 px-1 border-b border-border/40"
                aria-expanded={networkOpen}
              >
                {t("nav.discover")}
                <ChevronDown className={`h-4 w-4 transition-transform ${networkOpen ? "rotate-180" : ""}`} />
              </button>
              {networkOpen && (
                <div className="flex flex-col gap-1 pl-1 py-2 border-b border-border/40">
                  {networkItems.map(({ to, label, desc, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-start gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/60"
                    >
                      <span className="mt-0.5 w-8 h-8 rounded-lg bg-bib-marine/5 text-bib-marine flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="text-xs text-muted-foreground">{desc}</span>
                      </span>
                    </Link>
                  ))}
                  <div className="mt-2 pt-2 border-t border-border/40">
                    <p className="px-2 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                      {t("nav.becomePartner")}
                    </p>
                    {partnerItems.map(({ to, label, desc, icon: Icon }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-start gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/60"
                      >
                        <span className="mt-0.5 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{label}</span>
                          <span className="text-xs text-muted-foreground">{desc}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <Link to="/tarifs" onClick={() => setMobileMenuOpen(false)} className="text-foreground font-medium py-3 px-1 border-b border-border/40">
                {t("nav.pricing")}
              </Link>
              <Link to="/centre-aide" onClick={() => setMobileMenuOpen(false)} className="text-foreground font-medium py-3 px-1 border-b border-border/40 inline-flex items-center gap-2">
                <LifeBuoy className="h-4 w-4" /> {t("nav.help")}
              </Link>
              <Link to="#trust" onClick={() => setMobileMenuOpen(false)} className="text-muted-foreground py-3 px-1 border-b border-border/40 text-sm">
                {t("nav.trust")}
              </Link>

              <div className="flex flex-col gap-2 pt-4">
                <LanguageSwitcher />
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>{t("nav.signin")}</Link>
                </Button>
                <Button variant="coral" size="default" asChild>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>{t("nav.start")}</Link>
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
