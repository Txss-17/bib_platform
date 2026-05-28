import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useCustomers } from "@/hooks/useCustomers";
import {
  useCampaigns, useSendCampaign, useAutomations, useUpsertAutomations,
  useTestSendCampaign, useSaveCampaignDraft,
} from "@/hooks/useCampaigns";
import { useEmailSettings } from "@/hooks/useBoutiqueEmail";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Megaphone, Send, Sparkles, Mail, Bot, ListChecks,
  Tag, Newspaper, MessageSquare, AlertTriangle, CheckCircle2,
  Eye, Save, Clock, Beaker,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BlockComposer } from "@/components/marketing/BlockComposer";
import { renderBlocksToHtml, blocksToPlainText, newBlock, type MarketingBlock } from "@/lib/marketingBlocks";

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
  const testSend = useTestSendCampaign();
  const saveDraft = useSaveCampaignDraft();

  const optInCount = useMemo(() => customers.filter((c) => c.marketing_opt_in).length, [customers]);
  const gmailReady = !!emailSettings?.gmail_connected;

  // Composer state
  const [kind, setKind] = useState<Kind>("newsletter");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [blocks, setBlocks] = useState<MarketingBlock[]>(() => [
    newBlock("heading"),
    newBlock("text"),
    newBlock("button"),
  ]);
  const [segmentType, setSegmentType] = useState("all_opt_in");
  const [segmentValue, setSegmentValue] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [draftId, setDraftId] = useState<string | null>(null);

  // Preview + test
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  // Schedule
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleAt, setScheduleAt] = useState("");

  const previewHtml = useMemo(
    () => renderBlocksToHtml(blocks, {
      signature: (emailSettings as any)?.marketing_signature ?? null,
      footerLinks: ((emailSettings as any)?.marketing_footer_links as any) ?? null,
      boutiqueName: boutiques.find((b: any) => b.id === activeId)?.name,
    }),
    [blocks, emailSettings, boutiques, activeId],
  );

  const estimatedRecipients = useMemo(() => {
    if (segmentType === "min_spent" && segmentValue) {
      const threshold = Number(segmentValue) * 100;
      return customers.filter((c) => c.marketing_opt_in && c.total_spent_cents >= threshold).length;
    }
    return optInCount;
  }, [customers, segmentType, segmentValue, optInCount]);

  const buildPayload = () => ({
    boutique_id: activeId,
    name: name || subject,
    kind, subject,
    body_html: renderBlocksToHtml(blocks, {
      boutiqueName: boutiques.find((b: any) => b.id === activeId)?.name,
    }),
    body_blocks: blocks,
    segment: { type: segmentType, value: segmentValue || undefined },
    promo_code: promoCode || undefined,
  });

  const resetComposer = () => {
    setSubject(""); setName(""); setPromoCode(""); setDraftId(null);
    setBlocks([newBlock("heading"), newBlock("text"), newBlock("button")]);
  };

  const handleSend = async () => {
    if (!activeId || !subject || blocks.length === 0) {
      toast({ title: "Champs manquants", description: "Sujet et au moins un bloc requis", variant: "destructive" });
      return;
    }
    try {
      const res = await sendCampaign.mutateAsync(buildPayload());
      toast({
        title: "Campagne envoyée",
        description: `${(res as any)?.sent ?? 0} envoyés / ${(res as any)?.recipients ?? 0} destinataires`,
      });
      resetComposer();
    } catch (e: any) {
      toast({ title: "Erreur d'envoi", description: e.message, variant: "destructive" });
    }
  };

  const handleTestSend = async () => {
    if (!testEmail || !subject || blocks.length === 0) {
      toast({ title: "Champs manquants", description: "Email de test et contenu requis", variant: "destructive" });
      return;
    }
    try {
      const p = buildPayload();
      await testSend.mutateAsync({
        boutique_id: p.boutique_id,
        kind: p.kind,
        subject: p.subject,
        body_html: p.body_html,
        promo_code: p.promo_code,
        test_recipient: testEmail,
      });
      toast({ title: "Email de test envoyé", description: `Envoyé à ${testEmail}` });
      setTestOpen(false);
    } catch (e: any) {
      toast({ title: "Échec du test", description: e.message, variant: "destructive" });
    }
  };

  const handleSaveDraft = async () => {
    if (!activeId || !subject) {
      toast({ title: "Sujet requis", variant: "destructive" });
      return;
    }
    try {
      const saved = await saveDraft.mutateAsync({
        id: draftId ?? undefined,
        ...buildPayload(),
        status: "draft",
        scheduled_at: null,
      });
      setDraftId((saved as any)?.id ?? draftId);
      toast({ title: "Brouillon enregistré" });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    }
  };

  const handleSchedule = async () => {
    if (!scheduleAt) return;
    const when = new Date(scheduleAt);
    if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
      toast({ title: "Date invalide", description: "Choisissez une date future", variant: "destructive" });
      return;
    }
    try {
      await saveDraft.mutateAsync({
        id: draftId ?? undefined,
        ...buildPayload(),
        status: "scheduled",
        scheduled_at: when.toISOString(),
      });
      toast({
        title: "Campagne programmée",
        description: `Envoi prévu le ${when.toLocaleString("fr-FR")}`,
      });
      setScheduleOpen(false);
      resetComposer();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
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
                  <Label className="text-xs mb-2 block">Contenu de l'email</Label>
                  <BlockComposer
                    boutiqueId={activeId}
                    blocks={blocks}
                    onChange={setBlocks}
                    promoCode={promoCode}
                    boutiqueName={boutiques.find((b: any) => b.id === activeId)?.name}
                  />
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
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
                      <Eye className="w-4 h-4 mr-1.5" /> Aperçu
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setTestOpen(true)}
                      disabled={!gmailReady}
                      title={!gmailReady ? "Gmail non connecté" : undefined}
                    >
                      <Beaker className="w-4 h-4 mr-1.5" /> Envoi test
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={handleSaveDraft}
                      disabled={saveDraft.isPending}
                    >
                      <Save className="w-4 h-4 mr-1.5" />
                      {draftId ? "Mettre à jour" : "Brouillon"}
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      onClick={() => setScheduleOpen(true)}
                    >
                      <Clock className="w-4 h-4 mr-1.5" /> Programmer
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={!gmailReady || sendCampaign.isPending || estimatedRecipients === 0}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendCampaign.isPending ? "Envoi en cours…" : "Envoyer maintenant"}
                    </Button>
                  </div>
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
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">{c.subject}</div>
                    {c.status === "scheduled" && c.scheduled_at && (
                      <div className="text-[11px] text-info mt-0.5">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Programmée pour le {new Date(c.scheduled_at).toLocaleString("fr-FR")}
                      </div>
                    )}
                    {c.status === "failed" && (
                      <div className="text-[11px] text-destructive mt-0.5">
                        {c.failed_count}/{c.recipients_count} échecs — vérifiez la connexion Gmail
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs">
                    {c.status === "draft" || c.status === "scheduled" ? (
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => {
                          setDraftId(c.id);
                          setName(c.name); setSubject(c.subject); setKind(c.kind);
                          setBlocks(Array.isArray((c as any).body_blocks) && (c as any).body_blocks.length
                            ? (c as any).body_blocks
                            : [newBlock("heading"), newBlock("text")]);
                          setPromoCode(c.promo_code ?? "");
                          setSegmentType((c.segment as any)?.type ?? "all_opt_in");
                          setSegmentValue((c.segment as any)?.value ?? "");
                          toast({ title: "Brouillon chargé dans l'éditeur" });
                        }}
                      >
                        Modifier
                      </Button>
                    ) : (
                      <>
                        <div className="font-semibold">{c.sent_count}/{c.recipients_count}</div>
                        <div className="text-muted-foreground">{c.sent_at ? new Date(c.sent_at).toLocaleDateString("fr-FR") : "—"}</div>
                      </>
                    )}
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

      {/* PREVIEW DIALOG */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aperçu de l'email</DialogTitle>
            <DialogDescription>
              Rendu tel que vos clients le recevront. Les variables (ex. {"{{first_name}}"}) sont remplacées par des valeurs d'exemple.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/30 p-2">
            <div className="text-xs text-muted-foreground px-2 py-1">
              <strong>Sujet :</strong> {subject || <em>(sujet vide)</em>}
            </div>
            <iframe
              title="Aperçu email"
              srcDoc={previewHtml.replace(/\{\{first_name\}\}/g, "Camille")
                .replace(/\{\{full_name\}\}/g, "Camille Martin")
                .replace(/\{\{boutique_name\}\}/g, boutiques.find((b: any) => b.id === activeId)?.name ?? "Votre boutique")
                .replace(/\{\{promo_code\}\}/g, promoCode || "EXEMPLE10")}
              className="w-full h-[60vh] rounded bg-background"
              sandbox=""
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* TEST SEND DIALOG */}
      <Dialog open={testOpen} onOpenChange={setTestOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer un email de test</DialogTitle>
            <DialogDescription>
              Envoyez la campagne à une seule adresse pour vérifier le rendu. Aucune campagne n'est créée.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Adresse email du test</Label>
            <Input
              type="email" value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="vous@exemple.com"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestOpen(false)}>Annuler</Button>
            <Button onClick={handleTestSend} disabled={testSend.isPending || !testEmail}>
              <Beaker className="w-4 h-4 mr-1.5" />
              {testSend.isPending ? "Envoi…" : "Envoyer le test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SCHEDULE DIALOG */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Programmer l'envoi</DialogTitle>
            <DialogDescription>
              La campagne apparaîtra comme "programmée" dans l'historique jusqu'à la date choisie.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Date et heure d'envoi</Label>
            <Input
              type="datetime-local" value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Annuler</Button>
            <Button onClick={handleSchedule} disabled={saveDraft.isPending || !scheduleAt}>
              <Clock className="w-4 h-4 mr-1.5" /> Programmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    draft: { cls: "bg-muted text-muted-foreground border-0", label: "Brouillon" },
    scheduled: { cls: "bg-info/10 text-info border-0", label: "Programmée" },
    sending: { cls: "bg-warning/10 text-warning border-0", label: "Envoi en cours" },
    sent: { cls: "bg-success/10 text-success border-0", label: "Envoyée" },
    failed: { cls: "bg-destructive/10 text-destructive border-0", label: "Échec" },
  };
  const s = map[status] ?? { cls: "bg-muted text-muted-foreground border-0", label: status };
  return <Badge className={s.cls}>{s.label}</Badge>;
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