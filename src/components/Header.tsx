import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-foreground">LINKSY</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <Link to="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t("nav.features")}</Link>
            <Link to="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t("nav.how")}</Link>
            <Link to="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t("nav.pricing")}</Link>
            <Link to="#trust" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">{t("nav.trust")}</Link>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">{t("nav.signin")}</Link>
            </Button>
            <Button variant="coral" size="default" asChild>
              <Link to="/signup">{t("nav.start")}</Link>
            </Button>
          </div>

          <button className="lg:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link to="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">{t("nav.features")}</Link>
              <Link to="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">{t("nav.how")}</Link>
              <Link to="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium py-2">{t("nav.pricing")}</Link>
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
