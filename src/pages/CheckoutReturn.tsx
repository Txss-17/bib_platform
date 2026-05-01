import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useSEO } from "@/hooks/useSEO";

export default function CheckoutReturn() {
  useSEO({ title: "Paiement confirmé · Brand-In-A-Box", description: "Votre paiement a bien été traité." });
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Give the webhook a couple of seconds to land before showing CTAs
    const t = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <Logo className="mx-auto" />
        {ready ? (
          <>
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-success/10">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-display font-semibold">Paiement confirmé</h1>
            <p className="text-sm text-muted-foreground">
              Merci ! Votre transaction a bien été enregistrée.
              {sessionId && (
                <span className="block mt-2 font-mono text-xs opacity-70">{sessionId.slice(0, 24)}…</span>
              )}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild>
                <Link to="/dashboard">Aller à mon tableau de bord</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Retour à l'accueil</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Validation du paiement…</p>
          </div>
        )}
      </div>
    </div>
  );
}