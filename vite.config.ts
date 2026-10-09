import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  // '/' locally; the GitHub Pages workflow sets BASE_PATH to the repo's sub-folder.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    // Photos and the logo live in public/ and are served as-is.
    target: 'es2020',
  },
});
