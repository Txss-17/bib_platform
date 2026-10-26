import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useProductCustomization,
  useCustomizationActions,
} from "@/hooks/useProductCustomization";
import {
  emptyCustomization,
  readCustomizationConfig,
  validateCustomizationConfig,
  hasCustomization,
  readCatalogCustomization,
  type CustomizationConfig,
} from "@/lib/productCustomization";
import type { ProductWithSupplier } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ProductCustomizationEditor({
  product,
}: {
  product: ProductWithSupplier;
}) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const {
    data: dossier,
    isLoading,
    isError,
    refetch,
  } = useProductCustomization(product.id);
  const { save, submit } = useCustomizationActions();
  const meta = readCatalogCustomization(product.supplier_products);
  const [config, setConfig] = useState<CustomizationConfig>(emptyCustomization);
  const [dirty, setDirty] = useState(false);
  const [version, setVersion] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [invalidDraft, setInvalidDraft] = useState(false);
  const [conflict, setConflict] = useState(false);
  const images = [
    ...new Set(
      [
        product.supplier_products.image_url,
        ...(meta.details.gallery ?? []),
      ].filter((image): image is string => !!image),
    ),
  ];
  const options = meta.capabilities;
  const ready =
    meta.valid &&
    hasCustomization(options) &&
    product.supplier_products.is_active !== false;
  const pending = save.isPending || submit.isPending;
  useEffect(() => {
    if (isLoading || isError || dirty) return;
    try {
      setConfig(
        dossier
          ? readCustomizationConfig(dossier.merchant_config)
          : emptyCustomization(),
      );
      setVersion(dossier?.version ?? 0);
      setInvalidDraft(false);
    } catch {
      setInvalidDraft(true);
    }
  }, [dossier, dirty, isLoading, isError]);
  const change = (field: keyof CustomizationConfig, value: string) => {
    setConfig((current) => ({ ...current, [field]: value }));
    setDirty(true);
  };
  const fail = (error: unknown) => {
    const code = (error as { code?: string })?.code;
    if (code === "40001") setConflict(true);
    toast.error(
      code === "40001"
        ? en
          ? "This dossier changed. Reload it before saving."
          : "Ce dossier a changé. Rechargez-le avant de l’enregistrer."
        : en
          ? "The configuration could not be saved. Check the qualified options and retry."
          : "La configuration n’a pas pu être enregistrée. Vérifiez les options qualifiées et réessayez.",
    );
  };
  const saveDraft = async () => {
    try {
      const valid = validateCustomizationConfig(config, options);
      await save.mutateAsync({ productId: product.id, config: valid, version });
      setDirty(false);
      setConflict(false);
      toast.success(en ? "Draft saved." : "Brouillon enregistré.");
    } catch (error) {
      fail(error);
    }
  };
  const send = async () => {
    try {
      await submit.mutateAsync({ productId: product.id, version });
      toast.success(
        en
          ? "Review requested. BIB will process it through the intranet."
          : "Revue demandée. BIB la traitera depuis l’intranet.",
      );
    } catch (error) {
      fail(error);
    }
  };
  const statuses = en
    ? {
        not_requested: "Draft",
        submitted: "Review requested",
        in_review: "Under review",
        approved: "Technical approval",
        changes_requested: "Changes requested",
        rejected: "Rejected",
      }
    : {
        not_requested: "Brouillon",
        submitted: "Revue demandée",
        in_review: "En revue",
        approved: "Accord technique",
        changes_requested: "Modifications demandées",
        rejected: "Refusé",
      };
  const fields = [
    ["color", "colors", en ? "Available color" : "Couleur disponible"],
    ["logoOption", "logo", en ? "Logo method" : "Technique pour le logo"],
    ["material", "materials", en ? "Material" : "Matière"],
    ["finish", "finishes", en ? "Finish" : "Finition"],
    [
      "dimensions",
      "dimensions",
      en ? "Available dimensions" : "Dimensions disponibles",
    ],
    ["packaging", "packaging", "Packaging"],
    ["marking", "marking", en ? "Marking" : "Marquage"],
  ] as const;
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle>
            {en ? "Product configuration" : "Configuration du produit"}
          </CardTitle>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
            {statuses[dossier?.supplier_status ?? "not_requested"]}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {en
            ? "Only options qualified in the BIB catalogue are offered. A physical sample must be validated before production."
            : "Seules les options qualifiées au catalogue BIB sont proposées. Un échantillon physique doit être validé avant production."}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading && (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            {en ? "Loading dossier…" : "Chargement du dossier…"}
          </p>
        )}
        {(isError || invalidDraft) && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-ink"
          >
            <p>
              {en
                ? "The saved dossier is unavailable. Your current form will not be replaced by a local draft."
                : "Le dossier enregistré est indisponible. Le formulaire ne sera pas remplacé par un brouillon local."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="mt-3"
            >
              {en ? "Retry" : "Réessayer"}
            </Button>
          </div>
        )}
        {conflict && (
          <div
            role="alert"
            className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-ink"
          >
            <p>
              {en
                ? "A newer version exists. Your unsaved changes are still visible. Copy anything you want to keep before loading the saved version."
                : "Une version plus récente existe. Vos modifications restent visibles. Copiez les éléments à conserver avant de charger la version enregistrée."}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={async () => {
                const result = await refetch();
                if (!result.error) {
                  setDirty(false);
                  setConflict(false);
                }
              }}
            >
              {en
                ? "Replace form with saved version"
                : "Remplacer le formulaire par la version enregistrée"}
            </Button>
          </div>
        )}
        {!ready && (
          <div
            role="status"
            className="flex gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-ink"
          >
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>
              {en
                ? "BIB must qualify this product’s capabilities in the intranet before configuration is available."
                : "BIB doit qualifier les capacités de ce produit dans l’intranet avant de permettre sa configuration."}
            </p>
          </div>
        )}
        {dossier?.supplier_comment && (
          <div className="rounded-lg border border-info/30 bg-info/10 p-4 text-sm">
            <p className="font-medium text-info-ink">
              {en ? "BIB feedback" : "Retour BIB"}
            </p>
            <p className="mt-1 whitespace-pre-wrap">
              {dossier.supplier_comment}
            </p>
          </div>
        )}
        <dl className="grid gap-3 rounded-lg bg-muted/50 p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">MOQ</dt>
            <dd className="mt-1 font-medium">
              {meta.terms.moq ??
                product.supplier_products.moq ??
                (en ? "To confirm" : "À confirmer")}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">
              {en ? "Customization lead time" : "Délai de personnalisation"}
            </dt>
            <dd className="mt-1 font-medium">
              {meta.terms.lead_time_days != null
                ? meta.terms.lead_time_days + (en ? " days" : " jours")
                : en
                  ? "To confirm"
                  : "À confirmer"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">
              {en ? "Unit surcharge" : "Supplément unitaire"}
            </dt>
            <dd className="mt-1 font-medium">
              {meta.terms.surcharge_cents != null && meta.terms.currency
                ? new Intl.NumberFormat(en ? "en-GB" : "fr-FR", {
                    style: "currency",
                    currency: meta.terms.currency,
                  }).format(meta.terms.surcharge_cents / 100)
                : en
                  ? "Quote required"
                  : "Sur devis"}
            </dd>
          </div>
        </dl>
        <fieldset
          disabled={!ready || isLoading || isError || invalidDraft || pending}
          className="grid min-w-0 gap-4 sm:grid-cols-2"
        >
          <div className="space-y-1.5">
            <Label htmlFor="custom-brand">
              {en ? "Brand name" : "Nom de marque"}
            </Label>
            <Input
              id="custom-brand"
              maxLength={120}
              value={config.brand}
              onChange={(event) => change("brand", event.target.value)}
            />
          </div>
          {fields.map(([field, capability, label]) =>
            options[capability]?.length ? (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={"custom-" + field}>{label}</Label>
                <select
                  id={"custom-" + field}
                  value={config[field]}
                  onChange={(event) => change(field, event.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">
                    {en ? "Select an option" : "Choisir une option"}
                  </option>
                  {options[capability]?.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            ) : null,
          )}
          {!!options.logo?.length && (
            <div className="space-y-1.5">
              <Label htmlFor="custom-logo">
                {en
                  ? "Logo file URL (HTTPS)"
                  : "Lien du fichier de logo (HTTPS)"}
              </Label>
              <Input
                id="custom-logo"
                type="url"
                placeholder="https://…"
                maxLength={2048}
                value={config.logo}
                onChange={(event) => change("logo", event.target.value)}
              />
            </div>
          )}
          {options.text === true && (
            <div className="space-y-1.5">
              <Label htmlFor="custom-text">
                {en ? "Text to print" : "Texte à imprimer"}
              </Label>
              <Input
                id="custom-text"
                maxLength={300}
                value={config.text}
                onChange={(event) => change("text", event.target.value)}
              />
            </div>
          )}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="custom-instructions">
              {en ? "Additional instructions" : "Consignes complémentaires"}
            </Label>
            <Textarea
              id="custom-instructions"
              maxLength={2000}
              value={config.instructions}
              onChange={(event) => change("instructions", event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {en
                ? "Instructions do not create new options or authorize production."
                : "Les consignes ne créent pas de nouvelles options et n’autorisent pas la production."}
            </p>
          </div>
        </fieldset>
        <section
          aria-label={en ? "Illustrative preview" : "Aperçu indicatif"}
          className="grid min-w-0 gap-4 overflow-hidden rounded-xl border bg-muted/30 p-4 lg:grid-cols-2"
        >
          <div className="min-w-0">
            {images.length ? (
              <img
                src={images[imageIndex] ?? images[0]}
                alt={product.supplier_products.name}
                className="h-64 w-full rounded-lg object-contain"
              />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                {en
                  ? "No supplier image available."
                  : "Aucun visuel fournisseur disponible."}
              </p>
            )}
            {images.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((image, index) => (
                  <Button
                    key={image}
                    variant={imageIndex === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setImageIndex(index)}
                  >
                    {en ? "Image " : "Visuel "}
                    {index + 1}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col justify-center gap-3">
            {config.logo.startsWith("https://") && !!options.logo?.length && (
              <img
                src={config.logo}
                alt={en ? "Brand logo" : "Logo de marque"}
                className="h-16 max-w-full object-contain object-left"
              />
            )}
            <p className="break-words text-lg font-semibold">
              {config.brand || product.supplier_products.name}
            </p>
            {config.color && options.colors?.includes(config.color) && (
              <p className="flex items-center gap-2 text-sm">
                <span
                  aria-hidden
                  className="h-5 w-5 rounded border"
                  style={{ backgroundColor: config.color }}
                />
                {config.color}
              </p>
            )}
            {config.text && options.text && (
              <p className="break-words text-sm">{config.text}</p>
            )}
            <p className="text-xs leading-5 text-muted-foreground">
              {en
                ? "These are supplier photos and your chosen branding references. This preview is not a 3D model or a production proof."
                : "Ce sont les photos fournisseur et vos références de marque. Cet aperçu ne constitue pas un modèle 3D ni un bon à tirer."}
            </p>
          </div>
        </section>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            disabled={!ready || isLoading || isError || invalidDraft || pending}
            onClick={saveDraft}
          >
            {save.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {en ? "Save draft" : "Enregistrer le brouillon"}
          </Button>
          <Button
            variant="outline"
            disabled={
              !ready ||
              !dossier ||
              dirty ||
              pending ||
              isLoading ||
              isError ||
              ["submitted", "in_review", "approved"].includes(
                dossier.supplier_status,
              )
            }
            onClick={send}
          >
            <Send className="mr-2 h-4 w-4" />
            {en ? "Request BIB review" : "Demander la revue BIB"}
          </Button>
          {dirty ? (
            <span className="text-sm text-muted-foreground">
              {en ? "Unsaved changes" : "Modifications non enregistrées"}
            </span>
          ) : (
            dossier && (
              <span className="flex items-center gap-1.5 text-sm text-success-ink">
                <CheckCircle2 className="h-4 w-4" />
                {en ? "Saved dossier" : "Dossier enregistré"}
              </span>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
