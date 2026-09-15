import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type AuthContext = "platform" | "marketplace";

interface ProtectedRouteProps {
  context?: AuthContext;
  children?: React.ReactNode;
}

const isPlatformPath = (pathname: string) => {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/seller" ||
    pathname.startsWith("/seller/") ||
    pathname === "/merchant" ||
    pathname.startsWith("/merchant/")
  );
};

const isMarketplacePath = (pathname: string) => {
  return (
    pathname === "/store" ||
    pathname.startsWith("/store/") ||
    pathname === "/marketplace" ||
    pathname.startsWith("/marketplace/") ||
    pathname === "/recycler" ||
    pathname.startsWith("/recycler/")
  );
};

export default function ProtectedRoute({
  context,
  children,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  /*
   * Aucun utilisateur connecté.
   * Le contexte de la route détermine le formulaire de connexion.
   */
  if (!user) {
    const pathname = location.pathname;

    if (context === "marketplace" || isMarketplacePath(pathname)) {
      return (
        <Navigate
          to={`/store/login?next=${encodeURIComponent(
            pathname + location.search
          )}`}
          replace
        />
      );
    }

    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(
          pathname + location.search
        )}`}
        replace
      />
    );
  }

  /*
   * Si aucun contexte n'est explicitement fourni,
   * on le déduit de la route.
   */
  const currentContext: AuthContext =
    context ??
    (isMarketplacePath(location.pathname)
      ? "marketplace"
      : "platform");

  /*
   * IMPORTANT :
   * Le profil utilisateur doit permettre de distinguer
   * un compte Marketplace d'un compte Platform.
   *
   * Cette propriété devra correspondre à ton modèle réel
   * Supabase/AuthContext.
   */
  const accountType = user.user_metadata?.account_type;

  const isMarketplaceAccount =
    accountType === "marketplace" ||
    accountType === "customer";

  const isPlatformAccount =
    accountType === "platform" ||
    accountType === "merchant" ||
    accountType === "seller";

  /*
   * Compte Marketplace dans une zone Platform
   */
  if (currentContext === "platform" && isMarketplaceAccount) {
    return <Navigate to="/store" replace />;
  }

  /*
   * Compte Platform dans une zone Marketplace
   */
  if (currentContext === "marketplace" && isPlatformAccount) {
    return <Navigate to="/dashboard" replace />;
  }

  /*
   * Sécurité supplémentaire :
   * si le type de compte est absent ou inconnu,
   * on évite de donner un accès implicite.
   */
  if (!isMarketplaceAccount && !isPlatformAccount) {
    return <Navigate to="/login" replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
