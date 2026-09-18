import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CartProvider } from "@/contexts/CartContext";
import { StoreCartProvider } from "@/contexts/StoreCartContext";

/* =====================================================
   PUBLIC / AUTHENTICATION
===================================================== */

import Index from "@/pages/Index";
import Vendre from "@/pages/Vendre";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import StoreLogin from "@/pages/StoreLogin";
import StoreSignup from "@/pages/StoreSignup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

/* =====================================================
   GENERAL / BIB STORE
===================================================== */

import Dashboard from "@/pages/Dashboard";
import Tarifs from "@/pages/Tarifs";
import CheckoutReturn from "@/pages/CheckoutReturn";
import NotFound from "@/pages/NotFound";
import BrandPreview from "@/pages/BrandPreview";
import Store from "@/pages/Store";
import StoreBoutique from "@/pages/StoreBoutique";
import StoreCatalog from "@/pages/StoreCatalog";
import StoreCart from "@/pages/StoreCart";
import Recycler from "@/pages/customer/Recycler";
import Unsubscribe from "@/pages/Unsubscribe";
import StoreProduct from "@/pages/StoreProduct";

/* =====================================================
   SUPPLIERS / OPERATIONS
===================================================== */

import Suppliers from "@/pages/Suppliers";
import SuppliersApply from "@/pages/SuppliersApply";
import Ops from "@/pages/Ops";
import OpsApply from "@/pages/OpsApply";
import SuppliersOnboarding from "@/pages/SuppliersOnboarding";
import OpsOnboarding from "@/pages/OpsOnboarding";
import PartnerOnboardingResume from "@/pages/PartnerOnboardingResume";
import PartnerOnboardingPortal from "@/pages/PartnerOnboardingPortal";
import SuppliersPortal from "@/pages/SuppliersPortal";
import OpsPortal from "@/pages/OpsPortal";

/* =====================================================
   BIB TALENT
===================================================== */

import BibTalent from "@/pages/BibTalent";

/* =====================================================
   DASHBOARD
===================================================== */

import Ventes from "@/pages/Ventes";
import Commandes from "@/pages/Commandes";
import Produits from "@/pages/Produits";
import ProduitsFournisseurs from "@/pages/ProduitsFournisseurs";
import Paiements from "@/pages/Paiements";
import SEOAnalytics from "@/pages/SEOAnalytics";
import Boutiques from "@/pages/Boutiques";
import BoutiqueCreate from "@/pages/BoutiqueCreate";
import BoutiqueEdit from "@/pages/BoutiqueEdit";
import BoutiqueAnalytics from "@/pages/BoutiqueAnalytics";
import Parametres from "@/pages/Parametres";
import Aide from "@/pages/Aide";
import RelancesOnboarding from "@/pages/RelancesOnboarding";
import MesTickets from "@/pages/MesTickets";
import AdminDocuments from "@/pages/AdminDocuments";
import Equipe from "@/pages/Equipe";
import Clients from "@/pages/Clients";
import Marketing from "@/pages/Marketing";
import VentesPrivees from "@/pages/VentesPrivees";
import VentesPriveesPOS from "@/pages/VentesPriveesPOS";

/* =====================================================
   PUBLIC BOUTIQUE — REAL COMMERCE
===================================================== */

import BoutiquePublic from "@/pages/BoutiquePublic";
import BoutiqueAllProducts from "@/pages/BoutiqueAllProducts";
import BoutiqueCategory from "@/pages/BoutiqueCategory";
import ProductPublic from "@/pages/ProductPublic";
import OrderTracking from "@/pages/OrderTracking";
import BoutiqueFAQPage from "@/pages/BoutiqueFAQPage";
import BoutiqueCGVPage from "@/pages/BoutiqueCGVPage";
import BoutiqueCGUPage from "@/pages/BoutiqueCGUPage";
import BoutiqueAboutPage from "@/pages/BoutiqueAboutPage";
import BoutiqueCustomPage from "@/pages/BoutiqueCustomPage";

/* =====================================================
   INSTITUTIONAL / MARKETING
===================================================== */

import Carrieres from "@/pages/Carrieres";
import CarrieresPostes from "@/pages/CarrieresPostes";
import APropos from "@/pages/APropos";
import CentreAide from "@/pages/CentreAide";
import CentreAideFaq from "@/pages/CentreAideFaq";
import CentreAideGuide from "@/pages/CentreAideGuide";
import PackLegal from "@/pages/PackLegal";

/* =====================================================
   LEGAL
===================================================== */

import MentionsLegales from "@/pages/MentionsLegales";
import CGU from "@/pages/CGU";
import Confidentialite from "@/pages/Confidentialite";
import Cookies from "@/pages/Cookies";

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

  if (
    host.startsWith("logistics.") ||
    host.startsWith("logistique.")
  ) {
    return <Ops />;
  }

  return <Index />;
}

