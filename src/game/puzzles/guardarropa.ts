// Misión · El perchero de Neyba (Casa de Neyba): seis objetos olvidados ↔ seis sospechosos.
// Cada objeto está ligado al secreto de su dueño; las notas de la encargada lo demuestran.

import { SOSPECHOSOS } from '../../data/caso.ts';
import { barajar, elegir, type Rng } from '../core/rng.ts';
import { elegirCondiciones, permutaciones, type Condicion } from './logica.ts';
import type { PuzleEmparejar } from './tipos.ts';

const OBJETOS: { id: string; nombre: string; conArticulo: string; dueno: string }[] = [
  { id: 'ibuprofeno', nombre: 'Caja de ibuprofeno a medio gastar', conArticulo: 'la caja de ibuprofeno', dueno: 'oscar' },
  { id: 'botas', nombre: 'Caja de botas de fútbol sin estrenar', conArticulo: 'la caja de botas de fútbol', dueno: 'fatier' },
  { id: 'movil', nombre: 'Móvil al 1 % con TikTok abierto', conArticulo: 'el móvil al 1 %', dueno: 'sarita' },
  { id: 'pijama', nombre: 'Pijama doblado dentro de una bolsa', conArticulo: 'el pijama doblado', dueno: 'amic' },
  { id: 'mando', nombre: 'Mando de consola con las pilas gastadas', conArticulo: 'el mando de consola', dueno: 'judio' },
  { id: 'bolsas', nombre: 'Rollo de bolsas para cacas sin estrenar', conArticulo: 'el rollo de bolsas para cacas', dueno: 'madre' },
];

const FUENTES = [
  'Según Neyba,',
  'La etiqueta del perchero dice que',
  'Un vecino recuerda que',
  'En la libreta de la entrada pone que',
  'Por cómo lo mira Tiger, parece que',
];

export function generarGuardarropa(rng: Rng): PuzleEmparejar {
  const objetos = barajar(rng, OBJETOS);
  const personas = barajar(rng, SOSPECHOSOS);
  // solucion[i] = índice en `personas` del dueño del objeto i
  const solucion = objetos.map((o) => personas.findIndex((p) => p.id === o.dueno));
  const universo = permutaciones(objetos.length);
  const pool: Condicion<number[]>[] = [];
  // Solo dos afirmaciones directas; el resto se deduce por descarte.
  for (const i of barajar(rng, [0, 1, 2, 3, 4, 5]).slice(0, 2)) {
    const o = objetos[i];
    pool.push({
      texto: `${elegir(rng, FUENTES)} ${o.conArticulo} ${o.conArticulo.startsWith('la ') ? 'la' : 'lo'} dejó ${personas[solucion[i]].nombre}.`,
      cumple: (perm) => perm[i] === solucion[i],
    });
  }
  objetos.forEach((o, i) => {
    personas.forEach((p, j) => {
      pool.push({
        texto: `${elegir(rng, FUENTES)} ${o.conArticulo} no ${o.conArticulo.startsWith('la ') ? 'la' : 'lo'} dejó ${p.nombre}.`,
        cumple: (perm) => perm[i] !== j,
      });
    });
  });
  const pistas =
    elegirCondiciones(rng, universo, (perm) => perm.every((v, i) => v === solucion[i]), pool, 25) ?? [];

  const correcto: Record<string, string> = {};
  objetos.forEach((o, i) => (correcto[o.id] = personas[solucion[i]].id));
  return {
    izquierda: objetos.map((o) => ({ id: o.id, nombre: o.nombre })),
    derecha: personas.map((p) => ({ id: p.id, nombre: p.nombre })),
    correcto,
    pistas,
    tituloIzq: 'Objetos',
    tituloDer: 'Sospechosos',
    tituloPistas: 'Notas de Neyba',
  };
}
