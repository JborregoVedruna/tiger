// Los 18 elementos del caso "¿Quién llevó a Tiger al veterinario?".
// Este archivo alimenta tanto las páginas de presentación como la lógica del juego.
//
// Por compatibilidad con el motor del juego, las categorías internas se siguen llamando
// 'sospechoso', 'arma' y 'lugar', pero aquí significan: sospechoso, VEHÍCULO y FRANJA HORARIA.

export type Categoria = 'sospechoso' | 'arma' | 'lugar';

export const CATEGORIAS: readonly Categoria[] = ['sospechoso', 'arma', 'lugar'];

export const NOMBRE_CATEGORIA: Record<Categoria, { singular: string; plural: string; otro: string; uno: string }> = {
  sospechoso: { singular: 'sospechoso', plural: 'Sospechosos', otro: 'otro sospechoso', uno: 'un sospechoso' },
  arma: { singular: 'vehículo', plural: 'Vehículos', otro: 'otro vehículo', uno: 'un vehículo' },
  lugar: { singular: 'franja horaria', plural: 'Franjas horarias', otro: 'otra franja horaria', uno: 'una franja horaria' },
};

export interface DatoFicha {
  etiqueta: string;
  valor: string;
}

export interface ElementoBase {
  id: string;
  categoria: Categoria;
  /** Nombre corto tal y como aparece en el juego. */
  nombre: string;
  /** Inicial o monograma para la composición visual. */
  monograma: string;
  /** Color de iluminación de su escena (hex). */
  tono: string;
  lema: string;
  ficha: DatoFicha[];
  relacion: string;
  /** Frase (en minúscula inicial) que lo descarta en una pista. Solo se usa si no es la solución. */
  pistaInocente: string;
  /** Fragmento narrativo para la pantalla de resolución. */
  comoFue: string;
}

export interface Sospechoso extends ElementoBase {
  categoria: 'sospechoso';
  nombreCompleto: string;
  voz: string;
  motivo: string;
  coartada: string;
  secreto: string;
}

/** Vehículo en el que llevaron a Tiger (categoría interna 'arma'). */
export interface Arma extends ElementoBase {
  categoria: 'arma';
  /** "el coche", "la moto"… */
  conArticulo: string;
  /** "en coche", "en moto"… */
  modo: string;
  descripcion: string;
  forense: string;
}

/** Franja horaria en la que llevaron a Tiger (categoría interna 'lugar'). */
export interface Lugar extends ElementoBase {
  categoria: 'lugar';
  /** "las 12:00" */
  conArticulo: string;
  /** "a las 12:00" */
  enLugar: string;
  descripcion: string;
  detalle: string;
}

export type Elemento = Sospechoso | Arma | Lugar;

