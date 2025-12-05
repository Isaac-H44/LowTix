import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Run client on its own port; API is already using 5000
    port: 5173,
  },
});
