// Misión · La factura de la clínica (Clínica veterinaria): reconstruir la caja del día.
// Para resolverlo hay que: quitar el 10 % de recargo del total, aplicar el 2×1 de la promoción,
// multiplicar lo que cuentan los clientes y despejar la cantidad de la línea borrada.

import { barajar, entero, type Rng } from '../core/rng.ts';
import type { PuzleDiales } from './tipos.ts';

const CARTA = [
  { nombre: 'Consulta', plural: 'consultas', uno: 'una consulta', precio: 30 },
  { nombre: 'Vacuna', plural: 'vacunas', uno: 'una vacuna', precio: 25 },
  { nombre: 'Desparasitación', plural: 'desparasitaciones', uno: 'una desparasitación', precio: 12 },
  { nombre: 'Corte de uñas', plural: 'cortes de uñas', uno: 'un corte de uñas', precio: 8 },
  { nombre: 'Champú', plural: 'champús', uno: 'un champú', precio: 10 },
  { nombre: 'Bolsa de chuches', plural: 'bolsas de chuches', uno: 'una bolsa de chuches', precio: 3 },
];

const CLIENTES = ['Una señora con perros de Barbate', 'Un surfero de Los Caños', 'Una vecina de Zahora', 'Un pescador del puerto'];

const SERVICIO = 10; // %

function linea(izq: string, der: string): string {
  const puntos = '.'.repeat(Math.max(2, 30 - izq.length - der.length));
  return `${izq} ${puntos} ${der}`;
}

/** Con el 2×1 se paga la mitad de las unidades, redondeando hacia arriba. */
export function unidadesConPromo(q: number): number {
  return Math.ceil(q / 2);
}

export function generarTicket(rng: Rng): PuzleDiales {
  for (let intento = 0; intento < 2000; intento++) {
    const [visible, promo, t2, borrada] = barajar(rng, CARTA).slice(0, 4);
    const qVisible = entero(rng, 1, 3);
    const r1 = entero(rng, 2, 3);
    const k1 = entero(rng, 2, 3);
    const r2 = entero(rng, 2, 3);
    const k2 = entero(rng, 1, 3);
    const qBorrada = entero(rng, 2, 7);

    const importeVisible = qVisible * visible.precio;
    const importePromo = unidadesConPromo(r1 * k1) * promo.precio;
    const importe2 = r2 * k2 * t2.precio;
    const importeBorrada = qBorrada * borrada.precio;
    const subtotal = importeVisible + importePromo + importe2 + importeBorrada;
    if (subtotal % 10 !== 0) continue; // el total con el 10 % debe ser exacto
    const total = (subtotal * (100 + SERVICIO)) / 100;
    const [p1, p2] = barajar(rng, CLIENTES).slice(0, 2);

    return {
      tituloTarjeta: 'CAJA DEL DÍA · CLÍNICA VETERINARIA',
      lineas: [
        'TARIFA: ' + CARTA.map((c) => `${c.nombre} ${c.precio} €`).join(' · '),
        `PROMO: 2×1 en ${promo.plural} (se paga la mitad, redondeando hacia arriba).`,
        '',
        linea(`${qVisible} × ${visible.nombre}`, `${importeVisible} €`),
        linea(`? × ${promo.nombre} (2×1)`, '?? €'),
        linea(`? × ${t2.nombre}`, '?? €'),
        linea(`▒ × ${borrada.nombre}`, '▒▒ €'),
        linea(`Recargo ${SERVICIO} %`, 'incluido'),
        linea('TOTAL', `${total} €`),
        '',
        `${p1}: «Traje ${r1} mascotas y a cada una le hicieron ${k1} ${promo.plural}.»`,
        `${p2}: «Yo traje ${r2}, y a cada una ${k2 === 1 ? t2.uno : `${k2} ${t2.plural}`}.»`,
        '',
        `¿Qué cantidad de ${borrada.plural} hay en la línea borrada?`,
      ],
      diales: ['Cantidad'],
      solucion: [qBorrada],
      ayuda: `Ayuda: sin el recargo, la caja era de ${subtotal} €. Con el 2×1, de ${r1 * k1} ${promo.plural} solo se pagan ${unidadesConPromo(r1 * k1)}.`,
    };
  }
  throw new Error('No se pudo generar el ticket');
}
