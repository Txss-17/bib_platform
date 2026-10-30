import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { isPublicPrelaunchHost } from "@/lib/publicPrelaunch";
import { CartProvider } from "@/contexts/CartContext";
import { StoreCartProvider } from "@/contexts/StoreCartContext";
import SuppliersOnboarding from "@/pages/SuppliersOnboarding";
import OpsOnboarding from "@/pages/OpsOnboarding";

/* =====================================================
   PUBLIC / AUTHENTICATION
===================================================== */

const Index = lazy(() => import("@/pages/Index"));
const Vendre = lazy(() => import("@/pages/Vendre"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const StoreLogin = lazy(() => import("@/pages/StoreLogin"));
const StoreSignup = lazy(() => import("@/pages/StoreSignup"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

/* =====================================================
   GENERAL / BIB STORE
===================================================== */

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Tarifs = lazy(() => import("@/pages/Tarifs"));
const CheckoutReturn = lazy(() => import("@/pages/CheckoutReturn"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const BrandPreview = lazy(() => import("@/pages/BrandPreview"));

const Store = lazy(() => import("@/pages/Store"));
const StoreBoutique = lazy(() => import("@/pages/StoreBoutique"));
const StoreCatalog = lazy(() => import("@/pages/StoreCatalog"));
const StoreCart = lazy(() => import("@/pages/StoreCart"));
const StoreSubscriberAccount = lazy(
  () => import("@/pages/StoreSubscriberAccount"),
);
const StoreSubscriberFavorites = lazy(
  () => import("@/pages/StoreSubscriberFavorites"),
);
const StoreSubscriberOrders = lazy(
  () => import("@/pages/StoreSubscriberOrders"),
);
const StoreSubscriberSubscribe = lazy(
  () => import("@/pages/StoreSubscriberSubscribe"),
);

const Unsubscribe = lazy(() => import("@/pages/Unsubscribe"));
const StoreProduct = lazy(() => import("@/pages/StoreProduct"));
import StoreSubscriberLayout from "@/components/StoreSubscriberLayout";

/* =====================================================
   SUPPLIERS / OPERATIONS
===================================================== */

const Suppliers = lazy(() => import("@/pages/Suppliers"));
const SuppliersApply = lazy(() => import("@/pages/SuppliersApply"));
const Ops = lazy(() => import("@/pages/Ops"));
const OpsApply = lazy(() => import("@/pages/OpsApply"));
const PartnerOnboardingResume = lazy(
  () => import("@/pages/PartnerOnboardingResume"),
);
const PartnerOnboardingPortal = lazy(
  () => import("@/pages/PartnerOnboardingPortal"),
);

import { suppliersOnboardingConfig } from "@/pages/SuppliersOnboarding";

import { opsOnboardingConfig } from "@/pages/OpsOnboarding";

const SuppliersPortal = lazy(() => import("@/pages/SuppliersPortal"));
const OpsPortal = lazy(() => import("@/pages/OpsPortal"));

/* =====================================================
   BIB TALENT
===================================================== */

const BibTalent = lazy(() => import("@/pages/BibTalent"));

/* =====================================================
   DASHBOARD
===================================================== */

const Ventes = lazy(() => import("@/pages/dashboard/Ventes"));
const Commandes = lazy(() => import("@/pages/dashboard/Commandes"));
const Produits = lazy(() => import("@/pages/dashboard/Produits"));
const ProduitsFournisseurs = lazy(
  () => import("@/pages/dashboard/ProduitsFournisseurs"),
);
const Paiements = lazy(() => import("@/pages/dashboard/Paiements"));
const SEOAnalytics = lazy(() => import("@/pages/dashboard/SEOAnalytics"));
const Boutiques = lazy(() => import("@/pages/dashboard/Boutiques"));
const BoutiqueCreate = lazy(() => import("@/pages/dashboard/BoutiqueCreate"));
const BoutiqueEdit = lazy(() => import("@/pages/dashboard/BoutiqueEdit"));
const BoutiqueAnalytics = lazy(
  () => import("@/pages/dashboard/BoutiqueAnalytics"),
);
const Parametres = lazy(() => import("@/pages/dashboard/Parametres"));
const Aide = lazy(() => import("@/pages/dashboard/Aide"));
const RelancesOnboarding = lazy(
  () => import("@/pages/dashboard/RelancesOnboarding"),
);
const MesTickets = lazy(() => import("@/pages/dashboard/MesTickets"));
const AdminDocuments = lazy(() => import("@/pages/dashboard/AdminDocuments"));
const Equipe = lazy(() => import("@/pages/dashboard/Equipe"));
const Clients = lazy(() => import("@/pages/dashboard/Clients"));
const Marketing = lazy(() => import("@/pages/dashboard/Marketing"));
const VentesPrivees = lazy(() => import("@/pages/dashboard/VentesPrivees"));
const VentesPriveesPOS = lazy(
  () => import("@/pages/dashboard/VentesPriveesPOS"),
);
const BoutiqueCustomPage = lazy(
  () => import("@/pages/dashboard/BoutiqueCustomPage"),
);
const MonProfil = lazy(() => import("@/pages/dashboard/MonProfil"));
const Personnalisation = lazy(
  () => import("@/pages/dashboard/Personnalisation"),
);

/* =====================================================
   PUBLIC BOUTIQUE — REAL COMMERCE
===================================================== */

const BoutiquePublic = lazy(() => import("@/pages/BoutiquePublic"));
const BoutiqueAllProducts = lazy(() => import("@/pages/BoutiqueAllProducts"));
const BoutiqueCategory = lazy(() => import("@/pages/BoutiqueCategory"));
const ProductPublic = lazy(() => import("@/pages/ProductPublic"));
const OrderTracking = lazy(() => import("@/pages/OrderTracking"));
const BoutiqueFAQPage = lazy(() => import("@/pages/BoutiqueFAQPage"));
const BoutiqueCGVPage = lazy(() => import("@/pages/BoutiqueCGVPage"));
const BoutiqueCGUPage = lazy(() => import("@/pages/BoutiqueCGUPage"));
const BoutiqueAboutPage = lazy(() => import("@/pages/BoutiqueAboutPage"));

/* =====================================================
   INSTITUTIONAL / MARKETING
===================================================== */

const Carrieres = lazy(() => import("@/pages/Carrieres"));
const CarrieresPostes = lazy(() => import("@/pages/CarrieresPostes"));
const APropos = lazy(() => import("@/pages/APropos"));
const CentreAide = lazy(() => import("@/pages/CentreAide"));
const CentreAideFaq = lazy(() => import("@/pages/CentreAideFaq"));
const CentreAideGuide = lazy(() => import("@/pages/CentreAideGuide"));
const PackLegal = lazy(() => import("@/pages/PackLegal"));

/* =====================================================
   LEGAL
===================================================== */

const MentionsLegales = lazy(() =>
  import("@/pages/LegalPages").then((module) => ({
    default: module.MentionsLegales,
  })),
);
const CGU = lazy(() =>
  import("@/pages/LegalPages").then((module) => ({
    default: module.CGU,
  })),
);
const CGV = lazy(() =>
  import("@/pages/LegalPages").then((module) => ({
    default: module.CGV,
  })),
);
const Confidentialite = lazy(() =>
  import("@/pages/LegalPages").then((module) => ({
    default: module.Confidentialite,
  })),
);
const Cookies = lazy(() =>
  import("@/pages/LegalPages").then((module) => ({
    default: module.Cookies,
  })),
);

/* =====================================================
   QUERY CLIENT
===================================================== */

const queryClient = new QueryClient();

/* =====================================================
   ROOT HOST ROUTING
===================================================== */

function RootPage() {
  if (typeof window === "undefined") {
    return <Index />;
  }

  const host = window.location.hostname;

  if (host.startsWith("pack-legal.")) {
    return <PackLegal />;
  }

  if (host.startsWith("carrieres.")) {
    return <Carrieres />;
  }

  if (host.startsWith("tarifs.")) {
    return <Tarifs />;
  }

  if (host.startsWith("logistics.") || host.startsWith("logistique.")) {
    return <Ops />;
  }

  return <Index />;
}

/* =====================================================
   PARTNER PORTAL ROUTING
===================================================== */

function PartnerPortalRoute({ portal }: { portal: "suppliers" | "ops" }) {
  const { token = "" } = useParams();

  const config =
    portal === "suppliers" ? suppliersOnboardingConfig : opsOnboardingConfig;

  return (
    <PartnerOnboardingPortal portal={portal} token={token} config={config} />
  );
}

/* =====================================================
   APPLICATION
===================================================== */

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <LanguageProvider>
            <Toaster />
            <Sonner />
            <AuthProvider>
              <StoreCartProvider>
                <Suspense
                  fallback={
                    <div
                      className="min-h-screen bg-background"
                      aria-busy="true"
                    />
                  }
                >
                  {typeof window !== "undefined" && isPublicPrelaunchHost(window.location.hostname) ? (
                    <Routes>
                      <Route path="/" element={<Navigate to="/carrieres/talent" replace />} />
                      <Route path="/carrieres/talent" element={<BibTalent />} />
                      <Route path="/bib-talent" element={<Navigate to="/carrieres/talent" replace />} />
                      <Route path="/mentions-legales" element={<MentionsLegales />} />
                      <Route path="/confidentialite" element={<Confidentialite />} />
                      <Route path="/cookies" element={<Cookies />} />
                      <Route path="*" element={<Navigate to="/carrieres/talent" replace />} />
                    </Routes>
                  ) : (
                  <Routes>
                    {/* =================================================
                      ROOT / PUBLIC
                  ================================================= */}

                    <Route path="/" element={<RootPage />} />

                    <Route path="/landing" element={<Index />} />

                    <Route path="/vendre" element={<Vendre />} />

                    <Route path="/tarifs" element={<Tarifs />} />

                    <Route path="/pricing" element={<Tarifs />} />

                    {/* =================================================
                      SUPPLIERS
                  ================================================= */}

                    <Route
                      path="/suppliers/tarifs"
                      element={<Navigate to="/suppliers#tarifs" replace />}
                    />

                    <Route
                      path="/fournisseurs/tarifs"
                      element={<Navigate to="/suppliers#tarifs" replace />}
                    />

                    <Route
                      path="/suppliers/pricing"
                      element={<Navigate to="/suppliers#tarifs" replace />}
                    />

                    <Route path="/suppliers" element={<Suppliers />} />

                    <Route path="/fournisseurs" element={<Suppliers />} />

                    <Route
                      path="/suppliers/apply"
                      element={<SuppliersApply />}
                    />

                    <Route
                      path="/fournisseurs/candidature"
                      element={<SuppliersApply />}
                    />

                    <Route
                      path="/suppliers/onboarding"
                      element={<SuppliersOnboarding />}
                    />

                    <Route
                      path="/suppliers/reprendre"
                      element={
                        <Navigate
                          to="/suppliers/resume?portal=suppliers"
                          replace
                        />
                      }
                    />

                    <Route
                      path="/suppliers/onboarding/resume"
                      element={
                        <Navigate
                          to="/suppliers/resume?portal=suppliers"
                          replace
                        />
                      }
                    />

                    <Route
                      path="/suppliers/resume"
                      element={<PartnerOnboardingResume />}
                    />

                    <Route
                      path="/suppliers/portal"
                      element={<SuppliersPortal />}
                    />

                    <Route
                      path="/suppliers/portal/:token"
                      element={<PartnerPortalRoute portal="suppliers" />}
                    />

                    {/* =================================================
                      OPERATIONS / LOGISTICS
                  ================================================= */}

                    <Route path="/ops" element={<Ops />} />

                    <Route path="/logistics" element={<Ops />} />

                    <Route path="/logistique" element={<Ops />} />

                    <Route path="/ops/apply" element={<OpsApply />} />

                    <Route path="/ops/candidature" element={<OpsApply />} />

                    <Route path="/logistics/apply" element={<OpsApply />} />

                    <Route
                      path="/logistique/candidature"
                      element={<OpsApply />}
                    />

                    <Route path="/ops/onboarding" element={<OpsOnboarding />} />

                    <Route
                      path="/ops/reprendre"
                      element={<Navigate to="/ops/resume?portal=ops" replace />}
                    />

                    <Route
                      path="/ops/onboarding/resume"
                      element={<Navigate to="/ops/resume?portal=ops" replace />}
                    />

                    <Route
                      path="/ops/resume"
                      element={<PartnerOnboardingResume />}
                    />

                    <Route path="/ops/portal" element={<OpsPortal />} />

                    <Route
                      path="/ops/portal/:token"
                      element={<PartnerPortalRoute portal="ops" />}
                    />

                    {/* =================================================
                      BIB STORE — DISCOVERY
                  ================================================= */}

                    <Route path="/store" element={<Store />} />

                    <Route
                      path="/store/boutique/:slug"
                      element={<StoreBoutique />}
                    />

                    <Route path="/store/products" element={<StoreCatalog />} />

                    <Route
                      path="/store/product/:productId"
                      element={<StoreProduct />}
                    />

                    {/* =================================================
                      LEGACY BIB STORE CART

                      Conservé temporairement pendant la migration.
                  ================================================= */}

                    <Route
                      path="/store/cart"
                      element={
                        <CartProvider>
                          <StoreCart />
                        </CartProvider>
                      }
                    />

                    {/* =================================================
                      STORE CUSTOMER AUTHENTICATION
                  ================================================= */}

                    <Route path="/store/login" element={<StoreLogin />} />

                    <Route path="/store/signup" element={<StoreSignup />} />

                    {/* =================================================
                      BIB ABONNÉ — ACTIVATION / PAYMENT
                  ================================================= */}

                    <Route
                      path="/store/subscribe"
                      element={
                        <ProtectedRoute context="store">
                          <StoreSubscriberSubscribe />
                        </ProtectedRoute>
                      }
                    />

                    {/* =================================================
                      BIB ABONNÉ — CUSTOMER AREA

                      Ces routes nécessitent :
                      1. un utilisateur authentifié
                      2. un compte de type store

                      Le statut BIB Abonné reste vérifié
                      au niveau des pages/hooks concernés.
                  ================================================= */}

                    <Route
                      element={
                        <ProtectedRoute context="store">
                          <StoreSubscriberLayout />
                        </ProtectedRoute>
                      }
                    >
                      <Route
                        path="/store/account"
                        element={<StoreSubscriberAccount />}
                      />

                      <Route
                        path="/store/favorites"
                        element={<StoreSubscriberFavorites />}
                      />

                      <Route
                        path="/store/orders"
                        element={<StoreSubscriberOrders />}
                      />
                    </Route>

                    {/* =================================================
                      AUTHENTICATION — PLATFORM
                  ================================================= */}

                    <Route path="/login" element={<Login />} />

                    <Route path="/signup" element={<Signup />} />

                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />

                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* =================================================
                      GENERAL
                  ================================================= */}

                    <Route
                      path="/checkout/return"
                      element={<CheckoutReturn />}
                    />

                    <Route path="/brand-preview" element={<BrandPreview />} />

                    <Route path="/order-tracking" element={<OrderTracking />} />

                    <Route
                      path="/suivi-commande"
                      element={<Navigate to="/order-tracking" replace />}
                    />

                    <Route path="/unsubscribe" element={<Unsubscribe />} />

                    {/* =================================================
                      STORE — CUSTOMER FEATURES
                  ================================================= */}

                    {/* =================================================
                      DASHBOARD
                  ================================================= */}

                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/ventes"
                      element={
                        <ProtectedRoute>
                          <Ventes />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/commandes"
                      element={
                        <ProtectedRoute>
                          <Commandes />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/produits"
                      element={
                        <ProtectedRoute>
                          <Produits />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/produits-fournisseurs"
                      element={
                        <ProtectedRoute>
                          <ProduitsFournisseurs />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/paiements"
                      element={
                        <ProtectedRoute>
                          <Paiements />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/seo-analytics"
                      element={
                        <ProtectedRoute>
                          <SEOAnalytics />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/boutiques"
                      element={
                        <ProtectedRoute>
                          <Boutiques />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/boutiques/create"
                      element={
                        <ProtectedRoute>
                          <BoutiqueCreate />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/boutiques/:id/edit"
                      element={
                        <ProtectedRoute>
                          <BoutiqueEdit />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/boutiques/:id/analytics"
                      element={
                        <ProtectedRoute>
                          <BoutiqueAnalytics />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/parametres"
                      element={
                        <ProtectedRoute>
                          <Parametres />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/aide"
                      element={
                        <ProtectedRoute>
                          <Aide />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/relances-onboarding"
                      element={
                        <ProtectedRoute>
                          <RelancesOnboarding />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/parametres/relances"
                      element={
                        <Navigate to="/dashboard/relances-onboarding" replace />
                      }
                    />

                    <Route
                      path="/dashboard/tickets"
                      element={
                        <ProtectedRoute>
                          <MesTickets />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/admin/documents"
                      element={
                        <ProtectedRoute>
                          <AdminDocuments />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/equipe"
                      element={
                        <ProtectedRoute>
                          <Equipe />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/clients"
                      element={
                        <ProtectedRoute>
                          <Clients />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/marketing"
                      element={
                        <ProtectedRoute>
                          <Marketing />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/ventes-privees"
                      element={
                        <ProtectedRoute>
                          <VentesPrivees />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/ventes-privees/:id/pos"
                      element={
                        <ProtectedRoute>
                          <VentesPriveesPOS />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/boutique/:slug/page/:pageSlug"
                      element={<BoutiqueCustomPage />}
                    />

                    <Route
                      path="/boutique/:slug/p/:pageSlug"
                      element={<BoutiqueCustomPage />}
                    />

                    <Route
                      path="/dashboard/boutique/:id"
                      element={<LegacyBoutiqueEditRedirect />}
                    />

                    <Route
                      path="/dashboard/profil"
                      element={
                        <ProtectedRoute>
                          <MonProfil />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/dashboard/personnalisation"
                      element={
                        <ProtectedRoute>
                          <Personnalisation />
                        </ProtectedRoute>
                      }
                    />

                    {/* =================================================
                      PUBLIC BOUTIQUE — REAL COMMERCE
                  ================================================= */}

                    <Route
                      path="/boutique/:slug"
                      element={
                        <CartProvider>
                          <BoutiquePublic />
                        </CartProvider>
                      }
                    />

                    <Route
                      path="/boutique/:slug/products"
                      element={
                        <CartProvider>
                          <BoutiqueAllProducts />
                        </CartProvider>
                      }
                    />

                    <Route
                      path="/boutique/:slug/category/:category"
                      element={
                        <CartProvider>
                          <BoutiqueCategory />
                        </CartProvider>
                      }
                    />

                    <Route
                      path="/boutique/:slug/product/:productId"
                      element={
                        <CartProvider>
                          <ProductPublic />
                        </CartProvider>
                      }
                    />

                    <Route
                      path="/boutique/:slug/order-tracking"
                      element={<OrderTracking />}
                    />

                    <Route
                      path="/boutique/:slug/faq"
                      element={<BoutiqueFAQPage />}
                    />

                    <Route
                      path="/boutique/:slug/cgv"
                      element={<BoutiqueCGVPage />}
                    />

                    <Route
                      path="/boutique/:slug/cgu"
                      element={<BoutiqueCGUPage />}
                    />

                    <Route
                      path="/boutique/:slug/about"
                      element={<BoutiqueAboutPage />}
                    />

                    {/* =================================================
                      CAREERS / BIB TALENT
                  ================================================= */}

                    <Route path="/carrieres" element={<Carrieres />} />

                    <Route
                      path="/carrieres/postes"
                      element={<CarrieresPostes />}
                    />

                    <Route path="/carrieres/talent" element={<BibTalent />} />

                    <Route
                      path="/bib-talent"
                      element={<Navigate to="/carrieres/talent" replace />}
                    />

                    {/* =================================================
                      INSTITUTIONAL / HELP
                  ================================================= */}

                    <Route path="/a-propos" element={<APropos />} />

                    <Route path="/centre-aide" element={<CentreAide />} />

                    <Route
                      path="/centre-aide/faq"
                      element={<CentreAideFaq />}
                    />

                    <Route
                      path="/centre-aide/guide"
                      element={<CentreAideGuide />}
                    />

                    <Route path="/help" element={<CentreAide />} />

                    <Route path="/help/faq" element={<CentreAideFaq />} />

                    <Route path="/help/guide" element={<CentreAideGuide />} />

                    <Route path="/pack-legal" element={<PackLegal />} />

                    <Route path="/legal" element={<PackLegal />} />

                    {/* =================================================
                      LEGAL
                  ================================================= */}

                    <Route
                      path="/mentions-legales"
                      element={<MentionsLegales />}
                    />

                    <Route path="/cgu" element={<CGU />} />

                    <Route path="/cgv" element={<CGV />} />

                    <Route
                      path="/terms"
                      element={<Navigate to="/cgu" replace />}
                    />

                    <Route
                      path="/confidentialite"
                      element={<Confidentialite />}
                    />

                    <Route
                      path="/privacy"
                      element={<Navigate to="/confidentialite" replace />}
                    />

                    <Route path="/cookies" element={<Cookies />} />

                    {/* =================================================
                      CAREERS ALIASES
                  ================================================= */}

                    <Route path="/careers" element={<Carrieres />} />

                    <Route path="/careers/jobs" element={<CarrieresPostes />} />

                    {/* =================================================
                      FALLBACK
                  ================================================= */}

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  )}
                </Suspense>
              </StoreCartProvider>
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function LegacyBoutiqueEditRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/dashboard/boutiques/${id}/edit` : "/dashboard/boutiques"} replace />;
}
