import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CartProvider } from "@/contexts/CartContext";

// ============================================================
// PUBLIC / AUTHENTICATION
// ============================================================

import Index from "./pages/Index";
import Vendre from "./pages/Vendre";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MarketplaceLogin from "./pages/MarketplaceLogin";
import MarketplaceSignup from "./pages/MarketplaceSignup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ============================================================
// GENERAL PAGES
// ============================================================

import Dashboard from "./pages/Dashboard";
import Tarifs from "./pages/Tarifs";
import CheckoutReturn from "./pages/CheckoutReturn";
import NotFound from "./pages/NotFound";
import BrandPreview from "./pages/BrandPreview";
import Marketplace from "./pages/Marketplace";
import StoreProduct from "./pages/StoreProduct";
import Recycler from "./pages/customer/Recycler";
import Unsubscribe from "./pages/Unsubscribe";

// ============================================================
// SUPPLIERS / OPERATIONS
// ============================================================

import Suppliers from "./pages/Suppliers";
import SuppliersApply from "./pages/SuppliersApply";
import Ops from "./pages/Ops";
import OpsApply from "./pages/OpsApply";
import SuppliersOnboarding from "./pages/SuppliersOnboarding";
import OpsOnboarding from "./pages/OpsOnboarding";
import PartnerOnboardingResume from "./pages/PartnerOnboardingResume";
import PartnerOnboardingPortal from "./pages/PartnerOnboardingPortal";
import SuppliersPortal from "./pages/SuppliersPortal";
import OpsPortal from "./pages/OpsPortal";

// ============================================================
// BIB TALENT
// ============================================================

import BibTalent from "./pages/BibTalent";

// ============================================================
// DASHBOARD PAGES
// ============================================================

import Ventes from "./pages/dashboard/Ventes";
import Commandes from "./pages/dashboard/Commandes";
import Produits from "./pages/dashboard/Produits";
import ProduitsFournisseurs from "./pages/dashboard/ProduitsFournisseurs";
import Paiements from "./pages/dashboard/Paiements";
import SEOAnalytics from "./pages/dashboard/SEOAnalytics";
import Boutiques from "./pages/dashboard/Boutiques";
import BoutiqueCreate from "./pages/dashboard/BoutiqueCreate";
import BoutiqueEdit from "./pages/dashboard/BoutiqueEdit";
import BoutiqueAnalytics from "./pages/dashboard/BoutiqueAnalytics";
import Parametres from "./pages/dashboard/Parametres";
import Aide from "./pages/dashboard/Aide";
import RelancesOnboarding from "./pages/dashboard/RelancesOnboarding";
import MesTickets from "./pages/dashboard/MesTickets";
import AdminDocuments from "./pages/dashboard/AdminDocuments";
import Equipe from "./pages/dashboard/Equipe";
import Clients from "./pages/dashboard/Clients";
import Marketing from "./pages/dashboard/Marketing";
import VentesPrivees from "./pages/dashboard/VentesPrivees";
import VentesPriveesPOS from "./pages/dashboard/VentesPriveesPOS";

// ============================================================
// PUBLIC BOUTIQUE
// ============================================================

import BoutiquePublic from "./pages/BoutiquePublic";
import BoutiqueAllProducts from "./pages/BoutiqueAllProducts";
import BoutiqueCategory from "./pages/BoutiqueCategory";
import ProductPublic from "./pages/ProductPublic";
import OrderTracking from "./pages/OrderTracking";
import BoutiqueFAQPage from "./pages/BoutiqueFAQPage";
import {
  BoutiqueCGVPage,
  BoutiqueCGUPage,
  BoutiqueAboutPage,
} from "./pages/BoutiqueLegalPages";
import BoutiqueCustomPage from "./pages/BoutiqueCustomPage";

// ============================================================
// MARKETING / INFORMATION
// ============================================================

import Carrieres from "./pages/Carrieres";
import CarrieresPostes from "./pages/CarrieresPostes";
import APropos from "./pages/APropos";
import CentreAide from "./pages/CentreAide";
import CentreAideFaq from "./pages/CentreAideFaq";
import CentreAideGuide from "./pages/CentreAideGuide";
import PackLegal from "./pages/PackLegal";

import {
  MentionsLegales,
  CGU,
  Confidentialite,
  Cookies,
} from "./pages/LegalPages";

// ============================================================
// QUERY CLIENT
// ============================================================

const queryClient = new QueryClient();

