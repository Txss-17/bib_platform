import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SectionCard } from "@/components/dashboard/shared";
import { useAuth } from "@/contexts/AuthContext";
import { translateUi } from "@/lib/uiTranslation";
import { toast } from "sonner";
import { Loader2, LockKeyhole, Wallet } from "lucide-react";

type PayoutData = {
  payout_frequency: "semi_monthly" | "monthly";
  beneficiary_name: string;
  payout_contact_email: string;
  country_code: string;
  status: string;
};
const initial: PayoutData = {
  payout_frequency: "semi_monthly",
  beneficiary_name: "",
  payout_contact_email: "",
  country_code: "FR",
  status: "pending_verification",
};

export function BoutiquePayoutSettings({ boutiqueId }: { boutiqueId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [draft, setDraft] = useState(initial);
  const { data, isLoading, error } = useQuery({
    queryKey: ["boutique-payout-preferences", boutiqueId],
    enabled: Boolean(boutiqueId),
    queryFn: async () => {
      const { data, error } = await supabase.from("boutique_payout_preferences" as never)
        .select("payout_frequency,beneficiary_name,payout_contact_email,country_code,status")
        .eq("boutique_id", boutiqueId).maybeSingle();
      if (error) throw error;
      return data as PayoutData | null;
    },
  });
  useEffect(() => { setDraft({ ...initial, ...(data ?? {}) }); }, [data]);
  const save = useMutation({
    mutationFn: async () => {
      if (!user || !boutiqueId) throw new Error("Accès non autorisé");
      if (!draft.beneficiary_name.trim() || draft.beneficiary_name.trim().length > 150) throw new Error("Nom du bénéficiaire invalide");
      if (draft.payout_contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.payout_contact_email)) throw new Error("Adresse e-mail invalide");
      const { error } = await supabase.from("boutique_payout_preferences" as never)
        .upsert({
          boutique_id: boutiqueId,
          payout_frequency: draft.payout_frequency,
          beneficiary_name: draft.beneficiary_name.trim(),
          payout_contact_email: draft.payout_contact_email.trim() || null,
          country_code: "FR",
          currency: "EUR",
        } as never, { onConflict: "boutique_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boutique-payout-preferences", boutiqueId] });
      toast.success(translateUi("Instructions de versement enregistrées — vérification nécessaire"));
    },
    onError: (error: Error) => toast.error(error.message),
  });
  return <SectionCard title={translateUi("Instructions de versement")} description={translateUi("Configurez les préférences de versement de cette boutique. Les virements restent soumis à la vérification du bénéficiaire et aux règlements de BIB.")} icon={<Wallet className="h-4 w-4" />}>
    {isLoading ? <p className="text-sm text-muted-foreground">{translateUi("Chargement…")}</p> : error ? <p role="alert" className="text-sm text-destructive">{translateUi("Impossible de charger les instructions de versement.")}</p> : (
      <div className="space-y-5">
        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <p className="font-medium">{draft.status === "verified" ? translateUi("Bénéficiaire vérifié") : translateUi("Vérification du bénéficiaire en attente")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{translateUi("Aucune modification de coordonnées bancaires ni aucun virement automatique ne sont effectués ici.")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="payout-beneficiary">{translateUi("Bénéficiaire légal")}</Label><Input id="payout-beneficiary" maxLength={150} value={draft.beneficiary_name ?? ""} onChange={e => setDraft(v => ({ ...v, beneficiary_name: e.target.value }))} placeholder={translateUi("Raison sociale ou nom légal")} /></div>
          <div className="space-y-2"><Label htmlFor="payout-email">{translateUi("E-mail de contact pour les versements")}</Label><Input id="payout-email" type="email" maxLength={200} value={draft.payout_contact_email ?? ""} onChange={e => setDraft(v => ({ ...v, payout_contact_email: e.target.value }))} placeholder="finance@example.com" /></div>
          <div className="space-y-2"><Label>{translateUi("Préférence de périodicité")}</Label><Select value={draft.payout_frequency} onValueChange={v => setDraft(d => ({ ...d, payout_frequency: v as PayoutData["payout_frequency"] }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="semi_monthly">{translateUi("Deux fois par mois")}</SelectItem><SelectItem value="monthly">{translateUi("Une fois par mois")}</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>{translateUi("Devise")}</Label><Input disabled value="EUR — Euro" /></div>
        </div>
        <p className="flex items-start gap-2 text-xs text-muted-foreground"><LockKeyhole className="h-4 w-4 shrink-0" />{translateUi("La périodicité est une préférence, pas une promesse de date de versement. Les fonds sont versés uniquement après validation financière et contrôle des commandes.")}</p>
        <Button onClick={() => save.mutate()} disabled={save.isPending || !user}>{save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{translateUi("Enregistrer les instructions")}</Button>
      </div>
    )}
  </SectionCard>;
}
