// Tamaño de letra para títulos gigantes en mayúsculas que nunca se salen de la pantalla:
// se calcula a partir de la palabra más larga, de modo que quepa entera en el ancho del móvil.

/** Ancho medio de una letra mayúscula en negrita, en "em" (con margen de seguridad). */
const ANCHO_LETRA = 0.8;
/** Porcentaje del ancho de pantalla disponible para el título (descontando márgenes). */
const ANCHO_UTIL = 84;

export function estiloTitulo(texto: string, maxVw = 17, maxRem = 9): string {
  const palabra = Math.max(...texto.split(/\s+/).map((p) => p.length), 1);
  const vw = Math.min(maxVw, ANCHO_UTIL / (palabra * ANCHO_LETRA));
  return `font-size: clamp(1.75rem, ${vw.toFixed(2)}vw, ${maxRem}rem)`;
}
