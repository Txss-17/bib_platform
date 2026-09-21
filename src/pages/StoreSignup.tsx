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

import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  Recycle,
  Shield,
  Star,
} from "lucide-react";

import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function StoreSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [confirmationRequired, setConfirmationRequired] =
    useState(false);

  const { signUp } = useAuth();
  const { t } = useLanguage();

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const requestedDestination =
    searchParams.get("next") ||
    location.state?.from?.pathname ||
    "/store/subscribe";

  const isStorePath =
    requestedDestination === "/store" ||
    requestedDestination.startsWith("/store/");

  const destination = isStorePath
    ? requestedDestination
    : "/store/subscribe";

  const isSubscriberFlow =
    destination === "/store/subscribe";

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

    if (
      normalized.includes("already registered") ||
      normalized.includes("user already registered")
    ) {
      return "Un compte existe déjà avec cette adresse e-mail. Connectez-vous pour continuer.";
    }

    return message;
  };

  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();

    setError(null);
    setConfirmationRequired(false);

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Veuillez saisir votre adresse e-mail.",
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Les mots de passe ne correspondent pas.",
      );
      return;
    }

    setLoading(true);

    const { data, error: signUpError } =
      await signUp(
        normalizedEmail,
        password,
        undefined,
        "store",
      );

    if (signUpError) {
      setError(
        getErrorMessage(signUpError.message),
      );
      setLoading(false);
      return;
    }

    /**
     * Supabase peut exiger une confirmation e-mail.
     * Dans ce cas, la session n'existe pas encore.
     */
    if (!data.session) {
      setConfirmationRequired(true);
      setLoading(false);
      return;
    }

    navigate(destination, {
      replace: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        {/* Formulaire */}
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
                  <div className="text-2xl font-bold leading-none">
                    BIB
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Store
                  </div>
                </div>
              </Link>

              <LanguageSwitcher />
            </div>

            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <div className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  <Check className="h-3.5 w-3.5" />
                  BIB Abonné
                </div>

                <CardTitle className="text-2xl">
                  {isSubscriberFlow
                    ? "Activer BIB Abonné"
                    : "Créer votre compte BIB"}
                </CardTitle>

                <CardDescription>
                  {isSubscriberFlow
                    ? "Créez votre compte client puis poursuivez immédiatement vers le paiement."
                    : "Votre compte client BIB vous permet d'accéder à votre espace Store."}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Prix AVANT création du compte */}
                {isSubscriberFlow && (
                  <div className="mb-6 rounded-2xl border bg-muted/30 p-5">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium">
                          BIB Abonné
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Abonnement mensuel
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-semibold">
                          4,99 €
                        </p>

                        <p className="text-xs text-muted-foreground">
                          / mois
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2">
                      <Benefit>
                        Favoris et boutiques suivies
                      </Benefit>

                      <Benefit>
                        Commandes et suivi
                      </Benefit>

                      <Benefit>
                        Recyclage et points BIB
                      </Benefit>

                      <Benefit>
                        Avantages et cartes cadeaux
                      </Benefit>
                    </div>
                  </div>
                )}

                {confirmationRequired ? (
                  <div className="space-y-5">
                    <Alert>
                      <AlertDescription>
                        Un e-mail de confirmation vient
                        d'être envoyé à{" "}
                        <strong>{email}</strong>.
                        Confirmez votre adresse puis
                        reconnectez-vous pour poursuivre
                        l'activation de BIB Abonné.
                      </AlertDescription>
                    </Alert>

                    <Button
                      asChild
                      className="w-full"
                    >
                      <Link
                        to={`/store/login?next=${encodeURIComponent(
                          destination,
                        )}`}
                      >
                        Se connecter et continuer
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="store-signup-email">
                        {t("login.email")}
                      </Label>

                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          id="store-signup-email"
                          type="email"
                          placeholder="vous@exemple.com"
                          value={email}
                          onChange={(event) =>
                            setEmail(event.target.value)
                          }
                          className="pl-10"
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store-signup-password">
                        Mot de passe
                      </Label>

                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          id="store-signup-password"
                          type={
                            showPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="••••••••"
                          value={password}
                          onChange={(event) =>
                            setPassword(
                              event.target.value,
                            )
                          }
                          className="pl-10 pr-10"
                          autoComplete="new-password"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (current) => !current,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        8 caractères minimum.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store-signup-confirm-password">
                        Confirmer le mot de passe
                      </Label>

                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          id="store-signup-confirm-password"
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(
                              event.target.value,
                            )
                          }
                          className="pl-10 pr-10"
                          autoComplete="new-password"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (current) => !current,
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

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
                            ? "Créer mon compte et continuer"
                            : "Créer mon compte"}

                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <div className="text-center text-sm text-muted-foreground">
                  Vous avez déjà un compte ?{" "}
                  <Link
                    to={`/store/login?next=${encodeURIComponent(
                      destination,
                    )}`}
                    className="font-medium text-primary hover:underline"
                  >
                    Se connecter
                  </Link>
                </div>

                <Link
                  to="/store"
                  className="text-center text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Retour au Store
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Présentation */}
        <div className="hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background p-12 lg:flex lg:items-center">
          <div className="mx-auto max-w-lg">
            <h2 className="text-3xl font-bold">
              Un compte client BIB.
            </h2>

            <p className="mt-4 text-muted-foreground">
              Votre compte constitue votre identité client.
              L'abonnement BIB Abonné est ensuite activé
              séparément après paiement.
            </p>

            <div className="mt-8 space-y-5">
              <Benefit
                icon={<Star className="h-5 w-5" />}
              >
                Boutiques et produits favoris
              </Benefit>

              <Benefit
                icon={<Recycle className="h-5 w-5" />}
              >
                Recyclage et points
              </Benefit>

              <Benefit
                icon={<Gift className="h-5 w-5" />}
              >
                Avantages et cartes cadeaux
              </Benefit>

              <Benefit
                icon={<Shield className="h-5 w-5" />}
              >
                Un compte client distinct de l'espace marchand
              </Benefit>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Benefit({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon ?? <Check className="h-3.5 w-3.5" />}
      </div>

      <span>{children}</span>
    </div>
  );
}
