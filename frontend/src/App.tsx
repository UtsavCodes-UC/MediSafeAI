import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import InteractionChecker from "./pages/InteractionChecker";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import Profile from "./pages/Profile";
import CartSafety from "./pages/CartSafety";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import PersonalDetails from "./pages/PersonalDetails";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    {" "}
    <TooltipProvider>
      {" "}
      <Toaster /> <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Index />} />
          <Route path="/checker" element={<InteractionChecker />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/report" element={<Report />} />

          {/* 🔒 PROTECTED ROUTES */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal-details"
            element={
              <ProtectedRoute>
                <PersonalDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart-safety"
            element={
              <ProtectedRoute>
                <CartSafety />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
