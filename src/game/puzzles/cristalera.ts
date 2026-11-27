// Misión · Las huellas de la Breña: sudoku 6×6 (bloques de 2×3).
// Cada casilla tiene la huella de uno de los 6 animales del pinar; en cada fila, columna
// y bloque tienen que aparecer las 6 luces exactamente una vez.

import { barajar, type Rng } from '../core/rng.ts';

export const N = 6;
export const ALTO_BLOQUE = 2;
export const ANCHO_BLOQUE = 3;

export interface PuzleCristalera {
  solucion: number[][]; // 1..6
  pistas: (number | null)[][];
}

function rejillaBase(): number[][] {
  // Patrón válido para bloques de 2×3.
  return Array.from({ length: N }, (_, r) =>
    Array.from({ length: N }, (_, c) => ((c + ANCHO_BLOQUE * (r % ALTO_BLOQUE) + Math.floor(r / ALTO_BLOQUE)) % N) + 1),
  );
}

function mezclar(rng: Rng, g: number[][]): number[][] {
  const simbolos = barajar(rng, [1, 2, 3, 4, 5, 6]);
  // Filas: bandas de 2 y filas dentro de cada banda
  const bandas = barajar(rng, [0, 1, 2]);
  const filas = bandas.flatMap((b) => barajar(rng, [0, 1]).map((k) => b * ALTO_BLOQUE + k));
  // Columnas: pilas de 3 y columnas dentro de cada pila
  const pilas = barajar(rng, [0, 1]);
  const cols = pilas.flatMap((p) => barajar(rng, [0, 1, 2]).map((k) => p * ANCHO_BLOQUE + k));
  return filas.map((r) => cols.map((c) => simbolos[g[r][c] - 1]));
}

function posible(g: (number | null)[][], r: number, c: number, v: number): boolean {
  for (let k = 0; k < N; k++) if (g[r][k] === v || g[k][c] === v) return false;
  const r0 = r - (r % ALTO_BLOQUE);
  const c0 = c - (c % ANCHO_BLOQUE);
  for (let i = 0; i < ALTO_BLOQUE; i++) for (let j = 0; j < ANCHO_BLOQUE; j++) if (g[r0 + i][c0 + j] === v) return false;
  return true;
}

/** Cuenta soluciones (se detiene al llegar a `limite`). */
export function contarSoluciones(g: (number | null)[][], limite = 2): number {
  let mejor = -1;
  let opcionesMejor: number[] = [];
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      if (g[r][c] !== null) continue;
      const ops = [1, 2, 3, 4, 5, 6].filter((v) => posible(g, r, c, v));
      if (ops.length === 0) return 0;
      if (mejor < 0 || ops.length < opcionesMejor.length) {
        mejor = r * N + c;
        opcionesMejor = ops;
      }
    }
  if (mejor < 0) return 1;
  const r = Math.floor(mejor / N);
  const c = mejor % N;
  let total = 0;
  for (const v of opcionesMejor) {
    g[r][c] = v;
    total += contarSoluciones(g, limite - total);
    g[r][c] = null;
    if (total >= limite) break;
  }
  return total;
}

export function generarCristalera(rng: Rng, minimoPistas = 12): PuzleCristalera {
  const solucion = mezclar(rng, rejillaBase());
  const pistas: (number | null)[][] = solucion.map((f) => [...f]);
  let quedan = N * N;
  for (const k of barajar(rng, Array.from({ length: N * N }, (_, i) => i))) {
    if (quedan <= minimoPistas) break;
    const r = Math.floor(k / N);
    const c = k % N;
    const v = pistas[r][c];
    pistas[r][c] = null;
    if (contarSoluciones(pistas.map((f) => [...f])) !== 1) pistas[r][c] = v;
    else quedan--;
  }
  return { solucion, pistas };
}
