import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

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
import Parametres from "./pages/dashboard/Parametres";

// Public pages
import BoutiquePublic from "./pages/BoutiquePublic";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
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
              path="/dashboard/parametres"
              element={
                <ProtectedRoute>
                  <Parametres />
                </ProtectedRoute>
              }
            />
            {/* Public boutique route */}
            <Route path="/boutique/:slug" element={<BoutiquePublic />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
