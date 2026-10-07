import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2020",
    cssMinify: "lightningcss",
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, "index.html"),
        privacy: resolve(import.meta.dirname, "privacy/index.html"),
        terms: resolve(import.meta.dirname, "terms/index.html"),
        support: resolve(import.meta.dirname, "support/index.html"),
        delete: resolve(import.meta.dirname, "delete/index.html"),
      },
    },
  },
});
