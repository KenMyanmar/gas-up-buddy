import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// PERF-DIAG
(window as any).__perf?.("main-tsx-eval");
(window as any).__perf?.("react-render-call");
createRoot(document.getElementById("root")!).render(<App />);
