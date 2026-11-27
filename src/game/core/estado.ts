// Estado de la partida: solución secreta, misiones, descartes y notas del cuaderno.
// Es la única fuente de verdad; Phaser y los paneles DOM se suscriben a sus cambios.

import { CATEGORIAS, ELEMENTOS, HISTORIA_PREDETERMINADA, porId, type Categoria } from '../../data/caso.ts';
import { leerModo, type ModoHistoria } from '../../lib/ajustes.ts';
import { CLAVE_PARTIDA } from '../../lib/partidaGuardada.ts';
import { INDICES_DESCARTE, INDICES_TESTIMONIO, MISIONES } from '../misiones.ts';
import { Emisor } from './eventos.ts';
import {
  candidatosDe,
  generarAfirmaciones,
  generarPistaDescarte,
  generarPistaTestimonio,
  parteDeAfirmaciones,
} from './pistas.ts';
import { crearRng, derivar, elegir, semillaAleatoria } from './rng.ts';
import type { Marca, Partida, Pista } from './tipos.ts';

export const TOTAL_MISIONES = MISIONES.length; // 15
export const VIDAS_INICIALES = 3;
/**
 * Las 12 misiones de lugares y armas terminan con un descarte de 1 elemento.
 * Las categorías se alternan (sospechoso, arma, lugar…), así que se descartan 4 por categoría
 * y quedan 2 candidatos en cada una. Los 3 testimonios dan afirmaciones condicionales.
 */
const ROTACION: Categoria[] = ['sospechoso', 'arma', 'lugar'];

const CLAVE = CLAVE_PARTIDA;

export const eventos = new Emisor<{
  cambio: Partida;
  pista: { mision: number; pista: Pista };
}>();

let partida: Partida | null = null;

export function esTestimonio(mision: number): boolean {
  return INDICES_TESTIMONIO.includes(mision);
}

export function nuevaPartida(semillaElegida?: number, modo: ModoHistoria = leerModo()): Partida {
  const predeterminada = modo === 'predeterminado';
  const semilla = semillaElegida ?? (predeterminada ? HISTORIA_PREDETERMINADA.semilla : semillaAleatoria());
  const rng = crearRng(semilla);
  partida = {
    version: 2,
    modo,
    semilla,
    solucion: predeterminada
      ? { ...HISTORIA_PREDETERMINADA.solucion }
      : {
          sospechoso: elegir(rng, ELEMENTOS.sospechoso).id,
          arma: elegir(rng, ELEMENTOS.arma).id,
          lugar: elegir(rng, ELEMENTOS.lugar).id,
        },
    descartados: { sospechoso: [], arma: [], lugar: [] },
    misiones: MISIONES.map((_, i) => ({ estado: esTestimonio(i) ? 'bloqueada' : 'disponible', fallos: 0 })),
    marcas: {},
    notasLibres: '',
    acusaciones: 0,
    resuelta: false,
    vidas: VIDAS_INICIALES,
    perdida: false,
  };
  guardar();
  eventos.emit('cambio', partida);
  return partida;
}

function esValida(p: unknown): p is Partida {
  const x = p as Partida;
  return (
    !!x &&
    x.version === 2 &&
    typeof x.semilla === 'number' &&
    Array.isArray(x.misiones) &&
    x.misiones.length === TOTAL_MISIONES &&
    CATEGORIAS.every((c) => typeof x.solucion?.[c] === 'string' && Array.isArray(x.descartados?.[c]))
  );
}

export function cargarOCrear(): Partida {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) {
      const p = JSON.parse(crudo);
      // Si el jugador cambió el modo en Ajustes, la partida guardada ya no vale.
      if (esValida(p) && (p.modo ?? 'aleatorio') === leerModo()) {
        partida = p;
        return p;
      }
    }
  } catch {
    /* almacenamiento no disponible: partida en memoria */
  }
  return nuevaPartida();
}

function guardar(): void {
  if (!partida) return;
  try {
    localStorage.setItem(CLAVE, JSON.stringify(partida));
  } catch {
    /* sin persistencia */
  }
}

function cambio(): void {
  guardar();
  if (partida) eventos.emit('cambio', partida);
}

export function obtener(): Partida {
  return partida ?? cargarOCrear();
}

export function candidatos(cat: Categoria): string[] {
  return candidatosDe(cat, obtener().descartados);
}

/** Los testimonios se abren cuando están completadas las 12 misiones de lugares y armas. */
function desbloquearTestimonios(): void {
  const p = obtener();
  if (INDICES_DESCARTE.every((i) => p.misiones[i].estado === 'completada')) {
    for (const i of INDICES_TESTIMONIO) if (p.misiones[i].estado === 'bloqueada') p.misiones[i].estado = 'disponible';
  }
}

/** Siguiente misión pendiente en orden (1 → 15, volviendo al principio). -1 si no queda ninguna. */
export function siguienteMision(desde: number): number {
  const p = obtener();
  const n = p.misiones.length;
  for (let k = 1; k <= n; k++) {
    const i = (desde + k) % n;
    if (p.misiones[i].estado === 'disponible') return i;
  }
  return -1;
}

/** Todas las afirmaciones condicionales de la partida (deterministas una vez hechos los 12 descartes). */
function afirmacionesDeLaPartida(): string[] {
  const p = obtener();
  return generarAfirmaciones(p.solucion, p.descartados, crearRng(derivar(p.semilla, 200)), INDICES_TESTIMONIO.length);
}

