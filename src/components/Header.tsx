import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Store } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Logo } from "@/components/Logo";
import { BoutiqueSearchBar } from "@/components/search/BoutiqueSearchBar";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

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
          {/* Mobile: 36px icon. Desktop (lg): 44px icon — both use identical pixel-true crop. */}
          <span className="lg:hidden"><Logo iconSize={36} /></span>
          <span className="hidden lg:inline-flex"><Logo iconSize={44} /></span>

          <div className="hidden lg:flex items-center gap-6">
            <Link to="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t("nav.features")}</Link>
            <Link to="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t("nav.how")}</Link>
            <Link to="/tarifs" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t("nav.pricing")}</Link>
            <Link to="/store" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium inline-flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5" /> Découvrir les boutiques
            </Link>
            <Link to="#trust" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t("nav.trust")}</Link>
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
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <BoutiqueSearchBar compact placeholder="Boutique ou produit…" />
              <Link to="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">{t("nav.features")}</Link>
              <Link to="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">{t("nav.how")}</Link>
              <Link to="/tarifs" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">{t("nav.pricing")}</Link>
              <Link to="/store" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2 inline-flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" /> Découvrir les boutiques
              </Link>
              <Link to="#trust" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">{t("nav.trust")}</Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <LanguageSwitcher />
                <Button variant="ghost" size="sm" className="justify-start" asChild>
                  <Link to="/login">{t("nav.signin")}</Link>
                </Button>
                <Button variant="coral" size="default" asChild>
                  <Link to="/signup">{t("nav.start")}</Link>
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
