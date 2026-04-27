import { createRoot } from "react-dom/client";
import Page from "./page";

export function renderTowerApp(container: HTMLElement, config?: any) {
  const root = createRoot(container);
  root.render(<Page />);
}

// expose globally for PHP
(window as any).renderTowerApp = renderTowerApp;
