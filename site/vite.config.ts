import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig(({command}) => ({
  // Served from https://rolandvtonder.github.io/Your-Wedding-Planner-website-demo/,
  // so production builds live under that sub-folder; `npm run dev` stays at '/'.
  base: command === 'build' ? (process.env.BASE_PATH ?? '/Your-Wedding-Planner-website-demo/') : '/',
  plugins: [react(), tailwindcss()],
  build: {
    // Photos and the logo live in public/ and are served as-is.
    target: 'es2020',
  },
}));
