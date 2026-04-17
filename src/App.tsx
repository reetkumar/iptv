import React, { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { registerServiceWorker } from "@/services/serviceWorkerService";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const TVLitePage = lazy(() => import("./pages/TVLitePage"));
const UIProviders = lazy(() => import("./components/UIProviders"));

// Defer notification center - load after initial render
const NotificationCenter = () => {
  const [NotificationCenterComp, setNotificationCenter] = useState<React.ComponentType<unknown> | null>(null);
  
  useEffect(() => {
    import("@/components/NotificationCenter").then((mod) => {
      setNotificationCenter(() => mod.NotificationCenter);
    });
  }, []);

  if (!NotificationCenterComp) return null;
  return <NotificationCenterComp />;
};

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full bg-primary/50 animate-pulse"></div>
      <p className="text-sm text-muted-foreground">Loading REET TV...</p>
    </div>
  </div>
);

// Main app content
const AppContent = () => {
  useEffect(() => {
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
);

export default App;
