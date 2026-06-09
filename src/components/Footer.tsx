import { Link } from "react-router-dom";
import { Twitter, Linkedin, Instagram, Shield, Globe, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-6">
              <Logo variant="full" onLight={false} />
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">{t("footer.desc")}</p>
            <div className="flex items-center gap-4">
              <a href="https://twitter.com/brandinabox" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"><Twitter size={20} /></a>
              <a href="https://www.linkedin.com/company/brand-in-a-box" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"><Linkedin size={20} /></a>
              <a href="https://www.instagram.com/brandinabox" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">{t("footer.product")}</h4>
            <ul className="space-y-3">
              <li><Link to="/vendre" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Vendre sur BIB</Link></li>
              <li><Link to="/marketplace" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Marketplace</Link></li>
              <li><Link to="/tarifs" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Tarifs</Link></li>
              <li><Link to="/suivi-commande" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Suivi commande</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">{t("footer.company")}</h4>
            <ul className="space-y-3">
              <li><Link to="/a-propos" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">À propos</Link></li>
              <li><Link to="/carrieres" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Carrières</Link></li>
              <li><Link to="/suppliers" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Devenir fournisseur</Link></li>
              <li><Link to="/ops" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Partenaires logistiques</Link></li>
              <li><Link to="/centre-aide" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">{t("footer.resources")}</h4>
            <ul className="space-y-3">
              <li><Link to="/centre-aide" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Centre d'aide</Link></li>
              <li><Link to="/pack-legal" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Pack légal</Link></li>
              <li><Link to="/suivi-commande" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Suivi commande</Link></li>
              <li><Link to="/recycler" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Recyclage</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">{t("footer.legal")}</h4>
            <ul className="space-y-3">
              <li><Link to="/mentions-legales" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Mentions légales</Link></li>
              <li><Link to="/cgu" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">CGU</Link></li>
              <li><Link to="/confidentialite" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Confidentialité</Link></li>
              <li><Link to="/cookies" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">Cookies</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
              <div className="flex items-center gap-2"><Shield size={16} /><span>{t("footer.ssl")}</span></div>
              <div className="flex items-center gap-2"><Globe size={16} /><span>{t("footer.multimarket")}</span></div>
              <div className="flex items-center gap-2"><MapPin size={16} /><span>EU, UAE, Africa</span></div>
            </div>
            <p className="text-sm text-primary-foreground/60">© {currentYear} Brand-In-A-Box. {t("footer.rights")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
