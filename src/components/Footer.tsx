import { translateUi } from "@/lib/uiTranslation";
import { Link } from "react-router-dom";
import {
  Twitter,
  Linkedin,
  Instagram,
  Shield,
  Globe,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "@/components/Logo";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_repeat(4,1fr)] lg:gap-10">
            {/* Brand */}
            <div className="max-w-sm">
              <Link
                to="/"
                className="inline-flex items-center"
                aria-label={translateUi("BIB — Accueil")}
              >
                <Logo variant="full" onLight={false} />
              </Link>

              <p className="mt-6 max-w-xs text-sm leading-6 text-primary-foreground/65">
                {t("footer.desc")}
              </p>

              <div className="mt-7 flex items-center gap-3">
                <a
                  href="https://twitter.com/brandinabox"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X / Twitter"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/15 text-primary-foreground/60 transition-colors hover:border-primary-foreground/35 hover:text-primary-foreground"
                >
                  <Twitter size={16} />
                </a>

                <a
                  href="https://www.linkedin.com/company/brand-in-a-box"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/15 text-primary-foreground/60 transition-colors hover:border-primary-foreground/35 hover:text-primary-foreground"
                >
                  <Linkedin size={16} />
                </a>

                <a
                  href="https://www.instagram.com/brandinabox"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/15 text-primary-foreground/60 transition-colors hover:border-primary-foreground/35 hover:text-primary-foreground"
                >
                  <Instagram size={16} />
                </a>
              </div>
            </div>

            {/* Découvrir */}
            <div>
              <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/45">
                {translateUi("Découvrir")}
              </h4>

              <ul className="space-y-3.5">
                <li>
                  <Link
                    to="/store"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("Boutiques")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/suivi-commande"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("Suivre une commande")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Marques */}
            <div>
              <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/45">
                {translateUi("Pour les marques")}
              </h4>

              <ul className="space-y-3.5">
                <li>
                  <Link
                    to="/signup"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("Créer ma boutique")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/tarifs"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("Tarifs")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/a-propos"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("À propos de BIB")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/bib-talent"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    BIB Talent
                  </Link>
                </li>

                <li>
                  <Link
                    to="/carrieres"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("Carrières")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Réseau BIB */}
            <div>
              <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/45">
                {translateUi("Réseau BIB")}
              </h4>

              <ul className="space-y-3.5">
                <li>
                  <Link
                    to="/suppliers"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("Fournisseurs")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/ops"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("Logistique")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Aide & légal */}
            <div>
              <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/45">
                {translateUi("Aide & légal")}
              </h4>

              <ul className="space-y-3.5">
                <li>
                  <Link
                    to="/centre-aide"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("Centre d'aide")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/pack-legal"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("Pack légal")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/mentions-legales"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("Mentions légales")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/confidentialite"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    {translateUi("Confidentialité")}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/cgv"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    CGV
                  </Link>
                </li>

                <li>
                  <Link
                    to="/cgu"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    CGU
                  </Link>
                </li>

                <li>
                  <Link
                    to="/cookies"
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                  >
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 py-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-primary-foreground/50">
              <div className="inline-flex items-center gap-2">
                <Shield size={15} />
                <span>{t("footer.ssl")}</span>
              </div>

              <div className="inline-flex items-center gap-2">
                <Globe size={15} />
                <span>{t("footer.multimarket")}</span>
              </div>

              <div className="inline-flex items-center gap-2">
                <MapPin size={15} />
                <span>{translateUi("EU · UAE · Africa")}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 text-xs text-primary-foreground/45 lg:items-end">
              <p>
                © {currentYear} Brand-In-A-Box. {t("footer.rights")}
              </p>

              <Link
                to="/a-propos"
                className="inline-flex items-center gap-1 transition-colors hover:text-primary-foreground/80"
              >
                {translateUi("À propos de BIB")}
                <ArrowUpRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