// ============================================================
// APP
// ============================================================

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <LanguageProvider>
          <AuthProvider>
            <Routes>

              {/* =====================================================
                  PUBLIC ROOT
              ===================================================== */}

              <Route
                path="/"
                element={
                  (() => {
                    if (typeof window === "undefined") {
                      return <Index />;
                    }

                    const host =
                      window.location.hostname;

                    if (
                      host.startsWith("pack-legal.")
                    ) {
                      return <PackLegal />;
                    }

                    if (
                      host.startsWith("carrieres.")
                    ) {
                      return <Carrieres />;
                    }

                    if (
                      host.startsWith("tarifs.")
                    ) {
                      return <Tarifs />;
                    }

                    if (
                      host.startsWith("logistics.") ||
                      host.startsWith("logistique.")
                    ) {
                      return <Ops />;
                    }

                    return <Index />;
                  })()
                }
              />

              <Route
                path="/landing"
                element={<Index />}
              />

              <Route
                path="/vendre"
                element={<Vendre />}
              />

              <Route
                path="/tarifs"
                element={<Tarifs />}
              />

              <Route
                path="/pricing"
                element={<Tarifs />}
              />

              {/* =====================================================
                  SUPPLIERS / OPERATIONS
              ===================================================== */}

              <Route
                path="/suppliers/tarifs"
                element={
                  <Navigate
                    to="/suppliers#tarifs"
                    replace
                  />
                }
              />

              <Route
                path="/fournisseurs/tarifs"
                element={
                  <Navigate
                    to="/suppliers#tarifs"
                    replace
                  />
                }
              />

              <Route
                path="/suppliers/pricing"
                element={
                  <Navigate
                    to="/suppliers#tarifs"
                    replace
                  }
                }
              />

              <Route
                path="/suppliers"
                element={<Suppliers />}
              />

              <Route
                path="/fournisseurs"
                element={<Suppliers />}
              />

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
                path="/fournisseurs/onboarding"
                element={<SuppliersOnboarding />}
              />

              <Route
                path="/ops"
                element={<Ops />}
              />

              <Route
                path="/logistics"
                element={<Ops />}
              />

              <Route
                path="/logistique"
                element={<Ops />}
              />

              <Route
                path="/ops/apply"
                element={<OpsApply />}
              />

              <Route
                path="/logistique/candidature"
                element={<OpsApply />}
              />

              <Route
                path="/ops/onboarding"
                element={<OpsOnboarding />}
              />

              <Route
                path="/logistique/onboarding"
                element={<OpsOnboarding />}
              />

              <Route
                path="/suppliers/onboarding/resume"
                element={<PartnerOnboardingResume />}
              />

              <Route
                path="/fournisseurs/onboarding/reprendre"
                element={<PartnerOnboardingResume />}
              />

              <Route
                path="/ops/onboarding/resume"
                element={<PartnerOnboardingResume />}
              />

              <Route
                path="/logistique/onboarding/reprendre"
                element={<PartnerOnboardingResume />}
              />

              <Route
                path="/portal/onboarding/:token"
                element={<PartnerOnboardingPortal />}
              />

              <Route
                path="/suppliers/portal/:token"
                element={<SuppliersPortal />}
              />

              <Route
                path="/fournisseurs/portail/:token"
                element={<SuppliersPortal />}
              />

              <Route
                path="/ops/portal/:token"
                element={<OpsPortal />}
              />

              <Route
                path="/logistique/portail/:token"
                element={<OpsPortal />}
              />

              {/* =====================================================
                  BIB STORE
              ===================================================== */}

              {/* Accueil du Store */}

              <Route
                path="/store"
                element={<Marketplace />}
              />

              {/* Recherche / catalogue produits */}

              <Route
                path="/store/products"
                element={<Marketplace />}
              />

              {/* Page produit publique BIB */}

              <Route
                path="/store/product/:productId"
                element={<StoreProduct />}
              />

              {/* Ancienne URL marketplace
                  conservée uniquement pour compatibilité */}

              <Route
                path="/marketplace"
                element={
                  <Navigate
                    to="/store"
                    replace
                  />
                }
              />

              {/* =====================================================
                  STORE CUSTOMER AUTHENTICATION
              ===================================================== */}

              <Route
                path="/store/login"
                element={<MarketplaceLogin />}
              />

              <Route
                path="/store/signup"
                element={<MarketplaceSignup />}
              />

              {/* =====================================================
                  PLATFORM AUTHENTICATION
              ===================================================== */}

              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/signup"
                element={<Signup />}
              />

              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
              />

              <Route
                path="/reset-password"
                element={<ResetPassword />}
              />

              {/* =====================================================
                  STORE / CUSTOMER PUBLIC ROUTES
              ===================================================== */}

              <Route
                path="/checkout/return"
                element={<CheckoutReturn />}
              />

              <Route
                path="/brand-preview"
                element={<BrandPreview />}
              />

              <Route
                path="/order-tracking"
                element={<OrderTracking />}
              />

              <Route
                path="/unsubscribe"
                element={<Unsubscribe />}
              />

              {/* =====================================================
                  CUSTOMER PROTECTED AREA
                  STORE ACCOUNT ONLY
              ===================================================== */}

              <Route
                element={
                  <ProtectedRoute context="marketplace" />
                }
              >
                <Route
                  path="/store/recycler"
                  element={<Recycler />}
                />

                <Route
                  path="/store/recycler/:slug"
                  element={<Recycler />}
                />
              </Route>

              {/* =====================================================
                  PLATFORM PROTECTED AREA
                  BIB PLATFORM / MERCHANT ACCOUNTS ONLY
              ===================================================== */}

              <Route
                element={
                  <ProtectedRoute context="platform" />
                }
              >
                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />

                <Route
                  path="/dashboard/ventes"
                  element={<Ventes />}
                />

                <Route
                  path="/dashboard/commandes"
                  element={<Commandes />}
                />

                <Route
                  path="/dashboard/produits"
                  element={<Produits />}
                />

                <Route
                  path="/dashboard/produits-fournisseurs"
                  element={<ProduitsFournisseurs />}
                />

                <Route
                  path="/dashboard/paiements"
                  element={<Paiements />}
                />

                <Route
                  path="/dashboard/seo-analytics"
                  element={<SEOAnalytics />}
                />

                <Route
                  path="/dashboard/boutiques"
                  element={<Boutiques />}
                />

                <Route
                  path="/dashboard/boutiques/create"
                  element={<BoutiqueCreate />}
                />

                <Route
                  path="/dashboard/boutiques/edit/:id"
                  element={<BoutiqueEdit />}
                />

                <Route
                  path="/dashboard/boutiques/analytics/:id"
                  element={<BoutiqueAnalytics />}
                />

                <Route
                  path="/dashboard/parametres"
                  element={<Parametres />}
                />

                <Route
                  path="/dashboard/aide"
                  element={<Aide />}
                />

                <Route
                  path="/dashboard/parametres/relances"
                  element={<RelancesOnboarding />}
                />

                <Route
                  path="/dashboard/tickets"
                  element={<MesTickets />}
                />

                <Route
                  path="/dashboard/equipe"
                  element={<Equipe />}
                />

                <Route
                  path="/dashboard/clients"
                  element={<Clients />}
                />

                <Route
                  path="/dashboard/marketing"
                  element={<Marketing />}
                />

                <Route
                  path="/dashboard/ventes-privees"
                  element={<VentesPrivees />}
                />

                <Route
                  path="/dashboard/ventes-privees/:id/pos"
                  element={<VentesPriveesPOS />}
                />

                <Route
                  path="/dashboard/admin/documents"
                  element={<AdminDocuments />}
                />
              </Route>

              {/* =====================================================
                  PUBLIC BOUTIQUE
              ===================================================== */}

              <Route
                path="/boutique/:slug"
                element={<BoutiquePublic />}
              />

              <Route
                path="/boutique/:slug/products"
                element={<BoutiqueAllProducts />}
              />

              <Route
                path="/boutique/:slug/category/:category"
                element={<BoutiqueCategory />}
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

              <Route
                path="/boutique/:slug/p/:pageSlug"
                element={<BoutiqueCustomPage />}
              />

              {/* =====================================================
                  MARKETING / INFORMATION
              ===================================================== */}

              <Route
                path="/carrieres"
                element={<Carrieres />}
              />

              <Route
                path="/carrieres/postes"
                element={<CarrieresPostes />}
              />

              <Route
                path="/careers"
                element={<Carrieres />}
              />

              <Route
                path="/careers/jobs"
                element={<CarrieresPostes />}
              />

              <Route
                path="/a-propos"
                element={<APropos />}
              />

              <Route
                path="/centre-aide"
                element={<CentreAide />}
              />

              <Route
                path="/aide"
                element={<CentreAide />}
              />

              <Route
                path="/help"
                element={<CentreAide />}
              />

              <Route
                path="/centre-aide/faq/:persona"
                element={<CentreAideFaq />}
              />

              <Route
                path="/aide/faq/:persona"
                element={<CentreAideFaq />}
              />

              <Route
                path="/centre-aide/guide/:slug"
                element={<CentreAideGuide />}
              />

              <Route
                path="/aide/guide/:slug"
                element={<CentreAideGuide />}
              />

              <Route
                path="/pack-legal"
                element={<PackLegal />}
              />

              <Route
                path="/legal"
                element={<PackLegal />}
              />

              <Route
                path="/mentions-legales"
                element={<MentionsLegales />}
              />

              <Route
                path="/cgu"
                element={<CGU />}
              />

              <Route
                path="/confidentialite"
                element={<Confidentialite />}
              />

              <Route
                path="/cookies"
                element={<Cookies />}
              />

              <Route
                path="/bib-talent"
                element={<BibTalent />}
              />

              {/* =====================================================
                  CATCH-ALL
              ===================================================== */}

              <Route
                path="*"
                element={<NotFound />}
              />

            </Routes>
          </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
