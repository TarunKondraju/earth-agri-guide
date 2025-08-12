import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import GEEAnalysis from "./pages/GEEAnalysis";
import Dashboard from "./pages/Dashboard";
import FieldManagement from "./pages/FieldManagement";
import SatelliteAnalysis from "./pages/SatelliteAnalysis";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<GEEAnalysis />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/fields" element={<FieldManagement />} />
            <Route path="/satellite" element={<Navigate to="/" replace />} />
            <Route path="/weather" element={<div className="p-6"><h1 className="text-2xl font-bold">Weather Monitor</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/crops" element={<div className="p-6"><h1 className="text-2xl font-bold">Crop Health</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/analytics" element={<div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Reports</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="/settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p className="text-muted-foreground">Coming soon...</p></div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
