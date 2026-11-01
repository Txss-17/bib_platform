import { translateUi, getUiLanguage } from "@/lib/uiTranslation";
import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useProducts } from "@/hooks/useProducts";

function useOnboardingState() {
  const { profile, user } = useAuth();
  const { data: boutiques } = useBoutiques();
  const { data: products } = useProducts();
  const hasProfileBasics = !!profile?.full_name;
  const hasBusinessType = !!profile?.business_type;
  const hasBoutique = (boutiques?.length || 0) > 0;
  const firstBoutique = boutiques?.[0];
  const hasPublishedBoutique = boutiques?.some(b => b.status === "published") || false;
  const hasProduct = (products?.length || 0) > 0;
  const isBusiness = profile?.business_type === "business";
  const needsWizard = !!user && !!profile && (!hasProfileBasics || !hasBusinessType);

  const steps = useMemo(() => {
    const list = [
      {
        key: "profile",
        label: translateUi("Compléter votre profil"),
        description: translateUi("Nom et type d'activité."),
        done: hasProfileBasics && hasBusinessType,
        href: "/dashboard/profil",
        cta: translateUi("Compléter")
      },
      {
        key: "boutique",
        label: translateUi("Créer votre première boutique"),
        description: translateUi("Choisissez un nom, une catégorie et un slug public."),
        done: hasBoutique,
        href: "/dashboard/boutiques/create",
        cta: translateUi("Créer")
      },
      {
        key: "product",
        label: translateUi("Importer un premier produit"),
        description: translateUi("Sélectionnez depuis le catalogue fournisseur validé."),
        done: hasProduct,
        href: "/dashboard/produits-fournisseurs",
        cta: translateUi("Choisir")
      }
    ];
    if (isBusiness) {
      list.push({
        key: "kyc",
        label: translateUi("Téléverser vos documents KYC"),
        description: translateUi("Obligatoire pour un compte business (SIRET, justificatif)."),
        done: !!profile?.is_verified,
        href: "/dashboard/parametres",
        cta: translateUi("Téléverser")
      });
    }
    list.push({
      key: "publish",
      label: translateUi("Publier votre boutique"),
      description: translateUi("Rendez votre vitrine accessible publiquement."),
      done: hasPublishedBoutique,
      href: firstBoutique
        ? `/dashboard/boutiques/${firstBoutique.id}/edit`
        : "/dashboard/boutiques",
      cta: translateUi("Publier")
    });
    return list;
  }, [
    hasProfileBasics, hasBusinessType, hasBoutique, hasProduct,
    hasPublishedBoutique, isBusiness, firstBoutique, profile?.is_verified,
    getUiLanguage()
  ]);
  const doneCount = steps.filter(step => step.done).length;
  const totalCount = steps.length;
  const completionPct = totalCount ? Math.round(doneCount / totalCount * 100) : 0;
  return {
    needsWizard, steps, doneCount, totalCount, completionPct,
    allDone: totalCount > 0 && doneCount === totalCount,
    hasBoutique, hasProduct
  };
}
export { useOnboardingState };
