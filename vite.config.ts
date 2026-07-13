import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves the project from https://<user>.github.io/<repo>/
// so the base path must match the repository name for assets to resolve.
export default defineConfig({
  base: '/traqspera-hour-rules/',
  plugins: [react()],
});
