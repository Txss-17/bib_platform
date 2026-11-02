import { Link } from "react-router-dom";
import { ArrowLeft, Clock3, Sparkles } from "lucide-react";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { PrelaunchSurvey } from "@/components/prelaunch/PrelaunchSurvey";

export default function SignupComingSoon() {
  const { lang } = useLanguage();
  const en = lang === "en";
  useSEO({
    title: en ? "Account registration coming soon — BIB" : "Création de compte bientôt disponible — BIB",
    description: en
      ? "BIB account registration is not yet open. Existing members can still sign in."
      : "La création de compte BIB n'est pas encore ouverte. Les comptes existants peuvent toujours se connecter.",
  });
  return (
    <PublicPageLayout>
      <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-background py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-bib-gold/10 blur-3xl" />
        <div className="container relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-bib-gold/30 bg-bib-gold/10 text-accent-ink">
            <Clock3 size={29} aria-hidden="true" />
          </div>
          <span className="mt-7 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-accent-ink">
            <Sparkles size={15} aria-hidden="true" />
            Brand-in-a-Box
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            {en ? "Coming soon" : "Bientôt disponible"}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            {en
              ? "Account registration is not open yet. We're preparing the next stage of the BIB experience."
              : "La création de compte n'est pas encore ouverte. Nous préparons la prochaine étape de l'expérience BIB."}
          </p>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            {en
              ? "Already have an account? You can continue signing in as usual."
              : "Vous possédez déjà un compte ? Vous pouvez continuer à vous connecter normalement."}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild variant="premium" size="lg" className="rounded-full">
              <Link to="/login">{en ? "Sign in" : "Se connecter"}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />{en ? "Back to home" : "Retour à l'accueil"}</Link>
            </Button>
          </div>
          <PrelaunchSurvey />
        </div>
      </section>
    </PublicPageLayout>
  );
}
