// Misión · La radio de la moto: ordenar canciones del casco Bluetooth por duración y testimonios.
// La batería se agota exactamente a las 10:45:00.

import { SOSPECHOSOS } from '../../data/caso.ts';
import { barajar, barajarDistinto, elegir, entero, type Rng } from '../core/rng.ts';
import { elegirCondiciones, permutaciones, type Condicion } from './logica.ts';
import type { PuzleOrden } from './tipos.ts';

const CANCIONES = [
  'Mediterráneo',
  'Sarandonga',
  'La flaca',
  'Corazón contento',
  'Chiringuito',
  'Bailando',
  'Despechá',
  'Paquito el chocolatero',
  'Gasolina',
  'La bomba',
];

const FIN = 10 * 3600 + 45 * 60;

export function mmss(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function hora(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function inicios(orden: number[], duraciones: number[]): number[] {
  const res: number[] = new Array(orden.length);
  let t = FIN;
  for (let k = orden.length - 1; k >= 0; k--) {
    t -= duraciones[orden[k]];
    res[orden[k]] = t;
  }
  return res;
}

export function generarDj(rng: Rng): PuzleOrden {
  for (let intento = 0; intento < 400; intento++) {
    const n = 6;
    const titulos = barajar(rng, CANCIONES).slice(0, n);
    const duraciones = titulos.map(() => 150 + 5 * entero(rng, 0, 30)); // 2:30 – 5:00, de 5 en 5 s
    if (new Set(duraciones).size < n) continue;
    const solucion = barajar(rng, [0, 1, 2, 3, 4, 5]); // orden de reproducción (índices de canción)
    const inicioReal = inicios(solucion, duraciones);
    const pos = (orden: number[], c: number) => orden.indexOf(c);
    const personas = barajar(rng, SOSPECHOSOS);

    const pool: Condicion<number[]>[] = [];
    titulos.forEach((t, c) => {
      const p = personas[c % personas.length].nombre;
      pool.push({
        texto: `${p}: «${elegir(rng, ['Iba por el carril', 'Estaba en la playa', 'Estaba en el chiringuito'])} cuando oí «${t}» en la moto: eran las ${hora(inicioReal[c])}.»`,
        cumple: (o) => inicios(o, duraciones)[c] === inicioReal[c],
      });
      titulos.forEach((u, d) => {
        if (c === d) return;
        pool.push({ texto: `«${t}» sonó antes que «${u}».`, cumple: (o) => pos(o, c) < pos(o, d) });
        pool.push({ texto: `Justo después de «${t}» sonó «${u}».`, cumple: (o) => pos(o, d) === pos(o, c) + 1 });
      });
    });
    const universo = permutaciones(n);
    const esSol = (o: number[]) => o.every((v, i) => v === solucion[i]);
    // Siempre al menos un testimonio con hora (obliga a usar las duraciones).
    const conHora = pool.filter((c, i) => i % (1 + 2 * (n - 1)) === 0 && c.cumple(solucion));
    const ancla = conHora.find((c) => !c.texto.includes(hora(FIN - duraciones[solucion[n - 1]])));
    const pistas = elegirCondiciones(rng, universo, esSol, pool.filter((c) => !c.texto.includes('Justo después') || rng() < 0.4), 12, ancla ? [ancla] : []);
    if (!pistas || pistas.length > 6 || pistas.filter((p) => p.includes('eran las')).length < 2) continue;

    const tarjetas = titulos.map((t, c) => ({ id: `s${c}`, etiqueta: `Duración ${mmss(duraciones[c])}`, texto: `«${t}»` }));
    return {
      tarjetas: barajarDistinto(rng, tarjetas),
      orden: solucion.map((c) => `s${c}`),
      pistas,
      destacado: { etiqueta: 'La batería del casco se agotó a las', valor: '10:45:00' },
      ayuda: `Ayuda: la última canción empezó a las ${hora(FIN - duraciones[solucion[n - 1]])}. Desde ahí, ve restando duraciones hacia atrás.`,
    };
  }
  throw new Error('No se pudo generar la sesión del DJ');
}
