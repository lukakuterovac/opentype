import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initializeSettings } from "./store/settingsStore";
import { initializeTheme } from "./store/themeStore";
import "./index.css";

initializeTheme();
initializeSettings();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in document.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
