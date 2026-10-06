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
        home: "index.html",
        privacy: "privacy/index.html",
        terms: "terms/index.html",
        support: "support/index.html",
        delete: "delete/index.html",
      },
    },
  },
});