export const SOSPECHOSOS: Sospechoso[] = [
  {
    id: 'oscar',
    categoria: 'sospechoso',
    nombre: 'Oscar Plano',
    nombreCompleto: 'Rafael Ortega Fernández',
    monograma: 'OP',
    tono: '#ff8a5b',
    lema: 'Si alguien cierra, yo le hago el favor de abrirlo a mi nombre.',
    voz: 'Confiado y firme',
    ficha: [
      { etiqueta: 'Edad', valor: '30 años' },
      { etiqueta: 'Profesión', valor: 'Hostelero' },
      { etiqueta: 'Vínculo', valor: 'Pareja de Neyba' },
      { etiqueta: 'Tono de voz', valor: 'Confiado y firme' },
    ],
    relacion: 'Vive con Neyba y con Tiger en Zahora. Tiger lo tolera, que no es poco.',
    motivo: 'Neyba lleva tres días diciéndole que lleve a Tiger al veterinario.',
    coartada: 'Estuvo toda la mañana visitando sus negocios para recoger el dinero.',
    secreto: 'La noche anterior salió de fiesta y tiene resaca, pero no quiere que Neyba se entere.',
    pistaInocente:
      'los encargados de sus tres bares confirman que Oscar Plano pasó por todos a recoger la caja, con gafas de sol y pidiendo agua con gas',
    comoFue:
      'Oscar Plano no aguantaba un día más con Neyba repitiéndole lo del veterinario. Resaca o no, cogió el transportín y zanjó el tema.',
  },
  {
    id: 'fatier',
    categoria: 'sospechoso',
    nombre: 'Fatier',
    nombreCompleto: 'Javier Morillo Balén',
    monograma: 'FA',
    tono: '#2ec4b6',
    lema: 'No paha na.',
    voz: 'Burlona y agresiva',
    ficha: [
      { etiqueta: 'Edad', valor: '31 años' },
      { etiqueta: 'Profesión', valor: 'Ingeniero' },
      { etiqueta: 'Vínculo', valor: 'Amigo de Neyba (y pareja de Sarita)' },
      { etiqueta: 'Tono de voz', valor: 'Burlona y agresiva' },
    ],
    relacion: 'Amigo de Neyba. Tiger se le sube encima cada vez que va de visita a Zahora.',
    motivo:
      'Quería ir a la tienda de deportes que está enfrente del veterinario, pero Sarita no le deja comprar porque tienen que ahorrar para el piso.',
    coartada: 'Se hizo un canuto y se le olvidó que tenía que llevarlo a esa hora.',
    secreto: 'Se ha comprado unas botas de fútbol a escondidas de Sarita.',
    pistaInocente:
      'el vecino de Fatier lo vio toda la mañana tirado en la hamaca del porche, mirando las nubes y sin moverse ni para coger el móvil',
    comoFue:
      'Fatier tenía una excusa perfecta para cruzar a la tienda de deportes: llevar a Tiger al veterinario de enfrente. Las botas nuevas, de paso, también salieron por la puerta.',
  },
  {
    id: 'sarita',
    categoria: 'sospechoso',
    nombre: 'Sarita',
    nombreCompleto: 'Sara Herrasti Alguacil',
    monograma: 'SA',
    tono: '#ffd166',
    lema: 'Lo que pase después de las 10, que me lo cuenten mañana.',
    voz: 'Alegre y despreocupada',
    ficha: [
      { etiqueta: 'Edad', valor: '31 años' },
      { etiqueta: 'Profesión', valor: 'Guardabosques' },
      { etiqueta: 'Vínculo', valor: 'Amiga de Neyba (y pareja de Fatier)' },
      { etiqueta: 'Tono de voz', valor: 'Alegre y despreocupada' },
    ],
    relacion: 'Amiga de Neyba. Conoce a Tiger desde que era un gatito.',
    motivo: 'Quería echarle un ojo al parque de la Breña de camino a Barbate.',
    coartada: 'Se quedó dormida hasta tarde y no tuvo tiempo de ir.',
    secreto: 'Irse a la cama temprano es solo una excusa para ver TikTok hasta tarde.',
    pistaInocente:
      'el historial de su móvil demuestra que Sarita estuvo en la cama hasta las cinco de la tarde, deslizando vídeos sin parar',
    comoFue:
      'Sarita aprovechó la ruta para revisar el parque de la Breña, y qué mejor compañero de viaje que Tiger.',
  },
  {
    id: 'amic',
    categoria: 'sospechoso',
    nombre: 'Amic',
    nombreCompleto: 'Ana Hernández Martín',
    monograma: 'AM',
    tono: '#a5d8ff',
    lema: 'Las mejores decisiones se toman con el pijama puesto.',
    voz: 'Relajada y pacífica',
    ficha: [
      { etiqueta: 'Edad', valor: '31 años' },
      { etiqueta: 'Profesión', valor: 'Técnica de laboratorio' },
      { etiqueta: 'Vínculo', valor: 'Amiga de Neyba' },
      { etiqueta: 'Tono de voz', valor: 'Relajada y pacífica' },
    ],
    relacion: 'Amiga de Neyba. Tiger la adora porque siempre juega con él cuando la ve.',
    motivo: 'Tenía que llevar a su periquito al veterinario, así que aprovechaba el viaje.',
    coartada: 'Estaba muy cansada y se quedó en casa.',
    secreto: 'Se durmió a las 22:00. Simplemente, no quería salir de casa.',
    pistaInocente:
      'el periquito de Amic sigue sin su revisión: la clínica confirma que ese día no apareció nadie con un pájaro',
    comoFue:
      'Amic metió al periquito y a Tiger en el mismo viaje. Dos pájaros de un tiro, como ella dice, aunque uno sea un gato.',
  },
  {
    id: 'judio',
    categoria: 'sospechoso',
    nombre: 'Judío',
    nombreCompleto: 'Pablo Amaya Dobla',
    monograma: 'JU',
    tono: '#c77dff',
    lema: 'Podrían hacer un módulo de módulos.',
    voz: 'Cómica e irónica',
    ficha: [
      { etiqueta: 'Edad', valor: '33 años' },
      { etiqueta: 'Profesión', valor: 'Tocapelotas profesional' },
      { etiqueta: 'Vínculo', valor: 'Amigo de Neyba' },
      { etiqueta: 'Tono de voz', valor: 'Cómica e irónica' },
    ],
    relacion: 'Amigo de Neyba. Sabe perfectamente que todo lo de Neyba lo hace Begoña, y que nadie más puede hacerlo.',
    motivo: 'Tocarle las pelotas a Begoña.',
    coartada:
      'Tenía que entrar a trabajar a La Rubia a las 18:00 y no le daba tiempo. «Ni que tuviese toda la mañana libre.»',
    secreto: 'Anoche se acostó a las 5:00 jugando al GTA VI.',
    pistaInocente:
      'el encargado de La Rubia confirma que Judío entró a trabajar antes de hora y no salió en todo el día',
    comoFue:
      'Judío no lo hizo por Tiger ni por Neyba: lo hizo porque sabía lo mucho que le iba a molestar a Begoña.',
  },
  {
    id: 'madre',
    categoria: 'sospechoso',
    nombre: 'Madre de Begoña',
    nombreCompleto: 'Catalina Sánchez',
    monograma: 'CS',
    tono: '#ff6b6b',
    lema: 'Como dijo Jack Poth, la caca es biodegradable.',
    voz: 'Segura y acusadora',
    ficha: [
      { etiqueta: 'Edad', valor: '56 años' },
      { etiqueta: 'Profesión', valor: 'Desadiestradora de perros' },
      { etiqueta: 'Vínculo', valor: 'Madre de Bego, amiga de Neyba' },
      { etiqueta: 'Tono de voz', valor: 'Segura y acusadora' },
    ],
    relacion: 'Madre de Bego, amiga de Neyba. Conoce a Tiger de cuidarlo cuando Begoña está de fiesta por la Janda.',
    motivo: 'Liberar a su hija de una carga más.',
    coartada:
      'Pensaba llevarlo haciendo footing mientras él la seguía, pero como no lo hacía, lo dejó en tierra.',
    secreto: 'Al final se llevó a los perros y no recogió ni una sola caca de Turco por el camino.',
    pistaInocente:
      'media Zahora vio a la Madre de Begoña corriendo por el carril con los perros, y a Turco dejando su firma en cada esquina',
    comoFue:
      'La Madre de Begoña decidió que su hija ya tenía bastante. Si había que llevar al gato, lo llevaba ella, con o sin permiso.',
  },
];

