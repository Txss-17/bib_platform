import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO } from "@/hooks/useSEO";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SuppliersPricingSection } from "@/components/standalone/SuppliersPricingSection";
import { ShieldCheck, Truck, Workflow, Check, ArrowRight, AlertTriangle, Mail } from "lucide-react";

const compatibility = [
  { icon: Workflow, title: "Workflow intégré", text: "Échantillon Stripe, audit qualité et catalogue pré-validé." },
  { icon: Truck, title: "Logistique opérée", text: "Pickup, hub de transit UE, suivi et retours via Ops BIB." },
  { icon: ShieldCheck, title: "Conformité & paiements", text: "KYC vérifiés, encaissements mensuels, escrow sur litiges." },
];

const steps = [
  { title: "Candidature", text: "Formulaire en moins de 5 minutes." },
  { title: "Validation", text: "Étude du dossier sous 3 jours ouvrés." },
  { title: "Audit & KYC", text: "Contrôle qualité, documents, échantillon Stripe." },
  { title: "Onboarding", text: "Mise en ligne dans le catalogue BIB." },
];

const minimumCriteria = [
  "MOQ défini (idéalement ≤ 300 unités)",
  "Expédition vers l'UE possible",
  "Tracking opérationnel",
  "Entreprise enregistrée + documents KYC",
  "Audit qualité accepté (48h de préavis)",
];

const constraints = [
  "Audit qualité obligatoire (48h de préavis)",
  "Suivi via portail fournisseur uniquement",
  "Transit par notre hub QC (+2–5 jours)",
  "Pénalités si retard injustifié > 10 jours",
];

export default function Suppliers() {
  useSEO({
    title: "Devenir fournisseur — Brand-In-A-Box",
    description:
      "Référencez vos produits dans le Catalogue BIB et accédez à un réseau de boutiques pré-qualifiées. Logistique, paiements et conformité gérés.",
  });

  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.hash]);

  return (
    <StandaloneLayout
      portal="Suppliers"
      accent="primary"
      menuItems={[
        { label: "Fonctionnement", href: "#how", icon: "workflow" },
        { label: "Critères", href: "#criteres", icon: "shield" },
        { label: "Contraintes", href: "#contraintes", icon: "shield" },
        { label: "Étapes", href: "#etapes", icon: "clipboard" },
        { label: "Tarifs", href: "#tarifs", icon: "sparkles" },
        { label: "FAQ", href: "#faq", icon: "sparkles" },
        { label: "Candidater", href: "/suppliers/apply", icon: "file" },
        { label: "Nous écrire", href: "mailto:suppliers@brand-in-a-box.space", icon: "mail" },
      ]}
    >
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <Badge variant="secondary" className="mb-4">Espace fournisseurs</Badge>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight max-w-3xl">
            Distribuez vos produits dans le réseau Brand-In-A-Box.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 max-w-2xl">
            Catalogue pré-validé, logistique et paiements opérés. Naviguez via le menu ci-dessus pour explorer.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/suppliers/apply">Vérifier ma compatibilité <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <a href="#tarifs" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Voir les tarifs
            </a>
          </div>
        </div>
      </section>

      {/* How it works (résumé) */}
      <section id="how" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 scroll-mt-20">
        <div className="max-w-2xl mb-8">
          <p className="uppercase tracking-[0.18em] text-xs text-secondary font-medium mb-2">Fonctionnement</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Comment fonctionne le réseau BIB</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {compatibility.map((c) => (
            <Card key={c.title} className="p-5 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <c.icon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Critères minimums */}
      <section id="criteres" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Critères minimums pour candidater</h2>
        </div>
        <Card className="p-6 sm:p-8">
          <ul className="space-y-2.5">
            {minimumCriteria.map((c) => (
              <li key={c} className="flex items-start gap-2.5 text-sm">
                <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Contraintes */}
      <section id="contraintes" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <Card className="p-6 sm:p-8 bg-warning/5 border-warning/30">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold">Contraintes à accepter</h2>
            </div>
          </div>
          <ul className="space-y-2 pl-1">
            {constraints.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Étapes processus */}
      <section id="etapes" className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16 scroll-mt-20">
        <div className="max-w-2xl mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold">Étapes du processus</h2>
        </div>
        <Card className="p-6 sm:p-8 bg-muted/30">
          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={s.title} className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center justify-center">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </section>

      {/* Tarifs + FAQ + CTA (intégrés) */}
      <SuppliersPricingSection />

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center">
          <Button asChild variant="outline" size="lg" className="gap-2">
            <a href="mailto:suppliers@brand-in-a-box.space"><Mail className="w-4 h-4" /> Nous écrire</a>
          </Button>
        </div>
      </section>
    </StandaloneLayout>
  );
}