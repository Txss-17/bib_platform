import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type ProtectedContext = "platform" | "marketplace";

interface ProtectedRouteProps {
  context: ProtectedContext;
  children?: React.ReactNode;
}

export default function ProtectedRoute({
  context,
  children,
}: ProtectedRouteProps) {
  const { user, accountType, loading } = useAuth();
  const location = useLocation();

  /*
   * Attendre que Supabase ait terminé
   * de restaurer la session.
   */
  if (loading) {
    return null;
  }

  /*
   * Aucun utilisateur connecté.
   *
   * La destination de connexion dépend du contexte
   * de la route protégée.
   */
  if (!user) {
    const destination =
      location.pathname + location.search;

    const loginPath =
      context === "marketplace"
        ? "/store/login"
        : "/login";

    return (
      <Navigate
        to={`${loginPath}?next=${encodeURIComponent(destination)}`}
        replace
      />
    );
  }

  /*
   * L'utilisateur est connecté mais son type de compte
   * n'est pas correctement défini.
   *
   * On ne lui accorde aucun accès implicite.
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
   * Compte Marketplace essayant d'accéder
   * à une zone Platform.
   */
  if (
    context === "platform" &&
    accountType !== "platform"
  ) {
    return (
      <Navigate
        to="/store"
        replace
      />
    );
  }

  /*
   * Compte Platform essayant d'accéder
   * à une zone Marketplace.
   */
  if (
    context === "marketplace" &&
    accountType !== "marketplace"
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  /*
   * Accès autorisé.
   */
  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
