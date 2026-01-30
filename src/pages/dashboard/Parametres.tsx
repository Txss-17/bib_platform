import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, CreditCard, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Parametres() {
  const { profile } = useAuth();

  return (
    <DashboardLayout title="Paramètres" subtitle="Gérez votre compte et vos préférences">
      <div className="max-w-3xl space-y-6">
        {/* Profile Section */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Profil
            </CardTitle>
            <CardDescription>Informations de votre compte vendeur</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input id="fullName" defaultValue={profile?.full_name || ""} className="mt-2" />
              </div>
              <div>
                <Label htmlFor="businessName">Nom commercial</Label>
                <Input id="businessName" defaultValue={profile?.business_name || ""} className="mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="businessType">Type d'activité</Label>
              <Input id="businessType" defaultValue={profile?.business_type || ""} className="mt-2" />
            </div>
            <Button>Enregistrer les modifications</Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>Gérez vos préférences de notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Nouvelles commandes</p>
                <p className="text-sm text-muted-foreground">Recevoir une notification à chaque nouvelle commande</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alertes de stock</p>
                <p className="text-sm text-muted-foreground">Être alerté quand un produit est en rupture</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Rapports hebdomadaires</p>
                <p className="text-sm text-muted-foreground">Recevoir un résumé de vos performances chaque semaine</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sécurité
            </CardTitle>
            <CardDescription>Paramètres de sécurité de votre compte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Authentification à deux facteurs</p>
                <p className="text-sm text-muted-foreground">Ajouter une couche de sécurité supplémentaire</p>
              </div>
              <Button variant="outline">Configurer</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Mot de passe</p>
                <p className="text-sm text-muted-foreground">Dernière modification il y a 3 mois</p>
              </div>
              <Button variant="outline">Modifier</Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Informations de paiement
            </CardTitle>
            <CardDescription>Compte bancaire pour les versements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">IBAN</p>
              <p className="font-mono text-foreground">FR76 •••• •••• •••• •••• ••87</p>
            </div>
            <Button variant="outline">Modifier les coordonnées bancaires</Button>
          </CardContent>
        </Card>

        {/* Language Section */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Langue et région
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Langue de l'interface</p>
                <p className="text-sm text-muted-foreground">Français (France)</p>
              </div>
              <Button variant="outline">Modifier</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
