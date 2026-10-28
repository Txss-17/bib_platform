import { Link } from "react-router-dom";
import { PencilLine } from "lucide-react";
import { translateUi } from "@/lib/uiTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

/** Owner-only shortcut back to this boutique's editor. */
export function OwnerEditButton({ boutiqueId, visible }: { boutiqueId: string; visible: boolean }) {
  useLanguage();
  if (!visible) return null;
  return (
    <Link
      to={`/dashboard/boutiques/${boutiqueId}/edit`}
      className="fixed bottom-5 left-5 z-50 inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
    >
      <PencilLine className="h-4 w-4" />
      {translateUi("Retour à l'édition")}
    </Link>
  );
}
