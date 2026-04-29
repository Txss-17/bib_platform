import { ShieldCheck, FileCheck, Lock, BadgeCheck, Scale, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * ComplianceBadgesSection
 * Trust-first proof block: official compliance badges + verification process.
 * Strict tri-color: ivory bg / marine ink / gold accent. No gradients.
 */
const BADGES = [
  {
    icon: ShieldCheck,
    label: { fr: "KYC vérifié", en: "KYC verified" },
    desc: {
      fr: "Identité du vendeur contrôlée avant publication.",
      en: "Seller identity checked before publication.",
    },
  },
  {
    icon: Lock,
    label: { fr: "RGPD natif", en: "GDPR native" },
    desc: {
      fr: "Données chiffrées, hébergement UE, droit à l'oubli.",
      en: "Encrypted data, EU hosting, right to erasure.",
    },
  },
  {
    icon: BadgeCheck,
    label: { fr: "Paiements Stripe", en: "Stripe payments" },
    desc: {
      fr: "PCI-DSS niveau 1, 3D Secure, anti-fraude inclus.",
      en: "PCI-DSS level 1, 3D Secure, anti-fraud built in.",
    },
  },
  {
    icon: Users,
    label: { fr: "18+ obligatoire", en: "18+ required" },
    desc: {
      fr: "Vérification d'âge à l'inscription, sans exception.",
      en: "Age check at signup, no exception.",
    },
  },
  {
    icon: FileCheck,
    label: { fr: "Échantillon validé", en: "Sample validated" },
    desc: {
      fr: "Aucun produit en ligne sans test physique préalable.",
      en: "No product live without prior physical test.",
    },
  },
  {
    icon: Scale,
    label: { fr: "Litiges sous 48h", en: "Disputes < 48h" },
    desc: {
      fr: "Escalade automatique, médiation par Brand-In-A-Box.",
      en: "Auto escalation, mediation by Brand-In-A-Box.",
    },
  },
];

export default function ComplianceBadgesSection() {
  const { lang } = useLanguage();

  return (
    <section
      id="compliance"
      className="py-20 lg:py-28 bg-bib-marine text-primary-foreground relative overflow-hidden"
    >
      {/* discreet gold ring decor — never blended */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full border border-bib-gold/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-32 w-[480px] h-[480px] rounded-full border border-bib-gold/10"
        aria-hidden
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-2xl mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-bib-gold/15 border border-bib-gold/30 mb-5">
            <ShieldCheck size={14} className="text-bib-gold" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bib-gold">
              {lang === "fr" ? "Preuves de conformité" : "Compliance proofs"}
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
            {lang === "fr" ? (
              <>
                La confiance, <span className="text-bib-gold">prouvée.</span>
              </>
            ) : (
              <>
                Trust, <span className="text-bib-gold">proven.</span>
              </>
            )}
          </h2>
          <p className="text-base lg:text-lg text-primary-foreground/75 leading-relaxed">
            {lang === "fr"
              ? "Chaque badge ci-dessous correspond à un contrôle réel, automatisé ou humain, exécuté avant qu'une boutique ne soit visible publiquement."
              : "Each badge below maps to a real check — automated or human — performed before any boutique goes public."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          {BADGES.map((b) => (
            <div
              key={b.label.fr}
              className="group rounded-2xl border border-primary-foreground/10 bg-primary-foreground/[0.04] p-5 lg:p-6 hover:border-bib-gold/40 hover:bg-primary-foreground/[0.06] transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-bib-gold/15 flex items-center justify-center group-hover:bg-bib-gold/25 transition-colors">
                  <b.icon size={20} className="text-bib-gold" strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-primary-foreground leading-snug">
                    {b.label[lang]}
                  </p>
                  <p className="text-sm text-primary-foreground/70 mt-1 leading-relaxed">
                    {b.desc[lang]}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inline verification footer */}
        <div className="mt-10 lg:mt-12 flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center sm:justify-between rounded-2xl border border-bib-gold/25 bg-bib-gold/[0.06] px-5 py-4">
          <p className="text-sm text-primary-foreground/85">
            <span className="font-semibold text-bib-gold">
              {lang === "fr" ? "Verified by Brand-In-A-Box" : "Verified by Brand-In-A-Box"}
            </span>{" "}
            ·{" "}
            {lang === "fr"
              ? "chaque commande affiche le badge officiel sur la facture et l'email de confirmation."
              : "every order shows the official badge on the invoice and confirmation email."}
          </p>
          <p className="text-xs text-primary-foreground/55">
            {lang === "fr" ? "Mis à jour mensuellement" : "Updated monthly"}
          </p>
        </div>
      </div>
    </section>
  );
}