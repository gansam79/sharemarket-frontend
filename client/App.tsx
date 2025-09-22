import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "@/components/layout/AppLayout";
import { StoreProvider } from "@/state/store";
import Transfers from "@/pages/Transfers";
import Shareholders from "@/pages/Shareholders";
import Stockholders from "@/pages/Stockholders";
import DmatAccounts from "@/pages/DmatAccounts";
import ClientProfiles from "@/pages/ClientProfiles";
import Placeholder from "@/pages/_Placeholder";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/transfers" element={<Transfers />} />
              <Route path="/shareholders" element={<Shareholders />} />
              <Route path="/stockholders" element={<Stockholders />} />
              <Route path="/dmat" element={<DmatAccounts />} />
              <Route path="/profiles" element={<ClientProfiles />} />
              <Route path="/reports" element={<Placeholder title="Reports" />} />
              <Route path="/notifications" element={<Placeholder title="Notifications Log" />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
