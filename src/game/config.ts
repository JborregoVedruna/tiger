import { AUTO, Scale } from 'phaser';
import { generarAutobus } from './puzzles/ascensor.ts';
import { generarCamaras } from './puzzles/camaras.ts';
import { generarCandado } from './puzzles/candado.ts';
import { generarContenedor } from './puzzles/contenedor.ts';
import { generarDj } from './puzzles/dj.ts';
import { generarGuardarropa } from './puzzles/guardarropa.ts';
import { generarReloj } from './puzzles/reloj.ts';
import { generarReservados } from './puzzles/reservados.ts';
import { generarTicket } from './puzzles/ticket.ts';
import { generarVasos } from './puzzles/vasos.ts';
import { CifradoScene } from './scenes/CifradoScene.ts';
import { DialesScene } from './scenes/DialesScene.ts';
import { CareoScene, LlamadaScene } from './scenes/ElegirScene.ts';
import { CristaleraScene } from './scenes/CristaleraScene.ts';
import { EmparejarScene } from './scenes/EmparejarScene.ts';
import { MapaScene } from './scenes/MapaScene.ts';
import { NotaScene } from './scenes/NotaScene.ts';
import { OrdenarScene } from './scenes/OrdenarScene.ts';
import { ALTO, ANCHO, ZOOM } from './ui/phaserUi.ts';

/** Una escena por misión, en el mismo orden que MISIONES. */
function escenasDeMisiones() {
  return [
    // Por Zahora, Los Caños y Barbate
    new EmparejarScene(0, generarGuardarropa), // Casa de Neyba: el perchero
    new EmparejarScene(1, generarVasos), // Chiringuito: los vasos
    new NotaScene(2), // Playa de Zahora: la nota en la arena
    new CristaleraScene(3), // Parque de la Breña: las huellas
    new LlamadaScene(4), // Tienda de deportes: el móvil del probador
    new DialesScene(5, generarTicket), // Clínica veterinaria: la factura
    // Vehículos
    new OrdenarScene(6, generarCamaras), // Coche: la cámara del aparcamiento
    new CifradoScene(7), // Taxi: el papel del asiento trasero
    new OrdenarScene(8, generarDj), // Moto: la radio del casco
    new EmparejarScene(9, generarReservados), // Bicicleta: el aparcabicis
    new DialesScene(10, generarAutobus), // Autobús: los billetes
    new DialesScene(11, generarCandado), // Patinete eléctrico: el candado
    // Testimonios
    new OrdenarScene(12, generarReloj), // Vecinos de Zahora
    new EmparejarScene(13, generarContenedor), // Recepcionista: el transportín
    new CareoScene(14), // Socorristas
  ];
}

export function crearConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  return {
    type: AUTO,
    parent,
    width: ANCHO * ZOOM,
    height: ALTO * ZOOM,
    backgroundColor: '#062a3a',
    scale: {
      mode: Scale.FIT,
      autoCenter: Scale.CENTER_BOTH,
    },
    render: { antialias: true, roundPixels: false },
    // windowEvents: false evita que un toque fuera del lienzo (en un panel) llegue al juego.
    input: { activePointers: 2, windowEvents: false },
    scene: [MapaScene, ...escenasDeMisiones()],
  };
}
