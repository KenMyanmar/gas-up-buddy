// Self-hosted fonts (replaces fonts.googleapis.com @import)
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/dm-sans/800.css";
import "@fontsource/dm-sans/900.css";
import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/outfit/800.css";
import "@fontsource/outfit/900.css";
import "@fontsource/padauk/400.css";
import "@fontsource/padauk/700.css";

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// PERF-DIAG
(window as any).__perf?.("main-tsx-eval");
(window as any).__perf?.("react-render-call");
createRoot(document.getElementById("root")!).render(<App />);
