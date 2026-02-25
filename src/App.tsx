import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import CallFallback from "./components/CallFallback";
import Welcome from "./pages/Welcome";
import PhoneEntry from "./pages/PhoneEntry";
import OtpVerify from "./pages/OtpVerify";
import HomePage from "./pages/HomePage";
import OrderConfigure from "./pages/OrderConfigure";
import OrderConfirm from "./pages/OrderConfirm";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="mx-auto max-w-md min-h-screen bg-background">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/onboarding/phone" element={<PhoneEntry />} />
            <Route path="/onboarding/otp" element={<OtpVerify />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/order/configure" element={<OrderConfigure />} />
            <Route path="/order/confirm" element={<OrderConfirm />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
          <CallFallback />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