/** El jugador ha resuelto el puzle de la misión: se genera y entrega su pista. */
export function resolverPuzle(i: number): Pista | undefined {
  const p = obtener();
  const m = p.misiones[i];
  if (m.estado !== 'disponible' || p.perdida) return m.pista;

  let pista: Pista;
  if (esTestimonio(i)) {
    const k = INDICES_TESTIMONIO.indexOf(i);
    pista = generarPistaTestimonio(i, parteDeAfirmaciones(afirmacionesDeLaPartida(), k, INDICES_TESTIMONIO.length));
    m.estado = 'completada';
  } else {
    // La pista va rotando de categoría, saltándose las que ya solo tienen 2 candidatos.
    const yaResueltas = INDICES_DESCARTE.filter((j) => p.misiones[j].pista).length;
    const rotada = [0, 1, 2].map((k) => ROTACION[(yaResueltas + k) % ROTACION.length]);
    const categoria = rotada.find((c) => candidatosDe(c, p.descartados).length > CANDIDATOS_FINALES) ?? rotada[0];
    const pendientes = INDICES_DESCARTE.map((j) => p.misiones[j])
      .filter((r) => r.estado === 'descarte' && r.pista?.senalado)
      .map((r) => r.pista!.senalado!.id);
    const rng = crearRng(derivar(p.semilla, 100 + i));
    pista = generarPistaDescarte(i, categoria, p.solucion, p.descartados, pendientes, rng, protegidos());
    m.categoria = categoria;
    m.estado = 'descarte';
  }

  m.pista = pista;
  cambio();
  eventos.emit('pista', { mision: i, pista });
  return pista;
}

export function vidas(): number {
  return obtener().vidas ?? VIDAS_INICIALES;
}

/**
 * Respuesta fallida en una misión: resta una vida. Si ya no quedaban vidas, la partida se pierde.
 */
export function registrarFallo(i: number): { fallos: number; vidas: number; perdida: boolean } {
  const p = obtener();
  p.misiones[i].fallos += 1;
  const quedan = p.vidas ?? VIDAS_INICIALES;
  if (quedan > 0) p.vidas = quedan - 1;
  else p.perdida = true;
  cambio();
  return { fallos: p.misiones[i].fallos, vidas: p.vidas ?? 0, perdida: !!p.perdida };
}

/**
 * En la historia predeterminada, la alternativa falsa (Oscar Plano, en taxi, a las 15:00) llega
 * siempre hasta la decisión final: ni se señala en las pistas ni se puede descartar.
 */
export function protegidos(): string[] {
  const p = obtener();
  return p.modo === 'predeterminado' ? Object.values(HISTORIA_PREDETERMINADA.finalistas) : [];
}

/** Candidatos que deben quedar en cada categoría para la acusación final. */
export const CANDIDATOS_FINALES = 2;

/** ¿Se puede descartar todavía algo de esta categoría? */
export function quedaMargen(cat: Categoria): boolean {
  return candidatos(cat).length > CANDIDATOS_FINALES;
}

export type ResultadoDescarte =
  | { ok: true }
  | { ok: false; motivo: 'estado' | 'invalido' | 'limite' }
  | { ok: false; motivo: 'contradice' | 'pronto'; categoria: Categoria };

export function intentarDescarte(i: number, id: string | null): ResultadoDescarte {
  const p = obtener();
  const m = p.misiones[i];
  if (m.estado !== 'descarte') return { ok: false, motivo: 'estado' };
  if (!id) return { ok: false, motivo: 'invalido' };
  // Se puede descartar un elemento de cualquier categoría (los 18), no solo la de la pista.
  const cat = porId(id).categoria;
  if (!candidatos(cat).includes(id)) return { ok: false, motivo: 'invalido' };
  if (id === p.solucion[cat]) return { ok: false, motivo: 'contradice', categoria: cat };
  if (protegidos().includes(id)) return { ok: false, motivo: 'pronto', categoria: cat };
  if (!quedaMargen(cat)) return { ok: false, motivo: 'limite' };

  p.descartados[cat].push(id);
  m.descarte = id;
  m.estado = 'completada';
  desbloquearTestimonios();
  cambio();
  return { ok: true };
}

export function puedeAcusar(): boolean {
  const p = obtener();
  return !p.resuelta && !p.perdida && p.misiones.every((m) => m.estado === 'completada');
}

/** Afirmaciones de los testimonios ya obtenidos, en orden. */
export function afirmacionesObtenidas(): string[] {
  const p = obtener();
  return INDICES_TESTIMONIO.flatMap((i) => p.misiones[i].pista?.condicionales ?? []);
}

export function acusar(sel: Record<Categoria, string>): { correcto: boolean; fallos: Categoria[] } {
  const p = obtener();
  const fallos = CATEGORIAS.filter((c) => sel[c] !== p.solucion[c]);
  p.acusaciones += 1;
  if (fallos.length === 0) p.resuelta = true;
  cambio();
  return { correcto: fallos.length === 0, fallos };
}

const CICLO: Marca[] = ['ninguna', 'sospecha', 'principal'];

export function alternarMarca(id: string): Marca {
  const p = obtener();
  const actual = p.marcas[id] ?? 'ninguna';
  const siguiente = CICLO[(CICLO.indexOf(actual) + 1) % CICLO.length];
  p.marcas[id] = siguiente;
  cambio();
  return siguiente;
}

/** Las notas libres se guardan sin emitir cambio (evita repintar mientras se escribe). */
export function guardarNotas(texto: string): void {
  obtener().notasLibres = texto;
  guardar();
}

/** Misión en la que se descartó un elemento (o -1). */
export function misionDelDescarte(id: string): number {
  return obtener().misiones.findIndex((m) => m.descarte === id);
}
