// Construye rutas internas respetando el `base` de Astro
// (en GitHub Pages la web vive en /<nombre-del-repo>/).
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function ruta(camino = '/'): string {
  if (/^(https?:|#|mailto:)/.test(camino)) return camino;
  const limpio = camino.startsWith('/') ? camino : `/${camino}`;
  return `${BASE}${limpio}` || '/';
}
