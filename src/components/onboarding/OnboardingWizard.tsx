import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight, ArrowLeft, Check, Globe2, Building2, User, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOnboardingState } from "@/hooks/useOnboardingState";

/**
 * OnboardingWizard
 * Bloque l'expérience post-signup tant que les 3 essentiels ne sont pas remplis :
 *   1. Nom + confirmation
 *   2. Marché cible (EU / EAU / Afrique / Worldwide)
 *   3. Type d'activité (Particulier / Business)
 * Skippable mais relancé à chaque login tant que profil incomplet.
 */

const MARKETS = [
  { value: "EU", label: "Union Européenne", desc: "FR, DE, IT, ES… — TVA UE, RGPD" },
  { value: "UAE", label: "Émirats Arabes Unis", desc: "Dubaï, Abu Dhabi — AED, EN/AR" },
  { value: "AF", label: "Afrique", desc: "Multi-pays, multi-devises locales" },
  { value: "WW", label: "Mondial", desc: "Tous marchés — config avancée" },
];

const TYPES = [
  {
    value: "individual",
    label: "Particulier",
    desc: "Vendeur indépendant, micro-entreprise.",
    icon: User,
  },
  {
    value: "business",
    label: "Business / Société",
    desc: "SIRET requis, KYC complet à l'étape suivante.",
    icon: Building2,
  },
];

export function OnboardingWizard() {
  const { user, profile, refreshProfile } = useAuth();
  const { needsWizard } = useOnboardingState();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [market, setMarket] = useState<string>("");
  const [businessType, setBusinessType] = useState<string>("");
  const [businessName, setBusinessName] = useState("");
  const [saving, setSaving] = useState(false);

  // Open automatically when conditions are met.
  useEffect(() => {
    if (needsWizard) {
      setOpen(true);
      setFullName(profile?.full_name || "");
      setMarket(profile?.market || "");
      setBusinessType(profile?.business_type || "");
      setBusinessName(profile?.business_name || "");
    }
  }, [needsWizard, profile]);

  const totalSteps = 3;
  const canNext =
    (step === 0 && fullName.trim().length >= 2) ||
    (step === 1 && !!market) ||
    (step === 2 && !!businessType && (businessType !== "business" || businessName.trim().length >= 2));

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        market,
        business_type: businessType,
        business_name: businessType === "business" ? businessName.trim() : null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Impossible de sauvegarder votre profil", { description: error.message });
      setSaving(false);
      return;
    }
    await refreshProfile();
    toast.success("Profil complété 🎉", { description: "Continuons avec votre première boutique." });
    setOpen(false);
    setSaving(false);
  };

  const handleSkip = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        {/* Marine band */}
        <div className="bg-bib-marine text-primary-foreground px-6 py-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-bib-gold" />
            <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-bib-gold">
              First 5 minutes · {step + 1}/{totalSteps}
            </span>
          </div>
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-display text-xl sm:text-2xl text-primary-foreground">
              {step === 0 && "Faisons connaissance"}
              {step === 1 && "Choisissez votre marché"}
              {step === 2 && "Particulier ou business ?"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/70 text-sm">
              {step === 0 && "Comment souhaitez-vous être appelé sur Brand-In-A-Box ?"}
              {step === 1 && "Le marché principal détermine devises, langues et règles fiscales par défaut."}
              {step === 2 && "Cela conditionne les documents de conformité que nous demanderons."}
            </DialogDescription>
          </DialogHeader>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-all ${
                  i <= step ? "bg-bib-gold" : "bg-primary-foreground/15"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {step === 0 && (
            <div className="space-y-3">
              <Label htmlFor="ob-name">Nom complet</Label>
              <Input
                id="ob-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Affiché dans votre profil et utilisé pour la signature des emails clients.
              </p>
            </div>
          )}

          {step === 1 && (
            <RadioGroup value={market} onValueChange={setMarket} className="space-y-2">
              {MARKETS.map((m) => (
                <label
                  key={m.value}
                  htmlFor={`market-${m.value}`}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                    market === m.value
                      ? "border-bib-gold bg-bib-gold/5"
                      : "border-border hover:border-bib-marine/30 hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value={m.value} id={`market-${m.value}`} className="mt-0.5" />
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Globe2 size={18} className="text-bib-marine mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{m.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </RadioGroup>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <RadioGroup value={businessType} onValueChange={setBusinessType} className="space-y-2">
                {TYPES.map((t) => (
                  <label
                    key={t.value}
                    htmlFor={`type-${t.value}`}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      businessType === t.value
                        ? "border-bib-gold bg-bib-gold/5"
                        : "border-border hover:border-bib-marine/30 hover:bg-muted/50"
                    }`}
                  >
                    <RadioGroupItem value={t.value} id={`type-${t.value}`} className="mt-0.5" />
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <t.icon size={18} className="text-bib-marine mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {businessType === "business" && (
                <div className="space-y-2 pt-2 animate-fade-in">
                  <Label htmlFor="ob-business">Raison sociale</Label>
                  <Input
                    id="ob-business"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Acme SAS"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={handleSkip} disabled={saving}>
            Plus tard
          </Button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} disabled={saving}>
                <ArrowLeft size={14} /> Retour
              </Button>
            )}
            {step < totalSteps - 1 ? (
              <Button size="sm" onClick={() => setStep(step + 1)} disabled={!canNext}>
                Continuer <ArrowRight size={14} />
              </Button>
            ) : (
              <Button size="sm" onClick={handleSave} disabled={!canNext || saving}>
                {saving ? "Enregistrement…" : (
                  <>
                    Terminer <Check size={14} />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}