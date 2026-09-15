import { Link } from "react-router-dom";
import { ArrowRight, Check, Receipt, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PriceTransparencySection() {
  const { lang } = useLanguage();
  const isFr = lang === "fr";

  return (
    <section
      id="pricing-preview"
      className="relative overflow-hidden bg-bib-ivory py-16 sm:py-20 lg:py-24"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-bib-gold/30 bg-bib-gold/10 px-3 py-1.5"
          >
            <Receipt className="h-4 w-4 text-bib-gold" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-bib-marine">
              {isFr ? "Une offre claire" : "Clear pricing"}
            </span>
          </div>

          <h2 className="font-display text-3xl font-bold leading-tight text-bib-marine sm:text-4xl lg:text-5xl">
            {isFr ? (
              <>
                Développez votre marque.
                <span className="block text-bib-gold">
                  Maîtrisez vos coûts.
                </span>
              </>
            ) : (
              <>
                Grow your brand.
                <span className="block text-bib-gold">
                  Know your costs.
                </span>
              </>
            )}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {isFr
              ? "BIB présente les frais, commissions et revenus estimés avant chaque engagement. Aucun calcul important ne doit être découvert après la vente."
              : "BIB shows fees, commissions and estimated earnings before every commitment. No important cost should appear after the sale."}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
          <PricingPreviewCard
            eyebrow={isFr ? "Pour les clients" : "For customers"}
            title={isFr ? "Découvrir" : "Discover"}
            price={isFr ? "4,99 € / mois" : "€4.99 / month"}
            description={
              isFr
                ? "Explorez les marques vérifiées et profitez des services BIB."
                : "Explore verified brands and access BIB services."
            }
            items={
              isFr
                ? [
                    "Découverte des boutiques",
                    "Boutiques suivies",
                    "Points et cartes cadeaux",
                  ]
                : [
                    "Discover boutiques",
                    "Followed brands",
                    "Points and gift cards",
                  ]
            }
            href="/store"
            cta={isFr ? "Découvrir les marques" : "Discover brands"}
          />

          <PricingPreviewCard
            featured
            eyebrow={isFr ? "Pour les marques" : "For brands"}
            title={isFr ? "Développer" : "Grow"}
            price={isFr ? "À partir de 79 € / mois" : "From €79 / month"}
            description={
              isFr
                ? "Développez votre boutique au sein d’un réseau sélectionné."
                : "Grow your store within a curated network."
            }
            items={
              isFr
                ? [
                    "Accès au réseau BIB",
                    "Outils de vente",
                    "Frais présentés avant engagement",
                  ]
                : [
                    "Access to the BIB network",
                    "Sales tools",
                    "Fees shown before commitment",
                  ]
            }
            href="/vendre"
            cta={isFr ? "Développer ma marque" : "Grow my brand"}
          />

          <PricingPreviewCard
            eyebrow={isFr ? "Pour les partenaires" : "For partners"}
            title={isFr ? "Collaborer" : "Partner"}
            price={isFr ? "Selon votre activité" : "Based on your activity"}
            description={
              isFr
                ? "Fournisseurs et opérateurs peuvent rejoindre l’écosystème BIB."
                : "Suppliers and operators can join the BIB ecosystem."
            }
            items={
              isFr
                ? [
                    "Cadre adapté à votre activité",
                    "Processus de sélection",
                    "Partenariat structuré",
                  ]
                : [
                    "Activity-based framework",
                    "Selection process",
                    "Structured partnership",
                  ]
            }
            href="/suppliers"
            cta={isFr ? "Voir les partenariats" : "View partnerships"}
          />
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-bib-gold" />
            {isFr
              ? "Tarifs et conditions présentés avant validation"
              : "Pricing and terms shown before confirmation"}
          </div>

          <Button asChild variant="outline" className="gap-2">
            <Link to="/tarifs">
              {isFr ? "Voir tous les tarifs" : "View all pricing"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function PricingPreviewCard({
  eyebrow,
  title,
  price,
  description,
  items,
  href,
  cta,
  featured = false,
}: {
  eyebrow: string;
  title: string;
  price: string;
  description: string;
  items: string[];
  href: string;
  cta: string;
  featured?: boolean;
}) {
  return (
    <div
      className={[
        "relative flex h-full flex-col rounded-2xl border p-6 transition-all",
        featured
          ? "border-bib-gold bg-bib-marine text-primary-foreground shadow-premium"
          : "border-bib-marine/10 bg-card",
      ].join(" ")}
    >
      {featured && (
        <div className="absolute -top-3 left-6 rounded-full bg-bib-gold px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-bib-marine">
          Recommandé
        </div>
      )}

      <p
        className={[
          "text-xs font-semibold uppercase tracking-[0.16em]",
          featured ? "text-bib-gold" : "text-muted-foreground",
        ].join(" ")}
      >
        {eyebrow}
      </p>

      <h3
        className={[
          "mt-3 font-display text-2xl font-bold",
          featured ? "text-primary-foreground" : "text-bib-marine",
        ].join(" ")}
      >
        {title}
      </h3>

      <p
        className={[
          "mt-4 font-display text-xl font-bold",
          featured ? "text-bib-gold" : "text-bib-marine",
        ].join(" ")}
      >
        {price}
      </p>

      <p
        className={[
          "mt-3 text-sm leading-relaxed",
          featured
            ? "text-primary-foreground/75"
            : "text-muted-foreground",
        ].join(" ")}
      >
        {description}
      </p>

      <ul className="mt-6 flex-1 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className={[
              "flex items-start gap-2 text-sm",
              featured
                ? "text-primary-foreground/90"
                : "text-bib-marine",
            ].join(" ")}
          >
            <Check
              className={[
                "mt-0.5 h-4 w-4 shrink-0",
                featured ? "text-bib-gold" : "text-bib-gold",
              ].join(" ")}
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        className={[
          "mt-8 w-full gap-2",
          featured
            ? "bg-bib-gold text-bib-marine hover:bg-bib-gold/90"
            : "",
        ].join(" ")}
        variant={featured ? "default" : "outline"}
      >
        <Link to={href}>
          {cta}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
