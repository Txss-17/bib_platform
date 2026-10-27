import { Link } from "react-router-dom";
import { Recycle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Discovery mode until the verified physical collection workflow is operational. */
export default function Recycler() {
  const { lang } = useLanguage();
  const en = lang === "en";
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <Recycle className="mb-2 h-8 w-8 text-primary" />
          <CardTitle>B.I.B Circular</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="font-medium">
            {en
              ? "Discover the recycling programme"
              : "Découvrez le programme de recyclage"}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {en
              ? "The programme is being prepared. Packaging collection and physical verification must be operational before rewards can be activated."
              : "Le programme est en préparation. La collecte des emballages et leur vérification physique doivent être opérationnelles avant l’activation des récompenses."}
          </p>
          <p className="rounded-lg border bg-muted/40 p-4 text-sm">
            {en
              ? "No points or gift-card credit can currently be claimed from this page. Scanning a label does not validate a physical recycling operation."
              : "Aucun point ni crédit de carte cadeau ne peut actuellement être demandé depuis cette page. Scanner une étiquette ne valide pas une opération physique de recyclage."}
          </p>
          <Button asChild>
            <Link to="/store">
              {en ? "Back to BIB Store" : "Retour au Store BIB"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
