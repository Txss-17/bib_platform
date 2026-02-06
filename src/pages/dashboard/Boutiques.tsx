import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ExternalLink, Settings, Trash2, Store, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useBoutiques, useDeleteBoutique } from "@/hooks/useBoutiques";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Boutique = Tables<"boutiques">;

function BoutiqueCard({ boutique, onDelete }: { boutique: Boutique; onDelete: (id: string) => void }) {
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

        <div className="flex gap-2">
          <Link to={`/dashboard/boutiques/edit/${boutique.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-1">
              <Settings className="w-3 h-3" />
              Modifier
            </Button>
          </Link>
          {boutique.status === "published" && (
            <Button variant="outline" size="sm" className="gap-1" asChild>
              <a href={`/boutique/${boutique.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
                Voir
              </a>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(boutique.id)}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BoutiqueCardSkeleton() {
  return (
    <Card className="bg-card border-border/50 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-16 w-full mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-20" />
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
  const { data: boutiques, isLoading, error } = useBoutiques();
  const deleteBoutique = useDeleteBoutique();

  const handleDelete = async (id: string) => {
    try {
      await deleteBoutique.mutateAsync(id);
      toast.success("Boutique supprimée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la suppression de la boutique");
      console.error(error);
    }
  };

  if (error) {
    return (
      <DashboardLayout title="Boutiques" subtitle="Gérez vos boutiques en ligne">
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Une erreur est survenue lors du chargement des boutiques.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const publishedCount = boutiques?.filter(b => b.status === "published").length || 0;
  const totalCount = boutiques?.length || 0;
  const hasBoutiques = totalCount > 0;

  return (
    <DashboardLayout title="Boutiques" subtitle="Gérez vos boutiques en ligne">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <BoutiqueCardSkeleton key={i} />)}
        </div>
      ) : hasBoutiques ? (
        <>
          {/* Action Bar */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              {publishedCount} boutiques publiées sur {totalCount}
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
            {boutiques?.map(boutique => (
              <BoutiqueCard key={boutique.id} boutique={boutique} onDelete={handleDelete} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState />
      )}
    </DashboardLayout>
  );
}
