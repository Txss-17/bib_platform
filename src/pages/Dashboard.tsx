import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { OrdersTracking } from "@/components/dashboard/OrdersTracking";
import { StockAlerts } from "@/components/dashboard/StockAlerts";
import { TrustScore } from "@/components/dashboard/TrustScore";
import { RecyclingPoints } from "@/components/dashboard/RecyclingPoints";
import { NotificationSystem } from "@/components/dashboard/NotificationSystem";
import { Bell, Search, Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.full_name || profile?.business_name || "Seller";

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      
      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back, {displayName.split(' ')[0]} 👋</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your boutiques today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 w-64 bg-card border-border/50"
              />
            </div>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Product
            </Button>
            <Button variant="outline" size="icon" onClick={handleSignOut} title="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Stats Cards */}
        <StatsCards />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Charts & Orders */}
          <div className="lg:col-span-2 space-y-6">
            <RevenueChart />
            <OrdersTracking />
          </div>

          {/* Right Column - Sidebar Widgets */}
          <div className="space-y-6">
            <NotificationSystem />
            <TrustScore />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <StockAlerts />
          <RecyclingPoints />
        </div>
      </main>
    </div>
  );
}
