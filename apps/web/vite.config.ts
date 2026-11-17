import react from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      spa: {
        enabled: true,
        // Cloudflare's SPA fallback serves index.html for unmatched paths.
        prerender: { outputPath: "/index.html" },
      },
    }),
    react(),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
