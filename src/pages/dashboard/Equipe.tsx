import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, Shield, Crown, Megaphone, HeadphonesIcon, Trash2, ArrowUpCircle, Loader2 } from "lucide-react";
import { useBoutiques } from "@/hooks/useBoutiques";
import {
  useBoutiqueMembers,
  useRemoveMember,
  ROLE_LABELS,
  PLAN_LIMITS,
  type TeamRole,
} from "@/hooks/useBoutiqueMembers";
import { InviteMemberDialog } from "@/components/dashboard/InviteMemberDialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { toast } from "@/hooks/use-toast";

const roleIcons: Record<TeamRole, React.ElementType> = {
  owner: Crown,
  manager: Shield,
  marketing: Megaphone,
  support: HeadphonesIcon,
};

const roleColors: Record<TeamRole, string> = {
  owner: "bg-amber-100 text-amber-800",
  manager: "bg-blue-100 text-blue-800",
  marketing: "bg-purple-100 text-purple-800",
  support: "bg-green-100 text-green-800",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800" },
  active: { label: "Actif", color: "bg-green-100 text-green-800" },
};

export default function Equipe() {
  const { data: boutiques = [] } = useBoutiques();
  const [selectedBoutique, setSelectedBoutique] = useState<string>("");
  const boutiqueId = selectedBoutique || boutiques[0]?.id || "";
  const { data: members = [], isLoading } = useBoutiqueMembers(boutiqueId);
  const removeMember = useRemoveMember();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);

  // Simulated plan — replace with real subscription data later
  const currentPlan = "starter";
  const memberLimit = PLAN_LIMITS[currentPlan] || 1;
  const activeCount = members.filter((m) => m.status !== "removed").length;
  const canInvite = activeCount < memberLimit;

  const handleRemove = () => {
    if (!deleteTarget) return;
    removeMember.mutate(
      { memberId: deleteTarget.id, boutiqueId },
      {
        onSuccess: () => {
          toast({ title: "Membre retiré" });
          setDeleteTarget(null);
        },
      }
    );
  };

  return (
    <DashboardLayout title="Équipe" subtitle="Gérez les membres de votre boutique">
      {/* Boutique selector */}
      {boutiques.length > 1 && (
        <Select value={boutiqueId} onValueChange={setSelectedBoutique}>
          <SelectTrigger className="w-full sm:w-[240px] mb-4">
            <SelectValue placeholder="Sélectionner une boutique" />
          </SelectTrigger>
          <SelectContent>
            {boutiques.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Plan limits */}
      <Card className="mb-6 border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{activeCount} / {memberLimit} membre(s)</p>
                <p className="text-xs text-muted-foreground capitalize">Plan {currentPlan}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {canInvite ? (
                <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)} disabled={!boutiqueId}>
                  <UserPlus className="w-4 h-4" /> Inviter
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="gap-1.5">
                  <ArrowUpCircle className="w-4 h-4" /> Passer au plan supérieur
                </Button>
              )}
            </div>
          </div>
          {!canInvite && (
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
              Vous avez atteint la limite de membres pour votre plan. Passez au plan Growth (3 membres) ou Premium (5+ membres).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Members list */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Membres de l'équipe</CardTitle>
        </CardHeader>
        <CardContent>
          {!boutiqueId ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sélectionnez une boutique pour voir l'équipe.</p>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
                <Users className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Aucun membre dans cette équipe.</p>
              {canInvite && (
                <Button size="sm" variant="outline" onClick={() => setInviteOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-1.5" /> Inviter un membre
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => {
                const RoleIcon = roleIcons[member.role];
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <RoleIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{member.invited_email}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge className={`${roleColors[member.role]} text-[10px] px-1.5 py-0`}>
                            {ROLE_LABELS[member.role]}
                          </Badge>
                          <Badge className={`${statusLabels[member.status]?.color} text-[10px] px-1.5 py-0`}>
                            {statusLabels[member.status]?.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => setDeleteTarget({ id: member.id, email: member.invited_email })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Roles explanation */}
      <Card className="mt-6 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Rôles disponibles</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {(["owner", "manager", "marketing", "support"] as TeamRole[]).map((role) => {
            const Icon = roleIcons[role];
            return (
              <div key={role} className="p-3 rounded-lg border border-border/30 bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{ROLE_LABELS[role]}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {role === "owner" && "Accès total, gestion des abonnements et paiements"}
                  {role === "manager" && "Gestion des produits, commandes et suivi d'activité"}
                  {role === "marketing" && "Gestion du contenu, branding et stories"}
                  {role === "support" && "Accès aux litiges, signalements et demandes clients"}
                </p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} boutiqueId={boutiqueId} />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={handleRemove}
        title="Retirer le membre"
        description={`Êtes-vous sûr de vouloir retirer ${deleteTarget?.email} de l'équipe ?`}
      />
    </DashboardLayout>
  );
}
