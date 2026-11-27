// Lectura ligera de la partida guardada (sin cargar el juego), para la portada.

import { leerModo } from './ajustes.ts';

export const CLAVE_PARTIDA = 'partida:v1';

export interface ResumenPartida {
  hechas: number;
  total: number;
  resuelta: boolean;
}

/** Devuelve la partida en curso si existe, es del modo actual y no está resuelta. */
export function partidaEnCurso(): ResumenPartida | null {
  try {
    const crudo = localStorage.getItem(CLAVE_PARTIDA);
    if (!crudo) return null;
    const p = JSON.parse(crudo);
    if (!Array.isArray(p?.misiones) || (p.modo ?? 'aleatorio') !== leerModo()) return null;
    const hechas = p.misiones.filter((m: { estado?: string }) => m.estado === 'completada').length;
    if (p.resuelta || p.perdida) return null;
    return { hechas, total: p.misiones.length, resuelta: !!p.resuelta };
  } catch {
    return null;
  }
}

export function borrarPartida(): void {
  try {
    localStorage.removeItem(CLAVE_PARTIDA);
  } catch {
    /* sin almacenamiento */
  }
}
