// Misión · El aparcabicis (Bicicleta): cinco bicis en fila en el aparcabicis de la playa.

import { SOSPECHOSOS } from '../../data/caso.ts';
import { barajar, elegir, type Rng } from '../core/rng.ts';
import { elegirCondiciones, permutaciones, type Condicion } from './logica.ts';
import type { PuzleEmparejar } from './tipos.ts';

const MANIAS = ['porque ahí se le pinchó una rueda', 'porque ahí da el sol todo el día', 'porque ahí cagan las gaviotas', 'porque está pegado a la ducha'];
const DEUDAS = ['una cerveza', '20 €', 'un favor de hace años', 'un candado'];
const MOTIVOS = ['para compartir candado', 'para no perder de vista su bici', 'porque llegaron juntos', 'para dejarle la bomba de aire'];

export function generarReservados(rng: Rng): PuzleEmparejar {
  const n = 5;
  for (let intento = 0; intento < 200; intento++) {
    const personas = barajar(rng, SOSPECHOSOS).slice(0, n);
    const solucion = barajar(rng, [0, 1, 2, 3, 4]); // persona i → sillón solucion[i] (0 = izquierda)
    const pool: Condicion<number[]>[] = [];
    personas.forEach((a, i) => {
      for (let s = 0; s < n; s++) {
        pool.push({
          texto: `${a.nombre} no quiso el hueco ${s + 1} ${elegir(rng, MANIAS)}.`,
          cumple: (p) => p[i] !== s,
        });
      }
      pool.push({
        texto: `${a.nombre} no quiso un extremo: «ahí te roban el sillín».`,
        cumple: (p) => p[i] !== 0 && p[i] !== n - 1,
      });
      pool.push({
        texto: `${a.nombre} aparcó en un extremo para salir el primero.`,
        cumple: (p) => p[i] === 0 || p[i] === n - 1,
      });
      personas.forEach((b, j) => {
        if (i === j) return;
        pool.push({
          texto: `${a.nombre} aparcó justo a la izquierda de ${b.nombre} ${elegir(rng, MOTIVOS)}.`,
          cumple: (p) => p[i] === p[j] - 1,
        });
        if (i < j) {
          pool.push({
            texto: `${a.nombre} le debe ${elegir(rng, DEUDAS)} a ${b.nombre}, así que no aparcaron juntos.`,
            cumple: (p) => Math.abs(p[i] - p[j]) !== 1,
          });
        }
        pool.push({ texto: `La bici de ${a.nombre} estaba más a la derecha que la de ${b.nombre}.`, cumple: (p) => p[i] > p[j] });
      });
    });
    const pistas = elegirCondiciones(rng, permutaciones(n), (p) => p.every((v, i) => v === solucion[i]), pool, 25);
    if (!pistas || pistas.length > 7) continue;

    const correcto: Record<string, string> = {};
    personas.forEach((p, i) => (correcto[p.id] = `s${solucion[i]}`));
    return {
      izquierda: personas.map((p) => ({ id: p.id, nombre: p.nombre })),
      derecha: Array.from({ length: n }, (_, s) => ({
        id: `s${s}`,
        nombre: `Hueco ${s + 1}`,
        detalle: s === 0 ? 'extremo izquierdo' : s === n - 1 ? 'extremo derecho' : undefined,
      })),
      correcto,
      pistas,
      tituloIzq: 'Ciclistas',
      tituloDer: 'Huecos (de izquierda a derecha)',
      tituloPistas: 'Lo que recuerda el del alquiler de bicis',
    };
  }
  throw new Error('No se pudo generar el aparcabicis');
}
