import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { translateUi } from "@/lib/uiTranslation";

type Preferences = {
  security_emails: boolean;
  account_updates: boolean;
  platform_announcements: boolean;
  weekly_digest: boolean;
};
const defaults: Preferences = {
  security_emails: true,
  account_updates: true,
  platform_announcements: false,
  weekly_digest: false,
};

export function AccountNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState(defaults);
  const { data, isLoading } = useQuery({
    queryKey: ["account-notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("account_notification_preferences" as never)
        .select("security_emails,account_updates,platform_announcements,weekly_digest")
        .eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data as Preferences | null;
    },
  });
  useEffect(() => { setPrefs({ ...defaults, ...(data ?? {}) }); }, [data]);
  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Authentication required");
      const { error } = await supabase.from("account_notification_preferences" as never)
        .upsert({ user_id: user.id, ...prefs, security_emails: true } as never, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account-notifications", user?.id] });
      toast.success(translateUi("Préférences de notification enregistrées"));
    },
    onError: (error: Error) => toast.error(error.message),
  });
  if (isLoading) return <p className="py-5 text-sm text-muted-foreground">{translateUi("Chargement des préférences…")}</p>;
  const rows: { key: keyof Preferences; label: string; detail: string; locked?: boolean }[] = [
    { key: "security_emails", label: "Sécurité du compte", detail: "Alertes de connexion et événements de sécurité obligatoires", locked: true },
    { key: "account_updates", label: "Informations de compte", detail: "Mises à jour administratives et changements de votre espace" },
    { key: "platform_announcements", label: "Actualités BIB", detail: "Annonces non essentielles et nouveautés de la plateforme" },
    { key: "weekly_digest", label: "Synthèse hebdomadaire", detail: "Récapitulatif des événements de votre activité" },
  ];
  return <div className="space-y-4">
    <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
      {rows.map(row => <div key={row.key} className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{translateUi(row.label)}</p>
          <p className="mt-1 text-xs text-muted-foreground">{translateUi(row.detail)}</p>
        </div>
        <Switch checked={row.locked ? true : prefs[row.key]} disabled={row.locked} onCheckedChange={v => setPrefs(p => ({ ...p, [row.key]: v }))} aria-label={translateUi(row.label)}/>
      </div>)}
    </div>
    <p className="flex gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 shrink-0" />{translateUi("Les e-mails transactionnels et de sécurité obligatoires ne peuvent pas être désactivés. Les préférences enregistrées doivent être respectées par les envois automatisés.")}</p>
    <Button disabled={save.isPending || !user} onClick={() => save.mutate()}>{save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{translateUi("Enregistrer les préférences")}</Button>
  </div>;
}
