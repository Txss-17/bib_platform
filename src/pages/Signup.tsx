import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Shield,
  Recycle,
  TrendingUp,
  Store,
} from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
export default function Signup() {
  const [searchParams] = useSearchParams();
  // Platform signup only.
  // Customer signup is handled separately by /store/signup.
  const next = searchParams.get("next") || "/dashboard";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(
    searchParams.get("email") || ""
  );
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  /**
   * Platform destinations only.
   *
   * Never allow /signup to become a gateway to:
   * - /store
   * - /marketplace
   * - /recycler
   *
   * Those areas use /store/signup.
   */
  const isPlatformPath =
    next.startsWith("/dashboard") ||
    next.startsWith("/account") ||
    next.startsWith("/settings") ||
    next.startsWith("/seller") ||
    next.startsWith("/merchant");
  const destination = isPlatformPath ? next : "/dashboard";
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t("signup.passwordmismatch"));
      return;
    }
    if (password.length < 8) {
      setError(t("signup.passwordshort"));
      return;
    }
    if (!acceptTerms) {
      setError(t("signup.acceptterms"));
      return;
    }
    if (!ageConfirm) {
      setError(t("signup.ageconfirm"));
      return;
    }
    setLoading(true);
    const { error } = await signUp(
      email.trim(),
      password,
      fullName.trim()
    );
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    navigate(destination, { replace: true });
  };
  const platformFeatures = [
    {
      icon: Store,
      title: t("signup.multiboutique"),
      desc: t("signup.multiboutique.desc"),
    },
    {
      icon: TrendingUp,
      title: t("signup.analytics"),
      desc: t("signup.analytics.desc"),
    },
    {
      icon: Shield,
      title: t("signup.secure"),
      desc: t("signup.secure.desc"),
    },
    {
      icon: Recycle,
      title: t("signup.sustainable"),
      desc: t("signup.sustainable.desc"),
    },
  ];
  return (
    <div className="min-h-screen bg-background flex">
      {/* Platform presentation */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-accent/5 to-background items-center justify-center p-12">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            {t("signup.branding.title")}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t("signup.branding.desc")}
          </p>
          <div className="grid grid-cols-2 gap-4">
            {platformFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-card border border-border/50"
                >
                  <Icon className="w-6 h-6 text-primary mb-2" />
                  <p className="font-medium text-foreground">
                    {feature.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">
                  Plateforme BIB
                </p>
                <p className="text-sm text-muted-foreground">
                  Gérez votre activité au sein de l’écosystème
                  Brand-In-A-Box.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Signup form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/"
              className="flex items-center gap-2"
              aria-label="Brand-In-A-Box"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  B
                </span>
              </div>
              <span className="font-bold text-2xl text-foreground">
                Brand-In-A-Box
              </span>
            </Link>
            <LanguageSwitcher />
          </div>
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">
                {t("signup.title")}
              </CardTitle>
              <CardDescription>
                {t("signup.desc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {/* Full name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {t("signup.fullname")}
                  </Label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Jean Dupont"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("signup.email")}
                  </Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="vendeur@exemple.com"
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
                  <Label htmlFor="password">
                    {t("signup.password")}
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      autoComplete="new-password"
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
                  <p className="text-xs text-muted-foreground">
                    {t("signup.minchars")}
                  </p>
                </div>
                {/* Confirm password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t("signup.confirm")}
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) =>
                        setConfirmPassword(e.target.value)
                      }
                      className="pl-10 pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={
                        showConfirmPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Legal confirmations */}
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="ageConfirm"
                      checked={ageConfirm}
                      onCheckedChange={(checked) =>
                        setAgeConfirm(checked === true)
                      }
                    />
                    <Label
                      htmlFor="ageConfirm"
                      className="text-sm text-muted-foreground leading-tight"
                    >
                      {t("signup.age")}
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="acceptTerms"
                      checked={acceptTerms}
                      onCheckedChange={(checked) =>
                        setAcceptTerms(checked === true)
                      }
                    />
                    <Label
                      htmlFor="acceptTerms"
                      className="text-sm text-muted-foreground leading-tight"
                    >
                      {t("signup.terms1")}{" "}
                      <Link
                        to="/terms"
                        className="text-primary hover:underline"
                      >
                        {t("signup.termslink")}
                      </Link>{" "}
                      {t("signup.and")}{" "}
                      <Link
                        to="/privacy"
                        className="text-primary hover:underline"
                      >
                        {t("signup.privacylink")}
                      </Link>
                    </Label>
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
                      {t("signup.submit")}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="text-center text-sm text-muted-foreground">
                {t("signup.hasaccount")}{" "}
                <Link
                  to={`/login?next=${encodeURIComponent(destination)}`}
                  className="text-primary font-medium hover:underline"
                >
                  {t("signup.signin")}
                </Link>
              </div>
              <div className="text-center">
                <Link
                  to="/store/signup"
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  Créer un compte client BIB
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
