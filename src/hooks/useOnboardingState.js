import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useProducts } from "@/hooks/useProducts";
function useOnboardingState() {
  const { profile, user } = useAuth();
  const { data: boutiques } = useBoutiques();
  const { data: products } = useProducts();
  const hasProfileBasics = !!profile?.full_name;
  const hasMarket = !!profile?.market;
  const hasBusinessType = !!profile?.business_type;
  const hasBoutique = (boutiques?.length || 0) > 0;
  const firstBoutique = boutiques?.[0];
  const hasPublishedBoutique = boutiques?.some((b) => b.status === "published") || false;
  const hasProduct = (products?.length || 0) > 0;
  const isBusiness = profile?.business_type === "business";
  const isMultiMarket = (firstBoutique?.target_markets?.length || 0) > 1;
  const needsWizard = !!user && !!profile && (!hasProfileBasics || !hasMarket || !hasBusinessType);
  const steps = useMemo(() => {
    const list = [
      {
        key: "profile",
        label: "Compl\xE9ter votre profil",
        description: "Nom, march\xE9 cible et type d'activit\xE9.",
        done: hasProfileBasics && hasMarket && hasBusinessType,
        href: "/dashboard/parametres",
        cta: "Compl\xE9ter"
      },
      {
        key: "boutique",
        label: "Cr\xE9er votre premi\xE8re boutique",
        description: "Choisissez un nom, une cat\xE9gorie et un slug public.",
        done: hasBoutique,
        href: "/dashboard/boutiques/create",
        cta: "Cr\xE9er"
      },
      {
        key: "product",
        label: "Importer un premier produit",
        description: "S\xE9lectionnez depuis le catalogue fournisseur valid\xE9.",
        done: hasProduct,
        href: "/dashboard/produits-fournisseurs",
        cta: "Choisir"
      }
    ];
    if (isBusiness) {
      list.push({
        key: "kyc",
        label: "T\xE9l\xE9verser vos documents KYC",
        description: "Obligatoire pour un compte business (SIRET, justificatif).",
        done: !!profile?.is_verified,
        href: "/dashboard/parametres",
        cta: "T\xE9l\xE9verser"
      });
    }
    if (hasBoutique && isMultiMarket) {
      list.push({
        key: "markets",
        label: "Configurer vos march\xE9s cibles",
        description: `Activez devises et langues pour ${firstBoutique?.target_markets?.join(", ")}.`,
        done: hasPublishedBoutique,
        href: firstBoutique ? `/dashboard/boutiques/edit/${firstBoutique.id}` : "/dashboard/boutiques",
        cta: "Configurer"
      });
    }
    list.push({
      key: "publish",
      label: "Publier votre boutique",
      description: "Rendez votre vitrine accessible publiquement.",
      done: hasPublishedBoutique,
      href: firstBoutique ? `/dashboard/boutiques/edit/${firstBoutique.id}` : "/dashboard/boutiques",
      cta: "Publier"
    });
    return list;
  }, [
    hasProfileBasics,
    hasMarket,
    hasBusinessType,
    hasBoutique,
    hasProduct,
    hasPublishedBoutique,
    isBusiness,
    isMultiMarket,
    firstBoutique,
    profile?.is_verified
  ]);
  const doneCount = steps.filter((s) => s.done).length;
  const totalCount = steps.length;
  const completionPct = totalCount > 0 ? Math.round(doneCount / totalCount * 100) : 0;
  const allDone = doneCount === totalCount && totalCount > 0;
  return {
    needsWizard,
    steps,
    doneCount,
    totalCount,
    completionPct,
    allDone,
    hasBoutique,
    hasProduct,
    hasMarket
  };
}
export {
  useOnboardingState
};
