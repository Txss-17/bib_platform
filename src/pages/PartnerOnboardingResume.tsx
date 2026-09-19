import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { StandaloneLayout } from "@/components/standalone/StandaloneLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { useSEO } from "@/hooks/useSEO";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Loader2,
  Mail,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

export default function PartnerOnboardingResume() {
  const [params] = useSearchParams();

  const portalParam = params.get("portal");

  const portal: "suppliers" | "ops" =
    portalParam === "ops" ? "ops" : "suppliers";

  const portalLabel =
    portal === "suppliers" ? "Suppliers" : "Logistique";

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
    description:
      "Reprenez et modifiez votre dossier d'onboarding avant sa validation finale.",
  });

  async function sendCode() {
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)
    ) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }

    setSending(true);
    setError(null);

    const { data, error: invokeError } =
      await supabase.functions.invoke("partner-otp-request", {
        body: {
          email: normalizedEmail,
          portal,
        },
      });

    setSending(false);

    const response = data as {
      ok?: boolean;
      error?: string;
    } | null;

    if (invokeError || !response?.ok) {
      setError(
        response?.error === "rate_limited"
          ? "Trop de demandes. Veuillez patienter avant de réessayer."
          : "Impossible d'envoyer le code. Veuillez réessayer."
      );

      return;
    }

    setSent(true);

    toast({
      title: "Code envoyé",
      description: `Vérifiez votre boîte email ${normalizedEmail}.`,
    });
  }

  async function verifyCode() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\d{6}$/.test(code)) {
      setError("Veuillez saisir les 6 chiffres du code.");
      return;
    }

    setVerifying(true);
    setError(null);

    const { data, error: invokeError } =
      await supabase.functions.invoke("partner-otp-verify", {
        body: {
          email: normalizedEmail,
          portal,
          code,
        },
      });

    setVerifying(false);

    const response = data as {
      ok?: boolean;
      error?: string;
      access_token?: string;
    } | null;

    if (invokeError || !response?.ok) {
      setError(
        response?.error === "invalid_code"
          ? "Code incorrect."
          : response?.error === "expired"
            ? "Code expiré. Demandez un nouveau code."
            : response?.error === "too_many_attempts"
              ? "Trop de tentatives. Demandez un nouveau code."
              : "Impossible de vérifier le code."
      );

      return;
    }

    if (!response.access_token) {
      setError("Accès au dossier impossible. Veuillez réessayer.");
      return;
    }

    navigate(`/${portal}/portal/${response.access_token}`);
  }

  return (
    <StandaloneLayout
      portal={portal === "suppliers" ? "Suppliers" : "Ops"}
      accent={portal === "suppliers" ? "primary" : "accent"}
    >
      <section className="container mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* ------------------------------------------------------------------ */}
        {/* RETOUR                                                              */}
        {/* ------------------------------------------------------------------ */}

        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
        >
          <Link
            to={
              portal === "suppliers"
                ? "/suppliers"
                : "/ops"
            }
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Retour
          </Link>
        </Button>

        {/* ------------------------------------------------------------------ */}
        {/* INTRO                                                               */}
        {/* ------------------------------------------------------------------ */}

        <Badge variant="secondary" className="mb-3">
          Reprise sécurisée
        </Badge>

        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Reprendre mon onboarding
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Utilisez l'adresse email associée à votre dossier. BIB vous
          enverra un code à 6 chiffres permettant d'accéder à votre
          dossier et de le modifier lorsque cela est encore possible.
        </p>

        {/* ------------------------------------------------------------------ */}
        {/* FORMULAIRE                                                          */}
        {/* ------------------------------------------------------------------ */}

        <Card className="mt-8 space-y-5 p-5 sm:p-6">
          <div className="space-y-1.5">
            <Label htmlFor="resume-email">
              Email associé au dossier
            </Label>

            <Input
              id="resume-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              placeholder="vous@societe.com"
              maxLength={255}
              autoComplete="email"
              disabled={sending || verifying}
            />
          </div>

          {!sent ? (
            <Button
              onClick={sendCode}
              disabled={sending || !email.trim()}
              className="w-full sm:w-auto"
            >
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}

              Recevoir mon code
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-xs">
                  Code reçu par email
                </Label>

                <div className="mt-2">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={(value) => {
                      setCode(value);
                      setError(null);
                    }}
                    disabled={verifying}
                  >
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={verifyCode}
                  disabled={
                    verifying ||
                    code.length !== 6
                  }
                >
                  {verifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}

                  Accéder à mon dossier
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={sendCode}
                  disabled={sending}
                >
                  {sending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  Renvoyer le code
                </Button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* ERREUR                                                            */}
          {/* ---------------------------------------------------------------- */}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-1.5 text-xs text-destructive"
            >
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* NOUVELLE CANDIDATURE                                              */}
          {/* ---------------------------------------------------------------- */}

          <div className="border-t border-border/50 pt-4">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Vous n'avez pas encore déposé de candidature ?
            </p>

            <Link
              className="mt-1 inline-block text-xs font-medium underline underline-offset-4"
              to={
                portal === "suppliers"
                  ? "/suppliers/apply"
                  : "/ops/apply"
              }
            >
              Déposer une candidature
            </Link>
          </div>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* INFORMATION                                                         */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-6 rounded-lg border bg-muted/20 p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Le code est envoyé uniquement à l'adresse email utilisée
            lors de la candidature. Il permet d'accéder au dossier
            correspondant au portail sélectionné.
          </p>
        </div>
      </section>
    </StandaloneLayout>
  );
}
