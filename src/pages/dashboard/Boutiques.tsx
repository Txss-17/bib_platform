import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, Settings, Trash2, Store } from "lucide-react";
import { Link } from "react-router-dom";

interface Boutique {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: "published" | "draft";
  productsCount: number;
  revenue: number;
  logoUrl?: string;
}

const mockBoutiques: Boutique[] = [
  { id: "1", name: "Maison Déco", slug: "maison-deco", category: "Maison", status: "published", productsCount: 12, revenue: 4330 },
  { id: "2", name: "Beauty Corner", slug: "beauty-corner", category: "Beauté", status: "published", productsCount: 8, revenue: 2150 },
  { id: "3", name: "Tech Store", slug: "tech-store", category: "Tech", status: "draft", productsCount: 5, revenue: 0 },
];

function BoutiqueCard({ boutique }: { boutique: Boutique }) {
  return (
    <Card className="bg-card border-border/50 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{boutique.name}</h3>
              <p className="text-sm text-muted-foreground">{boutique.category}</p>
            </div>
          </div>
          <Badge variant={boutique.status === "published" ? "default" : "secondary"}>
            {boutique.status === "published" ? "Publiée" : "Brouillon"}
          </Badge>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 mb-4">
          <p className="text-sm text-muted-foreground">URL LINKSY</p>
          <p className="text-sm font-mono text-primary">linksy.com/{boutique.slug}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Produits</p>
            <p className="text-lg font-bold text-foreground">{boutique.productsCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Revenus</p>
            <p className="text-lg font-bold text-foreground">{boutique.revenue.toLocaleString('fr-FR')} €</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1">
            <Settings className="w-3 h-3" />
            Gérer
          </Button>
          {boutique.status === "published" && (
            <Button variant="outline" size="sm" className="gap-1">
              <ExternalLink className="w-3 h-3" />
              Ouvrir
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="bg-card border-border/50 border-dashed">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Store className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">Créez votre première boutique</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Lancez-vous et créez votre boutique en ligne en quelques minutes. 
          Choisissez parmi notre catalogue de produits validés et commencez à vendre.
        </p>
        <Link to="/dashboard/boutiques/create">
          <Button size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            Créer ma boutique
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function Boutiques() {
  const hasBoutiques = mockBoutiques.length > 0;

  return (
    <DashboardLayout title="Boutiques" subtitle="Gérez vos boutiques en ligne">
      {hasBoutiques ? (
        <>
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              {mockBoutiques.filter(b => b.status === "published").length} boutiques publiées sur {mockBoutiques.length}
            </p>
            <Link to="/dashboard/boutiques/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Créer une boutique
              </Button>
            </Link>
          </div>

          {/* Boutiques Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBoutiques.map(boutique => (
              <BoutiqueCard key={boutique.id} boutique={boutique} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </DashboardLayout>
  );
}
