// Las 15 misiones: seis por Zahora, Los Caños y Barbate, una por cada vehículo y tres testimonios.

export type GrupoMision = 'lugar' | 'arma' | 'testimonio';

export interface InfoMision {
  numeral: string;
  titulo: string;
  /** Lugar o arma con la que está relacionada, o quién testifica. */
  referencia: string;
  grupo: GrupoMision;
  escena: string;
  instrucciones: string;
  /** Frase con la que se abre la pista que desbloquea. */
  introPista: string;
}

const datos: Omit<InfoMision, 'numeral' | 'escena'>[] = [
  // ---------- Por Zahora, Los Caños y Barbate (grupo interno 'lugar') ----------
  {
    titulo: 'El perchero de Neyba',
    referencia: 'Casa de Neyba, Zahora',
    grupo: 'lugar',
    instrucciones:
      'En el perchero de la entrada se han quedado seis objetos olvidados. Toca un objeto y después a quien lo dejó. Las notas de Neyba te dirán de quién es cada uno.',
    introPista: 'Con cada objeto en su sitio, Neyba recuerda algo más de esa mañana.',
  },
  {
    titulo: 'Los vasos del chiringuito',
    referencia: 'Chiringuito de Zahora',
    grupo: 'lugar',
    instrucciones:
      'Seis vasos abandonados en la barra del chiringuito. Empareja cada uno con su dueño según el hielo, el cítrico, el carmín y la graduación.',
    introPista: 'Con cada vaso identificado, el camarero del chiringuito suelta lo que sabe.',
  },
  {
    titulo: 'La nota en la arena',
    referencia: 'Playa de Zahora',
    grupo: 'lugar',
    instrucciones:
      'En la arena aparece una nota rota en diez trozos. Tócalos en el orden en que se leen para reconstruirla.',
    introPista: 'En el reverso de la nota reconstruida hay algo más apuntado.',
  },
  {
    titulo: 'Las huellas de la Breña',
    referencia: 'Parque de la Breña',
    grupo: 'lugar',
    instrucciones:
      'El pinar está lleno de huellas de seis animales distintos. En cada fila, columna y bloque de 2×3 aparece cada huella una sola vez. Complétalas.',
    introPista: 'Con las huellas ordenadas, la guarda del parque reconoce el rastro.',
  },
  {
    titulo: 'El móvil del probador',
    referencia: 'Tienda de deportes, Barbate',
    grupo: 'lugar',
    instrucciones:
      'En el probador apareció un móvil. A las 11:39 llamó a alguien. El número usa exactamente las teclas con marca de dedo, ni una más, y cuadra con la pantalla.',
    introPista: 'El dependiente de la tienda reconoce el móvil y cuenta lo que vio.',
  },
  {
    titulo: 'La factura de la clínica',
    referencia: 'Clínica veterinaria, Barbate',
    grupo: 'lugar',
    instrucciones:
      'La recepcionista derramó el café sobre la caja del día. Usa la tarifa, la promoción y lo que cuentan los clientes para averiguar la cantidad de la línea borrada.',
    introPista: 'Con la caja cuadrada, la recepcionista repasa quién pasó por la clínica.',
  },
  // ---------- Los vehículos (grupo interno 'arma') ----------
  {
    titulo: 'La cámara del aparcamiento',
    referencia: 'Coche',
    grupo: 'arma',
    instrucciones:
      'Seis fotogramas de la cámara del aparcamiento de la clínica, con dos cifras borradas en cada hora. Esa mañana los coches solo llegaban: ninguno se fue. Ordénalos del primero al último.',
    introPista: 'Con los fotogramas en orden, el vigilante del aparcamiento repasa la grabación.',
  },
  {
    titulo: 'El papel del asiento trasero',
    referencia: 'Taxi',
    grupo: 'arma',
    instrucciones:
      'En el asiento trasero del taxi hay un papel con un mensaje cifrado. Averigua el desplazamiento, descífralo a mano y escribe las dos cosas.',
    introPista: 'El mensaje, por fin legible, lleva a un dato que lo cambia todo.',
  },
  {
    titulo: 'La radio de la moto',
    referencia: 'Moto',
    grupo: 'arma',
    instrucciones:
      'Ordena las canciones que sonaron en el casco Bluetooth, de la primera a la última. La batería se agotó justo a las 10:45:00. Usa la duración de cada tema y lo que cuentan los testigos.',
    introPista: 'Con la lista reconstruida, el mecánico del taller recuerda algo de la moto.',
  },
  {
    titulo: 'El aparcabicis',
    referencia: 'Bicicleta',
    grupo: 'arma',
    instrucciones:
      'Cinco bicis atadas en el aparcabicis de la playa. Cruza las manías, las deudas y los candados para saber quién aparcó en cada hueco.',
    introPista: 'Con el aparcabicis completo, el del alquiler de bicis cuenta lo que vio.',
  },
  {
    titulo: 'Los billetes del autobús',
    referencia: 'Autobús',
    grupo: 'arma',
    instrucciones:
      'La máquina de billetes del autobús ha perdido una parada. Con la recaudación total reconstruye cuántas personas y cuántos transportines subieron en ella.',
    introPista: 'Con la recaudación cuadrada, el conductor del autobús recuerda a sus pasajeros.',
  },
  {
    titulo: 'El candado del patinete',
    referencia: 'Patinete eléctrico',
    grupo: 'arma',
    instrucciones:
      'El patinete eléctrico tiene un candado de tres dígitos. La combinación está apuntada en una pegatina del manillar.',
    introPista: 'Al abrir el candado, la pantalla del patinete muestra su último viaje.',
  },
  // ---------- Testimonios ----------
  {
    titulo: 'Los vecinos de Zahora',
    referencia: 'Testimonio de los vecinos',
    grupo: 'testimonio',
    instrucciones:
      'La clínica cerró a las 18:00. Seis personas cuentan qué vieron esa tarde en la calle de Neyba. Ordena los sucesos del primero al último.',
    introPista:
      'Con la cronología ordenada, los vecinos firman una declaración. Crúzala con tus descartes y con los otros testimonios.',
  },
  {
    titulo: 'El transportín',
    referencia: 'Testimonio de la recepcionista',
    grupo: 'testimonio',
    instrucciones:
      'En el transportín de Tiger quedaron seis restos. Toca un resto y después el sitio del que salió.',
    introPista:
      'Con los restos identificados, la recepcionista de la clínica firma su declaración. Crúzala con tus descartes y con los otros testimonios.',
  },
  {
    titulo: 'El careo de los socorristas',
    referencia: 'Testimonio de los socorristas',
    grupo: 'testimonio',
    instrucciones: 'Tres socorristas, frente a frente. Exactamente uno miente. Tócalo y desenmascáralo.',
    introPista:
      'Desenmascarado el mentiroso, los dos socorristas sinceros firman su declaración. Crúzala con tus descartes y con los otros testimonios.',
  },
];

export const MISIONES: InfoMision[] = datos.map((d, i) => ({ ...d, numeral: String(i + 1), escena: `M${i}` }));

/** Índices de las misiones que terminan con un descarte (las 12 de lugares y armas). */
export const INDICES_DESCARTE = MISIONES.map((m, i) => (m.grupo !== 'testimonio' ? i : -1)).filter((i) => i >= 0);
/** Índices de los testimonios (afirmaciones condicionales). */
export const INDICES_TESTIMONIO = MISIONES.map((m, i) => (m.grupo === 'testimonio' ? i : -1)).filter((i) => i >= 0);

export const NOMBRE_GRUPO: Record<GrupoMision, string> = {
  lugar: 'Por Zahora, Los Caños y Barbate',
  arma: 'Los vehículos',
  testimonio: 'Testimonios',
};
