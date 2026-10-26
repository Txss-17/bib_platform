import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import {
  FileText,
  ScrollText,
  ShieldCheck,
  Cookie,
  ArrowRight,
  ScaleIcon,
  Mail,
} from "lucide-react";

const docs = [
  {
    icon: FileText,
    get eyebrow() {
      return translateUi("Identité");
    },
    get title() {
      return translateUi("Mentions légales");
    },
    get desc() {
      return translateUi(
        "Éditeur, hébergeur, directeur de publication et propriété intellectuelle de la plateforme Brand-In-A-Box.",
      );
    },
    href: "/mentions-legales",
    points: ["Éditeur & SIRET", "Hébergement", "Propriété intellectuelle"],
  },
  {
    icon: ScrollText,
    get eyebrow() {
      return translateUi("Contrat");
    },
    get title() {
      return translateUi("Conditions Générales d'Utilisation");
    },
    get desc() {
      return translateUi(
        "Cadre contractuel entre vous et BIB : compte, services fournis, engagements vendeur, tarifs, résiliation.",
      );
    },
    href: "/cgu",
    points: ["Création de compte 18+", "Services & tarifs", "Résiliation"],
  },
  {
    icon: ShieldCheck,
    eyebrow: "RGPD",
    get title() {
      return translateUi("Politique de confidentialité");
    },
    get desc() {
      return translateUi(
        "Quelles données nous collectons, dans quel but, pendant combien de temps, et comment exercer vos droits.",
      );
    },
    href: "/confidentialite",
    points: ["Données collectées", "Vos droits RGPD", "Sous-traitants"],
  },
  {
    icon: Cookie,
    get eyebrow() {
      return translateUi("Traceurs");
    },
    get title() {
      return translateUi("Politique cookies");
    },
    get desc() {
      return translateUi(
        "Liste des cookies essentiels, de préférences et de mesure d'audience, et comment les gérer dans votre navigateur.",
      );
    },
    href: "/cookies",
    points: ["Essentiels", "Préférences", "Mesure d'audience"],
  },
];

export default function PackLegal() {
  useLanguage();
  useSEO({
    title: translateUi("Pack légal complet — Brand-In-A-Box"),
    description: translateUi(
      "Mentions légales, CGU, politique de confidentialité et politique cookies de Brand-In-A-Box réunis sur une seule page.",
    ),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative overflow-hidden bg-brand-marine text-bib-ivory">
          <div
            className="absolute -top-40 -right-32 w-[520px] h-[520px] rounded-full bg-bib-gold/10 blur-3xl"
            aria-hidden
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative max-w-4xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/10 text-bib-ivory text-[11px] font-semibold uppercase tracking-[0.18em] mb-6">
              <ScaleIcon className="h-3.5 w-3.5" /> {translateUi("Pack légal")}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05]">
              {translateUi("Tout notre cadre légal,") + " "}
              <span className="text-bib-gold">
                {translateUi("accessible en un endroit")}
              </span>
              .
            </h1>
            <p className="mt-6 text-lg text-bib-ivory/80 leading-relaxed max-w-2xl">
              {translateUi(
                "Quatre documents qui régissent l'utilisation de Brand-In-A-Box. Chacun est rédigé clairement et tenu à jour.",
              )}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 max-w-5xl">
          <div className="grid sm:grid-cols-2 gap-5">
            {docs.map((d) => (
              <Link
                key={d.href}
                to={d.href}
                className="group relative rounded-2xl border border-border bg-card p-6 hover:border-bib-gold/50 hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 text-foreground flex items-center justify-center group-hover:bg-bib-gold/15 group-hover:text-bib-gold transition-colors">
                    <d.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bib-gold">
                      {d.eyebrow}
                    </span>
                    <h2 className="font-display text-xl font-bold text-foreground mt-1">
                      {d.title}
                    </h2>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {d.desc}
                </p>
                <ul className="mt-4 space-y-1.5">
                  {d.points.map((p) => (
                    <li
                      key={p}
                      className="text-xs text-muted-foreground flex items-center gap-2"
                    >
                      <span className="h-1 w-1 rounded-full bg-bib-gold" />
                      {p}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground group-hover:text-bib-gold transition-colors">
                  {translateUi("Consulter") + " "}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {translateUi("Une question juridique ?")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {translateUi(
                  "Notre équipe répond sous 48 h ouvrées sur tout sujet contractuel ou RGPD.",
                )}
              </p>
            </div>
            <a
              href="mailto:legal@brand-in-a-box.space"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-marine text-bib-ivory text-sm font-semibold hover:bg-brand-marine/90 transition-colors"
            >
              <Mail className="h-4 w-4" /> legal@brand-in-a-box.space
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
