import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/integrations/supabase/client";

import { AuthError } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import type { MerchantLegalAcceptances } from "@/lib/legalDocumentVersions";

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
  profile: Tables<"profiles"> | null;
  refreshProfile: () => Promise<void>;

  signIn: (
    email: string,
    password: string,
    portal?: AccountType,
  ) => Promise<{
    error: AuthError | null;
  }>;

  signUp: (
    email: string,
    password: string,
    fullName?: string,
    accountType?: AccountType,
    legalAcceptances?: MerchantLegalAcceptances,
    privacyConsent?: boolean,
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

  const [profile, setProfile] =
    useState<Tables<"profiles"> | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Unable to load user profile", error);
      return;
    }

    setProfile(data);
  }, [user]);

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
  const resolveAccountType = async (
    currentUser: User | null,
  ): Promise<AccountType | null> => {
    if (!currentUser) return null;
    // The server-maintained account_portals table is the trusted source.
    // Never accept user_metadata.account_type as authorization.
    const { data, error } = await supabase
      .from("account_portals" as never)
      .select("portal")
      .eq("user_id", currentUser.id)
      .maybeSingle();
    if (error) return null;
    const value = (data as { portal?: string } | null)?.portal;
    return value === "platform" || value === "store" ? value : null;
  };

  /* =======================================================
     SESSION INITIALIZATION
     ======================================================= */

  useEffect(() => {
    let mounted = true;
    let sequence = 0;

    const syncSession = async (currentSession: Session | null) => {
      const revision = ++sequence;
      setLoading(true);
      const currentUser = currentSession?.user ?? null;
      const verifiedType = await resolveAccountType(currentUser);
      if (!mounted || revision !== sequence) return;
      setSession(currentSession);
      setUser(currentUser);
      setAccountType(verifiedType);
      if (currentUser && verifiedType === "platform") {
        const { data } = await supabase.from("profiles")
          .select("*").eq("user_id", currentUser.id).maybeSingle();
        if (!mounted || revision !== sequence) return;
        setProfile(data);
      } else {
        setProfile(null);
      }
      if (mounted && revision === sequence) setLoading(false);
    };

    void supabase.auth.getSession().then(({ data }) => {
      void syncSession(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        // Defer database calls until after the auth-state callback returns.
        queueMicrotask(() => { if (mounted) void syncSession(currentSession); });
      },
    );
    return () => {
      mounted = false;
      sequence++;
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
  const signIn: AuthContextType["signIn"] = async (
    email, password, portal = "platform",
  ) => {
    // Verify the account context BEFORE accepting the session in this portal.
    // Account metadata must also be protected by server-side policies.
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { error };
    const actualType = await resolveAccountType(data.user);
    if (actualType !== portal) {
      await supabase.auth.signOut();
      return {
        error: new AuthError(
          portal === "store"
            ? "Ce compte n'est pas un compte client BIB Store."
            : "Ce compte n'est pas autorisé dans l'espace marchand.",
          403,
        ),
      };
    }
    return { error: null };
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
  const signUp: AuthContextType["signUp"] = async (
    email, password, fullName = "", type = "platform", _legalAcceptances, privacyConsent = false,
  ) => {
    // Only customer Store accounts can self-register. Merchant signup remains
    // closed; partner qualification uses its dedicated application workflow.
    if (type !== "store") {
      return {
        data: { user: null, session: null },
        error: new AuthError("Merchant account registration is coming soon.", 403),
      };
    }
    if (!privacyConsent) {
      return {
        data: { user: null, session: null },
        error: new AuthError("Privacy consent is required before account creation.", 400),
      };
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), account_type: "store", privacy_notice_version: "2026-11-02", privacy_notice_acknowledged_at: new Date().toISOString() },
      },
    });
    return { data: { user: data.user, session: data.session }, error };
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
    setProfile(null);
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
        profile,
        refreshProfile,
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
