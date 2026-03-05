import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: true,
        // Add JSX runtime for production build
        jsxRuntime: 'automatic',
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@store': path.resolve(__dirname, './src/store'),
        '@api': path.resolve(__dirname, './src/api'),
      },
    },

    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/socket.io': {
          target: env.VITE_SOCKET_URL || 'http://localhost:8080',
          changeOrigin: true,
          ws: true,
        },
      },
    },

    build: {
      // Generate source maps for production builds
      sourcemap: true,
      // Optimize deps for faster builds
      commonjsOptions: {
        include: [/node_modules/],
      },
      // Reduce chunk size
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'mui-vendor': ['@mui/material', '@mui/icons-material'],
            'chart-vendor': ['recharts'],
          },
        },
      },
      // Minify output
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-query',
        'zustand',
        '@mui/material',
        'recharts',
        'socket.io-client',
        'date-fns',
        'react-grid-layout',
      ],
    },

    // TypeScript configuration
    esbuild: {
      jsxInject: `import React from 'react'`,
    },
  };
});