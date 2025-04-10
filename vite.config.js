
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // your React app is rooted at the current folder
  build: {
    rollupOptions: {
      input: '/dashboard.html' // explicitly point to your React mount page
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    open: '/dashboard.html'
  }
});
