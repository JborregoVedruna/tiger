// Misión · El móvil del probador (Tienda de deportes): pantalla con algunos dígitos + teclas con marca de dedo.
// Diseño: mirando solo la pantalla quedan 5 candidatos de 6, y cada tecla sin marca
// descarta exactamente a uno de ellos. Hay que revisar varias teclas para dar con el bueno.

import { SOSPECHOSOS } from '../../data/caso.ts';
import { barajar, entero, type Rng } from '../core/rng.ts';
import type { PuzleElegir } from './tipos.ts';

export interface PuzleLlamada extends PuzleElegir {
  /** Teclas con marca de dedo. */
  marcadas: string[];
  /** Número en pantalla con huecos (null = ilegible). */
  pantalla: (string | null)[];
  numeros: string[];
}

function formatear(n: string): string {
  return `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

export function encajaPantalla(n: string, pantalla: (string | null)[]): boolean {
  return pantalla.every((d, i) => d === null || n[i] === d);
}

export function encaja(n: string, marcadas: string[], pantalla: (string | null)[]): boolean {
  const usados = new Set(n);
  const marcadasSet = new Set(marcadas);
  if (usados.size !== marcadasSet.size || [...usados].some((d) => !marcadasSet.has(d))) return false;
  return encajaPantalla(n, pantalla);
}

export function generarLlamada(rng: Rng): PuzleLlamada {
  for (let intento = 0; intento < 2000; intento++) {
    const contactos = barajar(rng, SOSPECHOSOS);
    const correcta = entero(rng, 0, contactos.length - 1);
    // 4 dígitos distintos además del 6 inicial; cada uno aparece al menos dos veces.
    const usados = barajar(rng, [...'012345789']).slice(0, 4);
    const objetivo = '6' + barajar(rng, [...usados, ...usados]).join('');
    const marcadas = [...new Set(objetivo)].sort();
    const libres = barajar(rng, [...'0123456789'].filter((d) => !marcadas.includes(d)));
    const visibles = new Set(barajar(rng, [1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 3));
    const pantalla = [...objetivo].map((d, i) => (i === 0 || visibles.has(i) ? d : null));
    const ocultas = [1, 2, 3, 4, 5, 6, 7, 8].filter((i) => !visibles.has(i));

    const numeros: string[] = new Array(contactos.length).fill('');
    numeros[correcta] = objetivo;
    const otros = barajar(rng, contactos.map((_, k) => k).filter((k) => k !== correcta));
    // 1) Uno con las mismas teclas pero que no cuadra con la pantalla.
    let falloPantalla = '';
    for (let t = 0; t < 50 && !falloPantalla; t++) {
      const cand = '6' + barajar(rng, [...objetivo.slice(1)]).join('');
      if (!encajaPantalla(cand, pantalla) && cand !== objetivo) falloPantalla = cand;
    }
    if (!falloPantalla) continue;
    numeros[otros[0]] = falloPantalla;
    // 2) Cuatro que cuadran con la pantalla; cada uno usa UNA tecla sin marca distinta.
    let ok = true;
    for (let k = 1; k < otros.length; k++) {
      const libre = libres[k - 1];
      const pos = ocultas[entero(rng, 0, ocultas.length - 1)];
      const n = objetivo.slice(0, pos) + libre + objetivo.slice(pos + 1);
      // Sin perder ninguna tecla marcada (así solo falla por la tecla libre).
      if (marcadas.some((d) => !n.includes(d))) {
        ok = false;
        break;
      }
      numeros[otros[k]] = n;
    }
    if (!ok || new Set(numeros).size !== numeros.length) continue;

    // Comprobaciones del diseño
    const enPantalla = numeros.filter((n) => encajaPantalla(n, pantalla)).length;
    const validos = numeros.filter((n) => encaja(n, marcadas, pantalla));
    if (enPantalla !== 5 || validos.length !== 1 || validos[0] !== objetivo) continue;
    const porTecla = libres.map((d) => numeros.filter((n) => encajaPantalla(n, pantalla) && n.includes(d)).length);
    if (porTecla.some((x) => x > 1)) continue;

    return {
      marcadas,
      pantalla,
      numeros,
      opciones: contactos.map((c, k) => ({ titulo: `${c.nombre} · ${formatear(numeros[k])}` })),
      correcta,
      ayuda: 'Ayuda: descarta primero al que no cuadra con la pantalla. Después, revisa una a una las teclas SIN marca: cada una delata a un número.',
    };
  }
  throw new Error('No se pudo generar la llamada');
}
