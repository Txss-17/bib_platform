import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, Loader2, FileText, Layout, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useBoutiquePages,
  useCreateBoutiquePage,
  useUpdateBoutiquePage,
  useDeleteBoutiquePage,
  type BoutiquePage,
} from "@/hooks/useBoutiquePages";
import { useUploadSceneAsset } from "@/hooks/useBrandStudio";
import { toast } from "sonner";

interface Props {
  boutiqueId: string;
  boutiqueSlug?: string;
}

export function PagesManager({ boutiqueId, boutiqueSlug }: Props) {
  const { data: pages = [], isLoading } = useBoutiquePages(boutiqueId);
  const createPage = useCreateBoutiquePage();
  const updatePage = useUpdateBoutiquePage();
  const deletePage = useDeleteBoutiquePage();
  const upload = useUploadSceneAsset();

  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMode, setNewMode] = useState<"simple" | "rich">("simple");

  const [editing, setEditing] = useState<BoutiquePage | null>(null);

  async function handleCreate() {
    if (!newTitle.trim()) return;
    try {
      const page = await createPage.mutateAsync({
        boutiqueId,
        title: newTitle.trim(),
        mode: newMode,
      });
      toast.success("Page créée");
      setCreating(false);
      setNewTitle("");
      setEditing(page);
    } catch (e: any) {
      toast.error(e.message || "Création impossible");
    }
  }

  async function saveEditing(patch: Partial<BoutiquePage>) {
    if (!editing) return;
    await updatePage.mutateAsync({
      pageId: editing.id,
      boutiqueId,
      patch: patch as any,
    });
    setEditing({ ...editing, ...patch } as BoutiquePage);
  }

  async function handleHeroUpload(file: File) {
    if (!editing) return;
    try {
      const url = await upload.mutateAsync({ boutiqueId, file });
      await saveEditing({ hero_image_url: url });
      toast.success("Image téléchargée");
    } catch (e: any) {
      toast.error(e.message || "Échec de l'upload");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Pages personnalisées</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Crée des pages enrichies (à propos, lookbook, blog…) qui apparaissent dans
            le menu de ta boutique.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)} className="gap-1">
          <Plus className="w-3.5 h-3.5" /> Nouvelle page
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : pages.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Aucune page personnalisée. Crée une première page pour enrichir ta boutique.
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
            >
              <button
                className="flex-1 flex items-center gap-3 text-left"
                onClick={() => setEditing(p)}
              >
                {p.mode === "rich" ? (
                  <Layout className="w-4 h-4 text-primary" />
                ) : (
                  <FileText className="w-4 h-4 text-muted-foreground" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{p.title}</span>
                    {!p.is_visible && (
                      <Badge variant="secondary" className="text-[10px]">Masquée</Badge>
                    )}
                    {!p.show_in_nav && (
                      <Badge variant="outline" className="text-[10px]">Hors menu</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">/{p.slug}</p>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted"
                  title={p.is_visible ? "Masquer" : "Afficher"}
                  onClick={() =>
                    updatePage.mutate({
                      pageId: p.id,
                      boutiqueId,
                      patch: { is_visible: !p.is_visible } as any,
                    })
                  }
                >
                  {p.is_visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>
                {boutiqueSlug && p.is_visible && (
                  <a
                    href={`/boutique/${boutiqueSlug}/p/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-muted"
                    title="Voir"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  title="Supprimer"
                  onClick={() => {
                    if (confirm(`Supprimer la page « ${p.title} » ?`)) {
                      deletePage.mutate(
                        { pageId: p.id, boutiqueId },
                        {
                          onSuccess: () => toast.success(`Page « ${p.title} » supprimée`),
                          onError: (e: any) =>
                            toast.error(
                              "Suppression impossible : " +
                                (e?.message || "erreur inconnue"),
                            ),
                        },
                      );
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle page</DialogTitle>
            <DialogDescription>
              Choisis un mode : simple (titre + image + texte riche) ou riche (scènes
              drag&drop comme la page d'accueil).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Titre</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex. À propos, Notre engagement, Blog"
              />
            </div>
            <div>
              <Label>Mode</Label>
              <Select value={newMode} onValueChange={(v) => setNewMode(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">
                    Simple — titre + image + texte
                  </SelectItem>
                  <SelectItem value="rich">
                    Riche — scènes drag&drop comme la home
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createPage.isPending || !newTitle.trim()}>
              {createPage.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editing && (
            <>
              <DialogHeader>
                <DialogTitle>Éditer la page</DialogTitle>
                <DialogDescription>
                  /{editing.slug} · mode {editing.mode === "rich" ? "riche" : "simple"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                    onBlur={() => saveEditing({ title: editing.title })}
                  />
                </div>
                <div>
                  <Label>URL (slug)</Label>
                  <Input
                    value={editing.slug}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "-")
                          .replace(/-+/g, "-"),
                      })
                    }
                    onBlur={() => saveEditing({ slug: editing.slug })}
                  />
                </div>

                {editing.mode === "simple" && (
                  <>
                    <div>
                      <Label>Image hero</Label>
                      <div className="mt-1 flex items-center gap-2">
                        {editing.hero_image_url && (
                          <img
                            src={editing.hero_image_url}
                            alt=""
                            className="w-20 h-14 object-cover rounded border"
                          />
                        )}
                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded border border-border text-xs hover:bg-muted">
                          {upload.isPending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : null}
                          {editing.hero_image_url ? "Remplacer" : "Téléverser"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleHeroUpload(f);
                            }}
                          />
                        </label>
                        {editing.hero_image_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveEditing({ hero_image_url: null })}
                          >
                            Retirer
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Contenu (markdown / texte)</Label>
                      <Textarea
                        rows={10}
                        value={editing.content || ""}
                        onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                        onBlur={() => saveEditing({ content: editing.content })}
                        placeholder={`# Mon titre\n\nÉcris ton contenu ici. Tu peux utiliser **gras**, *italique*, et des sauts de ligne.`}
                        className="font-mono text-sm"
                      />
                    </div>
                  </>
                )}

                {editing.mode === "rich" && (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Mode riche : utilise l'éditeur de scènes principal (onglet Scènes)
                    pour personnaliser cette page. Bientôt : éditeur dédié par page.
                  </div>
                )}

                <div className="border-t border-border pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Visible publiquement</Label>
                      <p className="text-xs text-muted-foreground">
                        La page est accessible via son URL.
                      </p>
                    </div>
                    <Switch
                      checked={editing.is_visible}
                      onCheckedChange={(v) => saveEditing({ is_visible: v })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Afficher dans le menu</Label>
                      <p className="text-xs text-muted-foreground">
                        Lien visible dans la navigation de la boutique.
                      </p>
                    </div>
                    <Switch
                      checked={editing.show_in_nav}
                      onCheckedChange={(v) => saveEditing({ show_in_nav: v })}
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground">SEO</Label>
                  <Input
                    placeholder="Meta title"
                    value={editing.seo_title || ""}
                    onChange={(e) => setEditing({ ...editing, seo_title: e.target.value })}
                    onBlur={() => saveEditing({ seo_title: editing.seo_title })}
                  />
                  <Textarea
                    placeholder="Meta description"
                    rows={2}
                    value={editing.seo_description || ""}
                    onChange={(e) => setEditing({ ...editing, seo_description: e.target.value })}
                    onBlur={() => saveEditing({ seo_description: editing.seo_description })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setEditing(null)}>Fermer</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}