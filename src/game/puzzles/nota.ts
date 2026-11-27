// Misión · La nota en la arena (Playa de Zahora): reconstruir el orden de diez fragmentos.

import { barajarDistinto, elegir, type Rng } from '../core/rng.ts';

export interface Fragmento {
  id: string;
  texto: string;
}

export interface PuzleNota {
  fragmentos: Fragmento[];
  orden: string[];
}

// Cada nota tiene 3 frases que cuentan una misma idea, rotas en 10 trozos.
// Las mayúsculas y los signos ayudan a encajarlos.
const NOTAS: string[][] = [
  // 1. Tiger sin comer
  [
    'Si alguien lee esto,',
    'Tiger no ha comido',
    'desde esta mañana.',
    'Ha estado maullando',
    'junto a la puerta',
    'un buen rato.',
    'Quien se lo haya llevado,',
    'que me avise',
    'antes de que',
    'vuelva Begoña.',
  ],
  // 2. El transportín desaparecido
  [
    'El transportín de Tiger',
    'ya no está',
    'en el armario.',
    'Alguien se ha llevado',
    'también su cartilla',
    'de vacunas.',
    'Begoña se va a enfadar',
    'muchísimo',
    'cuando se entere',
    'de todo esto.',
  ],
  // 3. La cita de Tiger
  [
    'Tiger tiene cita',
    'en Barbate',
    'esta semana.',
    'Solo Begoña sabe',
    'qué le pasa',
    'en la oreja.',
    'Que nadie lo lleve',
    'sin avisarla,',
    'por favor,',
    'os lo pido.',
  ],
  // 4. Los pelos en el felpudo
  [
    'He encontrado',
    'pelos grises',
    'en el felpudo.',
    'Tiger no sale nunca',
    'por la puerta',
    'de la calle.',
    'Si alguien lo ha sacado,',
    'que lo diga ya,',
    'que Begoña',
    'está de camino.',
  ],
];

export function generarNota(rng: Rng): PuzleNota {
  const nota = elegir(rng, NOTAS);
  const fragmentos = nota.map((texto, i) => ({ id: `f${i}`, texto }));
  return {
    orden: fragmentos.map((f) => f.id),
    fragmentos: barajarDistinto(rng, fragmentos),
  };
}
