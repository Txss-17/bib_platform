import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, MailX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type State = "loading" | "valid" | "already" | "invalid" | "confirming" | "done" | "error";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");

  useSEO({ title: "Désabonnement · Brand-In-A-Box", description: "Gérez vos préférences email." });

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      try {
        const r = await fetch(`${FN_URL}?token=${encodeURIComponent(token)}`, { headers: { apikey: ANON } });
        const data = await r.json();
        if (!r.ok) { setState("invalid"); return; }
        if (data.valid === false && data.reason === "already_unsubscribed") setState("already");
        else if (data.valid) setState("valid");
        else setState("invalid");
      } catch { setState("error"); }
    })();
  }, [token]);

  async function confirm() {
    if (!token) return;
    setState("confirming");
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
      if (error) { setState("error"); return; }
      if (data?.success || data?.reason === "already_unsubscribed") setState("done");
      else setState("error");
    } catch { setState("error"); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-12">
      <Card className="w-full max-w-md border-border/60 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailX className="h-7 w-7" />
          </div>
          <CardTitle className="font-display text-2xl">Préférences email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          {state === "loading" && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Vérification du lien…</div>
          )}
          {state === "valid" && (
            <>
              <p className="text-sm text-muted-foreground">Confirmez-vous votre désinscription des emails de Brand-In-A-Box ?</p>
              <Button onClick={confirm} className="w-full">Me désabonner</Button>
              <Link to="/" className="block text-xs text-muted-foreground hover:underline">Annuler</Link>
            </>
          )}
          {state === "confirming" && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Traitement…</div>
          )}
          {state === "done" && (
            <div className="space-y-3">
              <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
              <p className="text-sm">Vous êtes désabonné(e). Vous ne recevrez plus d'emails de notre part.</p>
              <Link to="/"><Button variant="outline" className="w-full">Retour à l'accueil</Button></Link>
            </div>
          )}
          {state === "already" && (
            <div className="space-y-3">
              <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cette adresse est déjà désabonnée.</p>
              <Link to="/"><Button variant="outline" className="w-full">Retour à l'accueil</Button></Link>
            </div>
          )}
          {(state === "invalid" || state === "error") && (
            <div className="space-y-3">
              <XCircle className="mx-auto h-10 w-10 text-destructive" />
              <p className="text-sm text-muted-foreground">Lien invalide ou expiré.</p>
              <Link to="/"><Button variant="outline" className="w-full">Retour à l'accueil</Button></Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}