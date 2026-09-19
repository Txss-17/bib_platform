import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export type ProtectedContext = "platform" | "store";

interface ProtectedRouteProps {
  context?: ProtectedContext;
  children?: React.ReactNode;
}

export function ProtectedRoute({
  context = "platform",
  children,
}: ProtectedRouteProps) {
  const {
    user,
    accountType,
    loading,
  } = useAuth();

  const location = useLocation();

  /*
   * Attendre la restauration de la session
   * avant de prendre une décision de redirection.
   */
  if (loading) {
    return null;
  }

  /*
   * Aucun utilisateur connecté.
   *
   * Chaque espace possède son propre accès.
   */
  if (!user) {
    const destination =
      location.pathname + location.search;

    const loginPath =
      context === "store"
        ? "/store/login"
        : "/login";

    return (
      <Navigate
        to={`${loginPath}?next=${encodeURIComponent(
          destination
        )}`}
        replace
      />
    );
  }

  /*
   * Utilisateur connecté mais compte sans type
   * reconnu.
   *
   * Aucun accès implicite n'est accordé.
   */
  if (!accountType) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /*
   * COMPTE PLATFORM
   *
   * Autorisé uniquement dans les routes
   * protégées de la plateforme BIB.
   */
  if (context === "platform") {
    if (accountType !== "platform") {
      return (
        <Navigate
          to="/store"
          replace
        />
      );
    }
  }

  /*
   * COMPTE STORE
   *
   * Autorisé uniquement dans les routes
   * protégées de l'espace client Store.
   */
  if (context === "store") {
    if (accountType !== "store") {
      return (
        <Navigate
          to="/dashboard"
          replace
        />
      );
    }
  }

  /*
   * Accès autorisé.
   */
  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
