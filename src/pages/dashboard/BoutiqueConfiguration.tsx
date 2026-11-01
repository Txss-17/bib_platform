import { useParams, Link, useSearchParams } from "react-router-dom";
import { Store, ArrowLeft, Settings2, Mail, Bell, Wallet, Users, Search } from "lucide-react";
import { BoutiquePayoutSettings } from "@/components/dashboard/boutique/BoutiquePayoutSettings";
import { useCurrentPlan } from "@/hooks/usePlans";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useLanguage } from "@/contexts/LanguageContext";
import { BoutiqueSettingsTab } from "@/components/dashboard/boutique/BoutiqueSettingsTab";
import { BoutiqueSeoTools } from "@/components/dashboard/boutique/BoutiqueSeoTools";
import { EmailMarketingSettings } from "@/components/dashboard/EmailMarketingSettings";
import { BoutiqueAlertsSettings } from "@/components/dashboard/BoutiqueAlertsSettings";

/** Boutique-level settings are accessible independently from Brand Studio
 * so test boutiques can configure their data while remaining drafts.
 * Ownership is also enforced by the database's RLS policies. */
export default function BoutiqueConfiguration() {
  const { id = "" } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const en = lang === "en";
  const { data: boutiques = [], isLoading } = useBoutiques();
  const boutique = boutiques.find(b => b.id === id);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "general";
  const setTab = (next: string) => setSearchParams({ tab: next }, { replace: true });
  const { tier } = useCurrentPlan();
  const teamEligible = tier === "growth" || tier === "pro";

  return <DashboardLayout>
    <PageHeader
      eyebrow={en ? "Store workspace" : "Espace boutique"}
      title={en ? "Store settings" : "Paramètres de la boutique"}
      subtitle={en ? "Manage this store's identity, commerce configuration, marketing and alerts." : "Configurez l'identité, les réglages commerciaux, les communications et les alertes de cette boutique."}
      breadcrumbs={[
        { label: en ? "Stores" : "Boutiques", href: "/dashboard/boutiques" },
        { label: boutique?.name || (en ? "Settings" : "Paramètres") },
      ]}
    />
    <div className="mx-auto max-w-6xl space-y-6">
      <Link to="/dashboard/boutiques" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16} />{en ? "Back to my stores" : "Retour à mes boutiques"}</Link>
      {isLoading ? (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">{en ? "Loading…" : "Chargement…"}</p>
      ) : !boutique ? (
        <p role="alert" className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">{en ? "Store unavailable or access denied." : "Boutique introuvable ou accès non autorisé."}</p>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-5">
            <Store className="h-5 w-5 text-bib-gold" />
            <div>
              <p className="font-semibold text-foreground">{boutique.name}</p>
              <p className="text-xs text-muted-foreground">{en ? "Settings are independent of storefront publication." : "Les paramètres sont accessibles même lorsque la boutique est en brouillon."}</p>
            </div>
          </div>
          <Tabs value={tab} onValueChange={setTab}>
            <div className="w-full overflow-x-auto pb-1"><TabsList className="inline-flex h-auto min-w-max gap-1 p-1 sm:grid sm:w-full sm:min-w-0 sm:grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="general" className="gap-2"><Settings2 size={16} />{en ? "General" : "Général"}</TabsTrigger>
              <TabsTrigger value="seo" className="gap-2"><Search size={16} />SEO</TabsTrigger>
              <TabsTrigger value="email" className="gap-2"><Mail size={16} />{en ? "Email" : "E-mail"}</TabsTrigger>
              <TabsTrigger value="alerts" className="gap-2"><Bell size={16} />{en ? "Alerts" : "Alertes"}</TabsTrigger>
              <TabsTrigger value="payouts" className="gap-2"><Wallet size={16} />{en ? "Payouts" : "Versements"}</TabsTrigger>
              {teamEligible && <TabsTrigger value="team" className="gap-2"><Users size={16} />{en ? "Team" : "Équipe"}</TabsTrigger>}
            </TabsList></div>
            <TabsContent value="general" className="mt-6"><BoutiqueSettingsTab boutiqueId={boutique.id} /></TabsContent>
            <TabsContent value="seo" className="mt-6"><BoutiqueSeoTools boutiqueId={boutique.id} /></TabsContent>
            <TabsContent value="email" className="mt-6"><EmailMarketingSettings boutiqueId={boutique.id} /></TabsContent>
            <TabsContent value="alerts" className="mt-6"><BoutiqueAlertsSettings boutiqueId={boutique.id} /></TabsContent>
            <TabsContent value="payouts" className="mt-6"><BoutiquePayoutSettings boutiqueId={boutique.id} /></TabsContent>
            {teamEligible && <TabsContent value="team" className="mt-6"><p className="mb-4 text-sm text-muted-foreground">{en ? "Manage members and roles for this store." : "Gérez les membres et les rôles de cette boutique."}</p><Link to={`/dashboard/equipe?boutiqueId=${boutique.id}`} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"><Users size={16}/>{en ? "Open team workspace" : "Ouvrir l’espace Équipe"}</Link></TabsContent>}
          </Tabs>
        </>
      )}
    </div>
  </DashboardLayout>;
}
