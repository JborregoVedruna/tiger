// Misión · Los vasos del chiringuito: seis vasos ↔ seis sospechosos.

import { SOSPECHOSOS } from '../../data/caso.ts';
import { barajar, elegir, type Rng } from '../core/rng.ts';
import { elegirCondiciones, permutaciones, type Condicion } from './logica.ts';
import type { PuzleEmparejar } from './tipos.ts';

const HIELO = ['hielo picado', 'cubitos', 'sin hielo'] as const;
const CITRICO = ['limón', 'lima', 'naranja', 'sin cítrico'] as const;
const GRADUACION = ['cargada', 'suave'] as const;
const ARTICULO: Record<string, string> = { limón: 'el limón', lima: 'la lima', naranja: 'la naranja' };

interface Copa {
  hielo: (typeof HIELO)[number];
  citrico: (typeof CITRICO)[number];
  carmin: boolean;
  graduacion: (typeof GRADUACION)[number];
}

function describir(c: Copa): string {
  return [c.hielo, c.citrico, c.carmin ? 'carmín' : 'sin carmín', c.graduacion].join(' · ');
}

export function generarVasos(rng: Rng): PuzleEmparejar {
  for (let intento = 0; intento < 200; intento++) {
    const copas: Copa[] = Array.from({ length: 6 }, () => ({
      hielo: elegir(rng, HIELO),
      citrico: elegir(rng, CITRICO),
      carmin: rng() < 0.4,
      graduacion: elegir(rng, GRADUACION),
    }));
    if (new Set(copas.map(describir)).size < 6) continue;
    const personas = barajar(rng, SOSPECHOSOS);
    const solucion = barajar(rng, [0, 1, 2, 3, 4, 5]); // persona i → copa solucion[i]

    const pool: Condicion<number[]>[] = [];
    personas.forEach((p, i) => {
      const n = p.nombre;
      for (const h of HIELO) {
        pool.push({
          texto: h === 'sin hielo' ? `${n} pidió su copa sin hielo.` : `${n} pidió su copa con ${h}.`,
          cumple: (perm) => copas[perm[i]].hielo === h,
        });
      }
      for (const ci of CITRICO) {
        pool.push({
          texto: ci === 'sin cítrico' ? `${n} odia los cítricos.` : `${n} no soporta ${ARTICULO[ci]} en la copa.`,
          cumple: (perm) => (ci === 'sin cítrico' ? copas[perm[i]].citrico === 'sin cítrico' : copas[perm[i]].citrico !== ci),
        });
        if (ci !== 'sin cítrico')
          pool.push({ texto: `${n} siempre pide su copa con ${ci}.`, cumple: (perm) => copas[perm[i]].citrico === ci });
      }
      pool.push({ texto: `${n} se retocó el carmín antes de beber.`, cumple: (perm) => copas[perm[i]].carmin });
      pool.push({ texto: `${n} no llevaba los labios pintados.`, cumple: (perm) => !copas[perm[i]].carmin });
      pool.push({ texto: `${n} iba a por todas: copa bien cargada.`, cumple: (perm) => copas[perm[i]].graduacion === 'cargada' });
      pool.push({ texto: `${n} se estaba cuidando: copa suave.`, cumple: (perm) => copas[perm[i]].graduacion === 'suave' });
      copas.forEach((_, k) => pool.push({ texto: `El vaso ${k + 1} no es de ${n}.`, cumple: (perm) => perm[i] !== k }));
    });
    const pistas = elegirCondiciones(rng, permutaciones(6), (perm) => perm.every((v, i) => v === solucion[i]), pool, 20);
    if (!pistas || pistas.length > 9) continue;

    const correcto: Record<string, string> = {};
    personas.forEach((p, i) => (correcto[`v${solucion[i]}`] = p.id));
    return {
      izquierda: copas.map((c, k) => ({ id: `v${k}`, nombre: `Vaso ${k + 1}`, detalle: describir(c) })),
      derecha: personas.map((p) => ({ id: p.id, nombre: p.nombre })),
      correcto,
      pistas,
      tituloIzq: 'Vasos',
      tituloDer: 'Dueños',
      tituloPistas: 'Lo que dicen de cada uno',
    };
  }
  throw new Error('No se pudieron generar las copas');
}
