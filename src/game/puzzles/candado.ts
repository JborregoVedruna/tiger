// Misión · El candado del patinete (Patinete eléctrico): candado de 3 dígitos.

import { barajar, entero, type Rng } from '../core/rng.ts';
import type { PuzleDiales } from './tipos.ts';

interface Regla {
  texto: string;
  cumple: (d: number[]) => boolean;
}

const P = ['El primer dígito', 'El segundo dígito', 'El tercer dígito'];
const p = ['el primero', 'el segundo', 'el tercero'];
const del = ['del primero', 'del segundo', 'del tercero'];

function reglasCiertas(s: number[]): Regla[] {
  const r: Regla[] = [];
  const suma = s[0] + s[1] + s[2];
  r.push({ texto: `La suma de los tres dígitos es ${suma}.`, cumple: (d) => d[0] + d[1] + d[2] === suma });
  for (let i = 0; i < 3; i++) {
    const par = s[i] % 2 === 0;
    r.push({ texto: `${P[i]} es ${par ? 'par' : 'impar'}.`, cumple: (d) => d[i] % 2 === (par ? 0 : 1) });
    for (let j = 0; j < 3; j++) {
      if (i === j) continue;
      if (s[i] === 2 * s[j]) r.push({ texto: `${P[i]} es el doble ${del[j]}.`, cumple: (d) => d[i] === 2 * d[j] });
      if (s[i] === 3 * s[j]) r.push({ texto: `${P[i]} es el triple ${del[j]}.`, cumple: (d) => d[i] === 3 * d[j] });
      if (i < j) {
        if (s[i] > s[j]) r.push({ texto: `${P[i]} es mayor que ${p[j]}.`, cumple: (d) => d[i] > d[j] });
        else if (s[i] < s[j]) r.push({ texto: `${P[i]} es menor que ${p[j]}.`, cumple: (d) => d[i] < d[j] });
        else r.push({ texto: `${P[i]} y ${p[j]} son iguales.`, cumple: (d) => d[i] === d[j] });
        const dif = Math.abs(s[i] - s[j]);
        if (dif > 0)
          r.push({ texto: `${P[i]} y ${p[j]} se diferencian en ${dif}.`, cumple: (d) => Math.abs(d[i] - d[j]) === dif });
        const sumaPar = s[i] + s[j];
        r.push({ texto: `${P[i]} y ${p[j]} suman ${sumaPar}.`, cumple: (d) => d[i] + d[j] === sumaPar });
      }
    }
  }
  const prod = s[0] * s[2];
  r.push({ texto: `Si multiplicas ${p[0]} por ${p[2]} obtienes ${prod}.`, cumple: (d) => d[0] * d[2] === prod });
  const distintos = new Set(s).size === 3;
  r.push({
    texto: distintos ? 'No hay ningún dígito repetido.' : 'Hay al menos un dígito repetido.',
    cumple: (d) => (new Set(d).size === 3) === distintos,
  });
  return r;
}

const TODAS: number[][] = [];
for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++) for (let c = 0; c <= 9; c++) TODAS.push([a, b, c]);

export function generarCandado(rng: Rng): PuzleDiales {
  let mejor: { digitos: number[]; reglas: string[] } | null = null;
  for (let intento = 0; intento < 60; intento++) {
    const s = [entero(rng, 1, 9), entero(rng, 1, 9), entero(rng, 1, 9)];
    let vivas = TODAS;
    const elegidas: Regla[] = [];
    for (const regla of barajar(rng, reglasCiertas(s))) {
      const siguientes = vivas.filter(regla.cumple);
      if (siguientes.length < vivas.length) {
        elegidas.push(regla);
        vivas = siguientes;
      }
      if (vivas.length === 1) break;
    }
    for (let i = 0; i < 3 && vivas.length > 1; i++) {
      elegidas.push({ texto: `${P[i]} es ${s[i]}.`, cumple: (d) => d[i] === s[i] });
      vivas = vivas.filter((d) => d[i] === s[i]);
    }
    const candidato = { digitos: s, reglas: elegidas.map((r) => r.texto) };
    if (elegidas.length >= 3 && elegidas.length <= 5) {
      mejor = candidato;
      break;
    }
    if (!mejor || Math.abs(elegidas.length - 4) < Math.abs(mejor.reglas.length - 4)) mejor = candidato;
  }
  const m = mejor!;
  return {
    tituloTarjeta: 'PEGATINA DEL MANILLAR',
    lineas: m.reglas.map((r, i) => `${i + 1}. ${r}`),
    diales: ['1.º', '2.º', '3.º'],
    solucion: m.digitos,
    ayuda: `Ayuda: el segundo dígito es ${m.digitos[1]}.`,
  };
}

/** Verificación (tests): ¿las reglas dejan una única combinación? */
export function esUnica(s: number[], lineas: string[]): boolean {
  const mapa = new Map(reglasCiertas(s).map((r) => [r.texto, r]));
  const fijas = lineas.map((l) => {
    const t = l.replace(/^\d+\.\s/, '');
    const m = /^(El \w+ dígito) es (\d)\.$/.exec(t);
    if (m) {
      const i = P.indexOf(m[1]);
      const v = Number(m[2]);
      return (d: number[]) => d[i] === v;
    }
    return mapa.get(t)!.cumple;
  });
  return TODAS.filter((d) => fijas.every((f) => f(d))).length === 1;
}
