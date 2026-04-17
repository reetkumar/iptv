import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

// Setup global error handler
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found in DOM. Check index.html structure.");
  document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif; color: red;">Fatal Error: Application root element not found. Please refresh the page.</div>';
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} catch (error) {
  console.error("Failed to render app:", error);
  document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif; color: red;">Fatal Error: Failed to initialize application. Please refresh the page.</div>';
}
