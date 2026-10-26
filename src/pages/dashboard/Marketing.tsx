import { translateUi, getUiLocale } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useCustomers } from "@/hooks/useCustomers";
import {
  useCampaigns,
  useSendCampaign,
  useAutomations,
  useUpsertAutomations,
  useTestSendCampaign,
  useSaveCampaignDraft,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Megaphone,
  Send,
  Sparkles,
  Mail,
  Bot,
  ListChecks,
  Tag,
  Newspaper,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Save,
  Clock,
  Beaker,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BlockComposer } from "@/components/marketing/BlockComposer";
import {
  renderBlocksToHtml,
  blocksToPlainText,
  newBlock,
  type MarketingBlock,
} from "@/lib/marketingBlocks";

type Kind = "newsletter" | "promo" | "custom";

export default function Marketing() {
  useLanguage();
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

  const optInCount = useMemo(
    () => customers.filter((c) => c.marketing_opt_in).length,
    [customers],
  );
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
    () =>
      renderBlocksToHtml(blocks, {
        signature: (emailSettings as any)?.marketing_signature ?? null,
        footerLinks:
          ((emailSettings as any)?.marketing_footer_links as any) ?? null,
        boutiqueName: boutiques.find((b: any) => b.id === activeId)?.name,
      }),
    [blocks, emailSettings, boutiques, activeId],
  );

  const estimatedRecipients = useMemo(() => {
    if (segmentType === "min_spent" && segmentValue) {
      const threshold = Number(segmentValue) * 100;
      return customers.filter(
        (c) => c.marketing_opt_in && c.total_spent_cents >= threshold,
      ).length;
    }
    return optInCount;
  }, [customers, segmentType, segmentValue, optInCount]);

  const buildPayload = () => ({
    boutique_id: activeId,
    name: name || subject,
    kind,
    subject,
    body_html: renderBlocksToHtml(blocks, {
      boutiqueName: boutiques.find((b: any) => b.id === activeId)?.name,
    }),
    body_blocks: blocks,
    segment: { type: segmentType, value: segmentValue || undefined },
    promo_code: promoCode || undefined,
  });

  const resetComposer = () => {
    setSubject("");
    setName("");
    setPromoCode("");
    setDraftId(null);
    setBlocks([newBlock("heading"), newBlock("text"), newBlock("button")]);
  };

  const handleSend = async () => {
    if (!activeId || !subject || blocks.length === 0) {
      toast({
        title: translateUi("Champs manquants"),
        description: translateUi("Sujet et au moins un bloc requis"),
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await sendCampaign.mutateAsync(buildPayload());
      toast({
        title: translateUi("Campagne envoyée"),
        description: translateUi("{v0} envoyés / {v1} destinataires", {
          v0: (res as any)?.sent ?? 0,
          v1: (res as any)?.recipients ?? 0,
        }),
      });
      resetComposer();
    } catch (e: any) {
      toast({
        title: translateUi("Erreur d'envoi"),
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleTestSend = async () => {
    if (!testEmail || !subject || blocks.length === 0) {
      toast({
        title: translateUi("Champs manquants"),
        description: translateUi("Email de test et contenu requis"),
        variant: "destructive",
      });
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
      toast({
        title: translateUi("Email de test envoyé"),
        description: translateUi("Envoyé à {v0}", { v0: testEmail }),
      });
      setTestOpen(false);
    } catch (e: any) {
      toast({
        title: translateUi("Échec du test"),
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!activeId || !subject) {
      toast({ title: translateUi("Sujet requis"), variant: "destructive" });
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
      toast({ title: translateUi("Brouillon enregistré") });
    } catch (e: any) {
      toast({
        title: translateUi("Erreur"),
        description: e.message,
        variant: "destructive",
      });
    }
  };

  const handleSchedule = async () => {
    if (!scheduleAt) return;
    const when = new Date(scheduleAt);
    if (isNaN(when.getTime()) || when.getTime() < Date.now()) {
      toast({
        title: translateUi("Date invalide"),
        description: translateUi("Choisissez une date future"),
        variant: "destructive",
      });
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
        title: translateUi("Campagne programmée"),
        description: translateUi("Envoi prévu le {v0}", {
          v0: when.toLocaleString(getUiLocale()),
        }),
      });
      setScheduleOpen(false);
      resetComposer();
    } catch (e: any) {
      toast({
        title: translateUi("Erreur"),
        description: e.message,
        variant: "destructive",
      });
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
              {translateUi(
                "Newsletters, promos et automations pour vos clients opt-in.",
              )}
            </p>
          </div>
          {boutiques.length > 1 && (
            <Select value={activeId} onValueChange={setBoutiqueId}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {boutiques.map((b: any) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {!gmailReady && (
          <Alert>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>{translateUi("Gmail non connecté.")}</strong>{" "}
              {translateUi("Connectez votre boîte Gmail dans")}{" "}
              <a href="/dashboard/parametres" className="underline font-medium">
                {translateUi("Paramètres &gt; Email")}
              </a>{" "}
              {translateUi(
                "pour envoyer des campagnes depuis votre propre adresse (préserve votre réputation d'expéditeur).",
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi
            icon={Mail}
            label={translateUi("Opt-in marketing")}
            value={optInCount.toString()}
          />
          <Kpi
            icon={Send}
            label={translateUi("Campagnes envoyées")}
            value={campaigns
              .filter((c) => c.status === "sent")
              .length.toString()}
          />
          <Kpi
            icon={Bot}
            label={translateUi("Automations actives")}
            value={[
              automations?.cart_abandoned_enabled,
              automations?.post_purchase_review_enabled,
              automations?.post_purchase_upsell_enabled,
            ]
              .filter(Boolean)
              .length.toString()}
          />
          <Kpi
            icon={CheckCircle2}
            label={translateUi("Taux envoi moyen")}
            value={
              campaigns.length
                ? `${Math.round(
                    (campaigns.reduce((s, c) => s + c.sent_count, 0) /
                      Math.max(
                        1,
                        campaigns.reduce((s, c) => s + c.recipients_count, 0),
                      )) *
                      100,
                  )}%`
                : "—"
            }
          />
        </div>

        <Tabs defaultValue="composer" className="w-full">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="composer">
              <Sparkles className="w-4 h-4 mr-1" />
              {translateUi("Composer")}
            </TabsTrigger>
            <TabsTrigger value="campaigns">
              <ListChecks className="w-4 h-4 mr-1" />
              {translateUi("Historique")}
            </TabsTrigger>
            <TabsTrigger value="automations">
              <Bot className="w-4 h-4 mr-1" />
              Automations
            </TabsTrigger>
          </TabsList>

          {/* COMPOSER */}
          <TabsContent value="composer" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {translateUi("Nouvelle campagne")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs mb-2 block">
                    {translateUi("Type d'envoi")}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <KindButton
                      active={kind === "newsletter"}
                      onClick={() => setKind("newsletter")}
                      icon={Newspaper}
                      label="Newsletter"
                    />
                    <KindButton
                      active={kind === "promo"}
                      onClick={() => setKind("promo")}
                      icon={Tag}
                      label={translateUi("Promo")}
                    />
                    <KindButton
                      active={kind === "custom"}
                      onClick={() => setKind("custom")}
                      icon={MessageSquare}
                      label={translateUi("Message libre")}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">
                      {translateUi("Nom interne (optionnel)")}
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={translateUi("Soldes été 2026")}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      {translateUi("Sujet de l'email *")}
                    </Label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder={translateUi(
                        "Une surprise pour vous {{first_name}}",
                      )}
                    />
                  </div>
                </div>

                {kind === "promo" && (
                  <div>
                    <Label className="text-xs">
                      {translateUi("Code promo")}
                    </Label>
                    <Input
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      placeholder="ETE2026"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-xs mb-2 block">
                    {translateUi("Contenu de l'email")}
                  </Label>
                  <BlockComposer
                    boutiqueId={activeId}
                    blocks={blocks}
                    onChange={setBlocks}
                    promoCode={promoCode}
                    boutiqueName={
                      boutiques.find((b: any) => b.id === activeId)?.name
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Segment</Label>
                    <Select value={segmentType} onValueChange={setSegmentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_opt_in">
                          {translateUi("Tous les opt-in (")}
                          {optInCount})
                        </SelectItem>
                        <SelectItem value="min_spent">
                          {translateUi("Clients ayant dépensé &gt; X €")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {segmentType === "min_spent" && (
                    <div>
                      <Label className="text-xs">
                        {translateUi("Seuil (€)")}
                      </Label>
                      <Input
                        type="number"
                        value={segmentValue}
                        onChange={(e) => setSegmentValue(e.target.value)}
                        placeholder="50"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      {translateUi("Destinataires estimés :")}
                    </span>{" "}
                    <Badge variant="secondary" className="ml-1">
                      {estimatedRecipients}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewOpen(true)}
                    >
                      <Eye className="w-4 h-4 mr-1.5" /> {translateUi("Aperçu")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTestOpen(true)}
                      disabled={!gmailReady}
                      title={
                        !gmailReady
                          ? translateUi("Gmail non connecté")
                          : undefined
                      }
                    >
                      <Beaker className="w-4 h-4 mr-1.5" />{" "}
                      {translateUi("Envoi test")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveDraft}
                      disabled={saveDraft.isPending}
                    >
                      <Save className="w-4 h-4 mr-1.5" />
                      {draftId
                        ? translateUi("Mettre à jour")
                        : translateUi("Brouillon")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setScheduleOpen(true)}
                    >
                      <Clock className="w-4 h-4 mr-1.5" />{" "}
                      {translateUi("Programmer")}
                    </Button>
                    <Button
                      onClick={handleSend}
                      disabled={
                        !gmailReady ||
                        sendCampaign.isPending ||
                        estimatedRecipients === 0
                      }
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {sendCampaign.isPending
                        ? translateUi("Envoi en cours…")
                        : translateUi("Envoyer maintenant")}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="campaigns" className="space-y-2 mt-4">
            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center text-muted-foreground">
                  <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  {translateUi("Aucune campagne envoyée pour le moment.")}
                </CardContent>
              </Card>
            ) : (
              campaigns.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground truncate">
                          {c.name}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {c.kind}
                        </Badge>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {c.subject}
                      </div>
                      {c.status === "scheduled" && c.scheduled_at && (
                        <div className="text-[11px] text-info-ink mt-0.5">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {translateUi("Programmée pour le") + " "}
                          {new Date(c.scheduled_at).toLocaleString(
                            getUiLocale(),
                          )}
                        </div>
                      )}
                      {c.status === "failed" && (
                        <div className="text-[11px] text-destructive mt-0.5">
                          {c.failed_count}/{c.recipients_count}{" "}
                          {translateUi("échecs — vérifiez la connexion Gmail")}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-xs">
                      {c.status === "draft" || c.status === "scheduled" ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDraftId(c.id);
                            setName(c.name);
                            setSubject(c.subject);
                            setKind(c.kind);
                            setBlocks(
                              Array.isArray((c as any).body_blocks) &&
                                (c as any).body_blocks.length
                                ? (c as any).body_blocks
                                : [newBlock("heading"), newBlock("text")],
                            );
                            setPromoCode(c.promo_code ?? "");
                            setSegmentType(
                              (c.segment as any)?.type ?? "all_opt_in",
                            );
                            setSegmentValue((c.segment as any)?.value ?? "");
                            toast({
                              title: translateUi(
                                "Brouillon chargé dans l'éditeur",
                              ),
                            });
                          }}
                        >
                          {translateUi("Modifier")}
                        </Button>
                      ) : (
                        <>
                          <div className="font-semibold">
                            {c.sent_count}/{c.recipients_count}
                          </div>
                          <div className="text-muted-foreground">
                            {c.sent_at
                              ? new Date(c.sent_at).toLocaleDateString(
                                  getUiLocale(),
                                )
                              : "—"}
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* AUTOMATIONS */}
          <TabsContent value="automations" className="space-y-3 mt-4">
            <AutomationRow
              label={translateUi("Email de confirmation de commande")}
              description={translateUi(
                "Envoi automatique transactionnel (toujours actif)",
              )}
              checked={true}
              disabled
            />
            <AutomationRow
              label={translateUi("Email d'expédition")}
              description={translateUi(
                "Envoyé lorsqu'une commande passe en 'expédiée'",
              )}
              checked={true}
              disabled
            />
            <AutomationRow
              label={translateUi("Relance panier abandonné (24h)")}
              description={translateUi(
                "Email envoyé 24h après un panier non finalisé",
              )}
              checked={!!automations?.cart_abandoned_enabled}
              onChange={(v) =>
                upsertAuto.mutate({
                  boutique_id: activeId,
                  cart_abandoned_enabled: v,
                })
              }
            />
            <AutomationRow
              label={translateUi("Demande d'avis (J+7)")}
              description={translateUi(
                "Demande de notation 7 jours après la commande",
              )}
              checked={!!automations?.post_purchase_review_enabled}
              onChange={(v) =>
                upsertAuto.mutate({
                  boutique_id: activeId,
                  post_purchase_review_enabled: v,
                })
              }
            />
            <AutomationRow
              label={translateUi("Cross-sell (J+30)")}
              description={translateUi(
                "Suggestion de produits complémentaires 30 jours après la commande",
              )}
              checked={!!automations?.post_purchase_upsell_enabled}
              onChange={(v) =>
                upsertAuto.mutate({
                  boutique_id: activeId,
                  post_purchase_upsell_enabled: v,
                })
              }
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* PREVIEW DIALOG */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{translateUi("Aperçu de l'email")}</DialogTitle>
            <DialogDescription>
              {translateUi(
                "Rendu tel que vos clients le recevront. Les variables (ex.",
              ) + " "}
              {"{{first_name}}"}
              {translateUi(") sont remplacées par des valeurs d'exemple.")}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/30 p-2">
            <div className="text-xs text-muted-foreground px-2 py-1">
              <strong>{translateUi("Sujet :")}</strong>{" "}
              {subject || <em>{translateUi("(sujet vide)")}</em>}
            </div>
            <iframe
              title={translateUi("Aperçu email")}
              srcDoc={previewHtml
                .replace(/\{\{first_name\}\}/g, "Camille")
                .replace(/\{\{full_name\}\}/g, "Camille Martin")
                .replace(
                  /\{\{boutique_name\}\}/g,
                  boutiques.find((b: any) => b.id === activeId)?.name ??
                    translateUi("Votre boutique"),
                )
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
            <DialogTitle>{translateUi("Envoyer un email de test")}</DialogTitle>
            <DialogDescription>
              {translateUi(
                "Envoyez la campagne à une seule adresse pour vérifier le rendu. Aucune campagne n'est créée.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">
              {translateUi("Adresse email du test")}
            </Label>
            <Input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder={translateUi("vous@exemple.com")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestOpen(false)}>
              {translateUi("Annuler")}
            </Button>
            <Button
              onClick={handleTestSend}
              disabled={testSend.isPending || !testEmail}
            >
              <Beaker className="w-4 h-4 mr-1.5" />
              {testSend.isPending
                ? translateUi("Envoi…")
                : translateUi("Envoyer le test")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SCHEDULE DIALOG */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{translateUi("Programmer l'envoi")}</DialogTitle>
            <DialogDescription>
              {translateUi(
                "La campagne apparaîtra comme \"programmée\" dans l'historique jusqu'à la date choisie.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">
              {translateUi("Date et heure d'envoi")}
            </Label>
            <Input
              type="datetime-local"
              value={scheduleAt}
              onChange={(e) => setScheduleAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              {translateUi("Annuler")}
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={saveDraft.isPending || !scheduleAt}
            >
              <Clock className="w-4 h-4 mr-1.5" /> {translateUi("Programmer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  useLanguage();
  const map: Record<string, { cls: string; label: string }> = {
    draft: {
      cls: "bg-muted text-muted-foreground border-0",
      label: translateUi("Brouillon"),
    },
    scheduled: {
      cls: "bg-info/10 text-info-ink border-0",
      label: translateUi("Programmée"),
    },
    sending: {
      cls: "bg-warning/10 text-warning-ink border-0",
      label: translateUi("Envoi en cours"),
    },
    sent: {
      cls: "bg-success/10 text-success-ink border-0",
      label: translateUi("Envoyée"),
    },
    failed: {
      cls: "bg-destructive/10 text-destructive border-0",
      label: translateUi("Échec"),
    },
  };
  const s = map[status] ?? {
    cls: "bg-muted text-muted-foreground border-0",
    label: status,
  };
  return <Badge className={s.cls}>{s.label}</Badge>;
}

function Kpi({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  useLanguage();
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-bold text-foreground truncate">
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KindButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  useLanguage();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center gap-1 ${
        active
          ? "border-primary bg-primary/5 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function AutomationRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  useLanguage();
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-foreground text-sm">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
        <Switch
          checked={checked}
          disabled={disabled}
          onCheckedChange={onChange}
        />
      </CardContent>
    </Card>
  );
}
