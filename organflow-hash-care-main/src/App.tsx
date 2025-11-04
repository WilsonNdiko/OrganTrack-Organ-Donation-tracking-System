import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Registry from "./pages/Registry";
import MapView from "./pages/MapView";
import Ledger from "./pages/Ledger";
import NotFound from "./pages/NotFound";
import { useWebSocket } from "./hooks/useWebSocket";

const queryClient = new QueryClient();

const App = () => {
  const { connect, isConnected, lastMessage } = useWebSocket();

  // Connect to WebSocket on app start
  useEffect(() => {
    // Connect without authentication initially
    // Pages can authenticate when needed
    connect();

    // Cleanup on unmount
    return () => {
      // WebSocket cleanup is handled in the hook
    };
  }, [connect]);

  // Handle real-time notifications globally
  useEffect(() => {
    if (lastMessage) {
      // You can add global notification handling here
      // For now, individual pages handle their own notifications
      console.log('📡 Global notification received:', lastMessage.type);
    }
  }, [lastMessage]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/registry" element={<Registry />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
