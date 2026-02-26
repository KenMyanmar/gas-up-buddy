import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { useCustomerProfile } from "@/hooks/useOrders";
import BottomNav from "./components/BottomNav";
import CallFallback from "./components/CallFallback";
import Welcome from "./pages/Welcome";
import PhoneEntry from "./pages/PhoneEntry";
import OtpVerify from "./pages/OtpVerify";
import LinkWelcomeBack from "./pages/LinkWelcomeBack";
import LinkSelectAddress from "./pages/LinkSelectAddress";
import LinkNewCustomer from "./pages/LinkNewCustomer";
import HomePage from "./pages/HomePage";
import OrderConfigure from "./pages/OrderConfigure";
import OrderConfirm from "./pages/OrderConfirm";
import OrderSuccess from "./pages/OrderSuccess";
import OrderTracking from "./pages/OrderTracking";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Route guard: checks auth + linked customer profile
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { data: customer, isLoading: customerLoading } = useCustomerProfile(user?.id);

  if (loading || customerLoading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (!customer) return <Navigate to="/onboarding/link-new" replace />;
  return <>{children}</>;
};

// Route guard: auth only (no customer-linked check) — for onboarding linking pages
const AuthOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Route guard: redirects to home if already authenticated
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <div className="mx-auto max-w-md min-h-screen bg-background">
    <Routes>
      {/* Public-only (redirect if logged in) */}
      <Route path="/" element={<PublicOnlyRoute><Welcome /></PublicOnlyRoute>} />
      <Route path="/onboarding/phone" element={<PublicOnlyRoute><PhoneEntry /></PublicOnlyRoute>} />
      {/* OTP verify — needs to stay mounted after auth succeeds to complete Edge Function linking */}
      <Route path="/onboarding/otp" element={<OtpVerify />} />

      {/* Post-OTP linking (needs auth but part of onboarding) */}
      <Route path="/onboarding/link-welcome" element={<AuthOnlyRoute><LinkWelcomeBack /></AuthOnlyRoute>} />
      <Route path="/onboarding/link-select" element={<AuthOnlyRoute><LinkSelectAddress /></AuthOnlyRoute>} />
      <Route path="/onboarding/link-new" element={<AuthOnlyRoute><LinkNewCustomer /></AuthOnlyRoute>} />

      {/* Protected app screens */}
      <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      <Route path="/order/configure" element={<ProtectedRoute><OrderConfigure /></ProtectedRoute>} />
      <Route path="/order/confirm" element={<ProtectedRoute><OrderConfirm /></ProtectedRoute>} />
      <Route path="/order/success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
      <Route path="/order/tracking/:orderId" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <BottomNav />
    <CallFallback />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
