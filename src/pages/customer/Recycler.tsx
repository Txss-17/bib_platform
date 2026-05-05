import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomerProfile, useRecordRecyclingScan } from "@/hooks/useCustomerProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recycle, Gift, ArrowLeft, Loader2, CheckCircle2, Package } from "lucide-react";
import { toast } from "sonner";

export default function Recycler() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile, isLoading: loadingProfile } = useCustomerProfile();
  const recordScan = useRecordRecyclingScan();

  const [orderNumber, setOrderNumber] = useState("");
  const [points, setPoints] = useState<number>(10);
  const [confirmation, setConfirmation] = useState<{ points: number; boutique: string } | null>(null);

  // If a slug is provided, lock the boutique to that one.
  const { data: boutique } = useQuery({
    queryKey: ["recycle-boutique", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("boutiques")
        .select("id, name, slug, logo_url")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const eurosFromPoints = useMemo(() => (points * 0.10).toFixed(2), [points]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error("Activez votre compte client pour cumuler des points.");
      navigate("/store");
      return;
    }
    if (points <= 0) {
      toast.error("Le nombre de points doit être supérieur à 0.");
      return;
    }

    let boutiqueId = boutique?.id ?? null;
    let boutiqueName = boutique?.name ?? "";
    let orderId: string | undefined;

    // If no slug, the order number tells us which boutique
    if (orderNumber.trim()) {
      const { data: orderRow, error: orderErr } = await supabase
        .from("orders")
        .select("id, boutique_id, boutiques ( id, name )")
        .eq("order_number", orderNumber.toUpperCase().trim())
        .maybeSingle();
      if (orderErr || !orderRow) {
        toast.error("Numéro de commande introuvable.");
        return;
      }
      // If a slug was specified, ensure the order matches it
      if (boutiqueId && orderRow.boutique_id !== boutiqueId) {
        toast.error("Cette commande n'appartient pas à cette boutique.");
        return;
      }
      boutiqueId = orderRow.boutique_id;
      boutiqueName = (orderRow as any).boutiques?.name ?? boutiqueName;
      orderId = orderRow.id;
    }

    if (!boutiqueId) {
      toast.error("Saisissez un numéro de commande pour identifier la boutique.");
      return;
    }

    try {
      await recordScan.mutateAsync({ boutiqueId, points, orderId, source: "qr_scan" });
      setConfirmation({ points, boutique: boutiqueName });
      toast.success(`+${points} points crédités sur ${boutiqueName} 🎉`);
      setOrderNumber("");
    } catch (err: any) {
      toast.error(err?.message ?? "Erreur lors de l'enregistrement.");
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="w-5 h-5 text-primary" /> Connectez-vous
            </CardTitle>
            <CardDescription>
              Pour cumuler vos points de recyclage et alimenter votre carte cadeau, créez ou
              connectez votre compte client marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button asChild className="flex-1">
              <Link to="/login">Se connecter</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/signup">Créer un compte</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-display text-xl font-semibold">Recycler mon emballage</h1>
            <p className="text-xs text-muted-foreground">
              1 point = 0,10 € sur la carte cadeau de la boutique
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
        {boutique && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex items-center gap-3 py-4">
              {boutique.logo_url ? (
                <img src={boutique.logo_url} alt={boutique.name} className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
              )}
              <div>
                <div className="text-xs text-muted-foreground">Boutique d'origine</div>
                <div className="font-semibold">{boutique.name}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {confirmation && (
          <Card className="border-green-500/40 bg-green-500/5">
            <CardContent className="flex items-start gap-3 py-4">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold">Recyclage validé</div>
                <div className="text-sm text-muted-foreground">
                  +{confirmation.points} pts crédités sur {confirmation.boutique} (≈ {(confirmation.points * 0.1).toFixed(2)} €).
                </div>
                <Button asChild variant="link" className="px-0 h-auto mt-1">
                  <Link to="/store">Voir mes cartes cadeaux</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="w-5 h-5 text-primary" />
              Déclarer un recyclage
            </CardTitle>
            <CardDescription>
              Saisissez le numéro de votre commande et le nombre de points indiqués sur l'étiquette
              de l'emballage. Les points sont automatiquement convertis en avoir sur la boutique d'origine.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order-number">Numéro de commande</Label>
                <Input
                  id="order-number"
                  placeholder="LKS26-XXXXXX"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="uppercase"
                  required={!boutique}
                />
                <p className="text-xs text-muted-foreground">
                  {boutique
                    ? "Optionnel : permet de relier le scan à une commande précise."
                    : "Le numéro identifie la boutique destinataire de votre carte cadeau."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points à créditer</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="points"
                    type="number"
                    min={1}
                    max={500}
                    value={points}
                    onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                    className="w-32"
                  />
                  <Badge variant="secondary" className="gap-1">
                    <Gift className="w-3 h-3" /> ≈ {eurosFromPoints} €
                  </Badge>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={recordScan.isPending}>
                {recordScan.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Recycle className="w-4 h-4 mr-2" />
                )}
                Valider mon recyclage
              </Button>
            </form>
          </CardContent>
        </Card>

        {profile && (
          <Card>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <div className="text-sm text-muted-foreground">Vos points cumulés</div>
                <div className="text-2xl font-display font-semibold">
                  {profile.total_recycling_points} pts
                </div>
              </div>
              <Button asChild variant="outline">
                <Link to="/store">Mon espace</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}