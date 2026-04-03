import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, CreditCard, Globe, Loader2, FileCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessDocuments } from "@/components/dashboard/BusinessDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Parametres() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBusinessName(profile.business_name || "");
      setBusinessType(profile.business_type || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        business_name: businessName,
        business_type: businessType,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    } else {
      await refreshProfile();
      toast.success("Profil mis à jour avec succès");
    }
    setSaving(false);
  };

  return (
    <DashboardLayout title="Paramètres" subtitle="Gérez votre compte">
      <div className="max-w-3xl">
        <Tabs defaultValue="profil" className="w-full">
          <TabsList className="w-full flex overflow-x-auto gap-1 bg-muted/50 p-1 h-auto flex-wrap">
            <TabsTrigger value="profil" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Profil</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Documents</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <Bell className="w-3.5 h-3.5" />
              <span>Notifs</span>
            </TabsTrigger>
            <TabsTrigger value="securite" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="paiement" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Paiement</span>
            </TabsTrigger>
          </TabsList>

          {/* Profil */}
          <TabsContent value="profil" className="mt-4 space-y-4">
            <Card className="border-border/50">
              <CardContent className="pt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs">Nom complet</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName" className="text-xs">Nom commercial</Label>
                    <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="businessType" className="text-xs">Type d'activité</Label>
                  <Input id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value)} />
                </div>
                <Button onClick={handleSave} disabled={saving} size="sm">
                  {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                  Enregistrer
                </Button>
              </CardContent>
            </Card>

            {/* Langue */}
            <Card className="border-border/50">
              <CardContent className="pt-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      Langue
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 ml-6">Français (France)</p>
                  </div>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="mt-4">
            <BusinessDocuments />
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="pt-5 divide-y divide-border/50">
                {[
                  { label: "Nouvelles commandes", desc: "Notification à chaque commande", defaultOn: true },
                  { label: "Alertes de stock", desc: "Alerte quand un produit est en rupture", defaultOn: true },
                  { label: "Rapports hebdomadaires", desc: "Résumé des performances chaque semaine", defaultOn: false },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between gap-3 ${i > 0 ? "pt-3" : ""} ${i < 2 ? "pb-3" : ""}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.defaultOn} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="securite" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="pt-5 divide-y divide-border/50">
                <div className="flex items-center justify-between gap-3 pb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Authentification 2FA</p>
                    <p className="text-xs text-muted-foreground">Couche de sécurité supplémentaire</p>
                  </div>
                  <Button variant="outline" size="sm">Configurer</Button>
                </div>
                <div className="flex items-center justify-between gap-3 pt-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Mot de passe</p>
                    <p className="text-xs text-muted-foreground">Dernière modification il y a 3 mois</p>
                  </div>
                  <Button variant="outline" size="sm">Modifier</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paiement */}
          <TabsContent value="paiement" className="mt-4">
            <Card className="border-border/50">
              <CardContent className="pt-5 space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">IBAN</p>
                  <p className="font-mono text-sm text-foreground">FR76 •••• •••• •••• •••• ••87</p>
                </div>
                <Button variant="outline" size="sm">Modifier les coordonnées</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
