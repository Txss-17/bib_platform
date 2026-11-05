import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  marketingScopeBody,
  marketingSubscriptionAction,
  type MarketingContext,
  type MarketingScope,
} from "@/lib/marketingSubscription";

export function MarketingSubscriptionForm({
  scope,
  preview = false,
}: {
  scope: MarketingScope;
  preview?: boolean;
}) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const id = useId();
  const epoch = useRef(0);
  const boutiqueId = scope.kind === "boutique" ? scope.boutiqueId : null;
  const [context, setContext] = useState<MarketingContext | null>(null);
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [status, setStatus] = useState<
    "loading" | "ready" | "sending" | "pending" | "error"
  >("loading");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let current = true;
    epoch.current++;
    setContext(null);
    setAccepted(false);
    setStatus("loading");
    if (preview || (scope.kind === "boutique" && !boutiqueId))
      return () => {
        current = false;
      };
    marketingSubscriptionAction<MarketingContext>({
      action: "context",
      ...marketingScopeBody(scope, lang),
    })
      .then((value) => {
        if (
          !value.notice_hash ||
          !value.notice_text ||
          !value.controller_name ||
          !/^https:\/\//.test(value.privacy_url)
        )
          throw new Error("invalid_notice");
        if (current) {
          setContext(value);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (current) setStatus("error");
      });
    return () => {
      current = false;
      epoch.current++;
    };
  }, [scope.kind, boutiqueId, lang, preview, retry]);

  if (preview || (scope.kind === "boutique" && !boutiqueId))
    return (
      <p className="text-sm">
        {en
          ? "Preview: no subscription will be submitted."
          : "Aperçu : aucune inscription ne sera envoyée."}
      </p>
    );

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!accepted || !context || status === "sending") return;
    setStatus("sending");
    const submissionEpoch = epoch.current;
    try {
      const result = await marketingSubscriptionAction<{ accepted: boolean }>({
        action: "request",
        ...marketingScopeBody(scope, lang),
        email: email.trim(),
        accepted: true,
        notice_hash: context.notice_hash,
      });
      if (result.accepted !== true) throw new Error("request_not_recorded");
      if (epoch.current === submissionEpoch) {
        setEmail("");
        setAccepted(false);
        setStatus("pending");
      }
    } catch {
      if (epoch.current === submissionEpoch) {
        setAccepted(false);
        setStatus("error");
      }
    }
  }

  return (
    <div className="rounded-xl border border-border bg-background p-4 text-left text-foreground">
      {status === "pending" ? (
        <p role="status" className="text-sm leading-6">
          {en
            ? "Your request has been received. If eligible, a confirmation email will be sent. Check your inbox and spam folder. No offers will be sent before you confirm."
            : "Votre demande a été prise en compte. Si elle est recevable, un email de confirmation vous sera adressé. Vérifiez votre messagerie et vos indésirables. Aucune offre ne sera envoyée avant votre confirmation."}
        </p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          {context && (
            <>
              <p className="text-xs text-muted-foreground">
                {en ? "Email offers from" : "Offres par email de"}{" "}
                <strong>{context.audience_name}</strong> ·{" "}
                {context.controller_name}
              </p>
              <label
                htmlFor={`${id}-email`}
                className="block text-sm font-medium"
              >
                {en ? "Your email address" : "Votre adresse email"}
              </label>
              <Input
                id={`${id}-email`}
                type="email"
                autoComplete="email"
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={status === "sending"}
              />
              <label
                className="flex items-start gap-3 text-sm leading-6"
                htmlFor={`${id}-consent`}
              >
                <input
                  id={`${id}-consent`}
                  type="checkbox"
                  className="mt-1.5 h-4 w-4 shrink-0 accent-primary"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  required
                  disabled={status === "sending"}
                />
                <span>{context.notice_text}</span>
              </label>
              <a
                href={context.privacy_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs underline underline-offset-4"
              >
                {en ? "How your data is used" : "Utilisation de vos données"}
              </a>
            </>
          )}
          {status === "loading" && (
            <p role="status" className="text-sm">
              {en
                ? "Loading subscription information…"
                : "Chargement des informations d’abonnement…"}
            </p>
          )}
          {status === "error" && (
            <div role="alert" className="space-y-2 text-sm">
              <p>
                {en
                  ? "The subscription could not be recorded. Please try again later."
                  : "L’inscription n’a pas pu être enregistrée. Réessayez plus tard."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRetry((value) => value + 1)}
              >
                {en ? "Try again" : "Réessayer"}
              </Button>
            </div>
          )}
          {context && status !== "error" && (
            <Button
              type="submit"
              className="w-full whitespace-normal"
              disabled={!accepted || status !== "ready"}
            >
              {status === "sending"
                ? en
                  ? "Submitting…"
                  : "Envoi…"
                : en
                  ? "Send me the confirmation email"
                  : "Recevoir l’email de confirmation"}
            </Button>
          )}
        </form>
      )}
    </div>
  );
}
