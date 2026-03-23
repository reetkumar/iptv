import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import legacy from "@vitejs/plugin-legacy";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    legacy({
      targets: ["chrome >= 73"],
      modernTargets: ["chrome >= 73"],
      modernPolyfills: true,
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendor chunk
          if (id.includes('node_modules/react')) {
            return 'react-core';
          }
          // Router chunk
          if (id.includes('react-router-dom')) {
            return 'router';
          }
          // Query chunk
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          // UI components - split into smaller chunks to enable partial loading
          if (id.includes('@radix-ui')) {
            return 'ui-radix';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          if (id.includes('hls.js')) {
            return 'hls';
          }
          if (id.includes('framer-motion')) {
            return 'motion';
          }
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          // Utilities split to reduce large vendor chunks
          if (id.includes('recharts')) {
            return 'charts';
          }
          if (id.includes('date-fns')) {
            return 'date-utils';
          }
          if (id.includes('zod')) {
            return 'validation';
          }
          if (id.includes('lodash')) {
            return 'lodash';
          }
        },
      },
    },
    chunkSizeWarningLimit: 550,
  },
}));
