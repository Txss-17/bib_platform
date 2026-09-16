import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";

import type {
  Session,
  User,
  AuthError,
} from "@supabase/supabase-js";

/* =========================================================
   ACCOUNT TYPES
   ========================================================= */

export type AccountType =
  | "platform"
  | "store";

/* =========================================================
   AUTH CONTEXT
   ========================================================= */

interface AuthContextType {
  user: User | null;
  session: Session | null;
  accountType: AccountType | null;
  loading: boolean;

  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    error: AuthError | null;
  }>;

  signUp: (
    email: string,
    password: string,
    fullName?: string,
    accountType?: AccountType,
  ) => Promise<{
    data: {
      user: User | null;
      session: Session | null;
    };
    error: AuthError | null;
  }>;

  signOut: () => Promise<void>;
}

/* =========================================================
   CONTEXT
   ========================================================= */

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  );

/* =========================================================
   PROVIDER
   ========================================================= */

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [accountType, setAccountType] =
    useState<AccountType | null>(null);

  const [loading, setLoading] =
    useState(true);

  /* =======================================================
     RESOLVE ACCOUNT TYPE
     ======================================================= */

  /**
   * Détermine le type de compte à partir
   * des metadata Supabase.
   *
   * Nouveau format :
   *
   *   platform
   *   store
   *
   * Compatibilité :
   *
   *   marketplace
   *
   * Les anciens comptes marketplace sont
   * automatiquement considérés comme des
   * comptes Store.
   */
  const resolveAccountType = (
    currentUser: User | null,
  ): AccountType | null => {
    if (!currentUser) {
      return null;
    }

    const value =
      currentUser.user_metadata
        ?.account_type;

    /* -------------------------------------------------------
       COMPTE PLATEFORME
       ------------------------------------------------------- */

    if (value === "platform") {
      return "platform";
    }

    /* -------------------------------------------------------
       COMPTE STORE
       ------------------------------------------------------- */

    if (
      value === "store" ||
      value === "marketplace"
    ) {
      return "store";
    }

    return null;
  };

  /* =======================================================
     SESSION INITIALIZATION
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    /**
     * Récupération de la session initiale.
     */
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) {
          return;
        }

        const currentSession =
          data.session;

        const currentUser =
          currentSession?.user ?? null;

        setSession(
          currentSession,
        );

        setUser(
          currentUser,
        );

        setAccountType(
          resolveAccountType(
            currentUser,
          ),
        );

        setLoading(false);
      });

    /**
     * Écoute des changements
     * d'authentification.
     */
    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          currentSession,
        ) => {
          if (!mounted) {
            return;
          }

          const currentUser =
            currentSession?.user ??
            null;

          setSession(
            currentSession,
          );

          setUser(
            currentUser,
          );

          setAccountType(
            resolveAccountType(
              currentUser,
            ),
          );

          setLoading(false);
        },
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* =======================================================
     SIGN IN
     ======================================================= */

  /**
   * Connexion.
   *
   * Le type de compte n'est jamais choisi
   * pendant la connexion.
   *
   * Il est récupéré depuis les metadata
   * du compte Supabase.
   */
  const signIn = async (
    email: string,
    password: string,
  ) => {
    const {
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email: email.trim(),
          password,
        },
      );

    return {
      error,
    };
  };

  /* =======================================================
     SIGN UP
     ======================================================= */

  /**
   * Création d'un compte.
   *
   * /signup
   *      -> platform
   *
   * /store/signup
   *      -> store
   */
  const signUp = async (
    email: string,
    password: string,
    fullName = "",
    type: AccountType = "platform",
  ) => {
    const {
      data,
      error,
    } =
      await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name:
              fullName.trim(),

            account_type:
              type,
          },
        },
      });

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error,
    };
  };

  /* =======================================================
     SIGN OUT
     ======================================================= */

  /**
   * Déconnexion complète.
   */
  const signOut = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setSession(null);
    setAccountType(null);
  };

  /* =======================================================
     PROVIDER
     ======================================================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        accountType,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =========================================================
   HOOK
   ========================================================= */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider",
    );
  }

  return context;
}
