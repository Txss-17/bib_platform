import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Vendre from "./pages/Vendre";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Tarifs from "./pages/Tarifs";
import CheckoutReturn from "./pages/CheckoutReturn";
import NotFound from "./pages/NotFound";
import BrandPreview from "./pages/BrandPreview";
import Marketplace from "./pages/Marketplace";
import Recycler from "./pages/customer/Recycler";

// Dashboard pages
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
import MesTickets from "./pages/dashboard/MesTickets";
import Rapports from "./pages/dashboard/Rapports";
import AdminDocuments from "./pages/dashboard/AdminDocuments";
import Equipe from "./pages/dashboard/Equipe";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Public pages
import BoutiquePublic from "./pages/BoutiquePublic";
import BoutiqueAllProducts from "./pages/BoutiqueAllProducts";
import BoutiqueCategory from "./pages/BoutiqueCategory";
import ProductPublic from "./pages/ProductPublic";
import OrderTracking from "./pages/OrderTracking";
import BoutiqueFAQPage from "./pages/BoutiqueFAQPage";
import { BoutiqueCGVPage, BoutiqueCGUPage, BoutiqueAboutPage } from "./pages/BoutiqueLegalPages";
import BoutiqueCustomPage from "./pages/BoutiqueCustomPage";
import { CartProvider } from "@/contexts/CartContext";
import Unsubscribe from "./pages/Unsubscribe";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vendre" element={<Vendre />} />
            <Route path="/landing" element={<Index />} />
            <Route path="/tarifs" element={<Tarifs />} />
            <Route path="/pricing" element={<Tarifs />} />
            <Route path="/checkout/return" element={<CheckoutReturn />} />
            <Route path="/brand-preview" element={<BrandPreview />} />
            <Route path="/store" element={<Marketplace />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/recycler" element={<Recycler />} />
            <Route path="/recycler/:slug" element={<Recycler />} />
            <Route path="/suivi-commande" element={<OrderTracking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/unsubscribe" element={<Unsubscribe />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
              path="/dashboard/boutiques/edit/:id"
              element={
                <ProtectedRoute>
                  <BoutiqueEdit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/boutiques/analytics/:id"
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
              path="/dashboard/rapports"
              element={
                <ProtectedRoute>
                  <Rapports />
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
              path="/dashboard/tickets"
              element={
                <ProtectedRoute>
                  <MesTickets />
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
              path="/dashboard/admin/documents"
              element={
                <ProtectedRoute>
                  <AdminDocuments />
                </ProtectedRoute>
              }
            />
            {/* Public boutique routes */}
            <Route path="/boutique/:slug" element={<BoutiquePublic />} />
            <Route path="/boutique/:slug/products" element={<BoutiqueAllProducts />} />
            <Route path="/boutique/:slug/category/:category" element={<BoutiqueCategory />} />
            <Route path="/boutique/:slug/product/:productId" element={
              <CartProvider><ProductPublic /></CartProvider>
            } />
            <Route path="/boutique/:slug/order-tracking" element={<OrderTracking />} />
            <Route path="/boutique/:slug/faq" element={<BoutiqueFAQPage />} />
            <Route path="/boutique/:slug/cgv" element={<BoutiqueCGVPage />} />
            <Route path="/boutique/:slug/cgu" element={<BoutiqueCGUPage />} />
            <Route path="/boutique/:slug/about" element={<BoutiqueAboutPage />} />
            <Route path="/boutique/:slug/p/:pageSlug" element={<BoutiqueCustomPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
        </LanguageProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
