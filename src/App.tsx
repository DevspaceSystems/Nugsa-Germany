import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Layout from '@/components/layout/Layout';
import { MaintenanceGuard } from '@/components/guards/MaintenanceGuard';
import { ChatbotWrapper } from '@/components/ChatbotWrapper';

// Lazy load all pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Students = lazy(() => import("./pages/Students"));
const Announcements = lazy(() => import("./pages/Announcements"));
const Profile = lazy(() => import("./pages/Profile"));
const Support = lazy(() => import("./pages/Support"));
const Contact = lazy(() => import("./pages/Contact"));
const Assistance = lazy(() => import("./pages/Assistance"));
const Messages = lazy(() => import("./pages/Messages"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const About = lazy(() => import("./pages/About"));
const Chapters = lazy(() => import("./pages/Chapters"));
const Gallery = lazy(() => import("./pages/Gallery"));
const CommunityChat = lazy(() => import("./pages/CommunityChat"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Configure React Query with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="md" className="mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ChatbotWrapper />
          <Suspense fallback={<PageLoader />}>
            <MaintenanceGuard>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin-auth" element={<AdminAuth />} />
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/announcements" element={<Announcements />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/assistance" element={<Assistance />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/chapters" element={<Chapters />} />
                  <Route path="/gallery" element={<Gallery />} />
                  {/* <Route path="/community-chat" element={<CommunityChat />} /> */}
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </MaintenanceGuard>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