/* =====================================================
   APPLICATION
===================================================== */

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <LanguageProvider>
            <AuthProvider>
              <StoreCartProvider>
                <Routes>
                  {/* =====================================================
                      ROOT / PUBLIC
                  ===================================================== */}

                  <Route
                    path="/"
                    element={<RootPage />}
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
                      SUPPLIERS
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
                      />
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
                    path="/suppliers/reprendre"
                    element={
                      <PartnerOnboardingResume
                        partnerType="supplier"
                      />
                    }
                  />

                  <Route
                    path="/suppliers/resume"
                    element={
                      <PartnerOnboardingResume
                        partnerType="supplier"
                      />
                    }
                  />

                  <Route
                    path="/suppliers/portal"
                    element={<SuppliersPortal />}
                  />

                  <Route
                    path="/suppliers/portal/:token"
                    element={<PartnerOnboardingPortal />}
                  />

                  {/* =====================================================
                      OPERATIONS / LOGISTICS
                  ===================================================== */}

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
                    path="/ops/candidature"
                    element={<OpsApply />}
                  />

                  <Route
                    path="/logistics/apply"
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
                    path="/ops/reprendre"
                    element={
                      <PartnerOnboardingResume
                        partnerType="ops"
                      />
                    }
                  />

                  <Route
                    path="/ops/resume"
                    element={
                      <PartnerOnboardingResume
                        partnerType="ops"
                      />
                    }
                  />

                  <Route
                    path="/ops/portal"
                    element={<OpsPortal />}
                  />

                  <Route
                    path="/ops/portal/:token"
                    element={<PartnerOnboardingPortal />}
                  />

                  {/* =====================================================
                      BIB STORE — DISCOVERY ONLY
                  ===================================================== */}

                  <Route
                    path="/store"
                    element={<Store />}
                  />

                  <Route
                    path="/store/boutique/:slug"
                    element={<StoreBoutique />}
                  />

                  <Route
                    path="/store/products"
                    element={<StoreCatalog />}
                  />

                  <Route
                    path="/store/product/:productId"
                    element={<StoreProduct />}
                  />

                  <Route
                    path="/store/cart"
                    element={<StoreCart />}
                  />

                  <Route
                    path="/store/login"
                    element={<StoreLogin />}
                  />

                  <Route
                    path="/store/signup"
                    element={<StoreSignup />}
                  />

                  {/* =====================================================
                      AUTHENTICATION
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
                      GENERAL
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
                      STORE — CUSTOMER AREA
                  ===================================================== */}

                  <Route
                    path="/store/recycler"
                    element={
                      <ProtectedRoute>
                        <Recycler />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/store/recycler/:slug"
                    element={
                      <ProtectedRoute>
                        <Recycler />
                      </ProtectedRoute>
                    }
                  />

                  {/* =====================================================
                      DASHBOARD
                  ===================================================== */}

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

                  {/* =====================================================
                      PUBLIC BOUTIQUE — REAL COMMERCE
                  ===================================================== */}

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

                  <Route
                    path="/boutique/:slug/page/:pageSlug"
                    element={<BoutiqueCustomPage />}
                  />

                  {/* =====================================================
                      CAREERS / BIB TALENT
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
                    path="/carrieres/talent"
                    element={<BibTalent />}
                  />

                  <Route
                    path="/bib-talent"
                    element={
                      <Navigate
                        to="/carrieres/talent"
                        replace
                      />
                    }
                  />

                  {/* =====================================================
                      INSTITUTIONAL / HELP
                  ===================================================== */}

                  <Route
                    path="/a-propos"
                    element={<APropos />}
                  />

                  <Route
                    path="/centre-aide"
                    element={<CentreAide />}
                  />

                  <Route
                    path="/centre-aide/faq"
                    element={<CentreAideFaq />}
                  />

                  <Route
                    path="/centre-aide/guide"
                    element={<CentreAideGuide />}
                  />

                  <Route
                    path="/help"
                    element={<CentreAide />}
                  />

                  <Route
                    path="/help/faq"
                    element={<CentreAideFaq />}
                  />

                  <Route
                    path="/help/guide"
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

                  {/* =====================================================
                      LEGAL
                  ===================================================== */}

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

                  {/* =====================================================
                      CAREERS ALIASES
                  ===================================================== */}

                  <Route
                    path="/careers"
                    element={<Carrieres />}
                  />

                  <Route
                    path="/careers/jobs"
                    element={<CarrieresPostes />}
                  />

                  {/* =====================================================
                      FALLBACK
                  ===================================================== */}

                  <Route
                    path="*"
                    element={<NotFound />}
                  />
                </Routes>
              </StoreCartProvider>
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
