import { createContext, useContext, useState, ReactNode } from "react";

type Lang = "fr" | "en";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    // Header
    "nav.features": "Fonctionnalités",
    "nav.how": "Comment ça marche",
    "nav.pricing": "Tarifs",
    "nav.trust": "Confiance & Sécurité",
    "nav.signin": "Se connecter",
    "nav.start": "Commencer",

    // Hero
    "hero.badge": "Approuvé par 10 000+ entrepreneurs",
    "hero.title1": "Bâtissez votre empire.",
    "hero.title2": "Évoluez en confiance.",
    "hero.desc": "Brand-In-A-Box est la plateforme de commerce intelligente qui vous permet de lancer, gérer et développer votre activité en ligne — avec une transparence totale, des insights intelligents et une protection intégrée.",
    "hero.cta": "Lancer votre activité",
    "hero.demo": "Voir la démo",
    "hero.nocard": "Sans carte bancaire",
    "hero.age": "Vérification 18+",
    "hero.gdpr": "Conforme RGPD",
    "hero.welcome": "Bienvenue",
    "hero.dashboard": "Votre tableau de bord",
    "hero.live": "En direct",
    "hero.revenue": "Revenus mensuels",
    "hero.vs": "+12,5% vs mois dernier",
    "hero.eco": "Points Éco",
    "hero.redeem": "Échanger des récompenses",
    "hero.trustscore": "Score de confiance",
    "hero.excellent": "Excellent",
    "hero.neworder": "Nouvelle commande",
    "hero.justnow": "À l'instant",

    // Features
    "features.badge": "Fonctionnalités",
    "features.title1": "Tout ce qu'il vous faut pour",
    "features.title2": "réussir",
    "features.desc": "Brand-In-A-Box est bien plus qu'une marketplace — c'est un système complet conçu pour lancer, développer et protéger votre activité en ligne.",
    "features.multiboutique.title": "Gestion multi-boutiques",
    "features.multiboutique.desc": "Créez et gérez plusieurs boutiques avec un branding personnalisé. Activez publicités vidéo, programmes de recyclage et analyses avancées par boutique.",
    "features.intelligence.title": "Intelligence produit",
    "features.intelligence.desc": "Recommandations IA explicables : demande du marché, niveaux de concurrence et impact environnemental — aucune boîte noire.",
    "features.trust.title": "Confiance & Conformité",
    "features.trust.desc": "Conformité intégrée, vérification d'âge, audits fournisseurs et intégration Trustpilot transparente. Votre réputation, protégée.",
    "features.recycling.title": "Recyclage & Fidélité",
    "features.recycling.desc": "Les clients scannent les emballages pour gagner des points. Impact environnemental visible et système de récompenses durable.",
    "features.multimarket.title": "Multi-marchés",
    "features.multimarket.desc": "Lancez-vous en UE, EAU, Afrique et au-delà. Multi-devises, multilingue, avec conformité locale intégrée.",
    "features.support.title": "Support Pôle 12",
    "features.support.desc": "Support intégré avec alertes contextuelles, recommandations personnalisées et emails de prévention pour risques, stocks et conformité.",

    // How it works
    "how.badge": "Démarrage",
    "how.title1": "Votre parcours vers le",
    "how.title2": "succès",
    "how.desc": "De la création de compte au développement de votre activité — Brand-In-A-Box vous guide à chaque étape avec transparence et support.",
    "how.step1.title": "Créez votre compte",
    "how.step1.desc": "Inscrivez-vous avec vérification email et confirmation d'âge (18+). Choisissez votre profil et vos marchés cibles.",
    "how.step2.title": "Lancez votre boutique",
    "how.step2.desc": "Créez votre première boutique, personnalisez le branding et choisissez votre catégorie. Activez publicités vidéo et recyclage.",
    "how.step3.title": "Sélectionnez vos produits",
    "how.step3.desc": "Parcourez les produits validés par Brand-In-A-Box avec indicateurs de demande, notes fournisseurs et visibilité des marges.",
    "how.step4.title": "Évoluez en confiance",
    "how.step4.desc": "Suivez vos performances dans le tableau de bord, exploitez l'intelligence produit et grandissez avec conformité et support intégrés.",

    // Trust
    "trust.badge": "Confiance & Sécurité",
    "trust.title1": "Protégé.",
    "trust.title2": "Autonomisé.",
    "trust.desc": "Brand-In-A-Box repose sur la transparence et la confiance. Chaque fonctionnalité protège votre activité, guide vos décisions et responsabilise tout le monde — y compris nous.",
    "trust.uptime": "Disponibilité",
    "trust.encryption": "Chiffrement",
    "trust.monitoring": "Surveillance",
    "trust.supplier.title": "Validation fournisseurs",
    "trust.supplier.desc": "Chaque fournisseur passe des audits rigoureux avec statut de validation visible et badges d'audit.",
    "trust.transparency.title": "Transparence totale",
    "trust.transparency.desc": "Voyez les indicateurs de demande, niveaux de concurrence et impact environnemental — aucun algorithme caché.",
    "trust.data.title": "Protection des données",
    "trust.data.desc": "Conforme RGPD avec sécurité de niveau entreprise. Vos données sont chiffrées et protégées.",
    "trust.compliance.title": "Conformité intégrée",
    "trust.compliance.desc": "Exigences légales par marché, règles d'emballage et responsabilités vendeur — toujours visibles.",
    "trust.trustpilot.title": "Intégration Trustpilot",
    "trust.trustpilot.desc": "Avis clients transparents affichés et utilisés pour l'analytique. Construisez une vraie réputation.",
    "trust.fair.title": "Juste & Responsable",
    "trust.fair.desc": "Conditions claires, frais visibles, aucun coût caché. Brand-In-A-Box grandit avec vous, pas à vos dépens.",

    // CTA
    "cta.badge": "Commencez aujourd'hui",
    "cta.title": "Prêt à bâtir votre empire commercial ?",
    "cta.desc": "Rejoignez des milliers d'entrepreneurs qui font confiance à Brand-In-A-Box pour lancer, développer et protéger leur activité. Sans carte bancaire.",
    "cta.button": "Créer un compte gratuit",
    "cta.sales": "Contacter les ventes",
    "cta.free": "✓ Gratuit pour commencer",
    "cta.nofees": "✓ Aucun frais caché",
    "cta.cancel": "✓ Annulation à tout moment",
    "cta.age": "✓ 18+ uniquement",

    // Footer
    "footer.desc": "La plateforme de commerce intelligente qui permet aux entrepreneurs de créer, développer et sécuriser leur activité en ligne.",
    "footer.product": "Produit",
    "footer.features": "Fonctionnalités",
    "footer.dashboard": "Tableau de bord",
    "footer.intelligence": "Intelligence Produit",
    "footer.recycling": "Programme Recyclage",
    "footer.pricing": "Tarifs",
    "footer.company": "Entreprise",
    "footer.about": "À propos",
    "footer.careers": "Carrières",
    "footer.press": "Presse",
    "footer.partners": "Partenaires",
    "footer.contact": "Contact",
    "footer.resources": "Ressources",
    "footer.help": "Centre d'aide",
    "footer.docs": "Documentation",
    "footer.academy": "Académie Vendeur",
    "footer.webinars": "Webinaires",
    "footer.blog": "Blog",
    "footer.legal": "Légal",
    "footer.privacy": "Politique de confidentialité",
    "footer.terms": "Conditions d'utilisation",
    "footer.cookies": "Politique des cookies",
    "footer.compliance": "Conformité",
    "footer.gdpr": "RGPD",
    "footer.ssl": "SSL Sécurisé",
    "footer.multimarket": "Multi-marchés",
    "footer.rights": "Tous droits réservés.",

    // Login
    "login.title": "Bon retour parmi nous",
    "login.desc": "Entrez vos identifiants pour accéder à votre espace vendeur",
    "login.email": "Email",
    "login.password": "Mot de passe",
    "login.forgot": "Mot de passe oublié ?",
    "login.submit": "Se connecter",
    "login.noaccount": "Pas encore de compte ?",
    "login.create": "En créer un",
    "login.branding.title": "Développez votre activité avec Brand-In-A-Box",
    "login.branding.1": "Accédez à votre tableau de bord vendeur complet",
    "login.branding.2": "Suivez revenus, commandes et stocks en temps réel",
    "login.branding.3": "Gérez plusieurs boutiques depuis un seul endroit",
    "login.branding.4": "Plateforme sécurisée et conforme",
    "login.security.title": "Sécurité de niveau entreprise",
    "login.security.desc": "Vos données sont protégées par un chiffrement de pointe",

    // Signup
    "signup.title": "Créez votre compte",
    "signup.desc": "Commencez votre aventure vendeur avec Brand-In-A-Box",
    "signup.fullname": "Nom complet",
    "signup.email": "Email",
    "signup.password": "Mot de passe",
    "signup.confirm": "Confirmer le mot de passe",
    "signup.minchars": "Minimum 8 caractères",
    "signup.age": "Je confirme avoir 18 ans ou plus",
    "signup.terms1": "J'accepte les",
    "signup.termslink": "Conditions d'utilisation",
    "signup.and": "et la",
    "signup.privacylink": "Politique de confidentialité",
    "signup.submit": "Créer un compte",
    "signup.hasaccount": "Vous avez déjà un compte ?",
    "signup.signin": "Se connecter",
    "signup.branding.title": "Commencez à vendre avec Brand-In-A-Box dès aujourd'hui",
    "signup.branding.desc": "Rejoignez des milliers d'entrepreneurs qui font confiance à Brand-In-A-Box pour développer leur activité.",
    "signup.multiboutique": "Multi-Boutique",
    "signup.multiboutique.desc": "Gérez plusieurs boutiques",
    "signup.analytics": "Analytique",
    "signup.analytics.desc": "Insights en temps réel",
    "signup.secure": "Sécurisé",
    "signup.secure.desc": "Sécurité entreprise",
    "signup.sustainable": "Durable",
    "signup.sustainable.desc": "Plateforme éco-responsable",
    "signup.social": "vendeurs font déjà confiance à Brand-In-A-Box",
    "signup.passwordmismatch": "Les mots de passe ne correspondent pas",
    "signup.passwordshort": "Le mot de passe doit contenir au moins 8 caractères",
    "signup.acceptterms": "Vous devez accepter les conditions d'utilisation",
    "signup.ageconfirm": "Vous devez avoir 18 ans ou plus pour créer un compte",

    // Forgot Password
    "forgot.title": "Mot de passe oublié",
    "forgot.desc": "Entrez votre email pour recevoir un lien de réinitialisation",
    "forgot.sent": "Email envoyé !",
    "forgot.sentdesc": "Si un compte existe avec l'adresse",
    "forgot.sentdesc2": ", vous recevrez un lien de réinitialisation.",
    "forgot.send": "Envoyer le lien",
    "forgot.back": "Retour à la connexion",

    // Reset Password
    "reset.title": "Nouveau mot de passe",
    "reset.desc": "Choisissez un nouveau mot de passe pour votre compte",
    "reset.new": "Nouveau mot de passe",
    "reset.confirm": "Confirmer le mot de passe",
    "reset.submit": "Réinitialiser le mot de passe",
    "reset.success": "Mot de passe mis à jour !",
    "reset.redirect": "Vous allez être redirigé vers la connexion...",
    "reset.errorMin": "Le mot de passe doit contenir au moins 6 caractères",
    "reset.errorMatch": "Les mots de passe ne correspondent pas",
    "reset.notoken": "Ce lien semble invalide ou expiré. Veuillez demander un nouveau lien de réinitialisation.",

    // Auth errors
    "auth.error.network": "Erreur de connexion réseau. Vérifiez votre connexion internet et réessayez.",
    "auth.error.invalid": "Email ou mot de passe incorrect",
    "auth.error.generic": "Une erreur est survenue. Veuillez réessayer.",
  },
  en: {
    // Header
    "nav.features": "Features",
    "nav.how": "How it Works",
    "nav.pricing": "Pricing",
    "nav.trust": "Trust & Security",
    "nav.signin": "Sign In",
    "nav.start": "Start Free",

    // Hero
    "hero.badge": "Trusted by 10,000+ entrepreneurs",
    "hero.title1": "Build Your Empire.",
    "hero.title2": "Scale with Confidence.",
    "hero.desc": "Brand-In-A-Box is the intelligent commerce platform that empowers you to launch, manage, and grow your online business—with complete transparency, smart insights, and built-in protection.",
    "hero.cta": "Start Your Business",
    "hero.demo": "Watch Demo",
    "hero.nocard": "No credit card required",
    "hero.age": "18+ verification",
    "hero.gdpr": "GDPR compliant",
    "hero.welcome": "Welcome back",
    "hero.dashboard": "Your Dashboard",
    "hero.live": "Live",
    "hero.revenue": "Monthly Revenue",
    "hero.vs": "+12.5% vs last month",
    "hero.eco": "Eco Points",
    "hero.redeem": "Redeem rewards",
    "hero.trustscore": "Trust Score",
    "hero.excellent": "Excellent",
    "hero.neworder": "New Order",
    "hero.justnow": "Just now",

    // Features
    "features.badge": "Platform Features",
    "features.title1": "Everything You Need to",
    "features.title2": "Succeed",
    "features.desc": "Brand-In-A-Box is more than a marketplace—it's a complete business operating system designed to help you launch, scale, and protect your online business.",
    "features.multiboutique.title": "Multi-Boutique Management",
    "features.multiboutique.desc": "Create and manage multiple boutiques with custom branding. Activate features like video ads, recycling programs, and advanced analytics per store.",
    "features.intelligence.title": "Product Intelligence",
    "features.intelligence.desc": "Explainable AI recommendations with clear reasoning: market demand, competition levels, and environmental impact—no black-box scoring.",
    "features.trust.title": "Trust & Compliance",
    "features.trust.desc": "Built-in compliance visibility, age verification, supplier audits, and transparent Trustpilot integration. Your reputation, protected.",
    "features.recycling.title": "Recycling & Loyalty",
    "features.recycling.desc": "Customers scan packaging to earn points. Visible environmental impact stats and rewards system that builds lasting loyalty.",
    "features.multimarket.title": "Multi-Market Ready",
    "features.multimarket.desc": "Launch across EU, UAE, Africa and beyond. Multi-currency, multi-language, with market-specific compliance built in.",
    "features.support.title": "Pôle 12 Support",
    "features.support.desc": "Integrated support with contextual alerts, personalized recommendations, and prevention emails for risks, stock, and compliance.",

    // How it works
    "how.badge": "Getting Started",
    "how.title1": "Your Journey to",
    "how.title2": "Success",
    "how.desc": "From account creation to scaling your business—Brand-In-A-Box guides you every step of the way with transparency and support.",
    "how.step1.title": "Create Your Account",
    "how.step1.desc": "Sign up with email verification and age confirmation (18+). Choose your business profile type and select your target markets.",
    "how.step2.title": "Launch Your Boutique",
    "how.step2.desc": "Create your first boutique, customize branding, and choose your category. Activate features like video ads and recycling programs.",
    "how.step3.title": "Select & Configure Products",
    "how.step3.desc": "Browse Brand-In-A-Box-validated products with transparent demand indicators, supplier ratings, and margin visibility. Add video content for authenticity.",
    "how.step4.title": "Scale with Confidence",
    "how.step4.desc": "Track performance in your dashboard, leverage product intelligence, and grow with compliance and support built-in from day one.",

    // Trust
    "trust.badge": "Trust & Security",
    "trust.title1": "Protected.",
    "trust.title2": "Empowered.",
    "trust.desc": "Brand-In-A-Box is built on transparency and trust. Every feature is designed to protect your business, guide your decisions, and hold everyone—including us—accountable.",
    "trust.uptime": "Uptime SLA",
    "trust.encryption": "Encryption",
    "trust.monitoring": "Monitoring",
    "trust.supplier.title": "Supplier Validation",
    "trust.supplier.desc": "Every supplier undergoes rigorous audits with visible validation status and audit badges.",
    "trust.transparency.title": "Full Transparency",
    "trust.transparency.desc": "See demand indicators, competition levels, and environmental impact—no hidden algorithms.",
    "trust.data.title": "Data Protection",
    "trust.data.desc": "GDPR compliant with enterprise-grade security. Your business data is encrypted and protected.",
    "trust.compliance.title": "Compliance Built-In",
    "trust.compliance.desc": "Market-specific legal requirements, packaging rules, and seller responsibilities—always visible.",
    "trust.trustpilot.title": "Trustpilot Integration",
    "trust.trustpilot.desc": "Transparent customer reviews displayed and used for analytics. Build real reputation.",
    "trust.fair.title": "Fair & Accountable",
    "trust.fair.desc": "Clear terms, visible fees, and no hidden costs. Brand-In-A-Box grows with you, not on your back.",

    // CTA
    "cta.badge": "Start your journey today",
    "cta.title": "Ready to Build Your Business Empire?",
    "cta.desc": "Join thousands of entrepreneurs who trust Brand-In-A-Box to launch, scale, and protect their online business. No credit card required.",
    "cta.button": "Create Free Account",
    "cta.sales": "Talk to Sales",
    "cta.free": "✓ Free to start",
    "cta.nofees": "✓ No hidden fees",
    "cta.cancel": "✓ Cancel anytime",
    "cta.age": "✓ 18+ only",

    // Footer
    "footer.desc": "The intelligent commerce platform that empowers entrepreneurs to build, scale, and secure their online business.",
    "footer.product": "Product",
    "footer.features": "Features",
    "footer.dashboard": "Dashboard",
    "footer.intelligence": "Product Intelligence",
    "footer.recycling": "Recycling Program",
    "footer.pricing": "Pricing",
    "footer.company": "Company",
    "footer.about": "About Us",
    "footer.careers": "Careers",
    "footer.press": "Press",
    "footer.partners": "Partners",
    "footer.contact": "Contact",
    "footer.resources": "Resources",
    "footer.help": "Help Center",
    "footer.docs": "Documentation",
    "footer.academy": "Seller Academy",
    "footer.webinars": "Webinars",
    "footer.blog": "Blog",
    "footer.legal": "Legal",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.cookies": "Cookie Policy",
    "footer.compliance": "Compliance",
    "footer.gdpr": "GDPR",
    "footer.ssl": "SSL Secured",
    "footer.multimarket": "Multi-Market",
    "footer.rights": "All rights reserved.",

    // Login
    "login.title": "Welcome back",
    "login.desc": "Enter your credentials to access your seller dashboard",
    "login.email": "Email",
    "login.password": "Password",
    "login.forgot": "Forgot password?",
    "login.submit": "Sign In",
    "login.noaccount": "Don't have an account?",
    "login.create": "Create one",
    "login.branding.title": "Grow your business with Brand-In-A-Box",
    "login.branding.1": "Access your complete seller dashboard",
    "login.branding.2": "Track revenue, orders, and stock in real-time",
    "login.branding.3": "Manage multiple boutiques from one place",
    "login.branding.4": "Secure and compliant platform",
    "login.security.title": "Enterprise-grade security",
    "login.security.desc": "Your data is protected with industry-leading encryption",

    // Signup
    "signup.title": "Create your account",
    "signup.desc": "Start your seller journey with Brand-In-A-Box",
    "signup.fullname": "Full Name",
    "signup.email": "Email",
    "signup.password": "Password",
    "signup.confirm": "Confirm Password",
    "signup.minchars": "Minimum 8 characters",
    "signup.age": "I confirm that I am 18 years or older",
    "signup.terms1": "I agree to the",
    "signup.termslink": "Terms of Service",
    "signup.and": "and",
    "signup.privacylink": "Privacy Policy",
    "signup.submit": "Create Account",
    "signup.hasaccount": "Already have an account?",
    "signup.signin": "Sign in",
    "signup.branding.title": "Start selling with Brand-In-A-Box today",
    "signup.branding.desc": "Join thousands of entrepreneurs who trust Brand-In-A-Box to grow their online business.",
    "signup.multiboutique": "Multi-Boutique",
    "signup.multiboutique.desc": "Manage multiple stores",
    "signup.analytics": "Analytics",
    "signup.analytics.desc": "Real-time insights",
    "signup.secure": "Secure",
    "signup.secure.desc": "Enterprise security",
    "signup.sustainable": "Sustainable",
    "signup.sustainable.desc": "Eco-friendly platform",
    "signup.social": "sellers already trust Brand-In-A-Box",
    "signup.passwordmismatch": "Passwords do not match",
    "signup.passwordshort": "Password must be at least 8 characters",
    "signup.acceptterms": "You must accept the terms and conditions",
    "signup.ageconfirm": "You must be 18 or older to create an account",

    // Forgot Password
    "forgot.title": "Forgot password",
    "forgot.desc": "Enter your email to receive a reset link",
    "forgot.sent": "Email sent!",
    "forgot.sentdesc": "If an account exists with",
    "forgot.sentdesc2": ", you will receive a reset link.",
    "forgot.send": "Send reset link",
    "forgot.back": "Back to login",

    // Reset Password
    "reset.title": "New password",
    "reset.desc": "Choose a new password for your account",
    "reset.new": "New password",
    "reset.confirm": "Confirm password",
    "reset.submit": "Reset password",
    "reset.success": "Password updated!",
    "reset.redirect": "You will be redirected to login...",
    "reset.errorMin": "Password must be at least 6 characters",
    "reset.errorMatch": "Passwords do not match",
    "reset.notoken": "This link seems invalid or expired. Please request a new reset link.",

    // Auth errors
    "auth.error.network": "Network connection error. Check your internet connection and try again.",
    "auth.error.invalid": "Incorrect email or password",
    "auth.error.generic": "An error occurred. Please try again.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("linksy-lang");
    return (saved === "en" ? "en" : "fr") as Lang;
  });

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("linksy-lang", newLang);
  };

  const t = (key: string) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
