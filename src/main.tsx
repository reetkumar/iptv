import React from "react";
import { autoRedirectLite } from "./lib/deviceDetection";

async function bootstrap() {
  if (!autoRedirectLite()) {
    const [{ createRoot }, { default: App }, { default: ErrorBoundary }] = await Promise.all([
      import("react-dom/client"),
      import("./App"),
      import("./components/ErrorBoundary"),
    ]);
    
    await import("./index.css");
    
    createRoot(document.getElementById("root")!).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
  }
}

bootstrap();
