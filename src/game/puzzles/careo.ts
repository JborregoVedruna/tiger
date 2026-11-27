// Testimonio de los socorristas · El careo: tres socorristas, exactamente uno miente.

import { barajar, capitalizar, elegir, entero, type Rng } from '../core/rng.ts';
import type { PuzleElegir } from './tipos.ts';

const CAMAREROS = ['Lucía, socorrista de Zahora', 'Rubén, el de la torre 2', 'Dani, el de la moto de agua', 'Marta, jefa de socorristas', 'Íker, el de la bandera'];

type Frase =
  | { tipo: 'miente' | 'verdad'; obj: number }
  | { tipo: 'alguno' | 'ambos'; a: number; b: number };

function esCierta(f: Frase, mentiroso: number): boolean {
  switch (f.tipo) {
    case 'miente':
      return mentiroso === f.obj;
    case 'verdad':
      return mentiroso !== f.obj;
    case 'alguno':
      return mentiroso === f.a || mentiroso === f.b;
    case 'ambos':
      return mentiroso !== f.a && mentiroso !== f.b;
  }
}

/** Hipótesis de mentiroso compatibles con las frases. */
export function compatibles(frases: Frase[]): number[] {
  return [0, 1, 2].filter((h) => frases.every((f, i) => esCierta(f, h) === (i !== h)));
}

function fraseAleatoria(rng: Rng, hablante: number): Frase {
  const otros = [0, 1, 2].filter((x) => x !== hablante);
  const r = rng();
  if (r < 0.35) return { tipo: 'miente', obj: elegir(rng, otros) };
  if (r < 0.65) return { tipo: 'verdad', obj: elegir(rng, otros) };
  if (r < 0.85) return { tipo: 'alguno', a: otros[0], b: otros[1] };
  return { tipo: 'ambos', a: otros[0], b: otros[1] };
}

function texto(f: Frase, n: string[]): string {
  switch (f.tipo) {
    case 'miente':
      return `${n[f.obj]} está mintiendo.`;
    case 'verdad':
      return `${n[f.obj]} dice la verdad.`;
    case 'alguno':
      return `O ${n[f.a]} o ${n[f.b]} miente.`;
    case 'ambos':
      return `${n[f.a]} y ${n[f.b]} dicen la verdad.`;
  }
}

export function generarCareo(rng: Rng): PuzleElegir & { mentiroso: number } {
  const completos = barajar(rng, CAMAREROS).slice(0, 3);
  const cortos = completos.map((c) => c.split(',')[0]);
  const mentiroso = entero(rng, 0, 2);
  let frases: Frase[] = [];
  for (let intento = 0; intento < 1000; intento++) {
    frases = [0, 1, 2].map((i) => fraseAleatoria(rng, i));
    const sol = compatibles(frases);
    if (sol.length === 1 && sol[0] === mentiroso) break;
  }
  const sincero = [0, 1, 2].find((i) => i !== mentiroso)!;
  return {
    mentiroso,
    correcta: mentiroso,
    opciones: completos.map((nombre, i) => ({ titulo: nombre, texto: `«${capitalizar(texto(frases[i], cortos))}»` })),
    ayuda: `Ayuda: ${cortos[sincero]} dice la verdad.`,
  };
}
