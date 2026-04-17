import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found in DOM. Check index.html structure.");
  document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif; color: red;">Fatal Error: Application root element not found. Please refresh the page.</div>';
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
