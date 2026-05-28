import { useState } from "react";
import { Link } from "react-router-dom";
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
  useUpdateMemberRole,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  PLAN_LIMITS,
  type TeamRole,
} from "@/hooks/useBoutiqueMembers";
import { InviteMemberDialog } from "@/components/dashboard/InviteMemberDialog";
import { ConfirmDeleteDialog } from "@/components/dashboard/ConfirmDeleteDialog";
import { toast } from "@/hooks/use-toast";
import { PageHeader, SectionCard, KpiTile, EmptyState, KpiGrid } from "@/components/dashboard/shared";
import { Check, Info, Mail } from "lucide-react";
import { useCurrentPlan } from "@/hooks/usePlans";

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
  const updateRole = useUpdateMemberRole();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string } | null>(null);

  const { tier } = useCurrentPlan();
  const currentPlan = (tier as keyof typeof PLAN_LIMITS) || "starter";
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
        subtitle="Invitez par email. Le membre rejoint l'équipe automatiquement à sa prochaine connexion."
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
      <KpiGrid cols={3}>
        <KpiTile
          label="Membres actifs"
          value={activeNow}
          icon={<Users className="w-4 h-4" />}
          hint={`${activeCount}/${memberLimit} sièges`}
        />
        <KpiTile
          label="En attente"
          value={pendingCount}
          icon={<Mail className="w-4 h-4" />}
          hint="Auto-join à la connexion"
        />
        <KpiTile
          label="Plan"
          value={<span className="capitalize">{currentPlan}</span>}
          tone="gold"
          icon={<Sparkles className="w-4 h-4" />}
          hint={`Limite : ${memberLimit} sièges`}
        />
      </KpiGrid>

      {/* How auto-join works */}
      <div className="mb-6 p-3 rounded-xl border border-info/30 bg-info/5 flex items-start gap-3">
        <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
        <div className="text-xs text-foreground/80">
          <p className="font-medium text-foreground mb-0.5">Comment ça marche ?</p>
          Lorsque vous invitez un email, le membre apparaît en <strong>En attente</strong>.
          Dès qu'il se connecte (ou s'inscrit) avec cet email, il rejoint automatiquement votre boutique
          avec le rôle que vous avez choisi — pas de code ni d'email à confirmer.
        </div>
      </div>

      {/* Action card */}
      <SectionCard
        className="mb-6"
        icon={<Users className="w-4 h-4" />}
        title={canInvite ? "Inviter un nouveau membre" : "Limite atteinte"}
        description={
          canInvite
            ? "Choisissez un rôle adapté à ses responsabilités."
            : "Ajoutez des sièges via les add-ons ou passez au plan supérieur."
        }
        actions={
          canInvite ? (
            <Button size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)} disabled={!boutiqueId}>
              <UserPlus className="w-4 h-4" /> Inviter
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link to="/dashboard/parametres?tab=abonnement">
                <ArrowUpCircle className="w-4 h-4" /> Ajouter un siège
              </Link>
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
            description="Invitez par email — le membre rejoindra l'équipe à sa prochaine connexion."
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
                          <Badge className={`${statusLabels[member.status]?.color} text-[10px] px-1.5 py-0`}>
                            {statusLabels[member.status]?.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {member.role === "owner" ? (
                        <Badge className={`${roleColors.owner} text-[10px] px-2 py-0.5`}>
                          <Crown className="w-3 h-3 mr-1" /> Propriétaire
                        </Badge>
                      ) : (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(v) => {
                              updateRole.mutate(
                                { memberId: member.id, role: v as TeamRole, boutiqueId },
                                { onSuccess: () => toast({ title: "Rôle mis à jour" }) },
                              );
                            }}
                          >
                            <SelectTrigger className="h-8 w-[130px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(["manager", "marketing", "support"] as TeamRole[]).map((r) => (
                                <SelectItem key={r} value={r} className="text-xs">
                                  {ROLE_LABELS[r]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget({ id: member.id, email: member.invited_email })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </SectionCard>

      {/* Permissions matrix */}
      <SectionCard
        className="mt-6"
        title="Accès par rôle"
        description="Ce que chaque rôle peut consulter dans l'espace dashboard."
        icon={<Shield className="w-4 h-4" />}
      >
        <PermissionsMatrix />
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

const PERMISSIONS_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  boutiques: "Boutiques",
  produits: "Produits",
  catalogue: "Catalogue",
  commandes: "Commandes",
  ventes: "Ventes",
  paiements: "Paiements",
  analytics: "Analytics",
  equipe: "Équipe",
  parametres: "Paramètres",
};

function PermissionsMatrix() {
  const modules = Object.keys(PERMISSIONS_LABELS);
  const roles: TeamRole[] = ["owner", "manager", "marketing", "support"];
  return (
    <div className="overflow-x-auto -mx-2 px-2">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-muted-foreground">
            <th className="text-left font-medium py-2 pr-3">Module</th>
            {roles.map((r) => (
              <th key={r} className="text-center font-medium py-2 px-2 capitalize">
                {ROLE_LABELS[r]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          {modules.map((m) => (
            <tr key={m}>
              <td className="py-2 pr-3 text-foreground font-medium">{PERMISSIONS_LABELS[m]}</td>
              {roles.map((r) => {
                const allowed = ROLE_PERMISSIONS[r]?.includes(m);
                return (
                  <td key={r} className="text-center py-2 px-2">
                    {allowed ? (
                      <Check className="w-3.5 h-3.5 text-success inline" />
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
