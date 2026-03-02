import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-1.5 text-xs font-medium ${className}`}
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
    >
      <Globe size={14} />
      {lang === "fr" ? "EN" : "FR"}
    </Button>
  );
}
