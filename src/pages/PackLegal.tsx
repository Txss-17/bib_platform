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
  ClipboardCheck,
  BriefcaseBusiness,
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
    icon: ScrollText,
    get eyebrow() {
      return translateUi("Vente");
    },
    get title() {
      return translateUi("Conditions Générales de Vente");
    },
    get desc() {
      return translateUi("Conditions applicables aux ventes, commandes, paiements, livraisons, retours et garanties selon les responsabilités des parties.");
    },
    href: "/cgv",
    points: ["Commandes", "Livraison et retours", "Garanties"],
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
    icon: ClipboardCheck,
    get eyebrow() { return translateUi("Transparence"); },
    get title() { return translateUi("Données et consentements"); },
    get desc() { return translateUi("Parcours par parcours : comptes, commandes, BIB Talent, sondage, assistance IA, communications et publicités."); },
    href: "/donnees-et-consentements",
    points: ["Consentement et bases légales", "Destinataires", "Choix et retrait"],
  },
  {
    icon: BriefcaseBusiness,
    get eyebrow() { return translateUi("Marchands"); },
    get title() { return translateUi("Annexe de traitement des données"); },
    get desc() { return translateUi("Projet d'accord entre BIB et les marchands pour protéger les données clients des boutiques ; à valider avant signature."); },
    href: "/annexe-donnees-marchands",
    points: ["Responsabilités RGPD", "Sécurité et transferts", "Projet non signé"],
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
      "Mentions légales, CGU, CGV, politique de confidentialité et cookies de Brand-In-A-Box accessibles depuis un même répertoire.",
    ),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="relative overflow-hidden bg-brand-marine text-bib-ivory">
          <div
            className="absolute -top-40 -right-32 w-[320px] h-[320px] rounded-full bg-bib-gold/10 blur-3xl"
            aria-hidden
          />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-9 lg:py-12 relative max-w-6xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/10 text-bib-ivory text-[11px] font-semibold uppercase tracking-[0.18em] mb-4">
              <ScaleIcon className="h-3.5 w-3.5" /> {translateUi("Pack légal")}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.05]">
              {translateUi("Tout notre cadre légal,") + " "}
              <span className="text-bib-gold">
                {translateUi("accessible en un endroit")}
              </span>
              .
            </h1>
            <p className="mt-4 text-sm text-bib-ivory/80 leading-relaxed max-w-2xl">
              {translateUi(
                "Retrouvez les mentions légales, les conditions d'utilisation et de vente, la confidentialité et les cookies au même endroit.",
              )}
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-6xl">
          <div className="grid sm:grid-cols-2 gap-3">
            {docs.map((d) => (
              <Link
                key={d.href}
                to={d.href}
                className="group relative rounded-lg border border-border bg-card p-4 hover:border-bib-gold/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/5 text-foreground flex items-center justify-center group-hover:bg-bib-gold/15 group-hover:text-bib-gold transition-colors">
                    <d.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bib-gold">
                      {d.eyebrow}
                    </span>
                    <h2 className="font-display text-base font-bold text-foreground mt-1">
                      {d.title}
                    </h2>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {d.desc}
                </p>
                <ul className="mt-3 space-y-1">
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
                <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground group-hover:text-bib-gold transition-colors">
                  {translateUi("Consulter") + " "}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-border bg-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {translateUi("Une question juridique ?")}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {translateUi(
                  "Contactez BIB pour toute demande juridique ou relative à la confidentialité. Le délai de réponse dépend de la nature de votre demande.",
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