export const ARMAS: Arma[] = [
  {
    id: 'coche',
    categoria: 'arma',
    nombre: 'Coche',
    conArticulo: 'el coche',
    modo: 'en coche',
    monograma: 'I',
    tono: '#2ec4b6',
    lema: 'Aire acondicionado y transportín en el asiento de atrás.',
    ficha: [
      { etiqueta: 'Trayecto', valor: 'Zahora → Barbate por la A-2233' },
      { etiqueta: 'Tiempo', valor: 'Unos 15 minutos' },
      { etiqueta: 'Comodidad para Tiger', valor: 'Alta' },
      { etiqueta: 'Rastro', valor: 'Pelos grises en la tapicería' },
    ],
    descripcion: 'Un utilitario lleno de arena de playa, con las ventanillas bajadas y la radio a todo volumen.',
    relacion: 'Tiger odia el coche, pero es la forma más rápida de llegar a Barbate.',
    forense: 'Si fue en coche, en la tapicería tendría que haber pelos grises de Tiger.',
    pistaInocente:
      'en ninguno de los coches del grupo hay un solo pelo gris de Tiger: el aspirado de la tapicería sale limpio',
    comoFue: 'Fue en coche, con el transportín en el asiento de atrás y Tiger maullando durante todo el trayecto.',
  },
  {
    id: 'taxi',
    categoria: 'arma',
    nombre: 'Taxi',
    conArticulo: 'el taxi',
    modo: 'en taxi',
    monograma: 'II',
    tono: '#ffd166',
    lema: '«¿El gato paga suplemento?»',
    ficha: [
      { etiqueta: 'Trayecto', valor: 'Zahora → Barbate' },
      { etiqueta: 'Precio aproximado', valor: '25 €' },
      { etiqueta: 'Disponibilidad', valor: 'Uno o dos taxis en todo Zahora' },
      { etiqueta: 'Rastro', valor: 'Recibo de la carrera' },
    ],
    descripcion: 'El taxi de siempre, el que espera a la sombra junto al chiringuito.',
    relacion: 'El taxista conoce a Tiger: no es la primera vez que lo lleva.',
    forense: 'Cualquier carrera queda en el registro del taxímetro.',
    pistaInocente:
      'el registro del taxímetro muestra que ese día el único taxi de Zahora solo hizo carreras al aeropuerto',
    comoFue: 'Fue en taxi, con el taxista quejándose de los pelos y cobrando suplemento por el transportín.',
  },
  {
    id: 'moto',
    categoria: 'arma',
    nombre: 'Moto',
    conArticulo: 'la moto',
    modo: 'en moto',
    monograma: 'III',
    tono: '#ff8a5b',
    lema: 'Casco, gafas de sol y un gato en la mochila.',
    ficha: [
      { etiqueta: 'Trayecto', valor: 'Por el carril de la costa' },
      { etiqueta: 'Tiempo', valor: 'Unos 12 minutos' },
      { etiqueta: 'Comodidad para Tiger', valor: 'Dudosa' },
      { etiqueta: 'Rastro', valor: 'Mochila con rejilla' },
    ],
    descripcion: 'Una scooter de 125 con una mochila-transportín de rejilla atada al portaequipajes.',
    relacion: 'Tiger se asoma por la rejilla de la mochila como si fuera el dueño de la carretera.',
    forense: 'Con viento de levante, Tiger habría llegado despeinado y lleno de arena.',
    pistaInocente:
      'la única moto del grupo lleva toda la semana en el taller de Barbate esperando una pieza',
    comoFue: 'Fue en moto, con Tiger en la mochila de rejilla y el levante soplando de lado.',
  },
  {
    id: 'bici',
    categoria: 'arma',
    nombre: 'Bicicleta',
    conArticulo: 'la bicicleta',
    modo: 'en bicicleta',
    monograma: 'IV',
    tono: '#a5d8ff',
    lema: 'Doce kilómetros, cuesta arriba y con un gato en la cesta.',
    ficha: [
      { etiqueta: 'Trayecto', valor: 'Por el pinar de la Breña' },
      { etiqueta: 'Tiempo', valor: 'Unos 45 minutos' },
      { etiqueta: 'Comodidad para Tiger', valor: 'Baja' },
      { etiqueta: 'Rastro', valor: 'Cesta delantera con pelos' },
    ],
    descripcion: 'Una bici de paseo con cesta delantera, perfecta para el pan… y para un gato con paciencia.',
    relacion: 'Tiger se tumba en la cesta al sol, pero en marcha es otra historia.',
    forense: 'Tras 45 minutos por el pinar, la cesta tendría que estar llena de pinocha.',
    pistaInocente:
      'las bicis del grupo siguen atadas al aparcabicis de la playa con las ruedas pinchadas desde el verano pasado',
    comoFue: 'Fue en bicicleta, por el pinar de la Breña, con Tiger en la cesta y mirando mal a cada bache.',
  },
  {
    id: 'autobus',
    categoria: 'arma',
    nombre: 'Autobús',
    conArticulo: 'el autobús',
    modo: 'en autobús',
    monograma: 'V',
    tono: '#c77dff',
    lema: 'Una parada en cada playa y ninguna prisa.',
    ficha: [
      { etiqueta: 'Trayecto', valor: 'Línea de la costa con paradas' },
      { etiqueta: 'Tiempo', valor: 'Unos 40 minutos' },
      { etiqueta: 'Comodidad para Tiger', valor: 'Media' },
      { etiqueta: 'Rastro', valor: 'Billete de transportín' },
    ],
    descripcion: 'El autobús de línea que une las playas con Barbate, con el aire acondicionado a tope.',
    relacion: 'Los transportines viajan con billete propio, más barato que el de una persona.',
    forense: 'Cada transportín lleva su propio billete en la máquina del conductor.',
    pistaInocente:
      'la máquina de billetes del autobús no registró ni un solo billete de transportín en todo el día',
    comoFue: 'Fue en autobús, con billete para el transportín y parada en cada playa hasta llegar a Barbate.',
  },
  {
    id: 'patinete',
    categoria: 'arma',
    nombre: 'Patinete eléctrico',
    conArticulo: 'el patinete eléctrico',
    modo: 'en patinete eléctrico',
    monograma: 'VI',
    tono: '#ff6b6b',
    lema: 'Batería al 15 % y un gato agarrado al manillar.',
    ficha: [
      { etiqueta: 'Trayecto', valor: 'Por el carril bici' },
      { etiqueta: 'Tiempo', valor: 'Unos 35 minutos' },
      { etiqueta: 'Comodidad para Tiger', valor: 'Ninguna' },
      { etiqueta: 'Rastro', valor: 'Candado con combinación' },
    ],
    descripcion: 'Un patinete eléctrico de alquiler con un transportín atado al manillar con bridas.',
    relacion: 'Tiger nunca se ha subido a uno. Y probablemente nunca quiera.',
    forense: 'El candado del patinete guarda la hora en que se desbloqueó por última vez.',
    pistaInocente:
      'el patinete eléctrico sigue con el candado puesto y la batería a cero: nadie lo ha movido desde el jueves',
    comoFue: 'Fue en patinete eléctrico, con el transportín atado al manillar y la batería llegando justa a Barbate.',
  },
];

