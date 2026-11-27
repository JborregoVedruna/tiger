// Ajustes del jugador, guardados en el navegador.
//   aleatorio      → cada partida tiene un sospechoso, un vehículo y una hora distintos.
//   predeterminado → siempre la misma historia (y los mismos puzles). Es el modo por defecto.

export type ModoHistoria = 'aleatorio' | 'predeterminado';

const CLAVE = 'ajustes:v1';

export function leerModo(): ModoHistoria {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (crudo) {
      const a = JSON.parse(crudo);
      if (a?.modo === 'predeterminado' || a?.modo === 'aleatorio') return a.modo;
    }
  } catch {
    /* sin almacenamiento */
  }
  return 'predeterminado';
}

export function guardarModo(modo: ModoHistoria): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ modo }));
  } catch {
    /* sin almacenamiento */
  }
}
