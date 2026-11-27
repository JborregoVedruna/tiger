// Generador pseudoaleatorio con semilla (mulberry32): cada partida es reproducible
// a partir de su semilla, de modo que los puzles no cambian al recargar la página.

export type Rng = () => number;

export function crearRng(semilla: number): Rng {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deriva una semilla independiente para un subproceso (misión, pista...). */
export function derivar(semilla: number, canal: number): number {
  let h = (semilla ^ Math.imul(canal + 1, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

export function semillaAleatoria(): number {
  try {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0];
  } catch {
    return Math.floor(Math.random() * 2 ** 32);
  }
}

export function entero(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function elegir<T>(rng: Rng, lista: readonly T[]): T {
  return lista[Math.floor(rng() * lista.length)];
}

export function barajar<T>(rng: Rng, lista: readonly T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/** Baraja garantizando que el resultado no coincide con el orden original. */
export function barajarDistinto<T>(rng: Rng, lista: readonly T[]): T[] {
  if (lista.length < 2) return [...lista];
  for (let intento = 0; intento < 20; intento++) {
    const r = barajar(rng, lista);
    if (r.some((v, i) => v !== lista[i])) return r;
  }
  return [...lista.slice(1), lista[0]];
}

export function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
