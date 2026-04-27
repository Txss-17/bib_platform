import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Shield, Recycle, TrendingUp, Store } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [ageConfirm, setAgeConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError(t("signup.passwordmismatch")); return; }
    if (password.length < 8) { setError(t("signup.passwordshort")); return; }
    if (!acceptTerms) { setError(t("signup.acceptterms")); return; }
    if (!ageConfirm) { setError(t("signup.ageconfirm")); return; }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) { setError(error.message); setLoading(false); }
    else { navigate("/dashboard"); }
  };

  const features = [
    { icon: Store, title: t("signup.multiboutique"), desc: t("signup.multiboutique.desc") },
    { icon: TrendingUp, title: t("signup.analytics"), desc: t("signup.analytics.desc") },
    { icon: Shield, title: t("signup.secure"), desc: t("signup.secure.desc") },
    { icon: Recycle, title: t("signup.sustainable"), desc: t("signup.sustainable.desc") },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-accent/5 to-background items-center justify-center p-12">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold text-foreground mb-6">{t("signup.branding.title")}</h2>
          <p className="text-muted-foreground mb-8">{t("signup.branding.desc")}</p>
          <div className="grid grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="p-4 rounded-xl bg-card border border-border/50">
                <f.icon className="w-6 h-6 text-primary mb-2" />
                <p className="font-medium text-foreground">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">10 000+</span> {t("signup.social")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <span className="font-bold text-2xl text-foreground">Brand-In-A-Box</span>
            </Link>
            <LanguageSwitcher />
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">{t("signup.title")}</CardTitle>
              <CardDescription>{t("signup.desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("signup.fullname")}</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="fullName" type="text" placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("signup.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="vendeur@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("signup.password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("signup.minchars")}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("signup.confirm")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Checkbox id="ageConfirm" checked={ageConfirm} onCheckedChange={(checked) => setAgeConfirm(checked as boolean)} />
                    <Label htmlFor="ageConfirm" className="text-sm text-muted-foreground leading-tight">{t("signup.age")}</Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="acceptTerms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} />
                    <Label htmlFor="acceptTerms" className="text-sm text-muted-foreground leading-tight">
                      {t("signup.terms1")}{" "}
                      <Link to="/terms" className="text-primary hover:underline">{t("signup.termslink")}</Link>{" "}
                      {t("signup.and")}{" "}
                      <Link to="/privacy" className="text-primary hover:underline">{t("signup.privacylink")}</Link>
                    </Label>
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <>{t("signup.submit")}<ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="text-center text-sm text-muted-foreground">
                {t("signup.hasaccount")}{" "}
                <Link to="/login" className="text-primary font-medium hover:underline">{t("signup.signin")}</Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
