import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBoutiques } from "@/hooks/useBoutiques";
import { useProducts } from "@/hooks/useProducts";

/**
 * Single source of truth for the "First 5 minutes" onboarding state.
 *
 * The wizard step (welcome dialog) is shown when the seller hasn't yet
 * picked a market or activity type. The checklist on the dashboard
 * remains visible until every step is completed.
 *
 * Steps are conditional: a B2B account sees the "Add KYC docs" step,
 * a multi-market boutique sees the "Activate target markets" step.
 */
export interface OnboardingStep {
  key: string;
  label: string;
  description: string;
  done: boolean;
  href: string;
  cta: string;
}

export function useOnboardingState() {
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

  // Wizard appears post-signup until all 3 essentials are filled.
  const needsWizard = !!user && !!profile && (!hasProfileBasics || !hasMarket || !hasBusinessType);

  const steps: OnboardingStep[] = useMemo(() => {
    const list: OnboardingStep[] = [
      {
        key: "profile",
        label: "Compléter votre profil",
        description: "Nom, marché cible et type d'activité.",
        done: hasProfileBasics && hasMarket && hasBusinessType,
        href: "/dashboard/parametres",
        cta: "Compléter",
      },
      {
        key: "boutique",
        label: "Créer votre première boutique",
        description: "Choisissez un nom, une catégorie et un slug public.",
        done: hasBoutique,
        href: "/dashboard/boutiques/create",
        cta: "Créer",
      },
      {
        key: "product",
        label: "Importer un premier produit",
        description: "Sélectionnez depuis le catalogue fournisseur validé.",
        done: hasProduct,
        href: "/dashboard/produits-fournisseurs",
        cta: "Choisir",
      },
    ];

    // Conditional step #1 — B2B accounts must upload KYC docs.
    if (isBusiness) {
      list.push({
        key: "kyc",
        label: "Téléverser vos documents KYC",
        description: "Obligatoire pour un compte business (SIRET, justificatif).",
        done: !!profile?.is_verified,
        href: "/dashboard/parametres",
        cta: "Téléverser",
      });
    }

    // Conditional step #2 — multi-market boutiques must activate markets.
    if (hasBoutique && isMultiMarket) {
      list.push({
        key: "markets",
        label: "Configurer vos marchés cibles",
        description: `Activez devises et langues pour ${firstBoutique?.target_markets?.join(", ")}.`,
        done: hasPublishedBoutique,
        href: firstBoutique ? `/dashboard/boutiques/edit/${firstBoutique.id}` : "/dashboard/boutiques",
        cta: "Configurer",
      });
    }

    // Final activation: publish.
    list.push({
      key: "publish",
      label: "Publier votre boutique",
      description: "Rendez votre vitrine accessible publiquement.",
      done: hasPublishedBoutique,
      href: firstBoutique ? `/dashboard/boutiques/edit/${firstBoutique.id}` : "/dashboard/boutiques",
      cta: "Publier",
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
    profile?.is_verified,
  ]);

  const doneCount = steps.filter((s) => s.done).length;
  const totalCount = steps.length;
  const completionPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
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
    hasMarket,
  };
}