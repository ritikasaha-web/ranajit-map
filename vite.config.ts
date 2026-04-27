import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "./app/embed.tsx",
      name: "TowerApp",
      fileName: "ditto",
      formats: ["umd"],
    },
  },
});
