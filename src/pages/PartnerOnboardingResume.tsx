import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, Mail, ShieldAlert, ShieldCheck } from "lucide-react";

/**
 * Magic-link-style resume page. Partner enters their email, receives a 6-digit
 * code, and is redirected to /portal/onboarding/:token where they can view
 * status and (re)edit their dossier until it is approved.
 */
export default function PartnerOnboardingResume() {
  const [params] = useSearchParams();
  const portalParam = params.get("portal");
  const portal: "suppliers" | "ops" = portalParam === "ops" ? "ops" : "suppliers";
  const portalLabel = portal === "suppliers" ? "Suppliers" : "Logistique";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: `Reprendre mon onboarding ${portalLabel} — Brand-In-A-Box`,
    description: "Reprenez et modifiez votre dossier d'onboarding avant validation finale.",
  });

  async function sendCode() {
    const e = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
      setError("Email invalide.");
      return;
    }
    setSending(true);
    setError(null);
    const { data, error } = await supabase.functions.invoke("partner-otp-request", {
      body: { email: e, portal },
    });
    setSending(false);
    if (error || !(data as { ok?: boolean })?.ok) {
      const code = (data as { error?: string })?.error;
      setError(code === "rate_limited" ? "Trop de demandes — patientez une minute." : "Envoi impossible. Réessayez.");
      return;
    }
    setSent(true);
    toast({ title: "Code envoyé", description: `Vérifiez ${e}.` });
  }

  async function verifyCode() {
    const e = email.trim().toLowerCase();
    if (!/^\d{6}$/.test(code)) {
      setError("Saisissez les 6 chiffres du code.");
      return;
    }
    setVerifying(true);
    setError(null);
    const { data, error } = await supabase.functions.invoke("partner-otp-verify", {
      body: { email: e, portal, code },
    });
    setVerifying(false);
    const ok = (data as { ok?: boolean })?.ok;
    if (error || !ok) {
      const msg = (data as { error?: string })?.error;
      setError(
        msg === "invalid_code" ? "Code incorrect."
        : msg === "expired" ? "Code expiré, renvoyez un nouveau code."
        : msg === "too_many_attempts" ? "Trop de tentatives. Renvoyez un code."
        : "Vérification impossible."
      );
      return;
    }
    const token = (data as { access_token: string }).access_token;
    navigate(`/portal/onboarding/${token}`);
  }

  return (
    <StandaloneLayout
      portal={portal === "suppliers" ? "Suppliers" : "Ops"}
      accent={portal === "suppliers" ? "primary" : "accent"}
      menuItems={[
        { label: "Présentation", href: portal === "suppliers" ? "/suppliers" : "/ops", icon: portal === "suppliers" ? "layers" : "truck" },
        { label: "Candidature", href: portal === "suppliers" ? "/suppliers/apply" : "/ops/apply", icon: "clipboard" },
        { label: "Onboarding", href: portal === "suppliers" ? "/suppliers/onboarding" : "/ops/onboarding", icon: "workflow" },
      ]}
    >
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 max-w-xl">
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to={portal === "suppliers" ? "/suppliers" : "/ops"}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Retour
          </Link>
        </Button>
        <Badge variant="secondary" className="mb-3">Reprise sécurisée</Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Reprendre mon onboarding</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-3 mb-8">
          Saisissez l'email utilisé lors de votre soumission. Nous envoyons un code à 6 chiffres pour
          accéder à votre dossier et le modifier avant validation finale.
        </p>

        <Card className="p-5 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="resume-email">Email du dossier</Label>
            <Input
              id="resume-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@societe.com"
              maxLength={255}
              disabled={sending || verifying}
            />
          </div>

          {!sent ? (
            <Button onClick={sendCode} disabled={sending || !email} className="w-full sm:w-auto">
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
              Recevoir mon code
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Code reçu par email</Label>
                <div className="mt-2">
                  <InputOTP maxLength={6} value={code} onChange={setCode}>
                    <InputOTPGroup>
                      {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button size="sm" onClick={verifyCode} disabled={verifying || code.length !== 6}>
                  {verifying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                  Accéder à mon dossier
                </Button>
                <Button size="sm" variant="ghost" onClick={sendCode} disabled={sending}>
                  Renvoyer le code
                </Button>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> {error}
            </p>
          )}

          <p className="text-[11px] text-muted-foreground">
            Pas encore inscrit ?{" "}
            <Link className="underline" to={portal === "suppliers" ? "/suppliers/apply" : "/ops/apply"}>
              Déposer une candidature
            </Link>
          </p>
        </Card>
      </section>
    </StandaloneLayout>
  );
}