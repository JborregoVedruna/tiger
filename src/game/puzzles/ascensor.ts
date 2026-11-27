// Misión · Los billetes del autobús (Autobús): la máquina ha perdido una parada.
// Billete de persona: 2,75 €; billete de transportín: 1,20 €. Con la recaudación total solo hay
// una combinación posible de personas y transportines para la parada borrada.

import { barajar, entero, type Rng } from '../core/rng.ts';
import type { PuzleDiales } from './tipos.ts';

const PERSONA = 275; // céntimos
const TRANSPORTIN = 120; // céntimos

export function euros(c: number): string {
  return `${Math.floor(c / 100)},${String(c % 100).padStart(2, '0')} €`;
}

/** Combinaciones (personas, transportines) que suman exactamente esa cantidad. */
export function combinaciones(centimos: number): [number, number][] {
  const res: [number, number][] = [];
  for (let p = 0; p <= 9; p++) for (let t = 0; t <= 9; t++) if (p * PERSONA + t * TRANSPORTIN === centimos) res.push([p, t]);
  return res;
}

const PARADAS = ['El Palmar', 'Los Caños de Meca', 'Zahora', 'Faro de Trafalgar', 'Mangueta', 'La Breña'];

export function generarAutobus(rng: Rng): PuzleDiales {
  for (let intento = 0; intento < 1000; intento++) {
    const [p1, p2, p3] = barajar(rng, PARADAS).slice(0, 3);
    const a0 = entero(rng, 1, 5);
    const t0 = entero(rng, 0, 2);
    const aB = entero(rng, 1, 6); // parada borrada
    const tB = entero(rng, 1, 4);
    const a2 = entero(rng, 1, 4); // siempre sube alguien (los transportines no viajan solos)
    const t2 = entero(rng, 0, 2);
    const total = (a0 + aB + a2) * PERSONA + (t0 + tB + t2) * TRANSPORTIN;
    // La parte borrada debe tener una única descomposición.
    if (combinaciones(aB * PERSONA + tB * TRANSPORTIN).length !== 1) continue;

    return {
      tituloTarjeta: 'MÁQUINA DE BILLETES · LÍNEA DE LA COSTA',
      lineas: [
        `Billete de persona: ${euros(PERSONA)} · Billete de transportín: ${euros(TRANSPORTIN)}`,
        '',
        `Parada ${p1} · ${a0} ${a0 === 1 ? 'persona' : 'personas'} y ${t0} ${t0 === 1 ? 'transportín' : 'transportines'}`,
        `Parada ${p2} · ▒▒▒▒ registro borrado ▒▒▒▒`,
        `Parada ${p3} · ${a2} ${a2 === 1 ? 'persona' : 'personas'} y ${t2} ${t2 === 1 ? 'transportín' : 'transportines'}`,
        `Llegada a Barbate · recaudación total: ${euros(total)}`,
        '',
        `¿Cuántas personas y cuántos transportines subieron en ${p2}?`,
      ],
      diales: ['Personas', 'Transportines'],
      solucion: [aB, tB],
      ayuda: `Ayuda: en la parada borrada se recaudaron ${euros(aB * PERSONA + tB * TRANSPORTIN)}. Prueba cuántos billetes de 2,75 € caben dejando un resto múltiplo de 1,20 €.`,
    };
  }
  throw new Error('No se pudo generar la máquina de billetes');
}
