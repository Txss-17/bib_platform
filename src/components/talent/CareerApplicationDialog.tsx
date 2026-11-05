import { BibTalentApplicationForm } from "@/components/talent/BibTalentApplicationForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialStageCode?: string | null;
};

export function CareerApplicationDialog({ open, onOpenChange, initialStageCode = null }: Props) {
  const { lang } = useLanguage();
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90dvh] w-[calc(100vw-1rem)] max-w-3xl overflow-y-auto p-3 sm:p-6">
      <DialogHeader className="px-3 pt-2 pr-12 text-left">
        <DialogTitle>{lang === "en" ? "Apply to BIB" : "Postuler chez BIB"}</DialogTitle>
        <DialogDescription>{lang === "en"
          ? "Complete your application in this secure form. You can close it at any time."
          : "Complétez votre dossier dans cette fenêtre sécurisée. Vous pouvez la fermer à tout moment."}</DialogDescription>
      </DialogHeader>
      {open && <BibTalentApplicationForm key={initialStageCode ?? "general"} initialStageCode={initialStageCode} />}
    </DialogContent>
  </Dialog>;
}
