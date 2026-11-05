import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { MarketingSubscriptionForm } from "@/components/privacy/MarketingSubscriptionForm";
import {
  marketingSubscriptionAction,
  type MarketingLinkState,
} from "@/lib/marketingSubscription";

export default function MarketingPreferences() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const [params] = useSearchParams();
  const action = params.get("action");
  const [token] = useState(() =>
    new URLSearchParams(window.location.hash.slice(1)).get("token"),
  );
  const [result, setResult] = useState<MarketingLinkState | null>(null);
  const [status, setStatus] = useState<
    "loading" | "ready" | "saving" | "done" | "error"
  >("loading");
  useSEO({
    title: en ? "Email preferences · BIB" : "Préférences email · BIB",
    robots: "noindex, nofollow",
  });
  useEffect(() => {
    // Remove the capability from the address bar before any navigation; never persist it.
    if (window.location.hash)
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
      );
    const meta = document.createElement("meta");
    meta.name = "referrer";
    meta.content = "no-referrer";
    document.head.append(meta);
    return () => meta.remove();
  }, []);
  useEffect(() => {
    let current = true;
    if (!action)
      return () => {
        current = false;
      };
    if (
      !["confirm", "unsubscribe"].includes(action) ||
      !token ||
      !/^[a-f0-9]{64}$/.test(token)
    ) {
      setStatus("error");
      return;
    }
    marketingSubscriptionAction<MarketingLinkState>({
      action:
        action === "confirm" ? "inspect_confirmation" : "inspect_unsubscribe",
      token,
    })
      .then((value) => {
        if (current) {
          setResult(value);
          setStatus(value.valid ? "ready" : "error");
        }
      })
      .catch(() => {
        if (current) setStatus("error");
      });
    return () => {
      current = false;
    };
  }, [action, token]);

  async function save() {
    if (!token) return;
    setStatus("saving");
    try {
      const value = await marketingSubscriptionAction<MarketingLinkState>({
        action: action === "confirm" ? "confirm" : "withdraw",
        token,
      });
      setResult(value);
      setStatus(
        value.valid &&
          value.state === (action === "confirm" ? "active" : "withdrawn")
          ? "done"
          : "error",
      );
    } catch {
      setStatus("error");
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-20">
      <section className="w-full max-w-xl space-y-5 rounded-2xl border bg-background p-5 text-foreground shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-semibold">
          {en ? "Your email preferences" : "Vos préférences email"}
        </h1>
        {!action ? (
          <>
            <p className="text-sm leading-6 text-muted-foreground">
              {en
                ? "Choose whether to receive BIB offers and news. This subscription is optional and does not subscribe you to store or partner offers."
                : "Choisissez de recevoir les offres et nouveautés de BIB. Cet abonnement est facultatif et ne vous inscrit pas aux offres des boutiques ou des partenaires."}
            </p>
            <MarketingSubscriptionForm scope={{ kind: "bib" }} />
          </>
        ) : (
          <>
            {(status === "loading" || status === "saving") && (
              <p role="status">{en ? "Processing…" : "Traitement…"}</p>
            )}
            {result?.valid && (
              <p className="text-sm">
                <strong>{result.audience_name}</strong> ·{" "}
                {result.controller_name}
              </p>
            )}
            {status === "ready" && (
              <>
                {action === "confirm" ? (
                  <p className="text-sm leading-6">{result?.notice_text}</p>
                ) : (
                  <p className="text-sm leading-6">
                    {en
                      ? "Unsubscribe from email offers for this sender only. Your orders and necessary service messages are unaffected."
                      : "Vous pouvez vous désabonner des offres de cet expéditeur uniquement. Vos commandes et les messages nécessaires au service restent accessibles."}
                  </p>
                )}
                {(action === "confirm" && result?.state === "active") ||
                (action === "unsubscribe" && result?.state === "withdrawn") ? (
                  <p role="status">
                    {en
                      ? "Your preference is already recorded."
                      : "Votre choix est déjà enregistré."}
                  </p>
                ) : (
                  <Button className="w-full whitespace-normal" onClick={save}>
                    {action === "confirm"
                      ? en
                        ? "Confirm my subscription"
                        : "Confirmer mon abonnement"
                      : en
                        ? "Unsubscribe from these offers"
                        : "Me désabonner de ces offres"}
                  </Button>
                )}
              </>
            )}
            {status === "done" && (
              <p role="status">
                {action === "confirm"
                  ? en
                    ? "Your subscription is confirmed."
                    : "Votre abonnement est confirmé."
                  : en
                    ? "You are unsubscribed from these offers."
                    : "Vous êtes désabonné de ces offres."}
              </p>
            )}
            {status === "error" && (
              <p role="alert">
                {en
                  ? "This link is invalid, expired or temporarily unavailable. No change has been confirmed."
                  : "Ce lien est invalide, expiré ou temporairement indisponible. Aucun changement n’a été confirmé."}
              </p>
            )}
          </>
        )}
        <Link className="inline-block text-sm underline" to="/">
          {en ? "Back to BIB" : "Retour à BIB"}
        </Link>
      </section>
    </main>
  );
}
