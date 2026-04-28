import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, CreditCard, Globe, Loader2, FileCheck, Trash2, Crown, AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BusinessDocuments } from "@/components/dashboard/BusinessDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { PageHeader, SectionCard } from "@/components/dashboard/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const plans = [
  {
    name: "Starter",
    price: "Gratuit",
    features: ["1 boutique", "50 produits", "Support email"],
    current: true,
  },
  {
    name: "Pro",
    price: "29€/mois",
    features: ["5 boutiques", "500 produits", "Support prioritaire", "Analytics avancés"],
    current: false,
    popular: true,
  },
  {
    name: "Scale",
    price: "99€/mois",
    features: ["Boutiques illimitées", "Produits illimités", "Support dédié", "API access", "White-label"],
    current: false,
  },
];

export default function Parametres() {
  const { profile, refreshProfile, user } = useAuth();
  const { data: products = [] } = useProducts();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasProducts = products.length > 0;

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
    } else {
      await refreshProfile();
      toast.success("Profil mis à jour avec succès");
    }
    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (hasProducts) {
      toast.error("Vous devez d'abord retirer tous les produits de vos boutiques");
      return;
    }
    setDeleting(true);
    try {
      await supabase.auth.signOut();
      toast.success("Demande de suppression envoyée. Votre compte sera supprimé sous 30 jours.");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
    setDeleting(false);
  };

  return (
    <DashboardLayout title="Paramètres" subtitle="Gérez votre compte">
      <PageHeader
        eyebrow="Compte"
        title="Paramètres"
        subtitle="Profil, abonnement, sécurité et préférences de notification."
      />
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
            <TabsTrigger value="abonnement" className="flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>Abonnement</span>
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
            <SectionCard
              title="Identité"
              description="Informations utilisées sur vos factures et exports"
              icon={<User className="w-4 h-4" />}
            >
              <div className="space-y-4">
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
              </div>
            </SectionCard>

            <SectionCard
              title="Préférences"
              icon={<Globe className="w-4 h-4" />}
            >
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
            </SectionCard>

            {/* Delete account */}
            <SectionCard
              className="border-destructive/30"
              title="Zone de danger"
              description="Action définitive et irréversible"
              icon={<Trash2 className="w-4 h-4 text-destructive" />}
            >
              <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Supprimer mon compte</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Cette action est irréversible. Tous vos données seront supprimées.
                    </p>
                    {hasProducts && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-destructive">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Vous devez d'abord retirer tous les produits de vos boutiques
                      </div>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="mt-3" disabled={hasProducts}>
                          Supprimer mon compte
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action supprimera définitivement votre compte, vos boutiques et toutes vos données. Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                            Confirmer la suppression
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
            </SectionCard>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="mt-4">
            <BusinessDocuments />
          </TabsContent>

          {/* Abonnement */}
          <TabsContent value="abonnement" className="mt-4">
            <SectionCard
              title="Plans & abonnement"
              description="Choisissez la formule adaptée à votre échelle"
              icon={<Crown className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-5 text-center space-y-3 ${
                    plan.popular
                      ? "border-secondary/50 ring-2 ring-secondary/40 bg-secondary/5"
                      : "border-border/60 bg-card"
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-[10px]">
                      Populaire
                    </Badge>
                  )}
                    <h3 className="font-display font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-2xl font-display font-bold text-foreground">{plan.price}</p>
                    <ul className="text-xs text-muted-foreground space-y-1.5 text-left">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="text-secondary">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.current ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      disabled={plan.current}
                    >
                      {plan.current ? "Plan actuel" : "Bientôt disponible"}
                    </Button>
                </div>
              ))}
              </div>
            </SectionCard>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-4">
            <SectionCard
              title="Notifications"
              description="Choisissez comment vous êtes alerté"
              icon={<Bell className="w-4 h-4" />}
            >
              <div className="divide-y divide-border/50">
                {[
                  { label: "Nouvelles commandes", desc: "Notification sonore à chaque commande", defaultOn: true },
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
              </div>
            </SectionCard>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="securite" className="mt-4">
            <SectionCard
              title="Sécurité du compte"
              description="Authentification renforcée et gestion du mot de passe"
              icon={<Shield className="w-4 h-4" />}
            >
              <div className="divide-y divide-border/50">
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
              </div>
            </SectionCard>
          </TabsContent>

          {/* Paiement */}
          <TabsContent value="paiement" className="mt-4">
            <SectionCard
              title="Coordonnées bancaires"
              description="Compte utilisé pour les versements tous les 15 jours"
              icon={<CreditCard className="w-4 h-4" />}
            >
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">IBAN</p>
                  <p className="font-mono text-sm text-foreground">FR76 •••• •••• •••• •••• ••87</p>
                </div>
                <Button variant="outline" size="sm">Modifier les coordonnées</Button>
              </div>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
