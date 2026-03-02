import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Shield, CheckCircle } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) { setError(error.message); setLoading(false); }
    else { navigate(from, { replace: true }); }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <span className="font-bold text-2xl text-foreground">LINKSY</span>
            </Link>
            <LanguageSwitcher />
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">{t("login.title")}</CardTitle>
              <CardDescription>{t("login.desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <div className="space-y-2">
                  <Label htmlFor="email">{t("login.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="vendeur@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">{t("login.password")}</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">{t("login.forgot")}</Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <>{t("login.submit")}<ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <div className="text-center text-sm text-muted-foreground">
                {t("login.noaccount")}{" "}
                <Link to="/signup" className="text-primary font-medium hover:underline">{t("login.create")}</Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/10 via-accent/5 to-background items-center justify-center p-12">
        <div className="max-w-lg">
          <h2 className="text-3xl font-bold text-foreground mb-6">{t("login.branding.title")}</h2>
          <div className="space-y-4">
            {["1", "2", "3", "4"].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="p-1 rounded-full bg-success/20"><CheckCircle className="w-4 h-4 text-success" /></div>
                <span className="text-muted-foreground">{t(`login.branding.${i}`)}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 rounded-xl bg-card border border-border/50">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">{t("login.security.title")}</p>
                <p className="text-sm text-muted-foreground">{t("login.security.desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
