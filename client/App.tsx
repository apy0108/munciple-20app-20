import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ComplaintsPage from "./pages/Complaints";
import Placeholder from "./pages/Placeholder";
import { AuthProvider } from "@/lib/auth";
import { Protected } from "@/components/RouteGuards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Protected>
                  <Index />
                </Protected>
              }
            />
            <Route
              path="/complaints"
              element={
                <Protected>
                  <ComplaintsPage />
                </Protected>
              }
            />
            <Route path="/map" element={<Protected><RoleGuard allow={["SUPER_ADMIN","DEPT_ADMIN","WARD_OFFICER"]}><Placeholder title="Interactive Map" /></RoleGuard></Protected>} />
            <Route path="/tasks" element={<Protected><RoleGuard allow={["WARD_OFFICER","FIELD_STAFF"]}><Placeholder title="My Tasks" /></RoleGuard></Protected>} />
            <Route path="/upload-proof" element={<Protected><RoleGuard allow={["FIELD_STAFF"]}><Placeholder title="Upload Proof" /></RoleGuard></Protected>} />
            <Route path="/reports" element={<Protected><RoleGuard allow={["SUPER_ADMIN","DEPT_ADMIN"]}><Placeholder title="Reports" /></RoleGuard></Protected>} />
            <Route path="/staff" element={<Protected><RoleGuard allow={["SUPER_ADMIN"]}><Placeholder title="Staff Performance" /></RoleGuard></Protected>} />
            <Route path="/admin" element={<Protected><RoleGuard allow={["SUPER_ADMIN"]}><Placeholder title="Admin Controls" /></RoleGuard></Protected>} />

            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
