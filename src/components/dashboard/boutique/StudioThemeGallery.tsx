import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, LayoutTemplate, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { STUDIO_BUNDLES, findSceneDefinition, type SceneRecord } from "@/lib/studioScenes";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export function StudioThemeGallery({ boutiqueId }: { boutiqueId: string }) {
  const { lang } = useLanguage();
  const en = lang === "en";
  const [selected, setSelected] = useState<string | null>(null);
  const qc = useQueryClient();

  const applyTheme = useMutation({
    mutationFn: async (key: string) => {
      const theme = STUDIO_BUNDLES.find(bundle => bundle.key === key);
      if (!theme) throw new Error("Thème introuvable");

      // Only homepage scenes are touched. Custom pages and existing scene
      // content remain unchanged, including uploaded assets and CTA copy.
      const { data, error } = await supabase.from("boutique_scenes")
        .select("*").eq("boutique_id", boutiqueId).is("page_id", null)
        .order("position", { ascending: true });
      if (error) throw error;
      const original = (data ?? []) as SceneRecord[];
      const used = new Set<string>();
      const arranged: Array<{ id: string; variant: string | null }> = [];
      for (const item of theme.scenes) {
        const existing = original.find(scene => scene.scene_type === item.id && !used.has(scene.id));
        if (existing) {
          used.add(existing.id);
          arranged.push({ id: existing.id, variant: item.variant ?? existing.variant });
        } else {
          const definition = findSceneDefinition(item.id);
          if (!definition) throw new Error(`Scène inconnue : ${item.id}`);
          const { data: created, error: createError } = await supabase.from("boutique_scenes")
            .insert({
              boutique_id: boutiqueId, page_id: null,
              role: definition.role, scene_type: definition.id,
              variant: item.variant ?? definition.variants[0],
              content: definition.defaultContent,
              position: -10000 - arranged.length,
              is_visible: true,
            } as never).select("id").single();
          if (createError) throw createError;
          arranged.push({ id: created.id, variant: item.variant ?? definition.variants[0] });
        }
      }
      // Keep the merchant's other scenes; do not discard their custom content.
      for (const scene of original) if (!used.has(scene.id)) arranged.push({ id: scene.id, variant: null });
      for (let index = 0; index < arranged.length; index++) {
        const { error: temporaryError } = await supabase.from("boutique_scenes")
          .update({ position: -20000 - index } as never)
          .eq("id", arranged[index].id).eq("boutique_id", boutiqueId);
        if (temporaryError) throw temporaryError;
      }
      for (let index = 0; index < arranged.length; index++) {
        const item = arranged[index];
        const patch: Record<string, unknown> = { position: index };
        if (item.variant) patch.variant = item.variant;
        const { error: updateError } = await supabase.from("boutique_scenes")
          .update(patch as never).eq("id", item.id).eq("boutique_id", boutiqueId);
        if (updateError) throw updateError;
      }
      return theme.name;
    },
    onSuccess: async name => {
      await qc.invalidateQueries({ queryKey: ["boutique-scenes", boutiqueId] });
      toast.success(en ? `Layout ${name} applied. Your pages and content are kept.` : `Composition « ${name} » appliquée sans supprimer vos contenus.`);
    },
    onError: () => toast.error(en ? "Unable to apply the layout; check the scene list." : "Application impossible. Vérifiez les scènes avant de réessayer."),
  });

  return (
    <div className="space-y-3">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold"><LayoutTemplate className="h-4 w-4" />{en ? "Page compositions" : "Compositions de site"}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {en ? "Choose a distinctive homepage structure. Existing text, images and other pages are preserved." : "Choisissez une structure d’accueil différente. Les textes, images et autres pages existants sont conservés."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {STUDIO_BUNDLES.map(bundle => (
          <button key={bundle.key} type="button" onClick={() => setSelected(bundle.key)}
            aria-pressed={selected === bundle.key}
            className={`min-w-0 rounded-xl border p-3 text-left transition-colors ${selected === bundle.key ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
            <span className="mb-2 flex h-16 items-end gap-1 overflow-hidden rounded-md bg-muted/40 p-1.5">
              {bundle.scenes.slice(0, 5).map((scene, i) => (
                <span key={i} className={`block flex-1 rounded-sm ${i % 2 ? "bg-primary/35" : "bg-primary/70"}`}
                  style={{ height: `${Math.max(22, 80 - i * 12)}%` }} />
              ))}
            </span>
            <span className="block text-xs font-semibold">{bundle.name}</span>
            <span className="mt-1 block text-[10px] text-muted-foreground">{bundle.scenes.length} {en ? "sections" : "sections"}</span>
          </button>
        ))}
      </div>
      <Button type="button" className="w-full gap-2" disabled={!selected || applyTheme.isPending}
        onClick={() => selected && applyTheme.mutate(selected)}>
        {applyTheme.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
        {en ? "Apply selected composition" : "Appliquer la composition sélectionnée"}
      </Button>
      <p className="text-[11px] leading-5 text-muted-foreground">{en ? "The composition reorders homepage scenes and adds missing ones. You can then move scenes individually." : "La composition réorganise les scènes d’accueil et ajoute les scènes manquantes. Vous pouvez ensuite déplacer chaque scène individuellement."}</p>
    </div>
  );
}