export const LUGARES: Lugar[] = [
  {
    id: 'h0900',
    categoria: 'lugar',
    nombre: '9:00',
    conArticulo: 'las 9:00',
    enLugar: 'a las 9:00',
    monograma: '9',
    tono: '#ffd166',
    lema: 'La hora del primer café en Zahora.',
    ficha: [
      { etiqueta: 'Momento', valor: 'Primera hora de la mañana' },
      { etiqueta: 'Clínica', valor: 'Abre a las 9:00' },
      { etiqueta: 'Tráfico', valor: 'Ninguno' },
      { etiqueta: 'Sol', valor: 'Todavía suave' },
    ],
    descripcion: 'La clínica acaba de abrir y la recepcionista aún está encendiendo el ordenador.',
    relacion: 'A esa hora Tiger suele estar durmiendo encima de la lavadora.',
    detalle: 'La primera cita del día casi siempre está libre.',
    pistaInocente:
      'a las 9:00 la recepcionista de la clínica estaba sola, con la persiana a medio subir, y no atendió a nadie hasta las 10',
    comoFue: 'Lo llevaron a las 9:00, nada más abrir, antes de que nadie en Zahora estuviera despierto.',
  },
  {
    id: 'h1030',
    categoria: 'lugar',
    nombre: '10:30',
    conArticulo: 'las 10:30',
    enLugar: 'a las 10:30',
    monograma: '10',
    tono: '#2ec4b6',
    lema: 'La hora del desayuno con vistas.',
    ficha: [
      { etiqueta: 'Momento', valor: 'Media mañana' },
      { etiqueta: 'Clínica', valor: 'Consultas de vacunas' },
      { etiqueta: 'Tráfico', valor: 'Poco' },
      { etiqueta: 'Sol', valor: 'Empieza a apretar' },
    ],
    descripcion: 'La sala de espera se llena de perros que vienen a vacunarse.',
    relacion: 'A esa hora Tiger desayuna y vuelve a dormirse.',
    detalle: 'Las citas de las 10:30 se reservan con una semana de antelación.',
    pistaInocente:
      'la agenda de la clínica muestra que a las 10:30 solo hubo vacunas de perros, todas reservadas desde la semana anterior',
    comoFue: 'Lo llevaron a las 10:30, entre perros que esperaban su vacuna.',
  },
  {
    id: 'h1200',
    categoria: 'lugar',
    nombre: '12:00',
    conArticulo: 'las 12:00',
    enLugar: 'a las 12:00',
    monograma: '12',
    tono: '#ff8a5b',
    lema: 'Mediodía en Barbate y la sala de espera llena.',
    ficha: [
      { etiqueta: 'Momento', valor: 'Mediodía' },
      { etiqueta: 'Clínica', valor: 'Consultas generales' },
      { etiqueta: 'Tráfico', valor: 'Coches de playa' },
      { etiqueta: 'Sol', valor: 'De justicia' },
    ],
    descripcion: 'El momento de más jaleo: la sala de espera llena y el teléfono sin parar.',
    relacion: 'A esa hora Tiger suele estar tumbado a la sombra del patio.',
    detalle: 'A mediodía la recepcionista no da abasto y casi no mira quién entra.',
    pistaInocente:
      'a las 12:00 la clínica cerró media hora por una urgencia y la sala de espera se quedó vacía',
    comoFue: 'Lo llevaron a las 12:00, en plena hora punta, cuando nadie se fijaba en quién entraba.',
  },
  {
    id: 'h1330',
    categoria: 'lugar',
    nombre: '13:30',
    conArticulo: 'las 13:30',
    enLugar: 'a las 13:30',
    monograma: '13',
    tono: '#ff6b6b',
    lema: 'La hora del vermut en el chiringuito.',
    ficha: [
      { etiqueta: 'Momento', valor: 'Antes de comer' },
      { etiqueta: 'Clínica', valor: 'Últimas citas de la mañana' },
      { etiqueta: 'Tráfico', valor: 'Mucho, gente que va a comer' },
      { etiqueta: 'Sol', valor: 'Insoportable' },
    ],
    descripcion: 'Las últimas consultas antes de que la clínica cierre a comer.',
    relacion: 'A esa hora Tiger empieza a pedir su comida con maullidos.',
    detalle: 'Si llegas tarde, te quedas sin cita hasta la tarde.',
    pistaInocente:
      'a las 13:30 la veterinaria estaba en su pausa del almuerzo, tomándose el vermut en el chiringuito, con la persiana de la clínica bajada hasta las 14:30',
    comoFue: 'Lo llevaron a las 13:30, justo cuando la veterinaria se iba a la pausa del almuerzo.',
  },
  {
    id: 'h1500',
    categoria: 'lugar',
    nombre: '15:00',
    conArticulo: 'las 15:00',
    enLugar: 'a las 15:00',
    monograma: '15',
    tono: '#c77dff',
    lema: 'La hora de la siesta. Para todos menos para uno.',
    ficha: [
      { etiqueta: 'Momento', valor: 'Después de comer' },
      { etiqueta: 'Clínica', valor: 'Reabre por la tarde' },
      { etiqueta: 'Tráfico', valor: 'Ninguno: todo el mundo duerme' },
      { etiqueta: 'Sol', valor: 'Derritiendo el asfalto' },
    ],
    descripcion: 'Barbate entero está durmiendo la siesta y las calles están vacías.',
    relacion: 'A esa hora Tiger está en su peor momento: recién comido y de mal humor.',
    detalle: 'Por la tarde atiende el veterinario de guardia, que no conoce a Tiger.',
    pistaInocente:
      'a las 15:00 el veterinario de guardia estaba operando a un perro y no atendió a nadie más hasta las 16:30',
    comoFue: 'Lo llevaron a las 15:00, con Barbate entero durmiendo la siesta.',
  },
  {
    id: 'h1630',
    categoria: 'lugar',
    nombre: '16:30',
    conArticulo: 'las 16:30',
    enLugar: 'a las 16:30',
    monograma: '16',
    tono: '#a5d8ff',
    lema: 'La última cita antes de la playa de la tarde.',
    ficha: [
      { etiqueta: 'Momento', valor: 'Media tarde' },
      { etiqueta: 'Clínica', valor: 'Últimas citas del día' },
      { etiqueta: 'Tráfico', valor: 'Gente volviendo a la playa' },
      { etiqueta: 'Sol', valor: 'Empieza a bajar' },
    ],
    descripcion: 'Las últimas citas del día, con el sol bajando y la playa llenándose otra vez.',
    relacion: 'A esa hora Tiger se despierta de la siesta y sale a cazar lagartijas.',
    detalle: 'La clínica cierra a las 18:00 en punto.',
    pistaInocente:
      'a las 16:30 Tiger estaba en el tejado de Neyba cazando lagartijas: lo grabó un vecino en vídeo',
    comoFue: 'Lo llevaron a las 16:30, en la última tanda de citas del día.',
  },
];

