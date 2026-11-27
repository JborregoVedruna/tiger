// Testimonio de los vecinos: ordenar seis sucesos a partir de testimonios con la hora
// expresada de formas distintas. La clínica cerró a las 18:00.

import { SOSPECHOSOS } from '../../data/caso.ts';
import { barajar, barajarDistinto, capitalizar, entero, type Rng } from '../core/rng.ts';
import type { PuzleOrden } from './tipos.ts';

export const PARADA = 18 * 60;

const SUCESOS = [
  'el panadero dejó el pan en la puerta de Neyba',
  'pasó el camión de la basura por el carril',
  'Tiger maulló en la ventana de la cocina',
  'empezó a soplar el levante',
  'sonó el silbato del socorrista',
  'el cartero dejó un paquete en el buzón',
  'alguien regó las buganvillas de la entrada',
  'un perro estuvo ladrando en la calle',
];

const NUMEROS = ['', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce'];
const MINUTOS: Record<number, string> = { 5: 'cinco', 10: 'diez', 15: 'cuarto', 20: 'veinte', 25: 'veinticinco', 30: 'media' };

export function hhmm(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/** 2:45 → "las tres menos cuarto" */
export function enPalabras(min: number): string {
  let h = Math.floor(min / 60);
  const m = min % 60;
  let resto: string;
  if (m === 0) resto = ' en punto';
  else if (m <= 30) resto = ` y ${MINUTOS[m]}`;
  else {
    h += 1;
    resto = ` menos ${MINUTOS[60 - m]}`;
  }
  const h12 = h % 12 || 12;
  return `${h12 === 1 ? 'la' : 'las'} ${NUMEROS[h12]}${resto}`;
}

const DURACION: Record<number, string> = {
  5: 'cinco minutos',
  10: 'diez minutos',
  15: 'un cuarto de hora',
  20: 'veinte minutos',
  25: 'veinticinco minutos',
  30: 'media hora',
  35: 'treinta y cinco minutos',
  40: 'cuarenta minutos',
  45: 'tres cuartos de hora',
  50: 'cincuenta minutos',
  55: 'cincuenta y cinco minutos',
  60: 'una hora',
};

export function duracion(min: number): string {
  if (min <= 60) return DURACION[min];
  const horas = Math.floor(min / 60);
  const resto = min % 60;
  const textoHoras = horas === 1 ? 'una hora' : `${NUMEROS[horas]} horas`;
  if (resto === 0) return textoHoras;
  const textoResto = DURACION[resto]
    .replace('tres cuartos de hora', 'tres cuartos')
    .replace('un cuarto de hora', 'cuarto')
    .replace('media hora', 'media');
  return `${textoHoras} y ${textoResto}`;
}

type Formato = 'digital' | 'palabras' | 'reloj' | 'relativo';

function elegirFormato(rng: Rng): Formato {
  return (['digital', 'palabras', 'reloj'] as const)[entero(rng, 0, 2)];
}

export function generarReloj(rng: Rng): PuzleOrden {
  const N = 6;
  const tiempos: number[] = [17 * 60 + 25 - 5 * entero(rng, 0, 2)]; // último suceso: 17:15–17:25
  for (let i = 0; i < N - 1; i++) tiempos.unshift(tiempos[0] - 5 * entero(rng, 2, 4));

  const sucesos = barajar(rng, SUCESOS).slice(0, N);
  const testigos = barajar(rng, SOSPECHOSOS).slice(0, N).map((s) => s.nombre);
  // Seis testimonios: cada formato de hora al menos una vez y dos relativos a otro suceso.
  const formatos = barajar<Formato>(rng, ['digital', 'palabras', 'reloj', 'relativo', 'relativo', elegirFormato(rng)]);
  const anclas = formatos.map((f, i) => (f === 'relativo' ? -1 : i)).filter((i) => i >= 0);
  const anclaDe = formatos.map(() => anclas[entero(rng, 0, anclas.length - 1)]);

  const tarjetas = tiempos.map((minuto, i) => {
    const suceso = capitalizar(sucesos[i]);
    let texto: string;
    switch (formatos[i]) {
      case 'digital':
        texto = `${suceso} a las ${hhmm(minuto)}.`;
        break;
      case 'palabras':
        texto = `${suceso} cuando eran ${enPalabras(minuto)}.`;
        break;
      case 'reloj':
        texto = `${suceso} ${duracion(PARADA - minuto)} antes de que cerrara la clínica.`;
        break;
      default: {
        const ancla = anclaDe[i];
        const dif = minuto - tiempos[ancla];
        const referencia = `del momento en que ${sucesos[ancla]}`;
        texto = dif > 0 ? `${suceso} ${duracion(dif)} después ${referencia}.` : `${suceso} ${duracion(-dif)} antes ${referencia}.`;
      }
    }
    return { id: `e${i}`, etiqueta: testigos[i], texto: `«${texto}»` };
  });

  const primero = tarjetas[0];
  return {
    orden: tarjetas.map((t) => t.id),
    tarjetas: barajarDistinto(rng, tarjetas),
    destacado: { etiqueta: 'La clínica cerró a las', valor: hhmm(PARADA) },
    reloj: PARADA,
    ayuda: `Ayuda: el primer suceso es el que cuenta ${primero.etiqueta}.`,
  };
}
