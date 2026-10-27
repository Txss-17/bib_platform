import { translateUi } from "@/lib/uiTranslation";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Loader2,
  Mail,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

export default function PartnerOnboardingResume() {
  const { lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);
  const [params] = useSearchParams();

  const portalParam = params.get("portal");

  const portal: "suppliers" | "ops" =
    portalParam === "ops" ? "ops" : "suppliers";

  const portalLabel =
    portal === "suppliers"
      ? tx("Fournisseurs", "Suppliers")
      : tx("Logistique", "Logistics");

  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useSEO({
    title:
      (english ? "Resume my onboarding " : "Reprendre mon onboarding ") +
      portalLabel +
      " — Brand-In-A-Box",
    description: tx(
      "Reprenez et modifiez votre dossier d'onboarding avant sa validation finale.",
      "Resume and update your onboarding file before final approval.",
    ),
  });

  async function sendCode() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail)) {
      setError(
        tx(
          translateUi("Veuillez saisir une adresse email valide."),
          translateUi("Enter a valid email address."),
        ),
      );
      return;
    }

    setSending(true);
    setError(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "partner-otp-request",
      {
        body: {
          email: normalizedEmail,
          portal,
        },
      },
    );

    setSending(false);

    const response = data as {
      ok?: boolean;
      error?: string;
    } | null;

    if (invokeError || !response?.ok) {
      setError(
        response?.error === "rate_limited"
          ? tx(
              translateUi(
                "Trop de demandes. Veuillez patienter avant de réessayer.",
              ),
              translateUi(
                "Too many requests. Please wait before trying again.",
              ),
            )
          : tx(
              translateUi("Impossible d'envoyer le code. Veuillez réessayer."),
              translateUi("The code could not be sent. Please try again."),
            ),
      );

      return;
    }

    setSent(true);

    toast({
      title:
        (english ? "Resume my onboarding " : "Reprendre mon onboarding ") +
        portalLabel +
        " — Brand-In-A-Box",
      description: english
        ? "Check your inbox at " + normalizedEmail + "."
        : "Vérifiez votre boîte email " + normalizedEmail + ".",
    });
  }

  async function verifyCode() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\d{6}$/.test(code)) {
      setError(
        tx(
          translateUi("Veuillez saisir les 6 chiffres du code."),
          translateUi("Enter the 6-digit code."),
        ),
      );
      return;
    }

    setVerifying(true);
    setError(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      "partner-otp-verify",
      {
        body: {
          email: normalizedEmail,
          portal,
          code,
        },
      },
    );

    setVerifying(false);

    const response = data as {
      ok?: boolean;
      error?: string;
      access_token?: string;
    } | null;

    if (invokeError || !response?.ok) {
      setError(
        response?.error === "invalid_code"
          ? tx(translateUi("Code incorrect."), translateUi("Incorrect code."))
          : response?.error === "expired"
            ? tx(
                translateUi("Code expiré. Demandez un nouveau code."),
                translateUi("Code expired. Request a new code."),
              )
            : response?.error === "too_many_attempts"
              ? tx(
                  translateUi("Trop de tentatives. Demandez un nouveau code."),
                  translateUi("Too many attempts. Request a new code."),
                )
              : tx(
                  translateUi("Impossible de vérifier le code."),
                  translateUi("The code could not be verified."),
                ),
      );

      return;
    }

    if (!response.access_token) {
      setError(
        tx(
          translateUi("Accès au dossier impossible. Veuillez réessayer."),
          translateUi("Could not access the file. Please try again."),
        ),
      );
      return;
    }

    navigate(`/${portal}/portal/${response.access_token}`);
  }

  return (
    <StandaloneLayout
      portal={portal === "suppliers" ? translateUi("Suppliers") : "Ops"}
      accent={portal === "suppliers" ? "primary" : "accent"}
    >
      <section className="container mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* ------------------------------------------------------------------ */}
        {/* RETOUR                                                              */}
        {/* ------------------------------------------------------------------ */}

        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link to={portal === "suppliers" ? "/suppliers" : "/ops"}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            {tx("Retour", "Back")}
          </Link>
        </Button>

        {/* ------------------------------------------------------------------ */}
        {/* INTRO                                                               */}
        {/* ------------------------------------------------------------------ */}

        <Badge variant="secondary" className="mb-3">
          {tx("Reprise sécurisée", "Secure resume")}
        </Badge>

        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {tx("Reprendre mon onboarding", "Resume my onboarding")}
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {tx(
            "Utilisez l'adresse email associée à votre dossier. BIB vous",
            "Use the email address linked to your file. BIB will send you",
          )}
          {tx(
            "enverra un code à 6 chiffres permettant d'accéder à votre",
            "a 6-digit code to access your file and",
          )}
          {tx(
            "dossier et de le modifier lorsque cela est encore possible.",
            "update it if the file is still editable.",
          )}
        </p>

        {/* ------------------------------------------------------------------ */}
        {/* FORMULAIRE                                                          */}
        {/* ------------------------------------------------------------------ */}

        <Card className="mt-8 space-y-5 p-5 sm:p-6">
          <div className="space-y-1.5">
            <Label htmlFor="resume-email">
              {tx("Email associé au dossier", "Email linked to the file")}
            </Label>

            <Input
              id="resume-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(null);
              }}
              placeholder={translateUi("vous@societe.com")}
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

              {tx("Recevoir mon code", "Send me a code")}
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-xs">
                  {tx("Code reçu par email", "Code received by email")}
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
                        <InputOTPSlot key={index} index={index} />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={verifyCode}
                  disabled={verifying || code.length !== 6}
                >
                  {verifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}

                  {tx("Accéder à mon dossier", "Access my file")}
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={sendCode}
                  disabled={sending}
                >
                  {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

                  {tx("Renvoyer le code", "Resend code")}
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
              {tx(
                "Vous n'avez pas encore déposé de candidature ?",
                "Haven't applied yet?",
              )}
            </p>

            <Link
              className="mt-1 inline-block text-xs font-medium underline underline-offset-4"
              to={portal === "suppliers" ? "/suppliers/apply" : "/ops/apply"}
            >
              {tx("Déposer une candidature", "Submit an application")}
            </Link>
          </div>
        </Card>

        {/* ------------------------------------------------------------------ */}
        {/* INFORMATION                                                         */}
        {/* ------------------------------------------------------------------ */}

        <div className="mt-6 rounded-lg border bg-muted/20 p-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {tx(
              "Le code est envoyé uniquement à l'adresse email utilisée",
              "The code is sent only to the email address used",
            )}
            {tx(
              "lors de la candidature. Il permet d'accéder au dossier",
              "when applying. It lets you access the file",
            )}
            {tx(
              "correspondant au portail sélectionné.",
              "for the selected portal.",
            )}
          </p>
        </div>
      </section>
    </StandaloneLayout>
  );
}
