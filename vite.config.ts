import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  esbuild: {
    jsxInject: `import { createElement, Fragment } from '/src/dom.js'`,
  },
});
