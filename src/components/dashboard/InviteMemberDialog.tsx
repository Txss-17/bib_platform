import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInviteMember, ROLE_LABELS, ROLE_DESCRIPTIONS, type TeamRole } from "@/hooks/useBoutiqueMembers";
import { toast } from "@/hooks/use-toast";
import { Loader2, UserPlus, Shield } from "lucide-react";

interface InviteMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boutiqueId: string;
}

export function InviteMemberDialog({ open, onOpenChange, boutiqueId }: InviteMemberDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamRole>("manager");
  const inviteMember = useInviteMember();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    inviteMember.mutate(
      { boutiqueId, email: email.trim().toLowerCase(), role },
      {
        onSuccess: () => {
          toast({ title: "Invitation envoyée", description: `${email} a été invité en tant que ${ROLE_LABELS[role]}` });
          setEmail("");
          setRole("manager");
          onOpenChange(false);
        },
        onError: () => {
          toast({ title: "Erreur", description: "Impossible d'envoyer l'invitation", variant: "destructive" });
        },
      }
    );
  };

  const roles: TeamRole[] = ["manager", "marketing", "support"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Inviter un membre
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="invite-email">Email du membre</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="membre@example.com"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label>Rôle</Label>
            <Select value={role} onValueChange={(v) => setRole(v as TeamRole)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" />
                      {ROLE_LABELS[r]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Role description */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-medium text-foreground mb-1">{ROLE_LABELS[role]}</p>
            <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" className="flex-1" disabled={inviteMember.isPending || !email.trim()}>
              {inviteMember.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Inviter
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
