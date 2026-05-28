import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useCustomers } from "@/hooks/useCustomers";
import { useCampaigns, useSendCampaign, useAutomations, useUpsertAutomations } from "@/hooks/useCampaigns";
import { useEmailSettings } from "@/hooks/useBoutiqueEmail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Megaphone, Send, Sparkles, Mail, Bot, ListChecks,
  Tag, Newspaper, MessageSquare, AlertTriangle, CheckCircle2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Kind = "newsletter" | "promo" | "custom";

export default function Marketing() {
  const { data: boutiques = [] } = useBoutiques();
  const [boutiqueId, setBoutiqueId] = useState<string>("");
  const activeId = boutiqueId || boutiques[0]?.id || "";
  const { data: customers = [] } = useCustomers(activeId);
  const { data: campaigns = [] } = useCampaigns(activeId);
  const { data: automations } = useAutomations(activeId);
  const { data: emailSettings } = useEmailSettings(activeId);
  const upsertAuto = useUpsertAutomations();
  const sendCampaign = useSendCampaign();

  const optInCount = useMemo(() => customers.filter((c) => c.marketing_opt_in).length, [customers]);
  const gmailReady = !!emailSettings?.gmail_connected;

  // Composer state
  const [kind, setKind] = useState<Kind>("newsletter");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [segmentType, setSegmentType] = useState("all_opt_in");
  const [segmentValue, setSegmentValue] = useState("");
  const [promoCode, setPromoCode] = useState("");

  const estimatedRecipients = useMemo(() => {
    if (segmentType === "min_spent" && segmentValue) {
      const threshold = Number(segmentValue) * 100;
      return customers.filter((c) => c.marketing_opt_in && c.total_spent_cents >= threshold).length;
    }
    return optInCount;
  }, [customers, segmentType, segmentValue, optInCount]);

  const handleSend = async () => {
    if (!activeId || !subject || !bodyHtml) {
      toast({ title: "Champs manquants", description: "Sujet et contenu requis", variant: "destructive" });
      return;
    }
    try {
      const res = await sendCampaign.mutateAsync({
        boutique_id: activeId,
        name: name || subject,
        kind, subject, body_html: bodyHtml,
        segment: { type: segmentType, value: segmentValue || undefined },
        promo_code: promoCode || undefined,
      });
      toast({
        title: "Campagne envoyée",
        description: `${(res as any)?.sent ?? 0} envoyés / ${(res as any)?.recipients ?? 0} destinataires`,
      });
      setSubject(""); setBodyHtml(""); setName(""); setPromoCode("");
    } catch (e: any) {
      toast({ title: "Erreur d'envoi", description: e.message, variant: "destructive" });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-primary" /> Marketing
            </h1>
            <p className="text-sm text-muted-foreground">
              Newsletters, promos et automations pour vos clients opt-in.
            </p>
          </div>
          {boutiques.length > 1 && (
            <Select value={activeId} onValueChange={setBoutiqueId}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                {boutiques.map((b: any) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {!gmailReady && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Gmail non connecté.</strong> Connectez votre boîte Gmail dans{" "}
              <a href="/dashboard/parametres" className="underline font-medium">Paramètres &gt; Email</a>{" "}
              pour envoyer des campagnes depuis votre propre adresse (préserve votre réputation d'expéditeur).
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi icon={Mail} label="Opt-in marketing" value={optInCount.toString()} />
          <Kpi icon={Send} label="Campagnes envoyées" value={campaigns.filter(c => c.status === "sent").length.toString()} />
          <Kpi icon={Bot} label="Automations actives" value={[
            automations?.cart_abandoned_enabled,
            automations?.post_purchase_review_enabled,
            automations?.post_purchase_upsell_enabled,
          ].filter(Boolean).length.toString()} />
          <Kpi icon={CheckCircle2} label="Taux envoi moyen" value={campaigns.length
            ? `${Math.round((campaigns.reduce((s, c) => s + c.sent_count, 0) / Math.max(1, campaigns.reduce((s, c) => s + c.recipients_count, 0))) * 100)}%`
            : "—"} />
        </div>

        <Tabs defaultValue="composer" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="composer"><Sparkles className="w-4 h-4 mr-1" />Composer</TabsTrigger>
            <TabsTrigger value="campaigns"><ListChecks className="w-4 h-4 mr-1" />Historique</TabsTrigger>
            <TabsTrigger value="automations"><Bot className="w-4 h-4 mr-1" />Automations</TabsTrigger>
          </TabsList>

          {/* COMPOSER */}
          <TabsContent value="composer" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Nouvelle campagne</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs mb-2 block">Type d'envoi</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <KindButton active={kind === "newsletter"} onClick={() => setKind("newsletter")} icon={Newspaper} label="Newsletter" />
                    <KindButton active={kind === "promo"} onClick={() => setKind("promo")} icon={Tag} label="Promo" />
                    <KindButton active={kind === "custom"} onClick={() => setKind("custom")} icon={MessageSquare} label="Message libre" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Nom interne (optionnel)</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Soldes été 2026" />
                  </div>
                  <div>
                    <Label className="text-xs">Sujet de l'email *</Label>
                    <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Une surprise pour vous {{first_name}}" />
                  </div>
                </div>

                {kind === "promo" && (
                  <div>
                    <Label className="text-xs">Code promo</Label>
                    <Input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} placeholder="ETE2026" />
                  </div>
                )}

                <div>
                  <Label className="text-xs">Contenu HTML *</Label>
                  <Textarea
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    rows={10}
                    placeholder={`<h2>Bonjour {{first_name}},</h2>\n<p>Voici nos nouveautés...</p>${kind === "promo" ? `\n<p>Votre code : <strong>{{promo_code}}</strong></p>` : ""}`}
                    className="font-mono text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Variables disponibles : <code>{"{{first_name}}"}</code>, <code>{"{{full_name}}"}</code>, <code>{"{{boutique_name}}"}</code>
                    {kind === "promo" && <>, <code>{"{{promo_code}}"}</code></>}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Segment</Label>
                    <Select value={segmentType} onValueChange={setSegmentType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_opt_in">Tous les opt-in ({optInCount})</SelectItem>
                        <SelectItem value="min_spent">Clients ayant dépensé &gt; X €</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {segmentType === "min_spent" && (
                    <div>
                      <Label className="text-xs">Seuil (€)</Label>
                      <Input type="number" value={segmentValue} onChange={(e) => setSegmentValue(e.target.value)} placeholder="50" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Destinataires estimés :</span>{" "}
                    <Badge variant="secondary" className="ml-1">{estimatedRecipients}</Badge>
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!gmailReady || sendCampaign.isPending || estimatedRecipients === 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {sendCampaign.isPending ? "Envoi en cours…" : "Envoyer maintenant"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="campaigns" className="space-y-2 mt-4">
            {campaigns.length === 0 ? (
              <Card><CardContent className="p-10 text-center text-muted-foreground">
                <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                Aucune campagne envoyée pour le moment.
              </CardContent></Card>
            ) : campaigns.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate">{c.name}</span>
                      <Badge variant="outline" className="text-[10px]">{c.kind}</Badge>
                      <Badge className={
                        c.status === "sent" ? "bg-success/10 text-success border-0"
                        : c.status === "failed" ? "bg-destructive/10 text-destructive border-0"
                        : "bg-info/10 text-info border-0"
                      }>{c.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">{c.subject}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-semibold">{c.sent_count}/{c.recipients_count}</div>
                    <div className="text-muted-foreground">{c.sent_at ? new Date(c.sent_at).toLocaleDateString("fr-FR") : "—"}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* AUTOMATIONS */}
          <TabsContent value="automations" className="space-y-3 mt-4">
            <AutomationRow
              label="Email de confirmation de commande"
              description="Envoi automatique transactionnel (toujours actif)"
              checked={true}
              disabled
            />
            <AutomationRow
              label="Email d'expédition"
              description="Envoyé lorsqu'une commande passe en 'expédiée'"
              checked={true}
              disabled
            />
            <AutomationRow
              label="Relance panier abandonné (24h)"
              description="Email envoyé 24h après un panier non finalisé"
              checked={!!automations?.cart_abandoned_enabled}
              onChange={(v) => upsertAuto.mutate({ boutique_id: activeId, cart_abandoned_enabled: v })}
            />
            <AutomationRow
              label="Demande d'avis (J+7)"
              description="Demande de notation 7 jours après la commande"
              checked={!!automations?.post_purchase_review_enabled}
              onChange={(v) => upsertAuto.mutate({ boutique_id: activeId, post_purchase_review_enabled: v })}
            />
            <AutomationRow
              label="Cross-sell (J+30)"
              description="Suggestion de produits complémentaires 30 jours après la commande"
              checked={!!automations?.post_purchase_upsell_enabled}
              onChange={(v) => upsertAuto.mutate({ boutique_id: activeId, post_purchase_upsell_enabled: v })}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function Kpi({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card><CardContent className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-bold text-foreground truncate">{value}</div>
      </div>
    </CardContent></Card>
  );
}

function KindButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1 ${
        active ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function AutomationRow({ label, description, checked, disabled, onChange }: {
  label: string; description: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void;
}) {
  return (
    <Card><CardContent className="p-4 flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="font-medium text-foreground text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </CardContent></Card>
  );
}