import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
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
  CheckCircle,
  Eye,
  EyeOff,
  Gift,
  Lock,
  Mail,
  Recycle,
  Shield,
  ShoppingBag,
  Star,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function MarketplaceLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  /**
   * Marketplace authentication only.
   *
   * This account is the single customer identity used across
   * the BIB customer ecosystem:
   *
   * - Store
   * - boutiques followed by the customer
   * - orders
   * - gift cards
   * - points
   * - recycling
   * - BIB Abonné
   *
   * Recycler does NOT have a separate authentication system.
   */
  const from =
    searchParams.get("next") ||
    location.state?.from?.pathname ||
    "/store";

  /**
   * Customer-facing routes are handled by this authentication flow.
   *
   * If a platform route is passed accidentally, do not allow the
   * Marketplace login to become a gateway to the BIB platform.
   */
  const isCustomerPath =
    from.startsWith("/store") ||
    from.startsWith("/recycler") ||
    from.startsWith("/marketplace");

  const destination = isCustomerPath ? from : "/store";

  const getErrorMessage = (errorMsg: string) => {
    const normalizedMessage = errorMsg.toLowerCase();

    if (
      errorMsg === "Load failed" ||
      normalizedMessage.includes("fetch") ||
      normalizedMessage.includes("network") ||
      normalizedMessage.includes("failed to fetch")
    ) {
      return t("auth.error.network");
    }

    if (errorMsg.includes("Invalid login credentials")) {
      return t("auth.error.invalid");
    }

    return errorMsg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setLoading(true);

    const { error } = await signIn(email.trim(), password);

    if (error) {
      setError(getErrorMessage(error.message));
      setLoading(false);
      return;
    }

    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Customer authentication */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* BIB Store header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/store"
              className="flex items-center gap-2"
              aria-label="BIB Store"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  B
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-bold text-2xl text-foreground leading-none">
                  BIB
                </span>
                <span className="text-xs text-muted-foreground">
                  Store
                </span>
              </div>
            </Link>

            <LanguageSwitcher />
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {t("login.title")}
              </CardTitle>

              <CardDescription>
                {t("login.desc")}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="marketplace-email">
                    {t("login.email")}
                  </Label>

                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      aria-hidden="true"
                    />

                    <Input
                      id="marketplace-email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="marketplace-password">
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
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      aria-hidden="true"
                    />

                    <Input
                      id="marketplace-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {t("login.submit")}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-5">
              <div className="text-center text-sm text-muted-foreground">
                {t("login.noaccount")}{" "}
                <Link
                  to={`/store/signup?next=${encodeURIComponent(destination)}`}
                  className="text-primary font-medium hover:underline"
                >
                  {t("login.create")}
                </Link>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Accès plateforme BIB
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Customer ecosystem */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-accent/5 to-background items-center justify-center p-12">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Votre espace BIB
          </h2>

          <p className="text-muted-foreground mb-8">
            Un seul compte pour retrouver vos boutiques, vos commandes,
            vos avantages et votre activité de recyclage.
          </p>

          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <ShoppingBag
                  className="w-5 h-5 text-primary"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="font-medium text-foreground">
                  Vos boutiques et commandes
                </p>
                <p className="text-sm text-muted-foreground">
                  Retrouvez vos achats et suivez vos commandes depuis
                  votre espace client.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Recycle
                  className="w-5 h-5 text-primary"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="font-medium text-foreground">
                  Recyclage BIB
                </p>
                <p className="text-sm text-muted-foreground">
                  Scannez le QR code de vos emballages éligibles et
                  validez votre recyclage.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Star
                  className="w-5 h-5 text-primary"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="font-medium text-foreground">
                  Vos points
                </p>
                <p className="text-sm text-muted-foreground">
                  Consultez les points cumulés grâce à vos actions
                  éligibles.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-primary/10">
                <Gift
                  className="w-5 h-5 text-primary"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="font-medium text-foreground">
                  Vos avantages
                </p>
                <p className="text-sm text-muted-foreground">
                  Gérez vos cartes cadeaux et les avantages associés à
                  votre compte.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-3">
              <Shield
                className="w-8 h-8 text-primary"
                aria-hidden="true"
              />

              <div>
                <p className="font-medium text-foreground">
                  Un seul compte client
                </p>

                <p className="text-sm text-muted-foreground">
                  Votre compte BIB vous accompagne dans tout votre
                  parcours client, du suivi de commande au recyclage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
