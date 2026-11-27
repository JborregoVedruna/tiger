import type { Categoria } from '../../data/caso.ts';

export type Seleccion = Record<Categoria, string>;

export type EstadoMision = 'bloqueada' | 'disponible' | 'descarte' | 'completada';

export type Marca = 'ninguna' | 'sospecha' | 'principal';

export interface Pista {
  mision: number;
  titulo: string;
  parrafos: string[];
  /** Afirmaciones condicionales (solo en los testimonios). */
  condicionales?: string[];
  /** Elemento que la pista exculpa expresamente (misiones de descarte). */
  senalado?: { categoria: Categoria; id: string };
}

export interface RegistroMision {
  estado: EstadoMision;
  fallos: number;
  pista?: Pista;
  /** Categoría que esta misión permite descartar (se asigna al resolver el puzle). */
  categoria?: Categoria;
  /** Elemento que el jugador descartó en esta misión. */
  descarte?: string;
}

export interface Partida {
  version: 2;
  semilla: number;
  solucion: Seleccion;
  descartados: Record<Categoria, string[]>;
  misiones: RegistroMision[];
  marcas: Record<string, Marca>;
  notasLibres: string;
  acusaciones: number;
  resuelta: boolean;
  /** Historia aleatoria o la predeterminada (siempre la misma). */
  modo?: 'aleatorio' | 'predeterminado';
  /** Vidas que quedan (cada respuesta fallida en una misión resta una). */
  vidas?: number;
  /** La partida se perdió por fallar sin vidas. */
  perdida?: boolean;
}
