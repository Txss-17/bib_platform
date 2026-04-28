import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  UserPlus,
  Shield,
  Crown,
  Megaphone,
  HeadphonesIcon,
  Trash2,
  ArrowUpCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
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
import { PageHeader, SectionCard, KpiTile, KpiTileSkeleton, EmptyState, KpiGrid } from "@/components/dashboard/shared";

const roleIcons: Record<TeamRole, React.ElementType> = {
  owner: Crown,
  manager: Shield,
  marketing: Megaphone,
  support: HeadphonesIcon,
};

const roleColors: Record<TeamRole, string> = {
  owner: "bg-warning/15 text-warning",
  manager: "bg-info/15 text-info",
  marketing: "bg-accent/15 text-accent-foreground",
  support: "bg-success/15 text-success",
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente", color: "bg-warning/15 text-warning" },
  active: { label: "Actif", color: "bg-success/15 text-success" },
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
  const pendingCount = members.filter((m) => m.status === "pending").length;
  const activeNow = members.filter((m) => m.status === "active").length;

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
    <DashboardLayout>
      <PageHeader
        eyebrow="Collaboration"
        title="Équipe & rôles"
        subtitle="Invitez vos collaborateurs et attribuez-leur des rôles précis pour chaque boutique."
        actions={
          boutiques.length > 1 ? (
            <Select value={boutiqueId} onValueChange={setSelectedBoutique}>
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Boutique" />
              </SelectTrigger>
              <SelectContent>
                {boutiques.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null
        }
      />

      {/* KPI strip */}
      <KpiGrid cols={4}>
        <KpiTile
          label="Membres actifs"
          value={activeNow}
          icon={<Users className="w-4 h-4" />}
          hint={`${activeCount}/${memberLimit} sur le plan`}
        />
        <KpiTile
          label="Invitations"
          value={pendingCount}
          icon={<UserPlus className="w-4 h-4" />}
          hint="En attente"
        />
        <KpiTile
          label="Plan"
          value={<span className="capitalize">{currentPlan}</span>}
          tone="gold"
          icon={<Sparkles className="w-4 h-4" />}
          hint={`Limite : ${memberLimit}`}
        />
        <KpiTile
          label="Boutiques"
          value={boutiques.length}
          hint="Couvertes par l'équipe"
        />
      </KpiGrid>

      {/* Action card */}
      <SectionCard
        className="mb-6"
        icon={<Users className="w-4 h-4" />}
        title={canInvite ? "Inviter un nouveau membre" : "Limite atteinte"}
        description={
          canInvite
            ? "Choisissez un rôle adapté à ses responsabilités."
            : "Passez au plan Growth (3) ou Premium (10) pour ajouter plus de membres."
        }
        actions={
          canInvite ? (
            <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)} disabled={!boutiqueId}>
              <UserPlus className="w-4 h-4" /> Inviter
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="gap-1.5">
              <ArrowUpCircle className="w-4 h-4" /> Mettre à niveau
            </Button>
          )
        }
      >
        {!canInvite && (
          <p className="text-xs text-secondary bg-secondary/10 border border-secondary/20 p-2 rounded-lg">
            Vous utilisez {activeCount}/{memberLimit} sièges du plan {currentPlan}.
          </p>
        )}
      </SectionCard>

      {/* Members list */}
      <SectionCard
        title="Membres de l'équipe"
        description={boutiqueId ? `${activeCount} membre(s) sur cette boutique` : undefined}
      >
        {!boutiqueId ? (
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title="Aucune boutique sélectionnée"
            description="Sélectionnez une boutique pour gérer son équipe."
          />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title="Aucun membre"
            description="Invitez vos premiers collaborateurs pour partager la gestion de cette boutique."
            action={
              canInvite ? (
                <Button size="sm" onClick={() => setInviteOpen(true)} className="gap-1.5">
                  <UserPlus className="w-4 h-4" /> Inviter un membre
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-2">
              {members.map((member) => {
                const RoleIcon = roleIcons[member.role];
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{member.invited_email}</p>
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
      </SectionCard>

      {/* Roles reference */}
      <SectionCard
        className="mt-6"
        title="Rôles disponibles"
        description="Permissions granulaires par fonction métier."
        icon={<Shield className="w-4 h-4" />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {(["owner", "manager", "marketing", "support"] as TeamRole[]).map((role) => {
            const Icon = roleIcons[role];
            return (
              <div key={role} className="p-3 rounded-xl border border-border/40 bg-muted/20">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-medium text-foreground">{ROLE_LABELS[role]}</span>
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
        </div>
      </SectionCard>

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
