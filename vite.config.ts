import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "./",

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },

  build: {
    lib: {
      entry: "./app/embed.tsx",
      name: "TowerApp",
      fileName: "ditto",
      formats: ["umd"],
    },
  },
});
