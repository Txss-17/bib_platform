import { translateUi } from "@/lib/uiTranslation";
import { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  ShoppingBag,
} from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function StoreLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const { t, lang } = useLanguage();
  const english = lang === "en";
  const tx = (fr: string, en: string) => (english ? en : fr);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  /*
   * Le parcours peut arriver ici avec :
   *
   * /store/login?next=/store/subscribe
   *
   * ou avec une destination Store classique.
   */
  const requestedDestination =
    searchParams.get("next") || location.state?.from?.pathname || "/store";

  /*
   * Sécurité de la redirection :
   * seules les routes internes du Store sont acceptées.
   */
  const isStorePath =
    requestedDestination === "/store" ||
    requestedDestination.startsWith("/store/");

  const destination = isStorePath ? requestedDestination : "/store";

  const isSubscriberFlow = destination === "/store/subscribe";

  const getErrorMessage = (message: string) => {
    const normalized = message.toLowerCase();

    if (
      message === "Load failed" ||
      normalized.includes("fetch") ||
      normalized.includes("network") ||
      normalized.includes("failed to fetch")
    ) {
      return t("auth.error.network");
    }

    if (normalized.includes("invalid login credentials")) {
      return t("auth.error.invalid");
    }

    if (normalized.includes("email not confirmed")) {
      return (
        "Votre adresse e-mail n'est pas encore confirmée. " +
        "Consultez votre boîte mail avant de vous connecter."
      );
    }

    return message;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(translateUi("Veuillez saisir votre adresse e-mail."));
      return;
    }

    if (!password) {
      setError(translateUi("Veuillez saisir votre mot de passe."));
      return;
    }

    setLoading(true);

    const { error: signInError } = await signIn(normalizedEmail, password);

    if (signInError) {
      setError(getErrorMessage(signInError.message));

      setLoading(false);
      return;
    }

    /*
     * IMPORTANT :
     * La connexion ne donne pas automatiquement
     * le statut BIB Abonné.
     *
     * Si destination = /store/subscribe,
     * cette page vérifiera ensuite l'abonnement réel
     * via subscriptions.kind = "bib_subscriber".
     */
    navigate(destination, {
      replace: true,
    });
  };

  const signupUrl = `/store/signup?next=${encodeURIComponent(destination)}`;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        {/* =====================================================
            FORMULAIRE
            ===================================================== */}

        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-between">
              <Link
                to="/store"
                className="flex items-center gap-2"
                aria-label="BIB Store"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
                  <span className="text-lg font-bold text-primary-foreground">
                    B
                  </span>
                </div>

                <div>
                  <div className="text-2xl font-bold leading-none">BIB</div>

                  <div className="text-xs text-muted-foreground">Store</div>
                </div>
              </Link>

              <LanguageSwitcher />
            </div>

            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                {isSubscriberFlow && (
                  <div className="mb-3 inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                    {translateUi("BIB Abonné · 4,99 €/mois")}
                  </div>
                )}

                <CardTitle className="text-2xl">
                  {isSubscriberFlow
                    ? tx(
                        "Continuer avec mon compte",
                        "Continue with my account",
                      )
                    : t("login.title")}
                </CardTitle>

                <CardDescription>
                  {isSubscriberFlow
                    ? tx(
                        "Connectez-vous pour poursuivre vers l'activation de BIB Abonné.",
                        "Sign in to continue activating BIB Subscriber.",
                      )
                    : t("login.desc")}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* E-MAIL */}

                  <div className="space-y-2">
                    <Label htmlFor="store-email">{t("login.email")}</Label>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="store-email"
                        type="email"
                        placeholder={
                          english ? "you@example.com" : "vous@exemple.com"
                        }
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="pl-10"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  {/* MOT DE PASSE */}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="store-password">
                        {t("login.password")}
                      </Label>

                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        {t("login.forgot")}
                      </Link>
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                      <Input
                        id="store-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="pl-10 pr-10"
                        autoComplete="current-password"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        aria-label={
                          showPassword
                            ? english
                              ? "Hide password"
                              : "Masquer le mot de passe"
                            : english
                              ? "Show password"
                              : "Afficher le mot de passe"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ACTION */}

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : (
                      <>
                        {isSubscriberFlow
                          ? tx(
                              "Se connecter et continuer",
                              "Sign in and continue",
                            )
                          : t("login.submit")}

                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col gap-5">
                {/* =================================================
                    CRÉATION DE COMPTE
                    ================================================= */}

                <div className="text-center text-sm text-muted-foreground">
                  {t("login.noaccount")}{" "}
                  <Link
                    to={signupUrl}
                    className="font-medium text-primary hover:underline"
                  >
                    {t("login.create")}
                  </Link>
                </div>

                <Link
                  to="/store"
                  className="text-center text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  {tx("Retour au Store", "Back to the Store")}
                </Link>

                <Link
                  to="/login"
                  className="text-center text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  {tx("Accès plateforme BIB", "BIB platform sign in")}
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* =====================================================
            PRÉSENTATION
            ===================================================== */}

        <div className="hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background p-12 lg:flex lg:items-center">
          <div className="mx-auto max-w-lg">
            <h2 className="text-3xl font-bold">
              {tx("Votre espace client BIB", "Your BIB customer account")}
            </h2>

            <p className="mt-4 text-muted-foreground">
              {translateUi(
                "Votre compte vous permet de retrouver vos boutiques, commandes et suivi.",
              )}
            </p>

            <div className="mt-8 space-y-5">
              <Benefit icon={<ShoppingBag className="h-5 w-5" />}>
                {tx("Boutiques et commandes", "Boutiques and orders")}
              </Benefit>

              <Benefit icon={<Shield className="h-5 w-5" />}>
                {tx(
                  "Compte client séparé de l'espace marchand",
                  "Customer account separate from the merchant workspace",
                )}
              </Benefit>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BENEFIT
   ========================================================= */

function Benefit({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  useLanguage();
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>

      <span>{children}</span>
    </div>
  );
}
