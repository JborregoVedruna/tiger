// Misión · Las cámaras de seguridad (Cordón de terciopelo): ordenar cuatro fotogramas con la
// marca de tiempo medio borrada. Esa mañana los coches solo llegaban: ninguno se fue.

import { barajar, barajarDistinto, entero, type Rng } from '../core/rng.ts';
import { permutaciones } from './logica.ts';
import type { PuzleOrden } from './tipos.ts';

interface Fotograma {
  id: string;
  /** Horas posibles (en segundos) según las cifras visibles, de menor a mayor. */
  posibles?: number[];
  segundos: number; // desde las 3:00:00
  digitos: (number | null)[]; // M M S S con huecos
  plazas: boolean[];
}

function completar(d: (number | null)[]): number[] {
  const res: number[] = [];
  const opciones = d.map((v) => (v === null ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] : [v]));
  for (const a of opciones[0])
    for (const b of opciones[1])
      for (const c of opciones[2])
        for (const e of opciones[3]) {
          const m = a * 10 + b;
          const s = c * 10 + e;
          if (m < 60 && s < 60) res.push(m * 60 + s);
        }
  return res.sort((x, y) => x - y);
}

function subconjunto(a: boolean[], b: boolean[]): boolean {
  return b.every((v, i) => !v || a[i]);
}

/** ¿Es posible este orden? (plazas que solo se van llenando y horas crecientes) */
function posible(orden: Fotograma[]): boolean {
  let previo = -1;
  for (let i = 0; i < orden.length; i++) {
    if (i > 0 && !subconjunto(orden[i].plazas, orden[i - 1].plazas)) return false;
    const siguiente = (orden[i].posibles ?? completar(orden[i].digitos)).find((t) => t > previo);
    if (siguiente === undefined) return false;
    previo = siguiente;
  }
  return true;
}

export function marca(d: (number | null)[]): string {
  const c = d.map((v) => (v === null ? '▒' : String(v)));
  return `11:${c[0]}${c[1]}:${c[2]}${c[3]}`;
}

const N = 6;
const PERMUTACIONES = permutaciones(N);

export function generarCamaras(rng: Rng): PuzleOrden {
  for (let intento = 0; intento < 20000; intento++) {
    const tiempos = Array.from({ length: N }, () => entero(rng, 5 * 60, 29 * 60 + 59)).sort((a, b) => a - b);
    if (new Set(tiempos).size < N) continue;
    // Aparcamiento de 4 plazas: los coches van llegando (con algún empate entre fotogramas seguidos).
    let actuales = [false, false, false, false];
    const primero = entero(rng, 0, 3);
    if (rng() < 0.6) actuales[primero] = true;
    const estados: boolean[][] = [];
    const llegaEn = barajar(rng, [1, 2, 3, 4, 5]).slice(0, entero(rng, 2, 3));
    for (let i = 0; i < N; i++) {
      if (llegaEn.includes(i)) {
        const libres = actuales.map((v, k) => (v ? -1 : k)).filter((k) => k >= 0);
        if (libres.length) {
          const llega = libres[entero(rng, 0, libres.length - 1)];
          actuales = actuales.map((v, k) => v || k === llega);
        }
      }
      estados.push([...actuales]);
    }
    const fotos: Fotograma[] = tiempos.map((t, i) => {
      const m = Math.floor(t / 60);
      const s = t % 60;
      const d: (number | null)[] = [Math.floor(m / 10), m % 10, Math.floor(s / 10), s % 10];
      const ocultos = barajar(rng, [0, 1, 2, 3]).slice(0, 2); // dos dígitos borrados en cada fotograma
      return { id: `c${i}`, segundos: t, digitos: d.map((v, k) => (ocultos.includes(k) ? null : v)), plazas: estados[i] };
    });
    fotos.forEach((f) => (f.posibles = completar(f.digitos)));
    let validos = 0;
    for (const p of PERMUTACIONES) {
      if (posible(p.map((k) => fotos[k])) && ++validos > 1) break;
    }
    if (validos !== 1) continue;

    const mostradas = barajarDistinto(rng, fotos);
    const camaras = barajar(rng, ['01', '02', '03', '04', '05', '06']);
    return {
      tarjetas: mostradas.map((f, i) => ({
        id: f.id,
        etiqueta: `CAM ${camaras[i]} · ${marca(f.digitos)}`,
        texto: '',
        plazas: f.plazas,
      })),
      orden: fotos.map((f) => f.id),
      ayuda: 'Ayuda: primero ordena por coches aparcados (cada vez los mismos o más, y ningún coche se va). Desempata con los dígitos visibles de la hora.',
    };
  }
  throw new Error('No se pudieron generar los fotogramas');
}
