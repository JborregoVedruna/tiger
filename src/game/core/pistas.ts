// Generación de pistas. Todas se construyen a partir de la solución secreta,
// así que nunca pueden contradecirla.

import { CATEGORIAS, ELEMENTOS, conTratamiento, porId, type Arma, type Categoria, type Lugar } from '../../data/caso.ts';
import { MISIONES } from '../misiones.ts';
import { capitalizar, elegir, type Rng } from './rng.ts';
import type { Pista, Seleccion } from './tipos.ts';

export function candidatosDe(cat: Categoria, descartados: Record<Categoria, string[]>): string[] {
  return ELEMENTOS[cat].map((e) => e.id).filter((id) => !descartados[cat].includes(id));
}

/**
 * Pista de las misiones de lugares y armas: exculpa un elemento de la categoría indicada
 * que siga en juego (y que no haya señalado ya otra pista pendiente de descarte).
 */
export function generarPistaDescarte(
  mision: number,
  categoria: Categoria,
  solucion: Seleccion,
  descartados: Record<Categoria, string[]>,
  excluir: string[],
  rng: Rng,
  /** Elementos que nunca se señalan (historia predeterminada: los finalistas falsos). */
  protegidos: readonly string[] = [],
): Pista {
  const inocentes = candidatosDe(categoria, descartados).filter(
    (id) => id !== solucion[categoria] && !protegidos.includes(id),
  );
  const libres = inocentes.filter((id) => !excluir.includes(id));
  const id = elegir(rng, libres.length ? libres : inocentes);
  const info = MISIONES[mision];
  return {
    mision,
    titulo: `Misión ${info.numeral} · ${info.titulo}`,
    parrafos: [info.introPista, `${capitalizar(porId(id).pistaInocente)}.`],
    senalado: { categoria, id },
  };
}

// ---------- Testimonios: afirmaciones condicionales ----------

interface Literal {
  cat: Categoria;
  id: string;
  positivo: boolean;
}

interface Afirmacion {
  tipo: 'si' | 'alguna';
  a: Literal;
  b: Literal;
}

type Combinacion = Seleccion;

function cumpleLiteral(l: Literal, c: Combinacion): boolean {
  return (c[l.cat] === l.id) === l.positivo;
}

function cumple(af: Afirmacion, c: Combinacion): boolean {
  const a = cumpleLiteral(af.a, c);
  const b = cumpleLiteral(af.b, c);
  return af.tipo === 'si' ? !a || b : a || b;
}

function textoLiteral(l: Literal): string {
  const e = porId(l.id);
  if (l.cat === 'sospechoso') {
    const n = conTratamiento(e.nombre);
    return l.positivo ? `quien llevó a Tiger fue ${n}` : `${n} no llevó a Tiger`;
  }
  if (l.cat === 'arma') {
    const a = e as Arma;
    return l.positivo ? `lo llevaron ${a.modo}` : `no lo llevaron ${a.modo}`;
  }
  const lu = e as Lugar;
  return l.positivo ? `lo llevaron ${lu.enLugar}` : `no lo llevaron ${lu.enLugar}`;
}

function textoAfirmacion(af: Afirmacion): string {
  if (af.tipo === 'si') return `Si ${textoLiteral(af.a)}, entonces ${textoLiteral(af.b)}.`;
  return `Al menos una de estas dos cosas es cierta: ${textoLiteral(af.a)}, o ${textoLiteral(af.b)}.`;
}

function combinaciones(listas: Record<Categoria, string[]>): Combinacion[] {
  const res: Combinacion[] = [];
  for (const s of listas.sospechoso)
    for (const a of listas.arma) for (const l of listas.lugar) res.push({ sospechoso: s, arma: a, lugar: l });
  return res;
}

function igual(a: Combinacion, b: Combinacion): boolean {
  return CATEGORIAS.every((c) => a[c] === b[c]);
}

/**
 * Afirmaciones condicionales, todas verdaderas para la solución, que entre los candidatos
 * restantes solo dejan una combinación posible: la solución. Devuelve al menos `minimo`.
 */
export function generarAfirmaciones(
  solucion: Seleccion,
  descartados: Record<Categoria, string[]>,
  rng: Rng,
  minimo = 3,
): string[] {
  const listas = {
    sospechoso: candidatosDe('sospechoso', descartados),
    arma: candidatosDe('arma', descartados),
    lugar: candidatosDe('lugar', descartados),
  };
  const abiertas = CATEGORIAS.filter((c) => listas[c].length > 1);
  if (abiertas.length === 0) return [];
  if (abiertas.length === 1) {
    const cat = abiertas[0];
    return [capitalizar(`está demostrado que ${textoLiteral({ cat, id: solucion[cat], positivo: true })}.`)];
  }

  const aleatoria = (): Afirmacion => {
    const catA = elegir(rng, abiertas);
    const catB = elegir(rng, abiertas.filter((c) => c !== catA));
    return {
      tipo: rng() < 0.7 ? 'si' : 'alguna',
      a: { cat: catA, id: elegir(rng, listas[catA]), positivo: rng() < 0.6 },
      b: { cat: catB, id: elegir(rng, listas[catB]), positivo: rng() < 0.6 },
    };
  };

  const todas = combinaciones(listas).filter((c) => !igual(c, solucion));
  let vivas = todas;
  const elegidas: Afirmacion[] = [];

  for (let intento = 0; intento < 2000 && vivas.length > 0; intento++) {
    const af = aleatoria();
    if (!cumple(af, solucion)) continue;
    const restantes = vivas.filter((c) => cumple(af, c));
    if (restantes.length === vivas.length) continue;
    elegidas.push(af);
    vivas = restantes;
  }
  // Respaldo determinista (prácticamente nunca necesario).
  for (const c of vivas) {
    const cat = abiertas.find((k) => c[k] !== solucion[k])!;
    elegidas.push({
      tipo: 'alguna',
      a: { cat, id: solucion[cat], positivo: true },
      b: { cat, id: solucion[cat], positivo: true },
    });
  }

  // Quita las redundantes: deja solo las necesarias para que la solución sea única.
  const descartaTodas = (lista: Afirmacion[]) => todas.every((c) => lista.some((af) => !cumple(af, c)));
  for (let i = elegidas.length - 1; i >= 0; i--) {
    const sin = elegidas.filter((_, k) => k !== i);
    if (descartaTodas(sin)) elegidas.splice(i, 1);
  }

  const textos = elegidas.map((af) => capitalizar(textoAfirmacion(af)));
  // Relleno con afirmaciones ciertas (aunque no descarten nada) para repartir entre los testimonios.
  for (let intento = 0; intento < 500 && textos.length < minimo; intento++) {
    const af = aleatoria();
    const t = capitalizar(textoAfirmacion(af));
    if (cumple(af, solucion) && !textos.includes(t)) textos.splice(Math.floor(rng() * (textos.length + 1)), 0, t);
  }
  return textos;
}

/** Reparte las afirmaciones entre los testimonios: la parte `k` de `n`. */
export function parteDeAfirmaciones(todas: string[], k: number, n: number): string[] {
  return todas.filter((_, i) => i % n === k);
}

export function generarPistaTestimonio(mision: number, condicionales: string[]): Pista {
  const info = MISIONES[mision];
  return {
    mision,
    titulo: `Misión ${info.numeral} · ${info.titulo}`,
    parrafos: [info.introPista],
    condicionales,
  };
}
