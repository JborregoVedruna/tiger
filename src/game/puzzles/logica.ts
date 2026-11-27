// Utilidades para generar pistas que dejan una única solución posible.

import { barajar, type Rng } from '../core/rng.ts';

export interface Condicion<T> {
  texto: string;
  cumple: (candidato: T) => boolean;
}

/** Todas las permutaciones de [0..n-1]. */
export function permutaciones(n: number): number[][] {
  if (n === 0) return [[]];
  const res: number[][] = [];
  for (const p of permutaciones(n - 1)) {
    for (let i = 0; i <= p.length; i++) res.push([...p.slice(0, i), n - 1, ...p.slice(i)]);
  }
  return res;
}

/**
 * Elige condiciones (todas ciertas para la solución) hasta que solo quede la solución.
 * Prueba varias barajas y se queda con la lista más corta. Devuelve null si no lo consigue.
 */
export function elegirCondiciones<T>(
  rng: Rng,
  universo: T[],
  esSolucion: (t: T) => boolean,
  pool: Condicion<T>[],
  intentos = 12,
  primero: Condicion<T>[] = [],
): string[] | null {
  const ciertas = pool.filter((c) => universo.filter(esSolucion).every(c.cumple));
  let mejor: string[] | null = null;
  for (let k = 0; k < intentos; k++) {
    let vivas = universo.filter((t) => !esSolucion(t));
    const elegidas: Condicion<T>[] = [];
    for (const c of [...primero, ...barajar(rng, ciertas)]) {
      const siguientes = vivas.filter(c.cumple);
      if (siguientes.length < vivas.length || primero.includes(c)) {
        elegidas.push(c);
        vivas = siguientes;
      }
      if (vivas.length === 0) break;
    }
    if (vivas.length > 0) continue;
    // Quita redundantes
    const otras = universo.filter((t) => !esSolucion(t));
    for (let i = elegidas.length - 1; i >= 0; i--) {
      if (primero.includes(elegidas[i])) continue;
      const sin = elegidas.filter((_, j) => j !== i);
      if (otras.every((t) => sin.some((c) => !c.cumple(t)))) elegidas.splice(i, 1);
    }
    if (!mejor || elegidas.length < mejor.length) mejor = elegidas.map((c) => c.texto);
  }
  return mejor;
}
