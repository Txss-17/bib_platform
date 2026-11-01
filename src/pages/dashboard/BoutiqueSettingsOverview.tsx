import { Link } from "react-router-dom";
import { ArrowRight, Bell, Mail, Settings2, Store, Wallet } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export default function BoutiqueSettingsOverview() {
  const { lang } = useLanguage();
  const en = lang === "en";
  const { data: boutiques = [], isLoading, isError } = useBoutiques();
  return <DashboardLayout>
    <PageHeader
      eyebrow={en ? "Store management" : "Gestion des boutiques"}
      title={en ? "Store settings" : "Paramètres des boutiques"}
      subtitle={en ? "Each store has separate commerce settings, emails, alerts and payout instructions." : "Chaque boutique possède ses propres paramètres commerciaux, e-mails, alertes et instructions de versement."}
    />
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2"><Settings2 className="h-4 w-4" />{en ? "General" : "Général"}</span>
        <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4" />{en ? "Marketing email" : "E-mail marketing"}</span>
        <span className="inline-flex items-center gap-2"><Bell className="h-4 w-4" />{en ? "Alerts" : "Alertes"}</span>
        <span className="inline-flex items-center gap-2"><Wallet className="h-4 w-4" />{en ? "Payouts" : "Versements"}</span>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">{en ? "Loading stores…" : "Chargement des boutiques…"}</p>
        : isError ? <p role="alert" className="text-sm text-destructive">{en ? "Unable to load stores." : "Impossible de charger vos boutiques."}</p>
        : boutiques.length === 0 ? <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="font-semibold text-foreground">{en ? "No store yet" : "Aucune boutique pour le moment"}</p>
          <p className="mt-2 text-sm text-muted-foreground">{en ? "The settings workspace will appear when you create a store." : "Les paramètres seront disponibles après la création de votre première boutique."}</p>
          <Button asChild variant="outline" className="mt-4"><Link to="/dashboard/boutiques">{en ? "View my stores" : "Voir mes boutiques"}</Link></Button>
        </div> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {boutiques.map(boutique => <div key={boutique.id} className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Store className="h-5 w-5"/></span>
              <div className="min-w-0"><h2 className="truncate font-semibold text-foreground">{boutique.name}</h2><p className="mt-1 text-xs text-muted-foreground">{boutique.status === "published" ? en ? "Published" : "Publiée" : en ? "Draft" : "Brouillon"}</p></div>
            </div>
            <p className="my-4 flex-1 text-sm text-muted-foreground">{en ? "Edit the independent settings and payout preferences of this store." : "Modifiez les réglages et les préférences de versement propres à cette boutique."}</p>
            <Button asChild variant="outline" className="w-full justify-between"><Link to={`/dashboard/boutiques/${boutique.id}/settings`}>{en ? "Configure store" : "Configurer la boutique"}<ArrowRight className="h-4 w-4"/></Link></Button>
          </div>)}
        </div>
      )}
    </div>
  </DashboardLayout>;
}