export const ELEMENTOS: Record<Categoria, readonly Elemento[]> = {
  sospechoso: SOSPECHOSOS,
  arma: ARMAS,
  lugar: LUGARES,
};

const INDICE = new Map<string, Elemento>([...SOSPECHOSOS, ...ARMAS, ...LUGARES].map((e) => [e.id, e]));

export function porId(id: string): Elemento {
  const e = INDICE.get(id);
  if (!e) throw new Error(`Elemento desconocido: ${id}`);
  return e;
}

/** Nombre tal y como se usa dentro de una frase (los apodos no llevan artículo). */
export function conTratamiento(nombre: string): string {
  if (nombre === 'Madre de Begoña') return 'la Madre de Begoña';
  return nombre;
}

export function sospechoso(id: string): Sospechoso {
  return porId(id) as Sospechoso;
}
export function arma(id: string): Arma {
  return porId(id) as Arma;
}
export function lugar(id: string): Lugar {
  return porId(id) as Lugar;
}

/** Historia predeterminada: siempre la misma solución. */
export const HISTORIA_PREDETERMINADA = {
  solucion: { sospechoso: 'judio', arma: 'coche', lugar: 'h1200' },
  /**
   * Alternativa falsa que llega hasta la decisión final: en la historia predeterminada estos
   * elementos nunca se descartan, así que la acusación es entre ellos y la solución.
   */
  finalistas: { sospechoso: 'oscar', arma: 'taxi', lugar: 'h1500' },
  /** Semilla fija: los puzles y las pistas también son siempre los mismos. */
  semilla: 20261127,
  resolucion: [
    'Judío se acostó a las cinco de la mañana jugando al GTA VI, pero a las once ya estaba despierto con una sola idea en la cabeza: tocarle las pelotas a Begoña.',
    'Sabía que todo lo de Neyba lo hace Begoña, y que nadie más puede hacerlo. Por eso mismo cogió el transportín, metió a Tiger en el coche y se plantó en Barbate a las 12:00, en plena hora punta, cuando la recepcionista no da abasto.',
    'Su coartada era perfecta: «Tenía que entrar a trabajar a La Rubia a las 18:00, ni que tuviese toda la mañana libre». Precisamente: tenía toda la mañana libre.',
    'Los pelos grises en la tapicería del coche lo delataron. Begoña, juglar y mamporrera de la Janda, ha resuelto el caso. Judío tendrá que buscarse otra forma de molestarla.',
  ],
};

