import { createRoot } from "react-dom/client";
import Page from "./page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export function renderTowerApp(container: HTMLElement, config?: any) {
  const root = createRoot(container);
  root.render(
    <QueryClientProvider client={queryClient}>
      <Page />
      <Toaster />
    </QueryClientProvider>,
  );
}

// expose globally for PHP
(window as any).renderTowerApp = renderTowerApp;
