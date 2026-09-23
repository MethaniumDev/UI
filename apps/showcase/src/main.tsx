import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ThemeStoreProvider } from "./ThemeStore";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeStoreProvider>
      <App />
    </ThemeStoreProvider>
  </StrictMode>,
);
