import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export function RecyclingPoints() {
  const { lang } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle>B.I.B Circular</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {lang === "en"
          ? "The recycling programme is in preparation. Verified collection is required before rewards can be activated."
          : "Le programme de recyclage est en préparation. La collecte vérifiée est nécessaire avant l’activation des récompenses."}
      </CardContent>
    </Card>
  );
}
