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
    get points() { return [translateUi("Éditeur & SIRET"), translateUi("Hébergement"), translateUi("Propriété intellectuelle")]; },
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
        "Information générale sur l’utilisation de BIB. Les conditions propres aux marchands et aux acheteurs relèvent de documents distincts, sans remplacer les CGV de chaque boutique.",
      );
    },
    href: "/cgu",
    get points() { return [translateUi("Création de compte 18+"), translateUi("Services & tarifs"), translateUi("Résiliation")]; },
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
      return translateUi("Présentation générale des ventes et garanties. Les CGV applicables à une commande sont celles de la boutique, générées pour le vendeur juridiquement identifié et présentées avant paiement.");
    },
    href: "/cgv",
    get points() { return [translateUi("CGV de la boutique"), translateUi("Vendeur identifié"), translateUi("Rétractation et garanties")]; },
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
    get points() { return [translateUi("Données collectées"), translateUi("Vos droits RGPD"), translateUi("Sous-traitants")]; },
  },
  {
    icon: ClipboardCheck,
    get eyebrow() { return translateUi("Transparence"); },
    get title() { return translateUi("Données et consentements"); },
    get desc() { return translateUi("Parcours par parcours : comptes, commandes, BIB Talent, sondage, assistance IA, communications et publicités."); },
    href: "/donnees-et-consentements",
    get points() { return [translateUi("Consentement et bases légales"), translateUi("Destinataires"), translateUi("Choix et retrait")]; },
  },
  {
    icon: BriefcaseBusiness,
    get eyebrow() { return translateUi("Marchands"); },
    get title() { return translateUi("Annexe de traitement des données"); },
    get desc() { return translateUi("Projet d'accord entre BIB et les marchands pour protéger les données clients des boutiques ; à valider avant signature."); },
    href: "/annexe-donnees-marchands",
    get points() { return [translateUi("Responsabilités RGPD"), translateUi("Sécurité et transferts"), translateUi("Projet non signé")]; },
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
    get points() { return [translateUi("Essentiels"), translateUi("Préférences"), translateUi("Mesure d'audience")]; },
  },
];

export default function PackLegal() {
  const { lang } = useLanguage();
  useSEO({
    title: translateUi("Documents juridiques — Brand-In-A-Box"),
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
              <ScaleIcon className="h-3.5 w-3.5" /> {translateUi("Documents juridiques")}
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

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 max-w-6xl">
          <div className="rounded-lg border border-amber-400/30 bg-muted/40 p-4 text-sm">
{lang === "en" ? (
              <>
                <strong>Contract harmonization as of 5 November 2026.</strong> Former BIB Sales Terms v1.2 and BIB Terms of Use v1.2 are historical drafts, not enforceable store-specific terms of sale. The working reference separates JUR-M01/M02 (merchants), JUR-C01 (buyers), JUR-C02 (BIB services to consumers, not activated) and JUR-B01/B02/B03 templates generated for each store. Legal Notices v1.1, Privacy v1.2 and Cookies v1.1 remain drafts requiring verification.
                <br /><br />The /cgu and /cgv pages currently provide general information only. Product sales are governed by the terms of sale of the identified seller's store. Working documents require legal approval before any definitive contractual use. The individual entrepreneur's identity and registrations, actual hosting provider, consumer mediators and deployed trackers must be verified against supporting evidence.
                <br /><br />References to a company (SAS), holding company or subsidiary that has not been incorporated do not identify the current operator.
              </>
            ) : (
              <><strong>Harmonisation des contrats au 5 novembre 2026.</strong> Les anciens projets CGV BIB v1.2 et CGU BIB v1.2 sont des sources historiques, non des CGV de boutique opposables. Le référentiel de travail distingue JUR-M01/M02 (marchands), JUR-C01 (acheteurs), JUR-C02 (services BIB aux consommateurs non activés) et les modèles JUR-B01/B02/B03 générés pour chaque boutique. Mentions légales v1.1, Confidentialité v1.2 et Cookies v1.1 restent des projets à vérifier. Les pages /cgu et /cgv sont actuellement des informations générales : les ventes de produits relèvent des CGV de la boutique et du vendeur identifié. Les documents de travail demeurent à valider juridiquement avant application contractuelle définitive. L'identité et les immatriculations de l'exploitant individuel, l'hébergeur effectif, les médiateurs de consommation et les traceurs déployés doivent être vérifiés sur justificatifs. Les anciennes références à une SAS, une holding ou une filiale non constituée ne valent pas identification de l'exploitant actuel.</>
            )}
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
