import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { registerServiceWorker } from "@/services/serviceWorkerService";
import { NotificationCenter } from "@/components/NotificationCenter";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TVLitePage = lazy(() => import("./pages/TVLitePage"));

// Lazy load UI providers to defer non-critical imports
const UIProviders = lazy(() => import("./components/UIProviders"));

// Configure QueryClient for optimal performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Minimal loading fallback for faster perceived performance
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="h-12 w-12 rounded-full bg-primary/50 animate-pulse"></div>
  </div>
);

// Main app content
const AppContent = () => {
  useEffect(() => {
    // Register service worker for PWA support
    registerServiceWorker();
  }, []);

  return (
    <>
      <NotificationCenter />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/auth/login" element={<Navigate to="/" replace />} />
          <Route path="/auth/signup" element={<Navigate to="/" replace />} />
          <Route path="/auth/callback" element={<Navigate to="/" replace />} />
          <Route path="/" element={<Index />} />
          <Route path="/tv-lite" element={<TVLitePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={<LoadingFallback />}>
      <UIProviders>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppContent />
        </BrowserRouter>
      </UIProviders>
    </Suspense>
  </QueryClientProvider>
);

export default App;
