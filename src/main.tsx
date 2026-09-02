import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { applyTheme } from "@/lib/theme";

// apply the stored / preferred theme before first paint
try {
  const stored = localStorage.getItem("calsense.theme");
  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  } else if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    applyTheme("light");
  }
} catch {
  /* keep the default from index.html */
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
