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
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"><Linkedin size={20} /></a>
              <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">{t("footer.product")}</h4>
            <ul className="space-y-3">
              {["features", "dashboard", "intelligence", "recycling", "pricing"].map(k => (
                <li key={k}><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">{t(`footer.${k}`)}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">{t("footer.company")}</h4>
            <ul className="space-y-3">
              {["about", "careers", "press", "partners", "contact"].map(k => (
                <li key={k}><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">{t(`footer.${k}`)}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">{t("footer.resources")}</h4>
            <ul className="space-y-3">
              {["help", "docs", "academy", "webinars", "blog"].map(k => (
                <li key={k}><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">{t(`footer.${k}`)}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-primary-foreground/80">{t("footer.legal")}</h4>
            <ul className="space-y-3">
              {["privacy", "terms", "cookies", "compliance", "gdpr"].map(k => (
                <li key={k}><Link to="#" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">{t(`footer.${k}`)}</Link></li>
              ))}
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
