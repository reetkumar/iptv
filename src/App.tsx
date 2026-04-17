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
    }).catch((error) => {
      console.error("Failed to load NotificationCenter:", error);
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

const ErrorFallback = ({ error }: { error?: Error }) => (
  <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
    <div className="flex flex-col items-center gap-4 max-w-md text-center">
      <div className="text-4xl">⚠️</div>
      <h1 className="text-xl font-bold">Loading Error</h1>
      <p className="text-sm text-muted-foreground">
        Failed to load application component. Please try refreshing the page.
      </p>
      {error && (
        <details className="w-full text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground">Error details</summary>
          <pre className="mt-2 text-xs overflow-auto bg-destructive/10 p-2 rounded">
            {error.message}
          </pre>
        </details>
      )}
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:opacity-90"
      >
        Refresh Page
      </button>
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

// App wrapper with error boundary for lazy loading
const LazyLoadingBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  if (hasError) {
    return <ErrorFallback error={error} />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorBoundaryWrapper onError={(error) => {
        setHasError(true);
        setError(error);
      }}>
        {children}
      </ErrorBoundaryWrapper>
    </Suspense>
  );
};

// Simple error boundary for component errors
const ErrorBoundaryWrapper = ({ 
  children, 
  onError 
}: { 
  children: React.ReactNode;
  onError: (error: Error) => void;
}) => {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Global error caught:", event.error);
      setHasError(true);
      onError(event.error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [onError]);

  if (hasError) {
    return <ErrorFallback />;
  }

  return <>{children}</>;
};

const App = () => (
  <Suspense fallback={<LoadingFallback />}>
    <LazyLoadingBoundary>
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
    </LazyLoadingBoundary>
  </Suspense>
);

export default App;
