import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useOrders";
import BottomNav from "./components/BottomNav";
import PhoneEntry from "./pages/PhoneEntry";
import LinkNewCustomer from "./pages/LinkNewCustomer";
import HomePage from "./pages/HomePage";
import OrderConfigure from "./pages/OrderConfigure";
import OrderConfirm from "./pages/OrderConfirm";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import ProfileAddress from "./pages/ProfileAddress";
import ProfileAddresses from "./pages/ProfileAddresses";
import ProfileFAQ from "./pages/ProfileFAQ";
import ProfileTerms from "./pages/ProfileTerms";
import ProfilePrivacy from "./pages/ProfilePrivacy";
import NotFound from "./pages/NotFound";
import KbzProfileComplete from "./pages/KbzProfileComplete";
import WelcomePage from "./pages/WelcomePage";
import { useRef } from "react";

const queryClient = new QueryClient();

// Route guard: checks auth + linked customer profile
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const cid = searchParams.get("cid");
  const { data: customer, isLoading: customerLoading } = useCustomerProfile(user?.id);

  if (loading || customerLoading) return null;
  if (!user && !cid) return <Navigate to="/" replace />;
  if (user && !customer) return <Navigate to="/onboarding/link-new" replace />;
  return <>{children}</>;
};

// Route guard: auth only (no customer-linked check) — for onboarding linking pages
const AuthOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const cid = searchParams.get("cid");
  if (loading) return null;
  if (!user && !cid) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <div className="mx-auto max-w-md min-h-screen bg-background">
    <Routes>
      {/* Root redirects to PhoneEntry — returning users handled by useEffect in PhoneEntry */}
      <Route path="/" element={<Navigate to="/onboarding/phone" replace />} />
      <Route path="/onboarding/phone" element={<PhoneEntry />} />

      {/* Post-KBZ linking (needs auth but part of onboarding) */}
      <Route path="/onboarding/link-new" element={<AuthOnlyRoute><LinkNewCustomer /></AuthOnlyRoute>} />
      <Route path="/onboarding/kbz-profile" element={<AuthOnlyRoute><KbzProfileComplete /></AuthOnlyRoute>} />
      <Route path="/welcome" element={<AuthOnlyRoute><WelcomePage /></AuthOnlyRoute>} />

      {/* Protected app screens */}
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/order/configure" element={<ProtectedRoute><OrderConfigure /></ProtectedRoute>} />
      <Route path="/order/confirm" element={<ProtectedRoute><OrderConfirm /></ProtectedRoute>} />
      <Route path="/order/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
      <Route path="/order/tracking/:orderId" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/profile/address" element={<ProtectedRoute><ProfileAddress /></ProtectedRoute>} />
      <Route path="/profile/addresses" element={<ProtectedRoute><ProfileAddresses /></ProtectedRoute>} />
      <Route path="/profile/faq" element={<ProtectedRoute><ProfileFAQ /></ProtectedRoute>} />
      <Route path="/profile/terms" element={<ProtectedRoute><ProfileTerms /></ProtectedRoute>} />
      <Route path="/profile/privacy" element={<ProtectedRoute><ProfilePrivacy /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <BottomNav />
  </div>
);

const App = () => {
  // PERF-DIAG
  const loggedRef = useRef(false);
  if (!loggedRef.current) {
    loggedRef.current = true;
    (window as any).__perf?.("app-component-render");
  }
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;