// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// En GitHub Pages la pipeline rellena estas variables a partir del repositorio
// (p. ej. site = https://usuario.github.io, base = /cluedo). En local quedan vacías.
const site = process.env.ASTRO_SITE || undefined;
const base = process.env.ASTRO_BASE || '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  vite: {
    plugins: [tailwindcss()],
  },
});
