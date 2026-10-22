import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  const nextLanguage = lang === "fr" ? "en" : "fr";

  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      className={`gap-1.5 text-xs font-medium ${className}`}
      aria-label={lang === "fr" ? "Passer en anglais" : "Switch to French"}
      title={lang === "fr" ? "Passer en anglais" : "Switch to French"}
      onClick={() => setLang(nextLanguage)}
    >
      <Globe size={14} />
      {lang === "fr" ? "EN" : "FR"}
    </Button>
  );
}
