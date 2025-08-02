import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PurchasePage from "./pages/PurchasePage";
import CheckoutPage from "./pages/CheckoutPage";
import ThankYouPage from "./pages/ThankYouPage";
import EventsPage from "./pages/EventsPage";
import PlayerIdPage from "./pages/PlayerIdPage";
import PurchaseHistoryPage from "./pages/PurchaseHistoryPage";
import GamingShopPage from "./pages/GamingShopPage";
import HonorOfKingsPage from "./pages/HonorOfKingsPage";
import HonorOfKingsPurchasePage from "./pages/HonorOfKingsPurchasePage";
import HelpCenterPage from "./pages/HelpCenterPage";
import ContactUsPage from "./pages/ContactUsPage";
import FAQsPage from "./pages/FAQsPage";
import CareersPage from "./pages/CareersPage";
import PressPage from "./pages/PressPage";
import PartnersPage from "./pages/PartnersPage";
import CopyrightNoticePage from "./pages/CopyrightNoticePage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import PaymentIssuesPage from "./pages/PaymentIssuesPage";
import SecurityPage from "./pages/SecurityPage";

const queryClient = new QueryClient();

function App() {
  const logout = () => {
    // Keep for compatibility but no longer needed
  };


  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index onLogout={logout} />} />
            <Route path="/pubg-mobile" element={<Index onLogout={logout} />} />
            <Route path="/player-id" element={<PlayerIdPage onLogout={logout} />} />
            <Route path="/purchase-history" element={<PurchaseHistoryPage onLogout={logout} />} />
            <Route path="/gaming-shop" element={<Navigate to="/" />} />
            <Route path="/honor-of-kings" element={<HonorOfKingsPage onLogout={logout} />} />
            <Route path="/purchase/:id" element={<PurchasePage onLogout={logout} />} />
            <Route path="/checkout/:id" element={<CheckoutPage onLogout={logout} />} />
            <Route path="/thankyou" element={<ThankYouPage onLogout={logout} />} />
            <Route path="/events" element={<EventsPage onLogout={logout} />} />
            <Route path="/honor-of-kings/purchase/:id" element={<HonorOfKingsPurchasePage onLogout={logout} />} />
            <Route path="/help-center" element={<HelpCenterPage onLogout={logout} />} />
            <Route path="/contact-us" element={<ContactUsPage onLogout={logout} />} />
            <Route path="/faqs" element={<FAQsPage onLogout={logout} />} />
            <Route path="/careers" element={<CareersPage onLogout={logout} />} />
            <Route path="/press" element={<PressPage onLogout={logout} />} />
            <Route path="/partners" element={<PartnersPage onLogout={logout} />} />
            <Route path="/copyright-notice" element={<CopyrightNoticePage onLogout={logout} />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage onLogout={logout} />} />
            <Route path="/refund-policy" element={<RefundPolicyPage onLogout={logout} />} />
            <Route path="/payment-issues" element={<PaymentIssuesPage onLogout={logout} />} />
            <Route path="/security" element={<SecurityPage onLogout={logout} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