export const HISTORIA = {
  titulo: '¿Quién llevó a Tiger al veterinario?',
  fecha: 'Zahora · Los Caños · Barbate · un día cualquiera de verano',
  secciones: [
    {
      etiqueta: 'Tiger',
      texto:
        'Tiger es el gato de Neyba: gris clarito, orgulloso y dueño absoluto de una casa en Zahora. Pero de todo lo de Neyba se encarga Begoña: los recados, las gestiones y, por supuesto, llevar a Tiger al veterinario de Barbate. Eso es cosa suya y de nadie más.',
    },
    {
      etiqueta: 'El problema',
      texto:
        'Esta mañana, cuando Begoña llamó para pedir cita, la recepcionista le dijo algo imposible: «A Tiger ya lo trajeron hoy». Alguien se le ha adelantado.',
    },
    {
      etiqueta: 'La detective',
      texto:
        'Begoña, juglar y mamporrera de la Janda, no piensa dejarlo pasar. Seis sospechosos, seis formas de llegar a Barbate y seis horas posibles. Solo una combinación es la verdadera.',
    },
    {
      etiqueta: 'Tu misión',
      texto:
        'Recorre Zahora, Los Caños y Barbate, resuelve doce misiones, escucha tres testimonios y descubre quién llevó a Tiger, en qué y a qué hora.',
    },
  ],
};
