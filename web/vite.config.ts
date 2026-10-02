import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

const vendorChunks: Record<string, string[]> = {
  firebase: ['firebase', '@firebase'],
  mui: ['@mui/material', '@mui/system', '@mui/styled-engine', '@emotion'],
  pickers: ['@mui/x-date-pickers', 'dayjs'],
};

const chunkFor = (id: string) =>
  Object.entries(vendorChunks).find(([, packages]) =>
    packages.some((pkg) => id.includes(`/node_modules/${pkg}/`)),
  )?.[0];

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => chunkFor(id),
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
