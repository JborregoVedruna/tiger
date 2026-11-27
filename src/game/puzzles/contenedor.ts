// Testimonio de la recepcionista · El transportín: emparejar 6 restos con su procedencia.

import { barajar, elegir, type Rng } from '../core/rng.ts';
import { elegirCondiciones, permutaciones, type Condicion } from './logica.ts';
import type { PuzleEmparejar } from './tipos.ts';

const RESTOS = [
  { id: 'arena', nombre: 'Arena fina de playa', conArticulo: 'la arena fina' },
  { id: 'pinocha', nombre: 'Pinocha de pino', conArticulo: 'la pinocha' },
  { id: 'pelo', nombre: 'Pelo blanco de perro', conArticulo: 'el pelo blanco de perro' },
  { id: 'pipas', nombre: 'Cáscaras de pipas', conArticulo: 'las cáscaras de pipas' },
  { id: 'sal', nombre: 'Costra de sal', conArticulo: 'la costra de sal' },
  { id: 'etiqueta', nombre: 'Etiqueta de unas botas', conArticulo: 'la etiqueta de unas botas' },
];

const PROCEDENCIAS = [
  { id: 'playa', nombre: 'Playa de Zahora', conArticulo: 'la playa de Zahora' },
  { id: 'brena', nombre: 'Pinar de la Breña', conArticulo: 'el pinar de la Breña' },
  { id: 'espera', nombre: 'Sala de espera', conArticulo: 'la sala de espera' },
  { id: 'chiringuito', nombre: 'Chiringuito', conArticulo: 'el chiringuito' },
  { id: 'puerto', nombre: 'Puerto de Barbate', conArticulo: 'el puerto de Barbate' },
  { id: 'tienda', nombre: 'Tienda de deportes', conArticulo: 'la tienda de deportes' },
];

const FUENTES = [
  'La recepcionista asegura que',
  'Según la veterinaria,',
  'La auxiliar de la clínica recuerda que',
  'El informe de la consulta dice que',
  'La recepcionista insiste en que',
];

function verbo(sujeto: string): string {
  return /^(las|los) /.test(sujeto) ? 'salieron' : 'salió';
}

function de(conArticulo: string): string {
  return conArticulo.replace(/^el /, 'del ').replace(/^la /, 'de la ').replace(/^las /, 'de las ');
}

export function generarContenedor(rng: Rng): PuzleEmparejar {
  for (let intento = 0; intento < 100; intento++) {
    const restos = barajar(rng, RESTOS);
    const lugares = barajar(rng, PROCEDENCIAS);
    const solucion = barajar(rng, [0, 1, 2, 3, 4, 5]);
    const pool: Condicion<number[]>[] = [];
    // Dos afirmaciones directas como mucho; el resto se deduce por descarte.
    for (const i of barajar(rng, [0, 1, 2, 3, 4, 5]).slice(0, 2)) {
      const r = restos[i];
      pool.push({
        texto: `${elegir(rng, FUENTES)} ${r.conArticulo} ${verbo(r.conArticulo)} ${de(lugares[solucion[i]].conArticulo)}.`,
        cumple: (p) => p[i] === solucion[i],
      });
    }
    restos.forEach((r, i) =>
      lugares.forEach((l, j) =>
        pool.push({
          texto: `${elegir(rng, FUENTES)} ${r.conArticulo} no ${verbo(r.conArticulo)} ${de(l.conArticulo)}.`,
          cumple: (p) => p[i] !== j,
        }),
      ),
    );
    const pistas = elegirCondiciones(rng, permutaciones(6), (p) => p.every((v, i) => v === solucion[i]), pool, 25);
    if (!pistas || pistas.length > 10) continue;
    const correcto: Record<string, string> = {};
    restos.forEach((r, i) => (correcto[r.id] = lugares[solucion[i]].id));
    return {
      izquierda: restos.map(({ id, nombre }) => ({ id, nombre })),
      derecha: lugares.map(({ id, nombre }) => ({ id, nombre })),
      correcto,
      pistas,
      tituloIzq: 'Restos en el transportín',
      tituloDer: 'Procedencia',
      tituloPistas: 'Lo que dice la recepcionista',
    };
  }
  throw new Error('No se pudo generar el transportín');
}
