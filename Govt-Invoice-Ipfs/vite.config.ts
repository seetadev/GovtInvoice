import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  server: {
    host: true, // Listen on all addresses (needed for Docker)
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true, // Enable polling for Docker volume watches
    },
  },
  preview: {
    host: true, // Listen on all addresses for preview mode
    port: 3000,
    strictPort: true,
  },
  plugins: [
    react(),
    // legacy({
    //   targets: ['defaults', 'android >= 7', 'chrome >= 60'],
    //   additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    // })
  ],
  define: {
    __DATE__: `'${new Date().toISOString()}'`,
    global: "globalThis",
  },
  build: {
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
  },
  esbuild: {
    target: "es2020",
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "es2020",
    },

  },
});
