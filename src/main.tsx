import { autoRedirectLite } from "./lib/deviceDetection";

// Redirect low-end devices to pure HTML lite mode BEFORE loading React
if (!autoRedirectLite()) {
  import("react-dom/client").then(({ createRoot }) => {
    import("./App").then(({ default: App }) => {
      import("./components/ErrorBoundary").then(({ default: ErrorBoundary }) => {
        import("./index.css");
        createRoot(document.getElementById("root")!).render(
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        );
      });
    });
  });
}
