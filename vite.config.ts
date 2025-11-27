import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.ts',
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      manifest: {
        name: 'NUGSA-Germany Platform',
        short_name: 'NUGSA-DE',
        description: 'Official platform for Ghanaian students in Germany',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI component libraries
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-avatar',
            '@radix-ui/react-toast',
            '@radix-ui/react-scroll-area',
          ],

          // Form and data handling
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Heavy dependencies
          'charts': ['recharts'],
          'emoji': ['emoji-picker-react'],

          // Supabase and data fetching
          'supabase': ['@supabase/supabase-js', '@tanstack/react-query'],

          // Utilities
          'utils': ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // Optimize chunk sizes
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Optimize CSS
    cssCodeSplit: true,
    // Source maps only in development
    sourcemap: mode === 'development',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
    ],
  },
}));
