// Formas comunes de los puzles. Cada generador devuelve una de ellas y una escena
// genérica de Phaser se encarga de dibujarla.

export interface TarjetaOrden {
  id: string;
  etiqueta: string;
  texto: string;
  /** Solo en la cámara del aparcamiento: qué plazas están ocupadas (dibujadas en miniatura). */
  plazas?: boolean[];
}

export interface PuzleOrden {
  tarjetas: TarjetaOrden[]; // en el orden en que se muestran
  orden: string[]; // ids en orden correcto
  ayuda: string;
  /** Línea opcional bajo las instrucciones (p. ej. la hora del reloj). */
  destacado?: { etiqueta: string; valor: string };
  /** Dibuja un reloj parado en este minuto del día junto al destacado. */
  reloj?: number;
  pistas?: string[];
}

export interface Ficha {
  id: string;
  nombre: string;
  detalle?: string;
}

export interface PuzleEmparejar {
  izquierda: Ficha[];
  derecha: Ficha[];
  /** izquierda.id → derecha.id */
  correcto: Record<string, string>;
  pistas: string[];
  tituloIzq: string;
  tituloDer: string;
  tituloPistas: string;
}

export interface PuzleDiales {
  tituloTarjeta: string;
  lineas: string[];
  diales: string[];
  solucion: number[];
  ayuda: string;
}

export interface OpcionElegir {
  titulo: string;
  texto?: string;
}

export interface PuzleElegir {
  opciones: OpcionElegir[];
  correcta: number;
  ayuda: string;
}
